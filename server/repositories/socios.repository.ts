import { supabase, db } from "../db";
import { ErpSocio, SocioTimelineEvent } from "../../src/types";

export class SociosRepository {
  public async getAll(): Promise<ErpSocio[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("socios")
        .select("*, socios_timeline(*)")
        .order("fecha_alta", { ascending: false });

      if (error) {
        console.error("[SociosRepository] Error fetching from Supabase:", error);
        throw new Error(error.message);
      }

      if (data) {
        return data.map((s: any) => this.mapFromDb(s));
      }
    }
    return db.getState().socios;
  }

  public async getById(id: string): Promise<ErpSocio | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("socios")
        .select("*, socios_timeline(*)")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[SociosRepository] Error fetching socio ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }

    const found = db.getState().socios.find((s) => s.id === id);
    return found || null;
  }

  public async create(socio: Omit<ErpSocio, "id"> & { id?: string }): Promise<ErpSocio> {
    const id = socio.id || crypto.randomUUID();
    const newSocio: ErpSocio = {
      ...socio,
      id,
      timeline: socio.timeline || [],
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("socios")
        .insert({
          id: newSocio.id,
          razon_social: newSocio.razonSocial,
          nombre_comercial: newSocio.nombreComercial,
          cuit: newSocio.cuit,
          rubro: newSocio.rubro,
          categoria: newSocio.categoria,
          estado: newSocio.estado,
          direccion: newSocio.direccion,
          localidad: newSocio.localidad,
          provincia: newSocio.provincia,
          email: newSocio.email,
          whatsapp: newSocio.whatsapp,
          web: newSocio.web || null,
          redes_sociales: newSocio.redesSociales || {},
          observaciones: newSocio.observaciones || null,
          fecha_alta: newSocio.fechaAlta || new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) {
        console.error("[SociosRepository] Error creating socio in Supabase:", error);
        throw new Error(error.message);
      }

      // If initial timeline events exist, insert them
      if (newSocio.timeline && newSocio.timeline.length > 0) {
        const timelineInserts = newSocio.timeline.map((t) => ({
          id: t.id || crypto.randomUUID(),
          socio_id: newSocio.id,
          tipo: t.tipo,
          titulo: t.titulo,
          descripcion: t.descripcion,
          fecha: t.fecha || new Date().toISOString(),
        }));
        await supabase.from("socios_timeline").insert(timelineInserts);
      }

      return this.mapFromDb(data, newSocio.timeline);
    }

    const state = db.getState();
    state.socios.unshift(newSocio);
    db.save();
    return newSocio;
  }

  public async update(id: string, updates: Partial<ErpSocio>): Promise<ErpSocio | null> {
    if (supabase) {
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.razonSocial !== undefined) updatePayload.razon_social = updates.razonSocial;
      if (updates.nombreComercial !== undefined) updatePayload.nombre_comercial = updates.nombreComercial;
      if (updates.cuit !== undefined) updatePayload.cuit = updates.cuit;
      if (updates.rubro !== undefined) updatePayload.rubro = updates.rubro;
      if (updates.categoria !== undefined) updatePayload.categoria = updates.categoria;
      if (updates.estado !== undefined) updatePayload.estado = updates.estado;
      if (updates.direccion !== undefined) updatePayload.direccion = updates.direccion;
      if (updates.localidad !== undefined) updatePayload.localidad = updates.localidad;
      if (updates.provincia !== undefined) updatePayload.provincia = updates.provincia;
      if (updates.email !== undefined) updatePayload.email = updates.email;
      if (updates.whatsapp !== undefined) updatePayload.whatsapp = updates.whatsapp;
      if (updates.web !== undefined) updatePayload.web = updates.web;
      if (updates.redesSociales !== undefined) updatePayload.redes_sociales = updates.redesSociales;
      if (updates.observaciones !== undefined) updatePayload.observaciones = updates.observaciones;

      const { data, error } = await supabase
        .from("socios")
        .update(updatePayload)
        .eq("id", id)
        .select("*, socios_timeline(*)")
        .single();

      if (error) {
        console.error(`[SociosRepository] Error updating socio ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.socios.findIndex((s) => s.id === id);
    if (index === -1) return null;
    state.socios[index] = { ...state.socios[index], ...updates };
    db.save();
    return state.socios[index];
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("socios").delete().eq("id", id);
      if (error) {
        console.error(`[SociosRepository] Error deleting socio ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    const index = state.socios.findIndex((s) => s.id === id);
    if (index === -1) return false;
    state.socios.splice(index, 1);
    db.save();
    return true;
  }

  public async getTimeline(socioId: string): Promise<SocioTimelineEvent[]> {
    const socio = await this.getById(socioId);
    return socio ? (socio.timeline || []) : [];
  }

  public async addTimelineEvent(socioId: string, event: Partial<SocioTimelineEvent>): Promise<SocioTimelineEvent> {
    return this.addTimeline({
      id: event.id || crypto.randomUUID(),
      socioId,
      tipo: event.tipo || "nota",
      titulo: event.titulo || "Evento",
      descripcion: event.descripcion || "",
      fecha: event.fecha || new Date().toISOString(),
      usuario: event.usuario,
    });
  }

  public async addTimeline(timeline: SocioTimelineEvent): Promise<SocioTimelineEvent> {
    const item: SocioTimelineEvent = {
      ...timeline,
      id: timeline.id || crypto.randomUUID(),
      fecha: timeline.fecha || new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("socios_timeline")
        .insert({
          id: item.id,
          socio_id: item.socioId,
          tipo: item.tipo,
          titulo: item.titulo,
          descripcion: item.descripcion,
          fecha: item.fecha,
        })
        .select()
        .single();

      if (error) {
        console.error("[SociosRepository] Error inserting timeline event:", error);
        throw new Error(error.message);
      }

      return {
        id: data.id,
        socioId: data.socio_id,
        tipo: data.tipo,
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha: data.fecha,
      };
    }

    const state = db.getState();
    const socio = state.socios.find((s) => s.id === item.socioId);
    if (socio) {
      if (!socio.timeline) socio.timeline = [];
      socio.timeline.unshift(item);
      db.save();
    }
    return item;
  }

  private mapFromDb(s: any, fallbackTimeline?: SocioTimelineEvent[]): ErpSocio {
    const timelineData = s.socios_timeline || fallbackTimeline || [];
    return {
      id: s.id,
      razonSocial: s.razon_social,
      nombreComercial: s.nombre_comercial,
      cuit: s.cuit,
      rubro: s.rubro,
      categoria: s.categoria,
      estado: s.estado,
      direccion: s.direccion,
      localidad: s.localidad,
      provincia: s.provincia,
      email: s.email,
      whatsapp: s.whatsapp,
      web: s.web,
      redesSociales: s.redes_sociales,
      observaciones: s.observaciones,
      fechaAlta: s.fecha_alta,
      timeline: timelineData.map((t: any) => ({
        id: t.id,
        socioId: t.socio_id,
        tipo: t.tipo,
        titulo: t.titulo,
        descripcion: t.descripcion,
        fecha: t.fecha,
      })),
    };
  }
}

export const sociosRepository = new SociosRepository();

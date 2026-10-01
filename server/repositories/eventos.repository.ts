import { supabase, db } from "../db";
import { ErpEvent, ErpEnrollment } from "../../src/types";

export class EventosRepository {
  public async getAll(): Promise<ErpEvent[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("eventos_capacitaciones")
        .select("*, inscripciones_eventos(*)")
        .order("fecha", { ascending: true });

      if (error) {
        console.error("[EventosRepository] Error fetching eventos from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map((e: any) => this.mapFromDb(e));
    }
    return db.getState().eventos;
  }

  public async getById(id: string): Promise<ErpEvent | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("eventos_capacitaciones")
        .select("*, inscripciones_eventos(*)")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[EventosRepository] Error fetching event ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = db.getState().eventos.find((e) => e.id === id);
    return found || null;
  }

  public async create(event: Omit<ErpEvent, "id"> & { id?: string }): Promise<ErpEvent> {
    const id = event.id || crypto.randomUUID();
    const newEvent: ErpEvent = {
      ...event,
      id,
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("eventos_capacitaciones")
        .insert({
          id: newEvent.id,
          titulo: newEvent.titulo,
          fecha: newEvent.fecha,
          hora: newEvent.hora,
          lugar: newEvent.lugar,
          cupos_max: newEvent.cuposMax,
          cupos_inscriptos: newEvent.cuposInscriptos || 0,
          asistentes_count: newEvent.asistentesCount || 0,
          descripcion: newEvent.descripcion,
          orador: newEvent.orador,
          categoria: newEvent.categoria,
          banner_url: newEvent.bannerUrl || null,
          color: newEvent.color || "bg-indigo-600",
          border_color: newEvent.borderColor || "border-indigo-600",
          text_color: newEvent.textColor || "text-indigo-600",
        })
        .select()
        .single();

      if (error) {
        console.error("[EventosRepository] Error creating evento in Supabase:", error);
        throw new Error(error.message);
      }
      return this.mapFromDb(data);
    }

    const state = db.getState();
    state.eventos.push(newEvent);
    db.save();
    return newEvent;
  }

  public async update(id: string, updates: Partial<ErpEvent>): Promise<ErpEvent | null> {
    if (supabase) {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.titulo !== undefined) payload.titulo = updates.titulo;
      if (updates.fecha !== undefined) payload.fecha = updates.fecha;
      if (updates.hora !== undefined) payload.hora = updates.hora;
      if (updates.lugar !== undefined) payload.lugar = updates.lugar;
      if (updates.cuposMax !== undefined) payload.cupos_max = updates.cuposMax;
      if (updates.cuposInscriptos !== undefined) payload.cupos_inscriptos = updates.cuposInscriptos;
      if (updates.asistentesCount !== undefined) payload.asistentes_count = updates.asistentesCount;
      if (updates.descripcion !== undefined) payload.descripcion = updates.descripcion;
      if (updates.orador !== undefined) payload.orador = updates.orador;
      if (updates.categoria !== undefined) payload.categoria = updates.categoria;
      if (updates.bannerUrl !== undefined) payload.banner_url = updates.bannerUrl;
      if (updates.color !== undefined) payload.color = updates.color;
      if (updates.borderColor !== undefined) payload.border_color = updates.borderColor;
      if (updates.textColor !== undefined) payload.text_color = updates.textColor;

      const { data, error } = await supabase
        .from("eventos_capacitaciones")
        .update(payload)
        .eq("id", id)
        .select("*, inscripciones_eventos(*)")
        .single();

      if (error) {
        console.error(`[EventosRepository] Error updating evento ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.eventos.findIndex((e) => e.id === id);
    if (index === -1) return null;
    state.eventos[index] = { ...state.eventos[index], ...updates };
    db.save();
    return state.eventos[index];
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("eventos_capacitaciones").delete().eq("id", id);
      if (error) {
        console.error(`[EventosRepository] Error deleting event ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    const index = state.eventos.findIndex((e) => e.id === id);
    if (index === -1) return false;
    state.eventos.splice(index, 1);
    db.save();
    return true;
  }

  public async getAllInscripciones(): Promise<ErpEnrollment[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("inscripciones_eventos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[EventosRepository] Error fetching inscripciones from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map((ins: any) => ({
        id: ins.id,
        eventoId: ins.evento_id,
        nombreSocio: ins.nombre_socio,
        email: ins.email,
        telefono: ins.telefono,
        asistio: Boolean(ins.asistio),
        certificadoEnviado: Boolean(ins.certificado_enviado),
      }));
    }
    return db.getState().inscripciones;
  }

  public async getInscripcionesByEvento(eventoId: string): Promise<ErpEnrollment[]> {
    const all = await this.getAllInscripciones();
    return all.filter((ins) => ins.eventoId === eventoId);
  }

  public async updateInscripcion(id: string, updates: Partial<ErpEnrollment>): Promise<ErpEnrollment | null> {
    if (supabase) {
      const payload: Record<string, any> = {};
      if (updates.nombreSocio !== undefined) payload.nombre_socio = updates.nombreSocio;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.telefono !== undefined) payload.telefono = updates.telefono;
      if (updates.asistio !== undefined) payload.asistio = updates.asistio;
      if (updates.certificadoEnviado !== undefined) payload.certificado_enviado = updates.certificadoEnviado;

      const { data, error } = await supabase
        .from("inscripciones_eventos")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[EventosRepository] Error updating inscripcion ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? {
        id: data.id,
        eventoId: data.evento_id,
        nombreSocio: data.nombre_socio,
        email: data.email,
        telefono: data.telefono,
        asistio: Boolean(data.asistio),
        certificadoEnviado: Boolean(data.certificado_enviado),
      } : null;
    }

    const state = db.getState();
    if (!state.inscripciones) state.inscripciones = [];
    const index = state.inscripciones.findIndex((i) => i.id === id);
    if (index === -1) return null;
    state.inscripciones[index] = { ...state.inscripciones[index], ...updates };
    db.save();
    return state.inscripciones[index];
  }

  public async createInscripcion(
    insOrEventoId: (Omit<ErpEnrollment, "id"> & { id?: string }) | string,
    optionalPayload?: Partial<ErpEnrollment>
  ): Promise<ErpEnrollment> {
    const isFirstParamId = typeof insOrEventoId === "string";
    const eventoId = isFirstParamId ? insOrEventoId : insOrEventoId.eventoId;
    const rawIns: Partial<ErpEnrollment> = isFirstParamId ? optionalPayload || {} : insOrEventoId;

    const id = rawIns.id || crypto.randomUUID();
    const newIns: ErpEnrollment = {
      id,
      eventoId,
      eventoTitulo: rawIns.eventoTitulo || "",
      nombreSocio: rawIns.nombreSocio || "",
      email: rawIns.email || "",
      telefono: rawIns.telefono || "",
      asistio: Boolean(rawIns.asistio),
      certificadoEnviado: Boolean(rawIns.certificadoEnviado),
      fechaInscripcion: rawIns.fechaInscripcion || new Date().toISOString().split("T")[0],
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("inscripciones_eventos")
        .insert({
          id: newIns.id,
          evento_id: newIns.eventoId,
          nombre_socio: newIns.nombreSocio,
          email: newIns.email,
          telefono: newIns.telefono,
          asistio: Boolean(newIns.asistio),
          certificado_enviado: Boolean(newIns.certificadoEnviado),
        })
        .select()
        .single();

      if (error) {
        console.error("[EventosRepository] Error creating inscripcion in Supabase:", error);
        throw new Error(error.message);
      }

      // Update inscriptos count in event
      const event = await this.getById(newIns.eventoId);
      if (event) {
        await this.update(newIns.eventoId, {
          cuposInscriptos: (event.cuposInscriptos || 0) + 1,
        });
      }

      return {
        id: data.id,
        eventoId: data.evento_id,
        nombreSocio: data.nombre_socio,
        email: data.email,
        telefono: data.telefono,
        asistio: Boolean(data.asistio),
        certificadoEnviado: Boolean(data.certificado_enviado),
      };
    }

    const state = db.getState();
    if (!state.inscripciones) state.inscripciones = [];
    state.inscripciones.push(newIns);
    const event = state.eventos.find((e) => e.id === newIns.eventoId);
    if (event) {
      event.cuposInscriptos = (event.cuposInscriptos || 0) + 1;
    }
    db.save();
    return newIns;
  }

  private mapFromDb(e: any): ErpEvent {
    const inscriptosCount = e.inscripciones_eventos ? e.inscripciones_eventos.length : Number(e.cupos_inscriptos || 0);
    return {
      id: e.id,
      titulo: e.titulo,
      fecha: e.fecha,
      hora: e.hora,
      lugar: e.lugar,
      cuposMax: Number(e.cupos_max),
      cuposInscriptos: inscriptosCount,
      asistentesCount: Number(e.asistentes_count || 0),
      descripcion: e.descripcion,
      orador: e.orador,
      categoria: e.categoria,
      bannerUrl: e.banner_url,
      color: e.color,
      borderColor: e.border_color,
      textColor: e.text_color,
    };
  }
}

export const eventosRepository = new EventosRepository();

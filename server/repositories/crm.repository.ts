import { supabase, db } from "../db";
import { ErpCrmInteraction } from "../../src/types";

export class CrmRepository {
  public async getAll(socioId?: string): Promise<ErpCrmInteraction[]> {
    if (supabase) {
      let query = supabase
        .from("crm_interacciones")
        .select("*")
        .order("fecha", { ascending: false });

      if (socioId) {
        query = query.eq("socio_id", socioId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[CrmRepository] Error fetching CRM from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapFromDb);
    }
    const list = db.getState().crm || [];
    if (socioId) {
      return list.filter((c) => c.socioId === socioId);
    }
    return list;
  }

  public async getById(id: string): Promise<ErpCrmInteraction | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("crm_interacciones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[CrmRepository] Error fetching crm ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = db.getState().crm.find((c) => c.id === id);
    return found || null;
  }

  public async getBySocioId(socioId: string): Promise<ErpCrmInteraction[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("crm_interacciones")
        .select("*")
        .eq("socio_id", socioId)
        .order("fecha", { ascending: false });

      if (error) {
        console.error(`[CrmRepository] Error fetching CRM for socio ${socioId}:`, error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapFromDb);
    }
    return db.getState().crm.filter((c) => c.socioId === socioId);
  }

  public async create(crm: Omit<ErpCrmInteraction, "id"> & { id?: string }): Promise<ErpCrmInteraction> {
    const id = crm.id || crypto.randomUUID();
    const newCrm: ErpCrmInteraction = {
      ...crm,
      id,
      fecha: crm.fecha || new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("crm_interacciones")
        .insert({
          id: newCrm.id,
          socio_id: newCrm.socioId,
          socio_nombre: newCrm.socioNombre,
          tipo: newCrm.tipo,
          fecha: newCrm.fecha,
          responsable_nombre: newCrm.responsable,
          detalle: newCrm.detalle,
          remitente: newCrm.remitente || "Institucional",
          estado: newCrm.estado || "Realizado",
        })
        .select()
        .single();

      if (error) {
        console.error("[CrmRepository] Error creating CRM interaction in Supabase:", error);
        throw new Error(error.message);
      }
      return this.mapFromDb(data);
    }

    const state = db.getState();
    state.crm.unshift(newCrm);
    db.save();
    return newCrm;
  }

  public async update(id: string, updates: Partial<ErpCrmInteraction>): Promise<ErpCrmInteraction | null> {
    if (supabase) {
      const payload: Record<string, any> = {};
      if (updates.socioId !== undefined) payload.socio_id = updates.socioId;
      if (updates.socioNombre !== undefined) payload.socio_nombre = updates.socioNombre;
      if (updates.tipo !== undefined) payload.tipo = updates.tipo;
      if (updates.fecha !== undefined) payload.fecha = updates.fecha;
      if (updates.responsable !== undefined) payload.responsable_nombre = updates.responsable;
      if (updates.detalle !== undefined) payload.detalle = updates.detalle;
      if (updates.remitente !== undefined) payload.remitente = updates.remitente;
      if (updates.estado !== undefined) payload.estado = updates.estado;

      const { data, error } = await supabase
        .from("crm_interacciones")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[CrmRepository] Error updating crm ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.crm.findIndex((c) => c.id === id);
    if (index === -1) return null;
    state.crm[index] = { ...state.crm[index], ...updates };
    db.save();
    return state.crm[index];
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("crm_interacciones").delete().eq("id", id);
      if (error) {
        console.error(`[CrmRepository] Error deleting crm ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    const index = state.crm.findIndex((c) => c.id === id);
    if (index === -1) return false;
    state.crm.splice(index, 1);
    db.save();
    return true;
  }

  private mapFromDb(c: any): ErpCrmInteraction {
    return {
      id: c.id,
      socioId: c.socio_id,
      socioNombre: c.socio_nombre,
      tipo: c.tipo,
      fecha: c.fecha,
      responsable: c.responsable_nombre,
      detalle: c.detalle,
      remitente: c.remitente,
      estado: c.estado,
    };
  }
}

export const crmRepository = new CrmRepository();

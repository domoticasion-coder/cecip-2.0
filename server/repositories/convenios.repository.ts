import { supabase, db } from "../db";
import { ErpConvenio } from "../../src/types";

export class ConveniosRepository {
  public async getAll(): Promise<ErpConvenio[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("convenios_beneficios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[ConveniosRepository] Error fetching convenios from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapFromDb);
    }
    return db.getState().convenios;
  }

  public async getById(id: string): Promise<ErpConvenio | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("convenios_beneficios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[ConveniosRepository] Error fetching convenio ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = db.getState().convenios.find((c) => c.id === id);
    return found || null;
  }

  public async create(convenio: Omit<ErpConvenio, "id"> & { id?: string }): Promise<ErpConvenio> {
    const id = convenio.id || crypto.randomUUID();
    const item: ErpConvenio = {
      ...convenio,
      id,
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("convenios_beneficios")
        .insert({
          id: item.id,
          titulo: item.titulo,
          descripcion: item.descripcion,
          descuento: item.descuento,
          vigencia_texto: item.vigenciaTexto,
          categoria: item.categoria,
          estado: item.estado || "Activo",
        })
        .select()
        .single();

      if (error) {
        console.error("[ConveniosRepository] Error creating convenio in Supabase:", error);
        throw new Error(error.message);
      }
      return this.mapFromDb(data);
    }

    const state = db.getState();
    state.convenios.unshift(item);
    db.save();
    return item;
  }

  public async update(id: string, updates: Partial<ErpConvenio>): Promise<ErpConvenio | null> {
    if (supabase) {
      const payload: Record<string, any> = {};
      if (updates.titulo !== undefined) payload.titulo = updates.titulo;
      if (updates.descripcion !== undefined) payload.descripcion = updates.descripcion;
      if (updates.descuento !== undefined) payload.descuento = updates.descuento;
      if (updates.vigenciaTexto !== undefined) payload.vigencia_texto = updates.vigenciaTexto;
      if (updates.categoria !== undefined) payload.categoria = updates.categoria;
      if (updates.estado !== undefined) payload.estado = updates.estado;

      const { data, error } = await supabase
        .from("convenios_beneficios")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[ConveniosRepository] Error updating convenio ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.convenios.findIndex((c) => c.id === id);
    if (index === -1) return null;
    state.convenios[index] = { ...state.convenios[index], ...updates };
    db.save();
    return state.convenios[index];
  }

  public async toggleAdhesion(id: string, socioNombre: string): Promise<string[]> {
    const state = db.getState();
    if (!state.convenios) state.convenios = [];
    const found = state.convenios.find((c) => c.id === id);
    if (found) {
      if (!found.adheridos) found.adheridos = [];
      const idx = found.adheridos.indexOf(socioNombre);
      if (idx >= 0) {
        found.adheridos.splice(idx, 1);
      } else {
        found.adheridos.push(socioNombre);
      }
      db.save();
      return found.adheridos;
    }
    return [];
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("convenios_beneficios").delete().eq("id", id);
      if (error) {
        console.error(`[ConveniosRepository] Error deleting convenio ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    if (!state.convenios) state.convenios = [];
    const index = state.convenios.findIndex((c) => c.id === id);
    if (index === -1) return false;
    state.convenios.splice(index, 1);
    db.save();
    return true;
  }

  private mapFromDb(c: any): ErpConvenio {
    return {
      id: c.id,
      titulo: c.titulo,
      descripcion: c.descripcion,
      descuento: c.descuento,
      vigencia: c.vigencia_texto || c.vigencia || "Permanente",
      vigenciaTexto: c.vigencia_texto || c.vigencia || "Permanente",
      adheridos: c.adheridos || [],
      categoria: c.categoria,
      estado: c.estado || "Activo",
    };
  }
}

export const conveniosRepository = new ConveniosRepository();

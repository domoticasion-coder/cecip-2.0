import { supabase, db } from "../db";
import { ErpTesoreriaEntry } from "../../src/types";

export class TesoreriaRepository {
  public async getAll(): Promise<ErpTesoreriaEntry[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("tesoreria_movimientos")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) {
        console.error("[TesoreriaRepository] Error fetching tesorería from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapFromDb);
    }
    return db.getState().tesoreria;
  }

  public async getById(id: string): Promise<ErpTesoreriaEntry | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("tesoreria_movimientos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[TesoreriaRepository] Error fetching tesoreria ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = db.getState().tesoreria.find((t) => t.id === id);
    return found || null;
  }

  public async create(entry: Omit<ErpTesoreriaEntry, "id"> & { id?: string }): Promise<ErpTesoreriaEntry> {
    const id = entry.id || crypto.randomUUID();
    const newEntry: ErpTesoreriaEntry = {
      ...entry,
      id,
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("tesoreria_movimientos")
        .insert({
          id: newEntry.id,
          tipo: newEntry.tipo,
          detalle: newEntry.detalle,
          monto: newEntry.monto,
          fecha: newEntry.fecha,
          categoria: newEntry.categoria,
          banco: newEntry.banco,
          conciliado: Boolean(newEntry.conciliado),
          factura_id: newEntry.facturaId || null,
        })
        .select()
        .single();

      if (error) {
        console.error("[TesoreriaRepository] Error creating tesoreria in Supabase:", error);
        throw new Error(error.message);
      }
      return this.mapFromDb(data);
    }

    const state = db.getState();
    state.tesoreria.unshift(newEntry);
    db.save();
    return newEntry;
  }

  public async update(id: string, updates: Partial<ErpTesoreriaEntry>): Promise<ErpTesoreriaEntry | null> {
    if (supabase) {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.tipo !== undefined) payload.tipo = updates.tipo;
      if (updates.detalle !== undefined) payload.detalle = updates.detalle;
      if (updates.monto !== undefined) payload.monto = updates.monto;
      if (updates.fecha !== undefined) payload.fecha = updates.fecha;
      if (updates.categoria !== undefined) payload.categoria = updates.categoria;
      if (updates.banco !== undefined) payload.banco = updates.banco;
      if (updates.conciliado !== undefined) payload.conciliado = updates.conciliado;
      if (updates.facturaId !== undefined) payload.factura_id = updates.facturaId;

      const { data, error } = await supabase
        .from("tesoreria_movimientos")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[TesoreriaRepository] Error updating tesoreria ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.tesoreria.findIndex((t) => t.id === id);
    if (index === -1) return null;
    state.tesoreria[index] = { ...state.tesoreria[index], ...updates };
    db.save();
    return state.tesoreria[index];
  }

  public async conciliar(id: string, conciliar = true): Promise<ErpTesoreriaEntry | null> {
    return this.update(id, { conciliado: conciliar });
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("tesoreria_movimientos").delete().eq("id", id);
      if (error) {
        console.error(`[TesoreriaRepository] Error deleting tesoreria ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    const index = state.tesoreria.findIndex((t) => t.id === id);
    if (index === -1) return false;
    state.tesoreria.splice(index, 1);
    db.save();
    return true;
  }

  private mapFromDb(t: any): ErpTesoreriaEntry {
    return {
      id: t.id,
      tipo: t.tipo,
      detalle: t.detalle,
      monto: Number(t.monto),
      fecha: t.fecha,
      categoria: t.categoria,
      banco: t.banco,
      conciliado: Boolean(t.conciliado),
      facturaId: t.factura_id,
    };
  }
}

export const tesoreriaRepository = new TesoreriaRepository();

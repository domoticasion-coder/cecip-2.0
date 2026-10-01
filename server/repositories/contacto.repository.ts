import { supabase, db } from "../db";
import { ContactMessage } from "../../src/types";

export class ContactoRepository {
  public async getAll(): Promise<ContactMessage[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("mensajes_contacto")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) {
        console.error("[ContactoRepository] Error fetching contacto from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapFromDb);
    }
    return db.getState().contacto || [];
  }

  public async getById(id: string): Promise<ContactMessage | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("mensajes_contacto")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[ContactoRepository] Error fetching message ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = (db.getState().contacto || []).find((m) => m.id === id);
    return found || null;
  }

  public async create(msg: Omit<ContactMessage, "id"> & { id?: string }): Promise<ContactMessage> {
    const id = msg.id || crypto.randomUUID();
    const item: ContactMessage = {
      ...msg,
      id,
      fecha: msg.fecha || new Date().toISOString().split("T")[0],
      respondido: Boolean(msg.respondido),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("mensajes_contacto")
        .insert({
          id: item.id,
          nombre: item.nombre,
          empresa: item.empresa || "",
          telefono: item.telefono,
          email: item.email,
          mensaje: item.mensaje,
          fecha: item.fecha,
          respondido: item.respondido,
        })
        .select()
        .single();

      if (error) {
        console.error("[ContactoRepository] Error creating contacto msg in Supabase:", error);
        throw new Error(error.message);
      }
      return this.mapFromDb(data);
    }

    const state = db.getState();
    if (!state.contacto) state.contacto = [];
    state.contacto.unshift(item);
    db.save();
    return item;
  }

  public async markRespondido(id: string, respondido = true): Promise<ContactMessage | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("mensajes_contacto")
        .update({ respondido })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[ContactoRepository] Error marking respondido ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }

    const state = db.getState();
    if (!state.contacto) state.contacto = [];
    const index = state.contacto.findIndex((m) => m.id === id);
    if (index === -1) return null;
    state.contacto[index].respondido = respondido;
    db.save();
    return state.contacto[index];
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("mensajes_contacto").delete().eq("id", id);
      if (error) {
        console.error(`[ContactoRepository] Error deleting msg ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    if (!state.contacto) state.contacto = [];
    const index = state.contacto.findIndex((m) => m.id === id);
    if (index === -1) return false;
    state.contacto.splice(index, 1);
    db.save();
    return true;
  }

  private mapFromDb(m: any): ContactMessage {
    return {
      id: m.id,
      nombre: m.nombre,
      empresa: m.empresa || "",
      telefono: m.telefono,
      email: m.email,
      mensaje: m.mensaje,
      fecha: m.fecha,
      respondido: Boolean(m.respondido),
    };
  }
}

export const contactoRepository = new ContactoRepository();

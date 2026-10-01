import { supabase, db } from "../db";
import { ErpTicket } from "../../src/types";

export class TicketsRepository {
  public async getAll(socioId?: string): Promise<ErpTicket[]> {
    if (supabase) {
      let query = supabase
        .from("tickets_mesa_ayuda")
        .select("*, ticket_mensajes(*)")
        .order("fecha_creacion", { ascending: false });

      if (socioId) {
        query = query.eq("socio_id", socioId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[TicketsRepository] Error fetching tickets from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map((t: any) => this.mapFromDb(t));
    }
    const list = db.getState().tickets || [];
    if (socioId) {
      return list.filter((t) => t.socioId === socioId);
    }
    return list;
  }

  public async getById(id: string): Promise<ErpTicket | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("tickets_mesa_ayuda")
        .select("*, ticket_mensajes(*)")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[TicketsRepository] Error fetching ticket ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = db.getState().tickets.find((t) => t.id === id);
    return found || null;
  }

  public async create(ticket: Omit<ErpTicket, "id"> & { id?: string }): Promise<ErpTicket> {
    const id = ticket.id || crypto.randomUUID();
    const newTicket: ErpTicket = {
      ...ticket,
      id,
      mensajes: ticket.mensajes || [],
      fechaCreacion: ticket.fechaCreacion || new Date().toISOString(),
      ultimaActualizacion: ticket.ultimaActualizacion || new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("tickets_mesa_ayuda")
        .insert({
          id: newTicket.id,
          socio_id: newTicket.socioId,
          socio_nombre: newTicket.socioNombre,
          titulo: newTicket.titulo,
          estado: newTicket.estado || "Pendiente",
          categoria: newTicket.categoria || "Consulta General",
          fecha_creacion: newTicket.fechaCreacion,
          ultima_actualizacion: newTicket.ultimaActualizacion,
          sugerencia_ia: newTicket.sugerenciaIa || null,
        })
        .select()
        .single();

      if (error) {
        console.error("[TicketsRepository] Error creating ticket in Supabase:", error);
        throw new Error(error.message);
      }

      if (newTicket.mensajes && newTicket.mensajes.length > 0) {
        const msgInserts = newTicket.mensajes.map((m) => ({
          ticket_id: newTicket.id,
          remitente: m.remitente,
          rol: m.rol,
          texto: m.texto,
          fecha: m.fecha || new Date().toISOString(),
        }));
        await supabase.from("ticket_mensajes").insert(msgInserts);
      }

      return this.mapFromDb(data, newTicket.mensajes);
    }

    const state = db.getState();
    state.tickets.unshift(newTicket);
    db.save();
    return newTicket;
  }

  public async update(id: string, updates: Partial<ErpTicket>): Promise<ErpTicket | null> {
    if (supabase) {
      const payload: Record<string, any> = {
        ultima_actualizacion: new Date().toISOString(),
      };
      if (updates.estado !== undefined) payload.estado = updates.estado;
      if (updates.categoria !== undefined) payload.categoria = updates.categoria;
      if (updates.titulo !== undefined) payload.titulo = updates.titulo;
      if (updates.sugerenciaIa !== undefined) payload.sugerencia_ia = updates.sugerenciaIa;

      const { data, error } = await supabase
        .from("tickets_mesa_ayuda")
        .update(payload)
        .eq("id", id)
        .select("*, ticket_mensajes(*)")
        .single();

      if (error) {
        console.error(`[TicketsRepository] Error updating ticket ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.tickets.findIndex((t) => t.id === id);
    if (index === -1) return null;
    state.tickets[index] = { ...state.tickets[index], ...updates, ultimaActualizacion: new Date().toISOString() };
    db.save();
    return state.tickets[index];
  }

  public async addMessage(ticketId: string, message: { remitente: string; rol: "socio" | "staff" | "ia"; texto: string; fecha?: string }): Promise<any> {
    const item = {
      ...message,
      fecha: message.fecha || new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("ticket_mensajes")
        .insert({
          ticket_id: ticketId,
          remitente: item.remitente,
          rol: item.rol,
          texto: item.texto,
          fecha: item.fecha,
        })
        .select()
        .single();

      if (error) {
        console.error("[TicketsRepository] Error inserting ticket message:", error);
        throw new Error(error.message);
      }

      await supabase
        .from("tickets_mesa_ayuda")
        .update({ ultima_actualizacion: item.fecha })
        .eq("id", ticketId);

      return data;
    }

    const state = db.getState();
    const ticket = state.tickets.find((t) => t.id === ticketId);
    if (ticket) {
      if (!ticket.mensajes) ticket.mensajes = [];
      const msgObj = { ...item, id: crypto.randomUUID() };
      ticket.mensajes.push(msgObj);
      ticket.ultimaActualizacion = item.fecha;
      db.save();
      return msgObj;
    }
    return item;
  }

  public async addMensaje(ticketId: string, message: { remitente: string; rol: "socio" | "staff" | "ia"; texto: string; fecha?: string }): Promise<any> {
    return this.addMessage(ticketId, message);
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("tickets_mesa_ayuda").delete().eq("id", id);
      if (error) {
        console.error(`[TicketsRepository] Error deleting ticket ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    const index = state.tickets.findIndex((t) => t.id === id);
    if (index === -1) return false;
    state.tickets.splice(index, 1);
    db.save();
    return true;
  }

  private mapFromDb(t: any, fallbackMensajes?: any[]): ErpTicket {
    const rawMsgs = t.ticket_mensajes || fallbackMensajes || [];
    return {
      id: t.id,
      socioId: t.socio_id,
      socioNombre: t.socio_nombre,
      titulo: t.titulo,
      estado: t.estado,
      categoria: t.categoria,
      fechaCreacion: t.fecha_creacion,
      ultimaActualizacion: t.ultima_actualizacion,
      sugerenciaIA: t.sugerencia_ia,
      sugerenciaIa: t.sugerencia_ia,
      mensajes: rawMsgs.map((m: any) => ({
        id: m.id || crypto.randomUUID(),
        ticketId: m.ticket_id || t.id,
        remitente: m.remitente,
        rol: m.rol,
        texto: m.texto,
        fecha: m.fecha,
      })),
    };
  }
}

export const ticketsRepository = new TicketsRepository();

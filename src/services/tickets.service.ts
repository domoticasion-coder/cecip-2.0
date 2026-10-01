import { apiFetch } from "./api";
import { ErpTicket, TicketMensaje } from "../types";

export const ticketsService = {
  async getAll(): Promise<ErpTicket[]> {
    return await apiFetch<ErpTicket[]>("/api/tickets");
  },

  async getById(id: string): Promise<ErpTicket> {
    return await apiFetch<ErpTicket>(`/api/tickets/${id}`);
  },

  async create(ticket: {
    socioId: string;
    socioNombre: string;
    titulo: string;
    categoria: "Facturación" | "Asesoramiento" | "Inscripción Evento" | "Inconveniente Técnico" | "Otros";
    primerMensaje: string;
    remitente: string;
  }): Promise<ErpTicket> {
    return await apiFetch<ErpTicket>("/api/tickets", {
      method: "POST",
      body: JSON.stringify(ticket),
    });
  },

  async update(id: string, updates: Partial<ErpTicket>): Promise<ErpTicket> {
    return await apiFetch<ErpTicket>(`/api/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async addMessage(ticketId: string, message: {
    remitente: string;
    rol: "socio" | "staff" | "ia";
    texto: string;
  }): Promise<TicketMensaje> {
    return await apiFetch<TicketMensaje>(`/api/tickets/${ticketId}/mensajes`, {
      method: "POST",
      body: JSON.stringify(message),
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/tickets/${id}`, {
      method: "DELETE",
    });
  },
};

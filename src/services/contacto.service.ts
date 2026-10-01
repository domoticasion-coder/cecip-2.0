import { apiFetch } from "./api";
import { ContactMessage } from "../types";

export const contactoService = {
  async getAll(): Promise<ContactMessage[]> {
    return await apiFetch<ContactMessage[]>("/api/contacto");
  },

  async submitContact(data: {
    nombre: string;
    empresa?: string;
    telefono: string;
    email: string;
    mensaje: string;
  }): Promise<ContactMessage> {
    return await apiFetch<ContactMessage>("/api/contacto", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async markAsResponded(id: string, respondido: boolean): Promise<ContactMessage> {
    return await apiFetch<ContactMessage>(`/api/contacto/${id}/responder`, {
      method: "PATCH",
      body: JSON.stringify({ respondido }),
    });
  },

  async responder(id: string, respondido = true): Promise<ContactMessage> {
    return this.markAsResponded(id, respondido);
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/contacto/${id}`, {
      method: "DELETE",
    });
  },
};

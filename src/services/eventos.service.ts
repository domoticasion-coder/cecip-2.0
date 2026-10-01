import { apiFetch } from "./api";
import { ErpEvent, ErpEnrollment } from "../types";

export const eventosService = {
  async getAll(): Promise<ErpEvent[]> {
    return await apiFetch<ErpEvent[]>("/api/eventos");
  },

  async getById(id: string): Promise<ErpEvent> {
    return await apiFetch<ErpEvent>(`/api/eventos/${id}`);
  },

  async create(evento: Partial<ErpEvent>): Promise<ErpEvent> {
    return await apiFetch<ErpEvent>("/api/eventos", {
      method: "POST",
      body: JSON.stringify(evento),
    });
  },

  async update(id: string, evento: Partial<ErpEvent>): Promise<ErpEvent> {
    return await apiFetch<ErpEvent>(`/api/eventos/${id}`, {
      method: "PUT",
      body: JSON.stringify(evento),
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/eventos/${id}`, {
      method: "DELETE",
    });
  },

  async getEnrollments(eventoId?: string): Promise<ErpEnrollment[]> {
    const url = eventoId ? `/api/eventos/${eventoId}/inscripciones` : "/api/inscripciones";
    return await apiFetch<ErpEnrollment[]>(url);
  },

  async enroll(data: {
    eventoId: string;
    nombreSocio: string;
    email: string;
    telefono: string;
  }): Promise<ErpEnrollment> {
    return await apiFetch<ErpEnrollment>(`/api/eventos/${data.eventoId}/inscripciones`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateEnrollment(id: string, updates: Partial<ErpEnrollment>): Promise<ErpEnrollment> {
    return await apiFetch<ErpEnrollment>(`/api/inscripciones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async deleteEnrollment(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/inscripciones/${id}`, {
      method: "DELETE",
    });
  },
};

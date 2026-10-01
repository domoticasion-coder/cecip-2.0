import { apiFetch } from "./api";
import { ErpTesoreriaEntry } from "../types";

export const tesoreriaService = {
  async getAll(): Promise<ErpTesoreriaEntry[]> {
    return await apiFetch<ErpTesoreriaEntry[]>("/api/tesoreria");
  },

  async getById(id: string): Promise<ErpTesoreriaEntry> {
    return await apiFetch<ErpTesoreriaEntry>(`/api/tesoreria/${id}`);
  },

  async create(entry: Partial<ErpTesoreriaEntry>): Promise<ErpTesoreriaEntry> {
    return await apiFetch<ErpTesoreriaEntry>("/api/tesoreria", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  },

  async update(id: string, entry: Partial<ErpTesoreriaEntry>): Promise<ErpTesoreriaEntry> {
    return await apiFetch<ErpTesoreriaEntry>(`/api/tesoreria/${id}`, {
      method: "PUT",
      body: JSON.stringify(entry),
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/tesoreria/${id}`, {
      method: "DELETE",
    });
  },

  async conciliar(id: string, conciliado: boolean): Promise<ErpTesoreriaEntry> {
    return await apiFetch<ErpTesoreriaEntry>(`/api/tesoreria/${id}/conciliar`, {
      method: "PATCH",
      body: JSON.stringify({ conciliado }),
    });
  },
};

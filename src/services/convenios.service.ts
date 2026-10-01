import { apiFetch } from "./api";
import { ErpConvenio } from "../types";

export const conveniosService = {
  async getAll(): Promise<ErpConvenio[]> {
    return await apiFetch<ErpConvenio[]>("/api/convenios");
  },

  async getById(id: string): Promise<ErpConvenio> {
    return await apiFetch<ErpConvenio>(`/api/convenios/${id}`);
  },

  async create(convenio: Partial<ErpConvenio>): Promise<ErpConvenio> {
    return await apiFetch<ErpConvenio>("/api/convenios", {
      method: "POST",
      body: JSON.stringify(convenio),
    });
  },

  async update(id: string, convenio: Partial<ErpConvenio>): Promise<ErpConvenio> {
    return await apiFetch<ErpConvenio>(`/api/convenios/${id}`, {
      method: "PUT",
      body: JSON.stringify(convenio),
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/convenios/${id}`, {
      method: "DELETE",
    });
  },

  async toggleAdhesion(convenioId: string, socioNombre: string): Promise<{ adheridos: string[] }> {
    return await apiFetch<{ adheridos: string[] }>(`/api/convenios/${convenioId}/adhesion`, {
      method: "POST",
      body: JSON.stringify({ socioNombre }),
    });
  },
};

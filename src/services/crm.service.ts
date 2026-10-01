import { apiFetch } from "./api";
import { ErpCrmInteraction } from "../types";

export const crmService = {
  async getAll(params?: { socioId?: string; estado?: string }): Promise<ErpCrmInteraction[]> {
    const query = new URLSearchParams();
    if (params?.socioId) query.append("socioId", params.socioId);
    if (params?.estado) query.append("estado", params.estado);
    const queryString = query.toString();
    return await apiFetch<ErpCrmInteraction[]>(`/api/crm${queryString ? `?${queryString}` : ""}`);
  },

  async getById(id: string): Promise<ErpCrmInteraction> {
    return await apiFetch<ErpCrmInteraction>(`/api/crm/${id}`);
  },

  async create(interaction: Partial<ErpCrmInteraction>): Promise<ErpCrmInteraction> {
    return await apiFetch<ErpCrmInteraction>("/api/crm", {
      method: "POST",
      body: JSON.stringify(interaction),
    });
  },

  async update(id: string, interaction: Partial<ErpCrmInteraction>): Promise<ErpCrmInteraction> {
    return await apiFetch<ErpCrmInteraction>(`/api/crm/${id}`, {
      method: "PUT",
      body: JSON.stringify(interaction),
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/crm/${id}`, {
      method: "DELETE",
    });
  },
};

import { apiFetch } from "./api";
import { ErpSocio, SocioTimelineEvent } from "../types";

export const sociosService = {
  async getAll(): Promise<ErpSocio[]> {
    return await apiFetch<ErpSocio[]>("/api/socios");
  },

  async getById(id: string): Promise<ErpSocio> {
    return await apiFetch<ErpSocio>(`/api/socios/${id}`);
  },

  async create(socio: Partial<ErpSocio>): Promise<ErpSocio> {
    return await apiFetch<ErpSocio>("/api/socios", {
      method: "POST",
      body: JSON.stringify(socio),
    });
  },

  async update(id: string, socio: Partial<ErpSocio>): Promise<ErpSocio> {
    return await apiFetch<ErpSocio>(`/api/socios/${id}`, {
      method: "PUT",
      body: JSON.stringify(socio),
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/socios/${id}`, {
      method: "DELETE",
    });
  },

  async getTimeline(socioId: string): Promise<SocioTimelineEvent[]> {
    return await apiFetch<SocioTimelineEvent[]>(`/api/socios/${socioId}/timeline`);
  },

  async addTimelineEvent(socioId: string, event: Partial<SocioTimelineEvent>): Promise<SocioTimelineEvent> {
    return await apiFetch<SocioTimelineEvent>(`/api/socios/${socioId}/timeline`, {
      method: "POST",
      body: JSON.stringify(event),
    });
  },
};

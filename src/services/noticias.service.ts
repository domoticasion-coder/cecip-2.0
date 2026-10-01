import { apiFetch } from "./api";
import { WebNewsItem } from "../types";

export const noticiasService = {
  async getAll(): Promise<WebNewsItem[]> {
    return await apiFetch<WebNewsItem[]>("/api/noticias");
  },

  async getById(id: string): Promise<WebNewsItem> {
    return await apiFetch<WebNewsItem>(`/api/noticias/${id}`);
  },

  async create(news: Partial<WebNewsItem>): Promise<WebNewsItem> {
    return await apiFetch<WebNewsItem>("/api/noticias", {
      method: "POST",
      body: JSON.stringify(news),
    });
  },

  async update(id: string, news: Partial<WebNewsItem>): Promise<WebNewsItem> {
    return await apiFetch<WebNewsItem>(`/api/noticias/${id}`, {
      method: "PUT",
      body: JSON.stringify(news),
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/noticias/${id}`, {
      method: "DELETE",
    });
  },
};

import { apiFetch } from "./api";
import { CVSubmission } from "../types";

export const bolsaService = {
  async getAll(): Promise<CVSubmission[]> {
    return await apiFetch<CVSubmission[]>("/api/cvs");
  },

  async getAllCVs(): Promise<CVSubmission[]> {
    return this.getAll();
  },

  async getById(id: string): Promise<CVSubmission> {
    return await apiFetch<CVSubmission>(`/api/cvs/${id}`);
  },

  async createCV(cv: Partial<CVSubmission>): Promise<CVSubmission> {
    return await apiFetch<CVSubmission>("/api/cvs", {
      method: "POST",
      body: JSON.stringify(cv),
    });
  },

  async uploadCvFile(formData: FormData): Promise<{ fileName: string; fileSize: string; filePath: string }> {
    return await apiFetch<{ fileName: string; fileSize: string; filePath: string }>("/api/storage/upload?folder=cvs", {
      method: "POST",
      body: formData,
    });
  },

  async markInterest(cvId: string, socioNombre: string): Promise<{ success: boolean; interesados: string[] }> {
    return await apiFetch<{ success: boolean; interesados: string[] }>(`/api/cvs/${cvId}/interes`, {
      method: "POST",
      body: JSON.stringify({ socioNombre }),
    });
  },

  async addInteres(cvId: string, socioNombre: string): Promise<{ success: boolean; interesados: string[] }> {
    return this.markInterest(cvId, socioNombre);
  },

  async removeInterest(cvId: string, socioNombre: string): Promise<{ success: boolean; interesados: string[] }> {
    return await apiFetch<{ success: boolean; interesados: string[] }>(`/api/cvs/${cvId}/interes`, {
      method: "DELETE",
      body: JSON.stringify({ socioNombre }),
    });
  },

  async removeInteres(cvId: string, socioNombre: string): Promise<{ success: boolean; interesados: string[] }> {
    return this.removeInterest(cvId, socioNombre);
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/cvs/${id}`, {
      method: "DELETE",
    });
  },
};

import { apiFetch } from "./api";
import { ErpDoc } from "../types";

export const documentosService = {
  async getAll(): Promise<ErpDoc[]> {
    return await apiFetch<ErpDoc[]>("/api/documentos");
  },

  async getById(id: string): Promise<ErpDoc> {
    return await apiFetch<ErpDoc>(`/api/documentos/${id}`);
  },

  async create(doc: Partial<ErpDoc>): Promise<ErpDoc> {
    return await apiFetch<ErpDoc>("/api/documentos", {
      method: "POST",
      body: JSON.stringify(doc),
    });
  },

  async uploadDocumentFile(formData: FormData): Promise<{ fileName: string; fileSize: string; filePath: string }> {
    return await apiFetch<{ fileName: string; fileSize: string; filePath: string }>("/api/storage/upload?folder=documentos", {
      method: "POST",
      body: formData,
    });
  },

  async incrementDownload(id: string): Promise<{ descargasCount: number }> {
    return await apiFetch<{ descargasCount: number }>(`/api/documentos/${id}/descargar`, {
      method: "POST",
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return await apiFetch<{ success: boolean }>(`/api/documentos/${id}`, {
      method: "DELETE",
    });
  },
};

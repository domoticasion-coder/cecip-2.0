import { apiFetch } from "./api";

export const storageService = {
  async uploadFile(file: File, folder: string = "general"): Promise<{ fileName: string; fileSize: string; filePath: string; url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return await apiFetch<{ fileName: string; fileSize: string; filePath: string; url: string }>(
      `/api/storage/upload?folder=${encodeURIComponent(folder)}`,
      {
        method: "POST",
        body: formData,
      }
    );
  },
};

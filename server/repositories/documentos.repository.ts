import { supabase, db } from "../db";
import { ErpDocument } from "../../src/types";

export class DocumentosRepository {
  public async getAll(): Promise<ErpDocument[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("documentos_digitales")
        .select("*")
        .order("fecha_subida", { ascending: false });

      if (error) {
        console.error("[DocumentosRepository] Error fetching documentos from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapFromDb);
    }
    return db.getState().documentos;
  }

  public async getById(id: string): Promise<ErpDocument | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("documentos_digitales")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[DocumentosRepository] Error fetching doc ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = db.getState().documentos.find((d) => d.id === id);
    return found || null;
  }

  public async create(doc: Omit<ErpDocument, "id"> & { id?: string }): Promise<ErpDocument> {
    const id = doc.id || crypto.randomUUID();
    const item: ErpDocument = {
      ...doc,
      id,
      fechaSubida: doc.fechaSubida || new Date().toISOString().split("T")[0],
      descargasCount: doc.descargasCount || 0,
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("documentos_digitales")
        .insert({
          id: item.id,
          nombre: item.nombre,
          carpeta: item.carpeta,
          version: item.version,
          fecha_subida: item.fechaSubida,
          tamanio: item.tamanio,
          tamanio_formato: item.tamanioFormato,
          file_path: item.filePath || `/storage/docs/${item.nombre}`,
          permisos: item.permisos || [],
          descargas_count: item.descargasCount,
        })
        .select()
        .single();

      if (error) {
        console.error("[DocumentosRepository] Error creating doc in Supabase:", error);
        throw new Error(error.message);
      }
      return this.mapFromDb(data);
    }

    const state = db.getState();
    state.documentos.unshift(item);
    db.save();
    return item;
  }

  public async incrementDescargas(id: string): Promise<void> {
    if (supabase) {
      const doc = await this.getById(id);
      if (doc) {
        await supabase
          .from("documentos_digitales")
          .update({ descargas_count: (doc.descargasCount || 0) + 1 })
          .eq("id", id);
      }
      return;
    }

    const state = db.getState();
    const doc = state.documentos.find((d) => d.id === id);
    if (doc) {
      doc.descargasCount = (doc.descargasCount || 0) + 1;
      db.save();
    }
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("documentos_digitales").delete().eq("id", id);
      if (error) {
        console.error(`[DocumentosRepository] Error deleting doc ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    const index = state.documentos.findIndex((d) => d.id === id);
    if (index === -1) return false;
    state.documentos.splice(index, 1);
    db.save();
    return true;
  }

  private mapFromDb(d: any): ErpDocument {
    return {
      id: d.id,
      nombre: d.nombre,
      carpeta: d.carpeta,
      version: d.version,
      fechaSubida: d.fecha_subida,
      tamanio: String(d.tamanio_formato || d.tamanio || "1.2 MB"),
      tamanioFormato: d.tamanio_formato,
      filePath: d.file_path,
      permisos: Array.isArray(d.permisos) ? d.permisos : [],
      descargasCount: Number(d.descargas_count || 0),
    };
  }
}

export const documentosRepository = new DocumentosRepository();

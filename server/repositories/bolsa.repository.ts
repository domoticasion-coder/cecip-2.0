import { supabase, db } from "../db";
import { ErpCv } from "../../src/types";

export class BolsaRepository {
  public async getAll(area?: string): Promise<ErpCv[]> {
    if (supabase) {
      let query = supabase
        .from("bolsa_cvs")
        .select("*, cv_interes_socios(*)")
        .order("fecha_subida", { ascending: false });

      if (area) {
        query = query.eq("area_busqueda", area);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[BolsaRepository] Error fetching bolsa_cvs from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map((c: any) => this.mapFromDb(c));
    }
    const list = db.getState().cvs || [];
    if (area) {
      return list.filter((c) => c.areaBusqueda.toLowerCase().includes(area.toLowerCase()));
    }
    return list;
  }

  public async getById(id: string): Promise<ErpCv | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("bolsa_cvs")
        .select("*, cv_interes_socios(*)")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[BolsaRepository] Error fetching cv ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = (db.getState().cvs || []).find((c) => c.id === id);
    return found || null;
  }

  public async create(cv: Omit<ErpCv, "id"> & { id?: string }): Promise<ErpCv> {
    const id = cv.id || crypto.randomUUID();
    const newCv: ErpCv = {
      ...cv,
      id,
      interesados: cv.interesados || cv.interesSocios || [],
      interesSocios: cv.interesSocios || cv.interesados || [],
      fechaSubida: cv.fechaSubida || new Date().toISOString().split("T")[0],
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("bolsa_cvs")
        .insert({
          id: newCv.id,
          nombre: newCv.nombre,
          email: newCv.email,
          telefono: newCv.telefono,
          area_busqueda: newCv.areaBusqueda,
          tipo_profesional: newCv.tipoProfesional,
          file_name: newCv.fileName,
          file_size: typeof newCv.fileSize === "number" ? newCv.fileSize : 0,
          file_path: newCv.filePath || `/storage/cvs/${newCv.fileName}`,
          fecha_subida: newCv.fechaSubida,
          comentarios: newCv.comentarios || null,
        })
        .select()
        .single();

      if (error) {
        console.error("[BolsaRepository] Error creating cv in Supabase:", error);
        throw new Error(error.message);
      }

      if (newCv.interesados.length > 0) {
        const inserts = newCv.interesados.map((s) => ({
          cv_id: newCv.id,
          socio_nombre: s,
        }));
        await supabase.from("cv_interes_socios").insert(inserts);
      }

      return this.mapFromDb(data, newCv.interesados);
    }

    const state = db.getState();
    if (!state.cvs) state.cvs = [];
    state.cvs.unshift(newCv);
    db.save();
    return newCv;
  }

  public async addInteres(cvId: string, socioNombre: string): Promise<string[]> {
    if (supabase) {
      await supabase.from("cv_interes_socios").insert({
        cv_id: cvId,
        socio_nombre: socioNombre,
      });
      const cv = await this.getById(cvId);
      return cv ? (cv.interesados || cv.interesSocios || []) : [];
    }

    const state = db.getState();
    if (!state.cvs) state.cvs = [];
    const found = state.cvs.find((c) => c.id === cvId);
    if (found) {
      if (!found.interesados) found.interesados = [];
      if (!found.interesados.includes(socioNombre)) {
        found.interesados.push(socioNombre);
      }
      found.interesSocios = found.interesados;
      db.save();
      return found.interesados;
    }
    return [];
  }

  public async removeInteres(cvId: string, socioNombre: string): Promise<string[]> {
    if (supabase) {
      await supabase.from("cv_interes_socios").delete().eq("cv_id", cvId).eq("socio_nombre", socioNombre);
      const cv = await this.getById(cvId);
      return cv ? (cv.interesados || cv.interesSocios || []) : [];
    }

    const state = db.getState();
    if (!state.cvs) state.cvs = [];
    const found = state.cvs.find((c) => c.id === cvId);
    if (found) {
      if (!found.interesados) found.interesados = [];
      found.interesados = found.interesados.filter((s) => s !== socioNombre);
      found.interesSocios = found.interesados;
      db.save();
      return found.interesados;
    }
    return [];
  }

  public async addInteresSocio(cvId: string, socioNombre: string): Promise<void> {
    await this.addInteres(cvId, socioNombre);
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("bolsa_cvs").delete().eq("id", id);
      if (error) {
        console.error(`[BolsaRepository] Error deleting cv ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    if (!state.cvs) state.cvs = [];
    const index = state.cvs.findIndex((c) => c.id === id);
    if (index === -1) return false;
    state.cvs.splice(index, 1);
    db.save();
    return true;
  }

  private mapFromDb(c: any, fallbackInteres?: string[]): ErpCv {
    const rawInteres = c.cv_interes_socios || [];
    const interesSocios = rawInteres.length > 0
      ? rawInteres.map((i: any) => i.socio_nombre)
      : fallbackInteres || [];

    return {
      id: c.id,
      nombre: c.nombre,
      email: c.email,
      telefono: c.telefono,
      areaBusqueda: c.area_busqueda,
      tipoProfesional: c.tipo_profesional,
      fileName: c.file_name,
      fileSize: Number(c.file_size || 0),
      filePath: c.file_path,
      fechaSubida: c.fecha_subida,
      comentarios: c.comentarios || "",
      interesados: interesSocios,
      interesSocios,
    };
  }
}

export const bolsaRepository = new BolsaRepository();

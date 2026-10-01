import { supabase, db } from "../db";
import { ErpUser } from "../../src/types";

export class UsuariosRepository {
  public async getAll(): Promise<ErpUser[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[UsuariosRepository] Error fetching usuarios from Supabase:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapFromDb);
    }
    return db.getState().usuarios;
  }

  public async getById(id: string): Promise<ErpUser | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[UsuariosRepository] Error fetching user ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = db.getState().usuarios.find((u) => u.id === id);
    return found || null;
  }

  public async getByEmail(email: string): Promise<ErpUser | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`[UsuariosRepository] Error fetching user by email:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }
    const found = db.getState().usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    return found || null;
  }

  public async create(user: Omit<ErpUser, "id"> & { id?: string }): Promise<ErpUser> {
    const id = user.id || crypto.randomUUID();
    const item: ErpUser = {
      ...user,
      id,
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("usuarios")
        .insert({
          id: item.id,
          nombre: item.nombre,
          apellido: item.apellido,
          email: item.email.toLowerCase().trim(),
          rol: item.rol,
          estado: item.estado || "Activo",
        })
        .select()
        .single();

      if (error) {
        console.error("[UsuariosRepository] Error creating usuario in Supabase:", error);
        throw new Error(error.message);
      }
      return this.mapFromDb(data);
    }

    const state = db.getState();
    state.usuarios.push(item);
    db.save();
    return item;
  }

  public async update(id: string, updates: Partial<ErpUser>): Promise<ErpUser | null> {
    if (supabase) {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.nombre !== undefined) payload.nombre = updates.nombre;
      if (updates.apellido !== undefined) payload.apellido = updates.apellido;
      if (updates.email !== undefined) payload.email = updates.email.toLowerCase().trim();
      if (updates.rol !== undefined) payload.rol = updates.rol;
      if (updates.estado !== undefined) payload.estado = updates.estado;

      const { data, error } = await supabase
        .from("usuarios")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[UsuariosRepository] Error updating usuario ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.usuarios.findIndex((u) => u.id === id);
    if (index === -1) return null;
    state.usuarios[index] = { ...state.usuarios[index], ...updates };
    db.save();
    return state.usuarios[index];
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from("usuarios").delete().eq("id", id);
      if (error) {
        console.error(`[UsuariosRepository] Error deleting user ${id}:`, error);
        throw new Error(error.message);
      }
      return true;
    }

    const state = db.getState();
    const index = state.usuarios.findIndex((u) => u.id === id);
    if (index === -1) return false;
    state.usuarios.splice(index, 1);
    db.save();
    return true;
  }

  private mapFromDb(u: any): ErpUser {
    return {
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      rol: u.rol,
      estado: u.estado,
    };
  }
}

export const usuariosRepository = new UsuariosRepository();

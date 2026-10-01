import { apiFetch } from "./api";
import { Usuario } from "../types";
import { getSupabase } from "../lib/supabase";

export interface LoginResponse {
  user: Usuario;
  token?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // 1. Check if Supabase Auth is enabled
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          throw error;
        }
        if (data && data.user) {
          // Fetch user metadata from our backend
          const userRes = await apiFetch<Usuario>(`/api/auth/me?email=${encodeURIComponent(email)}`);
          return {
            user: userRes,
            token: data.session?.access_token,
          };
        }
      } catch (err: any) {
        console.warn("Supabase auth falló o no está inicializado, intentando backend auth:", err.message);
      }
    }

    // 2. Standard backend REST login
    return await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async getCurrentUser(): Promise<Usuario | null> {
    try {
      return await apiFetch<Usuario>("/api/auth/session");
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Error cerrando sesion en Supabase:", e);
      }
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("cecip_auth_token");
      localStorage.removeItem("cecip_auth_user");
    }
  },

  async getUsuarios(): Promise<Usuario[]> {
    return await apiFetch<Usuario[]>("/api/usuarios");
  },
};

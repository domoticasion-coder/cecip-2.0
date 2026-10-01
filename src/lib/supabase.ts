import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Read environment variables for Supabase
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.warn("No se pudo inicializar el cliente Supabase:", e);
      return null;
    }
  }

  return null;
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

/**
 * Conexión con el ERP del CeCIP (cecip-erp): la web toma de ahí los eventos, capacitaciones y
 * novedades publicados, y manda los CV de la Bolsa de Empleo.
 *
 * Usa la clave PÚBLICA (anon) de Supabase del ERP, la misma que ya viaja en el ERP: con ella la web
 * solo puede llamar a web_contenido() y web_postular_cv() y subir archivos a "bolsa-cvs/web/".
 * Se pueden cambiar con VITE_ERP_SUPABASE_URL y VITE_ERP_SUPABASE_ANON_KEY.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const env = (import.meta as any).env || {};
const ERP_SUPABASE_URL: string = env.VITE_ERP_SUPABASE_URL || "https://jdofwntdquoukuvwxilc.supabase.co";
const ERP_SUPABASE_ANON_KEY: string = env.VITE_ERP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkb2Z3bnRkcXVvdWt1dnd4aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4OTQ1NjQsImV4cCI6MjEwNzQ3MDU2NH0.8-ZKNOkCPvCm9nqaCFvSr2Knwdf5w_BaE6FRGJ1fegA";
/** Dirección pública del ERP (para los formularios de inscripción del Portal de Socios) */
export const ERP_URL: string = (env.VITE_ERP_URL || "https://cecip-erp.vercel.app").replace(/\/$/, "");

let cliente: SupabaseClient | null = null;
export function erp(): SupabaseClient {
  if (!cliente) cliente = createClient(ERP_SUPABASE_URL, ERP_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  return cliente;
}

export interface EventoErp {
  id: string; titulo: string; tipo: "evento" | "capacitacion"; descripcion: string | null; fecha_inicio: string; fecha_fin: string | null;
  lugar: string | null; modalidad: string; link: string | null; costo: number; precio_no_socio: number | null; imagen_url: string | null;
  cantidad_clases: number | null; dias_semana: number[] | null; hora_inicio: string | null; hora_fin: string | null; docente: string | null;
  slug_inscripcion: string | null; inscripcion_abierta: boolean;
}
export interface NovedadErp { id: string; titulo: string; cuerpo: string; imagen_url: string | null; fecha: string; destacado: boolean }

/** Eventos, capacitaciones y novedades publicados en el ERP para la web. */
export async function contenidoWeb(): Promise<{ eventos: EventoErp[]; novedades: NovedadErp[] }> {
  const { data, error } = await erp().rpc("web_contenido");
  if (error) throw new Error(error.message);
  return { eventos: data?.eventos || [], novedades: data?.novedades || [] };
}

const nombreSeguro = (n: string) => n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w.-]+/g, "_").slice(-80) || "cv.pdf";

/** Sube el CV al ERP y registra la postulación en la Bolsa de Empleo. */
export async function postularCv(datos: {
  nombre: string; email: string; telefono: string; area: string; tipoProfesional: string; comentarios?: string; localidad?: string;
}, archivo: File): Promise<void> {
  if (archivo.size > 5 * 1024 * 1024) throw new Error("El archivo supera los 5 MB.");
  const ruta = `web/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}-${nombreSeguro(archivo.name)}`;
  const { error: e1 } = await erp().storage.from("bolsa-cvs").upload(ruta, archivo, { contentType: archivo.type || "application/pdf", upsert: false });
  if (e1) throw new Error("No se pudo subir el archivo. Probá con un PDF de menos de 5 MB.");
  const { error: e2 } = await erp().rpc("web_postular_cv", {
    p_nombre: datos.nombre, p_email: datos.email, p_telefono: datos.telefono, p_area: datos.area, p_tipo_profesional: datos.tipoProfesional,
    p_comentarios: datos.comentarios || null, p_localidad: datos.localidad || null,
    p_archivo_path: ruta, p_archivo_nombre: archivo.name, p_archivo_tamano: `${(archivo.size / (1024 * 1024)).toFixed(1)} MB`,
  });
  if (e2) throw new Error(e2.message);
}

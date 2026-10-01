import { 
  InteligenciaDashboardResumen, SocioSaludHistorial, AlertaOperativa, 
  AccionOperativa, Automatizacion, AutomatizacionEjecucion, 
  OportunidadOperativa, IaActividad, AuditoriaEntry 
} from "../types";

const API_BASE = "/api/intelligence";

export const intelligenceService = {
  // 1. Dashboard & Bandeja
  async getDashboard(): Promise<InteligenciaDashboardResumen> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error("Error al obtener dashboard de inteligencia");
    return res.json();
  },

  async getBandeja(): Promise<InteligenciaDashboardResumen["bandejaUrgencias"]> {
    const res = await fetch(`${API_BASE}/bandeja`);
    if (!res.ok) throw new Error("Error al obtener bandeja operativa");
    return res.json();
  },

  async runFullAnalysis(usuarioNombre = "Operador CeCIP"): Promise<{
    success: boolean;
    mensaje: string;
    resultado: {
      nuevasAlertas: number;
      nuevasAcciones: number;
      nuevasOportunidades: number;
      automatizacionesEjecutadas: number;
    };
  }> {
    const res = await fetch(`${API_BASE}/run-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioNombre }),
    });
    if (!res.ok) throw new Error("Error al ejecutar análisis de inteligencia");
    return res.json();
  },

  // 2. Salud del Socio
  async getSaludSocios(params?: { categoria?: string; tendencia?: string; busqueda?: string }): Promise<SocioSaludHistorial[]> {
    const query = new URLSearchParams();
    if (params?.categoria) query.append("categoria", params.categoria);
    if (params?.tendencia) query.append("tendencia", params.tendencia);
    if (params?.busqueda) query.append("busqueda", params.busqueda);

    const res = await fetch(`${API_BASE}/salud?${query.toString()}`);
    if (!res.ok) throw new Error("Error al consultar salud de socios");
    return res.json();
  },

  async getSaludSocio(socioId: string): Promise<SocioSaludHistorial> {
    const res = await fetch(`${API_BASE}/salud/${socioId}`);
    if (!res.ok) throw new Error("Error al consultar salud del socio");
    return res.json();
  },

  async getSaludHistorial(socioId: string): Promise<SocioSaludHistorial[]> {
    const res = await fetch(`${API_BASE}/salud/${socioId}/historial`);
    if (!res.ok) throw new Error("Error al consultar historial de salud del socio");
    return res.json();
  },

  async recalcularSalud(): Promise<{ success: boolean; mensaje: string; data: SocioSaludHistorial[] }> {
    const res = await fetch(`${API_BASE}/salud/recalcular`, { method: "POST" });
    if (!res.ok) throw new Error("Error al recalcular salud de socios");
    return res.json();
  },

  // 3. Alertas Operativas
  async getAlertas(params?: { estado?: string; prioridad?: string; tipo?: string }): Promise<AlertaOperativa[]> {
    const query = new URLSearchParams();
    if (params?.estado) query.append("estado", params.estado);
    if (params?.prioridad) query.append("prioridad", params.prioridad);
    if (params?.tipo) query.append("tipo", params.tipo);

    const res = await fetch(`${API_BASE}/alertas?${query.toString()}`);
    if (!res.ok) throw new Error("Error al consultar alertas operativas");
    return res.json();
  },

  async updateAlerta(id: string, data: Partial<AlertaOperativa>): Promise<AlertaOperativa> {
    const res = await fetch(`${API_BASE}/alertas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar alerta operativa");
    return res.json();
  },

  // 4. Acciones Operativas
  async getAcciones(params?: { estado?: string; prioridad?: string; socioId?: string }): Promise<AccionOperativa[]> {
    const query = new URLSearchParams();
    if (params?.estado) query.append("estado", params.estado);
    if (params?.prioridad) query.append("prioridad", params.prioridad);
    if (params?.socioId) query.append("socioId", params.socioId);

    const res = await fetch(`${API_BASE}/acciones?${query.toString()}`);
    if (!res.ok) throw new Error("Error al consultar acciones operativas");
    return res.json();
  },

  async createAccion(accion: Partial<AccionOperativa>): Promise<AccionOperativa> {
    const res = await fetch(`${API_BASE}/acciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accion),
    });
    if (!res.ok) throw new Error("Error al crear acción operativa");
    return res.json();
  },

  async updateAccion(id: string, data: Partial<AccionOperativa>): Promise<AccionOperativa> {
    const res = await fetch(`${API_BASE}/acciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar acción operativa");
    return res.json();
  },

  // 5. Automatizaciones
  async getAutomatizaciones(): Promise<Automatizacion[]> {
    const res = await fetch(`${API_BASE}/automatizaciones`);
    if (!res.ok) throw new Error("Error al obtener automatizaciones");
    return res.json();
  },

  async toggleAutomatizacion(id: string): Promise<Automatizacion> {
    const res = await fetch(`${API_BASE}/automatizaciones/${id}/toggle`, { method: "PATCH" });
    if (!res.ok) throw new Error("Error al cambiar estado de automatización");
    return res.json();
  },

  async ejecutarAutomatizacion(id: string): Promise<{ success: boolean; mensaje: string }> {
    const res = await fetch(`${API_BASE}/automatizaciones/${id}/ejecutar`, { method: "POST" });
    if (!res.ok) throw new Error("Error al ejecutar automatización");
    return res.json();
  },

  async getAutomatizacionesEjecuciones(): Promise<AutomatizacionEjecucion[]> {
    const res = await fetch(`${API_BASE}/automatizaciones/ejecuciones`);
    if (!res.ok) throw new Error("Error al obtener historial de automatizaciones");
    return res.json();
  },

  // 6. Oportunidades
  async getOportunidades(estado?: string): Promise<OportunidadOperativa[]> {
    const query = estado ? `?estado=${encodeURIComponent(estado)}` : "";
    const res = await fetch(`${API_BASE}/oportunidades${query}`);
    if (!res.ok) throw new Error("Error al obtener oportunidades");
    return res.json();
  },

  async updateOportunidad(id: string, data: Partial<OportunidadOperativa>): Promise<OportunidadOperativa> {
    const res = await fetch(`${API_BASE}/oportunidades/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar oportunidad");
    return res.json();
  },

  // 7. Auditoría & Bitácora IA
  async getIaActividad(): Promise<IaActividad[]> {
    const res = await fetch(`${API_BASE}/ia-actividad`);
    if (!res.ok) throw new Error("Error al obtener bitácora de IA");
    return res.json();
  },

  async getAuditoria(entidad?: string, limit = 100): Promise<AuditoriaEntry[]> {
    const query = new URLSearchParams();
    if (entidad) query.append("entidad", entidad);
    if (limit) query.append("limit", limit.toString());

    const res = await fetch(`${API_BASE}/auditoria?${query.toString()}`);
    if (!res.ok) throw new Error("Error al obtener auditoría");
    return res.json();
  },
};

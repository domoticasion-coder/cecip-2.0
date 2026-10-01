import { supabase, db } from "../db";
import { 
  SocioSaludHistorial, AlertaOperativa, AccionOperativa, 
  Automatizacion, AutomatizacionEjecucion, OportunidadOperativa, 
  IaActividad, AuditoriaEntry 
} from "../../src/types";

export class IntelligenceRepository {
  // ============================================================================
  // 1. SALUD DEL SOCIO (socio_salud_historial)
  // ============================================================================

  public async getSaludHistorial(filter?: {
    socioId?: string;
    categoria?: string;
    tendencia?: string;
    fecha?: string;
  }): Promise<SocioSaludHistorial[]> {
    if (supabase) {
      let query = supabase
        .from("socio_salud_historial")
        .select("*, socios(razon_social, nombre_comercial)")
        .order("fecha", { ascending: false });

      if (filter?.socioId) query = query.eq("socio_id", filter.socioId);
      if (filter?.categoria) query = query.ilike("categoria", filter.categoria);
      if (filter?.tendencia) query = query.eq("tendencia", filter.tendencia);
      if (filter?.fecha) query = query.eq("fecha", filter.fecha);

      const { data, error } = await query;
      if (error) {
        console.error("[IntelligenceRepository] Error fetching socio_salud_historial:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapSaludFromDb);
    }

    let list = db.getState().socioSaludHistorial;
    if (filter?.socioId) list = list.filter((s) => s.socioId === filter.socioId);
    if (filter?.categoria) list = list.filter((s) => s.categoria.toLowerCase() === filter.categoria!.toLowerCase());
    if (filter?.tendencia) list = list.filter((s) => s.tendencia === filter.tendencia);
    if (filter?.fecha) list = list.filter((s) => s.fecha === filter.fecha);
    return list;
  }

  public async getLatestSaludForAllSocios(): Promise<SocioSaludHistorial[]> {
    const all = await this.getSaludHistorial();
    const map = new Map<string, SocioSaludHistorial>();
    for (const h of all) {
      const existing = map.get(h.socioId);
      if (!existing || new Date(h.fecha).getTime() > new Date(existing.fecha).getTime()) {
        map.set(h.socioId, h);
      }
    }
    return Array.from(map.values());
  }

  public async saveSaludBatch(records: SocioSaludHistorial[]): Promise<void> {
    if (records.length === 0) return;

    if (supabase) {
      // In Supabase, check if a record for the same socio and same date exists to avoid duplicate rows per run
      for (const r of records) {
        const payload = {
          socio_id: r.socioId,
          score: r.score,
          categoria: r.categoria,
          score_financiero: r.scoreFinanciero,
          score_relacion: r.scoreRelacion,
          score_participacion: r.scoreParticipacion,
          score_atencion: r.scoreAtencion,
          score_antiguedad: r.scoreAntiguedad,
          factores: r.factores,
          recomendaciones: r.recomendaciones,
          tendencia: r.tendencia,
          fecha: r.fecha || new Date().toISOString().split("T")[0],
        };

        const { data: existing } = await supabase
          .from("socio_salud_historial")
          .select("id")
          .eq("socio_id", r.socioId)
          .eq("fecha", payload.fecha)
          .limit(1);

        if (existing && existing.length > 0) {
          await supabase
            .from("socio_salud_historial")
            .update(payload)
            .eq("id", existing[0].id);
        } else {
          await supabase
            .from("socio_salud_historial")
            .insert({
              id: r.id || crypto.randomUUID(),
              ...payload,
            });
        }
      }
      return;
    }

    const state = db.getState();
    const map = new Map<string, SocioSaludHistorial>();
    for (const h of state.socioSaludHistorial) {
      map.set(`${h.socioId}-${h.fecha}`, h);
    }
    for (const h of records) {
      map.set(`${h.socioId}-${h.fecha}`, h);
    }
    state.socioSaludHistorial = Array.from(map.values());
    db.save();
  }

  // ============================================================================
  // 2. ALERTAS OPERATIVAS (alertas_operativas)
  // ============================================================================

  public async getAlertas(filter?: {
    estado?: string;
    prioridad?: string;
    socioId?: string;
  }): Promise<AlertaOperativa[]> {
    if (supabase) {
      let query = supabase
        .from("alertas_operativas")
        .select("*")
        .order("fecha_deteccion", { ascending: false });

      if (filter?.estado) query = query.eq("estado", filter.estado);
      if (filter?.prioridad) query = query.eq("prioridad", filter.prioridad);
      if (filter?.socioId) query = query.eq("socio_id", filter.socioId);

      const { data, error } = await query;
      if (error) {
        console.error("[IntelligenceRepository] Error fetching alertas:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapAlertaFromDb);
    }

    let list = db.getState().alertas;
    if (filter?.estado) list = list.filter((a) => a.estado === filter.estado);
    if (filter?.prioridad) list = list.filter((a) => a.prioridad === filter.prioridad);
    if (filter?.socioId) list = list.filter((a) => a.socioId === filter.socioId);
    return list;
  }

  public async getAlertasActivas(): Promise<AlertaOperativa[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("alertas_operativas")
        .select("*")
        .not("estado", "in", '("Resuelta","Descartada")')
        .order("fecha_deteccion", { ascending: false });

      if (error) {
        console.error("[IntelligenceRepository] Error fetching active alerts:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapAlertaFromDb);
    }

    return db.getState().alertas.filter((a) => a.estado !== "Resuelta" && a.estado !== "Descartada");
  }

  public async saveAlerta(alerta: AlertaOperativa): Promise<AlertaOperativa> {
    const id = alerta.id || crypto.randomUUID();
    const item: AlertaOperativa = {
      ...alerta,
      id,
      fechaDeteccion: alerta.fechaDeteccion || new Date().toISOString(),
    };

    if (supabase) {
      // Check fingerprint deduplication
      if (item.fingerprint) {
        const { data: existing } = await supabase
          .from("alertas_operativas")
          .select("id, estado")
          .eq("fingerprint", item.fingerprint)
          .not("estado", "in", '("Resuelta","Descartada")')
          .limit(1);

        if (existing && existing.length > 0) {
          // Already active, do not duplicate
          return item;
        }
      }

      const { data, error } = await supabase
        .from("alertas_operativas")
        .insert({
          id: item.id,
          tipo: item.tipo,
          titulo: item.titulo,
          descripcion: item.descripcion,
          entidad_tipo: item.entidadTipo,
          entidad_id: item.entidadId || null,
          socio_id: item.socioId || null,
          socio_nombre: item.socioNombre || null,
          prioridad: item.prioridad,
          estado: item.estado || "Nueva",
          responsable_id: item.responsableId || null,
          responsable_nombre: item.responsableNombre || null,
          detectada_por: item.detectadaPor || "motor_reglas",
          fingerprint: item.fingerprint || null,
          fecha_deteccion: item.fechaDeteccion,
          fecha_limite: item.fechaLimite || null,
          metadata: item.metadata || {},
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Unique fingerprint collision, return existing safely
          return item;
        }
        console.error("[IntelligenceRepository] Error inserting alerta:", error);
        throw new Error(error.message);
      }
      return this.mapAlertaFromDb(data);
    }

    const state = db.getState();
    const exists = state.alertas.some(
      (a) => a.fingerprint && a.fingerprint === item.fingerprint && a.estado !== "Resuelta" && a.estado !== "Descartada"
    );
    if (!exists) {
      state.alertas.unshift(item);
      db.save();
    }
    return item;
  }

  public async updateAlerta(id: string, updates: Partial<AlertaOperativa>): Promise<AlertaOperativa | null> {
    if (supabase) {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.estado !== undefined) {
        payload.estado = updates.estado;
        if (updates.estado === "Resuelta") {
          payload.fecha_resolucion = new Date().toISOString();
        }
      }
      if (updates.prioridad !== undefined) payload.prioridad = updates.prioridad;
      if (updates.responsableId !== undefined) payload.responsable_id = updates.responsableId;
      if (updates.responsableNombre !== undefined) payload.responsable_nombre = updates.responsableNombre;
      if (updates.metadata !== undefined) payload.metadata = updates.metadata;

      const { data, error } = await supabase
        .from("alertas_operativas")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[IntelligenceRepository] Error updating alerta ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapAlertaFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.alertas.findIndex((a) => a.id === id);
    if (index === -1) return null;
    state.alertas[index] = { ...state.alertas[index], ...updates };
    if (updates.estado === "Resuelta") {
      state.alertas[index].fechaResolucion = new Date().toISOString();
    }
    db.save();
    return state.alertas[index];
  }

  // ============================================================================
  // 3. ACCIONES OPERATIVAS (acciones_operativas)
  // ============================================================================

  public async getAcciones(filter?: {
    estado?: string;
    prioridad?: string;
    socioId?: string;
  }): Promise<AccionOperativa[]> {
    if (supabase) {
      let query = supabase
        .from("acciones_operativas")
        .select("*")
        .order("fecha_creacion", { ascending: false });

      if (filter?.estado) query = query.eq("estado", filter.estado);
      if (filter?.prioridad) query = query.eq("prioridad", filter.prioridad);
      if (filter?.socioId) query = query.eq("socio_id", filter.socioId);

      const { data, error } = await query;
      if (error) {
        console.error("[IntelligenceRepository] Error fetching acciones:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapAccionFromDb);
    }

    let list = db.getState().acciones;
    if (filter?.estado) list = list.filter((a) => a.estado === filter.estado);
    if (filter?.prioridad) list = list.filter((a) => a.prioridad === filter.prioridad);
    if (filter?.socioId) list = list.filter((a) => a.socioId === filter.socioId);
    return list;
  }

  public async saveAccion(accion: AccionOperativa): Promise<AccionOperativa> {
    const id = accion.id || crypto.randomUUID();
    const item: AccionOperativa = {
      ...accion,
      id,
      fechaCreacion: accion.fechaCreacion || new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("acciones_operativas")
        .insert({
          id: item.id,
          titulo: item.titulo,
          descripcion: item.descripcion,
          socio_id: item.socioId || null,
          socio_nombre: item.socioNombre || null,
          origen_tipo: item.origenTipo || "manual",
          origen_id: item.origenId || null,
          responsable_id: item.responsableId || null,
          responsable_nombre: item.responsableNombre || null,
          prioridad: item.prioridad,
          estado: item.estado || "Pendiente",
          sugerida_por_ia: Boolean(item.sugeridaPorIa),
          automatica: Boolean(item.automatica),
          fecha_creacion: item.fechaCreacion,
          fecha_limite: item.fechaLimite || null,
          metadata: item.metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error("[IntelligenceRepository] Error saving accion:", error);
        throw new Error(error.message);
      }
      return this.mapAccionFromDb(data);
    }

    const state = db.getState();
    const exists = state.acciones.some((a) => a.id === item.id);
    if (!exists) {
      state.acciones.unshift(item);
      db.save();
    }
    return item;
  }

  public async updateAccion(id: string, updates: Partial<AccionOperativa>): Promise<AccionOperativa | null> {
    if (supabase) {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.estado !== undefined) {
        payload.estado = updates.estado;
        if (updates.estado === "Completada") {
          payload.fecha_completada = new Date().toISOString();
        }
      }
      if (updates.prioridad !== undefined) payload.prioridad = updates.prioridad;
      if (updates.responsableId !== undefined) payload.responsable_id = updates.responsableId;
      if (updates.responsableNombre !== undefined) payload.responsable_nombre = updates.responsableNombre;
      if (updates.titulo !== undefined) payload.titulo = updates.titulo;
      if (updates.descripcion !== undefined) payload.descripcion = updates.descripcion;
      if (updates.metadata !== undefined) payload.metadata = updates.metadata;

      const { data, error } = await supabase
        .from("acciones_operativas")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[IntelligenceRepository] Error updating accion ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapAccionFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.acciones.findIndex((a) => a.id === id);
    if (index === -1) return null;
    state.acciones[index] = { ...state.acciones[index], ...updates };
    if (updates.estado === "Completada") {
      state.acciones[index].fechaCompletada = new Date().toISOString();
    }
    db.save();
    return state.acciones[index];
  }

  // ============================================================================
  // 4. AUTOMATIZACIONES & EJECUCIONES (automatizaciones, automatizaciones_ejecuciones)
  // ============================================================================

  public async getAutomatizaciones(): Promise<Automatizacion[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("automatizaciones")
        .select("*, automatizaciones_ejecuciones(*)")
        .order("prioridad", { ascending: true });

      if (error) {
        console.error("[IntelligenceRepository] Error fetching automatizaciones:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapAutomatizacionFromDb);
    }
    return db.getState().automatizaciones;
  }

  public async saveAutomatizacion(auto: Automatizacion): Promise<Automatizacion> {
    const id = auto.id || crypto.randomUUID();
    const item: Automatizacion = {
      ...auto,
      id,
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("automatizaciones")
        .insert({
          id: item.id,
          nombre: item.nombre,
          descripcion: item.descripcion,
          trigger_tipo: item.triggerTipo,
          condiciones: item.condiciones || {},
          acciones: item.acciones || [],
          activa: Boolean(item.activa),
          prioridad: item.prioridad || 1,
        })
        .select()
        .single();

      if (error) {
        console.error("[IntelligenceRepository] Error saving automatizacion:", error);
        throw new Error(error.message);
      }
      return this.mapAutomatizacionFromDb(data);
    }

    const state = db.getState();
    state.automatizaciones.push(item);
    db.save();
    return item;
  }

  public async updateAutomatizacion(id: string, updates: Partial<Automatizacion>): Promise<Automatizacion | null> {
    if (supabase) {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.activa !== undefined) payload.activa = updates.activa;
      if (updates.nombre !== undefined) payload.nombre = updates.nombre;
      if (updates.descripcion !== undefined) payload.descripcion = updates.descripcion;
      if (updates.triggerTipo !== undefined) payload.trigger_tipo = updates.triggerTipo;
      if (updates.condiciones !== undefined) payload.condiciones = updates.condiciones;
      if (updates.acciones !== undefined) payload.acciones = updates.acciones;
      if (updates.prioridad !== undefined) payload.prioridad = updates.prioridad;

      const { data, error } = await supabase
        .from("automatizaciones")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[IntelligenceRepository] Error updating automatizacion ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapAutomatizacionFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.automatizaciones.findIndex((a) => a.id === id);
    if (index === -1) return null;
    state.automatizaciones[index] = { ...state.automatizaciones[index], ...updates };
    db.save();
    return state.automatizaciones[index];
  }

  public async getAutomatizacionEjecuciones(limit = 100): Promise<AutomatizacionEjecucion[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("automatizaciones_ejecuciones")
        .select("*")
        .order("inicio", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[IntelligenceRepository] Error fetching automatizaciones_ejecuciones:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapEjecucionFromDb);
    }
    return db.getState().automatizacionesEjecuciones.slice(0, limit);
  }

  public async saveAutomatizacionEjecucion(ejec: AutomatizacionEjecucion): Promise<AutomatizacionEjecucion> {
    const id = ejec.id || crypto.randomUUID();
    const item: AutomatizacionEjecucion = {
      ...ejec,
      id,
      inicio: ejec.inicio || new Date().toISOString(),
      finalizacion: ejec.finalizacion || new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("automatizaciones_ejecuciones")
        .insert({
          id: item.id,
          automatizacion_id: item.automatizacionId,
          automatizacion_nombre: item.automatizacionNombre,
          entidad_tipo: item.entidadTipo,
          entidad_id: item.entidadId || null,
          socio_id: item.socioId || null,
          socio_nombre: item.socioNombre || null,
          inicio: item.inicio,
          finalizacion: item.finalizacion,
          estado: item.estado || "Completada",
          resultado: item.resultado || {},
          error: item.error || null,
        })
        .select()
        .single();

      if (error) {
        console.error("[IntelligenceRepository] Error saving automatizacion_ejecucion:", error);
        throw new Error(error.message);
      }
      return this.mapEjecucionFromDb(data);
    }

    const state = db.getState();
    state.automatizacionesEjecuciones.unshift(item);
    db.save();
    return item;
  }

  // ============================================================================
  // 5. OPORTUNIDADES OPERATIVAS (oportunidades_operativas)
  // ============================================================================

  public async getOportunidades(): Promise<OportunidadOperativa[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("oportunidades_operativas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[IntelligenceRepository] Error fetching oportunidades:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapOportunidadFromDb);
    }
    return db.getState().oportunidades;
  }

  public async saveOportunidad(opo: OportunidadOperativa): Promise<OportunidadOperativa> {
    const id = opo.id || crypto.randomUUID();
    const item: OportunidadOperativa = {
      ...opo,
      id,
      fecha: opo.fecha || new Date().toISOString().split("T")[0],
    };

    if (supabase) {
      // Check if duplicate exists for same socio, type and day
      const { data: existing } = await supabase
        .from("oportunidades_operativas")
        .select("id")
        .eq("tipo", item.tipo)
        .eq("socio_id", item.socioId || "")
        .eq("fecha", item.fecha)
        .limit(1);

      if (existing && existing.length > 0) {
        return item;
      }

      const { data, error } = await supabase
        .from("oportunidades_operativas")
        .insert({
          id: item.id,
          tipo: item.tipo,
          titulo: item.titulo,
          descripcion: item.descripcion,
          socio_id: item.socioId || null,
          socio_nombre: item.socioNombre || null,
          score: item.score || 75,
          estado: item.estado || "Detectada",
          detectada_por: item.detectadaPor || "motor_inteligencia",
          metadata: item.metadata || {},
          fecha: item.fecha,
        })
        .select()
        .single();

      if (error) {
        console.error("[IntelligenceRepository] Error saving oportunidad:", error);
        throw new Error(error.message);
      }
      return this.mapOportunidadFromDb(data);
    }

    const state = db.getState();
    const exists = state.oportunidades.some((o) => o.id === item.id);
    if (!exists) {
      state.oportunidades.unshift(item);
      db.save();
    }
    return item;
  }

  public async updateOportunidad(id: string, updates: Partial<OportunidadOperativa>): Promise<OportunidadOperativa | null> {
    if (supabase) {
      const payload: Record<string, any> = {};
      if (updates.estado !== undefined) payload.estado = updates.estado;
      if (updates.score !== undefined) payload.score = updates.score;
      if (updates.metadata !== undefined) payload.metadata = updates.metadata;

      const { data, error } = await supabase
        .from("oportunidades_operativas")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`[IntelligenceRepository] Error updating oportunidad ${id}:`, error);
        throw new Error(error.message);
      }
      return data ? this.mapOportunidadFromDb(data) : null;
    }

    const state = db.getState();
    const index = state.oportunidades.findIndex((o) => o.id === id);
    if (index === -1) return null;
    state.oportunidades[index] = { ...state.oportunidades[index], ...updates };
    db.save();
    return state.oportunidades[index];
  }

  // ============================================================================
  // 6. ACTIVIDAD DE IA (ia_actividad)
  // ============================================================================

  public async getIaActividad(limit = 100): Promise<IaActividad[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("ia_actividad")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[IntelligenceRepository] Error fetching ia_actividad:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapIaActividadFromDb);
    }
    return db.getState().iaActividad.slice(0, limit);
  }

  public async logIaActividad(entry: Omit<IaActividad, "id" | "fecha"> & { id?: string }): Promise<IaActividad> {
    const id = entry.id || crypto.randomUUID();
    const item: IaActividad = {
      ...entry,
      id,
      fecha: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("ia_actividad")
        .insert({
          id: item.id,
          usuario_id: item.usuarioId || null,
          usuario_nombre: item.usuarioNombre || null,
          tipo: item.tipo,
          accion: item.accion,
          entidad_tipo: item.entidadTipo || null,
          entidad_id: item.entidadId || null,
          input_resumen: item.inputResumen || null,
          output_resumen: item.outputResumen || null,
          modelo: item.modelo || "gemini-3.8-flash",
          herramienta: item.herramienta || null,
          resultado: item.resultado || "Exitoso",
          fecha: item.fecha,
          metadata: item.metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error("[IntelligenceRepository] Error saving ia_actividad:", error);
        // Do not throw to avoid breaking core flows, fallback to db log
        return db.logIaActividad(entry);
      }
      return this.mapIaActividadFromDb(data);
    }

    return db.logIaActividad(entry);
  }

  // ============================================================================
  // 7. AUDITORÍA (auditoria)
  // ============================================================================

  public async getAuditoria(limit = 100): Promise<AuditoriaEntry[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("auditoria")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[IntelligenceRepository] Error fetching auditoria:", error);
        throw new Error(error.message);
      }
      return (data || []).map(this.mapAuditoriaFromDb);
    }
    return db.getState().auditoria.slice(0, limit);
  }

  public async logAuditoria(entry: Omit<AuditoriaEntry, "id" | "fecha"> & { id?: string }): Promise<AuditoriaEntry> {
    const id = entry.id || crypto.randomUUID();
    const item: AuditoriaEntry = {
      ...entry,
      id,
      fecha: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("auditoria")
        .insert({
          id: item.id,
          usuario_id: item.usuarioId || null,
          usuario_nombre: item.usuarioNombre || null,
          accion: item.accion,
          entidad: item.entidad,
          entidad_id: item.entidadId || crypto.randomUUID(),
          antes: item.antes || null,
          despues: item.despues || null,
          ip: item.ip || null,
          fecha: item.fecha,
        })
        .select()
        .single();

      if (error) {
        console.error("[IntelligenceRepository] Error saving auditoria:", error);
        // Fallback to local store log
        return db.logAuditoria(entry);
      }
      return this.mapAuditoriaFromDb(data);
    }

    return db.logAuditoria(entry);
  }

  // ============================================================================
  // MAPPERS
  // ============================================================================

  private mapSaludFromDb(s: any): SocioSaludHistorial {
    const socioNombre = s.socios
      ? s.socios.nombre_comercial || s.socios.razon_social
      : s.socio_nombre || "Socio";
    return {
      id: s.id,
      socioId: s.socio_id,
      socioNombre,
      score: Number(s.score),
      categoria: s.categoria,
      scoreFinanciero: Number(s.score_financiero || 0),
      scoreRelacion: Number(s.score_relacion || 0),
      scoreParticipacion: Number(s.score_participacion || 0),
      scoreAtencion: Number(s.score_atencion || 0),
      scoreAntiguedad: Number(s.score_antiguedad || 0),
      factores: Array.isArray(s.factores) ? s.factores : [],
      recomendaciones: Array.isArray(s.recomendaciones) ? s.recomendaciones : [],
      tendencia: s.tendencia || "estable",
      fecha: s.fecha,
    };
  }

  private mapAlertaFromDb(a: any): AlertaOperativa {
    return {
      id: a.id,
      tipo: a.tipo,
      titulo: a.titulo,
      descripcion: a.descripcion,
      entidadTipo: a.entidad_tipo,
      entidadId: a.entidad_id,
      socioId: a.socio_id,
      socioNombre: a.socio_nombre,
      prioridad: a.prioridad,
      estado: a.estado,
      responsableId: a.responsable_id,
      responsableNombre: a.responsable_nombre,
      detectadaPor: a.detectada_por,
      fingerprint: a.fingerprint,
      fechaDeteccion: a.fecha_deteccion,
      fechaLimite: a.fecha_limite,
      fechaResolucion: a.fecha_resolucion,
      metadata: a.metadata || {},
    };
  }

  private mapAccionFromDb(a: any): AccionOperativa {
    return {
      id: a.id,
      titulo: a.titulo,
      descripcion: a.descripcion,
      socioId: a.socio_id,
      socioNombre: a.socio_nombre,
      origenTipo: a.origen_tipo,
      origenId: a.origen_id,
      responsableId: a.responsable_id,
      responsableNombre: a.responsable_nombre,
      prioridad: a.prioridad,
      estado: a.estado,
      sugeridaPorIa: Boolean(a.sugerida_por_ia),
      automatica: Boolean(a.automatica),
      fechaCreacion: a.fecha_creacion,
      fechaLimite: a.fecha_limite,
      fechaCompletada: a.fecha_completada,
      metadata: a.metadata || {},
    };
  }

  private mapAutomatizacionFromDb(a: any): Automatizacion {
    const ejecs = a.automatizaciones_ejecuciones || [];
    return {
      id: a.id,
      nombre: a.nombre,
      descripcion: a.descripcion,
      triggerTipo: a.trigger_tipo,
      condiciones: a.condiciones || {},
      acciones: a.acciones || [],
      activa: Boolean(a.activa),
      prioridad: Number(a.prioridad || 1),
      ejecucionesCount: ejecs.length,
      ultimaEjecucion: ejecs.length > 0 ? ejecs[0].inicio : undefined,
    };
  }

  private mapEjecucionFromDb(e: any): AutomatizacionEjecucion {
    return {
      id: e.id,
      automatizacionId: e.automatizacion_id,
      automatizacionNombre: e.automatizacion_nombre,
      entidadTipo: e.entidad_tipo,
      entidadId: e.entidad_id,
      socioId: e.socio_id,
      socioNombre: e.socio_nombre,
      inicio: e.inicio,
      finalizacion: e.finalizacion,
      estado: e.estado,
      resultado: e.resultado || {},
      error: e.error,
      createdAt: e.created_at,
    };
  }

  private mapOportunidadFromDb(o: any): OportunidadOperativa {
    return {
      id: o.id,
      tipo: o.tipo,
      titulo: o.titulo,
      descripcion: o.descripcion,
      socioId: o.socio_id,
      socioNombre: o.socio_nombre,
      score: Number(o.score || 75),
      estado: o.estado,
      detectadaPor: o.detectada_por,
      metadata: o.metadata || {},
      fecha: o.fecha,
    };
  }

  private mapIaActividadFromDb(i: any): IaActividad {
    return {
      id: i.id,
      usuarioId: i.usuario_id,
      usuarioNombre: i.usuario_nombre,
      tipo: i.tipo,
      accion: i.accion,
      entidadTipo: i.entidad_tipo,
      entidadId: i.entidad_id,
      inputResumen: i.input_resumen,
      outputResumen: i.output_resumen,
      modelo: i.modelo,
      herramienta: i.herramienta,
      resultado: i.resultado,
      fecha: i.fecha,
      metadata: i.metadata || {},
    };
  }

  private mapAuditoriaFromDb(a: any): AuditoriaEntry {
    return {
      id: a.id,
      usuarioId: a.usuario_id,
      usuarioNombre: a.usuario_nombre,
      accion: a.accion,
      entidad: a.entidad,
      entidadId: a.entidad_id,
      antes: a.antes,
      despues: a.despues,
      ip: a.ip,
      fecha: a.fecha,
    };
  }
}

export const intelligenceRepository = new IntelligenceRepository();

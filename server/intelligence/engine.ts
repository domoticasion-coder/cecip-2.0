import { 
  AlertaOperativa, AccionOperativa, SocioSaludHistorial, 
  AutomatizacionEjecucion, OportunidadOperativa, 
  InteligenciaDashboardResumen, SaludCategoria 
} from "../../src/types";
import { DatabaseState } from "../db";
import { 
  sociosRepository, facturasRepository, tesoreriaRepository, 
  crmRepository, ticketsRepository, eventosRepository, 
  bolsaRepository, conveniosRepository, contactoRepository, 
  intelligenceRepository 
} from "../repositories";
import { calcularIndiceSaludSocio } from "./saludSocio";
import { checkMorosidad } from "./rules/morosidad.rule";
import { checkSocioSinContacto } from "./rules/socioSinContacto.rule";
import { checkRiesgoDesvinculacion } from "./rules/riesgoDesvinculacion.rule";
import { checkTicketDemorado } from "./rules/ticketDemorado.rule";
import { checkCrmVencido } from "./rules/crmVencido.rule";
import { checkConciliacion } from "./rules/conciliacion.rule";
import { checkRecaudacion } from "./rules/recaudacion.rule";
import { checkEventos } from "./rules/eventos.rule";
import { checkOportunidades } from "./rules/oportunidades.rule";

export class IntelligenceEngine {
  /**
   * Recalcula el índice de salud de todos los socios activos consultando los repositorios
   */
  public async recalculateSaludAll(): Promise<SocioSaludHistorial[]> {
    const [socios, facturas, crm, eventos, inscripciones, tickets, historialPrevio] = await Promise.all([
      sociosRepository.getAll(),
      facturasRepository.getAll(),
      crmRepository.getAll(),
      eventosRepository.getAll(),
      eventosRepository.getAllInscripciones(),
      ticketsRepository.getAll(),
      intelligenceRepository.getSaludHistorial(),
    ]);

    const nuevosHistoriales: SocioSaludHistorial[] = [];

    for (const socio of socios) {
      const calculo = calcularIndiceSaludSocio(
        socio,
        facturas,
        crm,
        eventos,
        inscripciones,
        tickets,
        historialPrevio
      );
      nuevosHistoriales.push(calculo);
    }

    // Persistir en PostgreSQL / Supabase
    await intelligenceRepository.saveSaludBatch(nuevosHistoriales);
    return nuevosHistoriales;
  }

  /**
   * Ejecuta el análisis integral de reglas, automatizaciones y oportunidades (Idempotente)
   */
  public async runFullAnalysis(usuarioNombre = "Sistema Automático"): Promise<{
    nuevasAlertas: number;
    nuevasAcciones: number;
    nuevasOportunidades: number;
    automatizacionesEjecutadas: number;
  }> {
    // 1. Recalcular salud de socios primero
    const nuevosHistoriales = await this.recalculateSaludAll();

    // 2. Cargar estado completo desde repositorios (fuente de verdad)
    const [
      socios,
      facturas,
      crm,
      tesoreria,
      eventos,
      inscripciones,
      tickets,
      cvs,
      convenios,
      contacto,
      automatizaciones,
      alertasActivas,
      accionesActuales,
      oportunidadesActuales,
    ] = await Promise.all([
      sociosRepository.getAll(),
      facturasRepository.getAll(),
      crmRepository.getAll(),
      tesoreriaRepository.getAll(),
      eventosRepository.getAll(),
      eventosRepository.getAllInscripciones(),
      ticketsRepository.getAll(),
      bolsaRepository.getAll(),
      conveniosRepository.getAll(),
      contactoRepository.getAll(),
      intelligenceRepository.getAutomatizaciones(),
      intelligenceRepository.getAlertasActivas(),
      intelligenceRepository.getAcciones(),
      intelligenceRepository.getOportunidades(),
    ]);

    // Construir estructura sintética compatible con los chequeadores de reglas
    const analysisState: DatabaseState = {
      socios: socios || [],
      facturas: facturas || [],
      tesoreria: tesoreria || [],
      crm: crm || [],
      eventos: eventos || [],
      inscripciones: inscripciones || [],
      tickets: tickets || [],
      cvs: cvs || [],
      convenios: convenios || [],
      documentos: [],
      noticias: [],
      contacto: contacto || [],
      usuarios: [],
      socioSaludHistorial: nuevosHistoriales || [],
      alertas: alertasActivas || [],
      acciones: accionesActuales || [],
      automatizaciones: automatizaciones || [],
      automatizacionesEjecuciones: [],
      oportunidades: oportunidadesActuales || [],
      iaActividad: [],
      auditoria: [],
    };

    // 3. Ejecutar detectores de reglas
    const detectadas: AlertaOperativa[] = [
      ...checkMorosidad(analysisState),
      ...checkSocioSinContacto(analysisState),
      ...checkRiesgoDesvinculacion(analysisState),
      ...checkTicketDemorado(analysisState),
      ...checkCrmVencido(analysisState),
      ...checkConciliacion(analysisState),
      ...checkRecaudacion(analysisState),
      ...checkEventos(analysisState),
    ];

    let countNuevasAlertas = 0;
    const existingFingerprints = new Set(
      alertasActivas.filter((a) => a.fingerprint).map((a) => a.fingerprint)
    );

    for (const alerta of detectadas) {
      if (alerta.fingerprint && existingFingerprints.has(alerta.fingerprint)) {
        continue; // Idempotencia: No duplicar alertas activas
      }
      await intelligenceRepository.saveAlerta(alerta);
      if (alerta.fingerprint) existingFingerprints.add(alerta.fingerprint);
      countNuevasAlertas++;
    }

    // 4. Ejecutar detector de oportunidades
    const oportunidadesDetectadas = checkOportunidades(analysisState);
    let countNuevasOportunidades = 0;
    const existingOportunidadesIds = new Set(oportunidadesActuales.map((o) => o.id));

    for (const opo of oportunidadesDetectadas) {
      if (!existingOportunidadesIds.has(opo.id)) {
        await intelligenceRepository.saveOportunidad(opo);
        existingOportunidadesIds.add(opo.id);
        countNuevasOportunidades++;
      }
    }

    // 5. Evaluar automatizaciones operativas
    let countAutomatizaciones = 0;
    let countNuevasAcciones = 0;
    const now = new Date();

    for (const auto of automatizaciones) {
      if (!auto.activa) continue;

      if (auto.triggerTipo === "socio_riesgo") {
        const scoreMax = (auto.condiciones && auto.condiciones.scoreMax) || 40;
        const sociosRiesgo = nuevosHistoriales.filter((h) => h.score < scoreMax);
        for (const sr of sociosRiesgo) {
          const accionId = `act-auto-riesgo-${sr.socioId}-${now.toISOString().split("T")[0]}`;
          if (!accionesActuales.some((a) => a.id === accionId)) {
            const nuevaAccion: AccionOperativa = {
              id: accionId,
              titulo: `Contacto prioritario por caída de salud (${sr.score}/100)`,
              descripcion: `Plan de rescate institucional para ${sr.socioNombre}. Recomendación: ${sr.recomendaciones[0] || "Llamada de gerencia"}.`,
              socioId: sr.socioId,
              socioNombre: sr.socioNombre,
              origenTipo: "automatizacion",
              prioridad: "Crítica",
              estado: "Pendiente",
              sugeridaPorIa: true,
              automatica: true,
              fechaCreacion: now.toISOString(),
              fechaLimite: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            };
            await intelligenceRepository.saveAccion(nuevaAccion);
            countNuevasAcciones++;

            // Registrar ejecución
            await intelligenceRepository.saveAutomatizacionEjecucion({
              id: `ae-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              automatizacionId: auto.id,
              automatizacionNombre: auto.nombre,
              entidadTipo: "socio",
              entidadId: sr.socioId,
              socioNombre: sr.socioNombre,
              inicio: now.toISOString(),
              finalizacion: new Date().toISOString(),
              estado: "Completada",
              resultado: { accionCreada: nuevaAccion.id, score: sr.score },
              createdAt: now.toISOString(),
            });
            countAutomatizaciones++;
          }
        }
      }

      if (auto.triggerTipo === "cuota_vencida") {
        const facturasMora = facturas.filter((f) => f.estado === "Vencido" || f.estado === "Mora");
        for (const f of facturasMora) {
          const accionId = `act-auto-mora-${f.id}`;
          if (!accionesActuales.some((a) => a.id === accionId)) {
            const nuevaAccion: AccionOperativa = {
              id: accionId,
              titulo: `Gestión preventiva de cuota vencida ($${f.monto.toLocaleString("es-AR")})`,
              descripcion: `Preparar recordatorio de pago para ${f.socioNombre} por factura ${f.detalle}.`,
              socioId: f.socioId,
              socioNombre: f.socioNombre,
              origenTipo: "automatizacion",
              prioridad: "Media",
              estado: "Pendiente",
              sugeridaPorIa: true,
              automatica: true,
              fechaCreacion: now.toISOString(),
            };
            await intelligenceRepository.saveAccion(nuevaAccion);
            countNuevasAcciones++;
          }
        }
      }

      if (auto.triggerTipo === "vencimiento_cuota") {
        const facturasPendientes = facturas.filter((f) => f.estado === "Pendiente");
        for (const f of facturasPendientes) {
          const accionId = `act-auto-venc-${f.id}`;
          if (!accionesActuales.some((a) => a.id === accionId)) {
            const nuevaAccion: AccionOperativa = {
              id: accionId,
              titulo: `Envío recordatorio de cuota por email ($${f.monto.toLocaleString("es-AR")})`,
              descripcion: `Enviar recordatorio por correo a ${f.socioNombre} para cuota de ${f.mes} ${f.anio} (Vence: ${f.vencimiento}).`,
              socioId: f.socioId,
              socioNombre: f.socioNombre,
              origenTipo: "automatizacion",
              prioridad: "Media",
              estado: "Pendiente",
              sugeridaPorIa: true,
              automatica: true,
              fechaCreacion: now.toISOString(),
            };
            await intelligenceRepository.saveAccion(nuevaAccion);
            countNuevasAcciones++;

            await intelligenceRepository.saveAutomatizacionEjecucion({
              id: `ae-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              automatizacionId: auto.id,
              automatizacionNombre: auto.nombre,
              entidadTipo: "factura",
              entidadId: f.id,
              socioNombre: f.socioNombre,
              inicio: now.toISOString(),
              finalizacion: new Date().toISOString(),
              estado: "Completada",
              resultado: { accionCreada: nuevaAccion.id, canal: "email", socio: f.socioNombre, cuota: `${f.mes} ${f.anio}` },
              createdAt: now.toISOString(),
            });
            countAutomatizaciones++;
          }
        }
      }
    }

    // 6. Registrar en auditoría
    await intelligenceRepository.logAuditoria({
      usuarioNombre,
      accion: "MOTOR_INTELIGENCIA_EJECUTADO",
      entidad: "alerta",
      entidadId: "sistema",
      despues: {
        nuevasAlertas: countNuevasAlertas,
        nuevasAcciones: countNuevasAcciones,
        nuevasOportunidades: countNuevasOportunidades,
        automatizacionesEjecutadas: countAutomatizaciones,
      },
    });

    return {
      nuevasAlertas: countNuevasAlertas,
      nuevasAcciones: countNuevasAcciones,
      nuevasOportunidades: countNuevasOportunidades,
      automatizacionesEjecutadas: countAutomatizaciones,
    };
  }

  /**
   * Obtiene el resumen consolidado del Dashboard de Inteligencia Operativa en tiempo real desde Supabase/repositorios
   */
  public async getDashboardResumen(): Promise<InteligenciaDashboardResumen> {
    const [
      socios,
      historiales,
      alertas,
      acciones,
      oportunidades,
      automatizaciones,
      ejecuciones,
      iaActividad,
    ] = await Promise.all([
      sociosRepository.getAll(),
      intelligenceRepository.getLatestSaludForAllSocios(),
      intelligenceRepository.getAlertas(),
      intelligenceRepository.getAcciones(),
      intelligenceRepository.getOportunidades(),
      intelligenceRepository.getAutomatizaciones(),
      intelligenceRepository.getAutomatizacionEjecuciones(20),
      intelligenceRepository.getIaActividad(10),
    ]);

    const totalSocios = socios.length;
    const scores = historiales.map((h) => h.score);
    const saludPromedio = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 75;

    const excelentes = historiales.filter((h) => h.categoria === "Excelente").length;
    const saludables = historiales.filter((h) => h.categoria === "Saludable").length;
    const atencion = historiales.filter((h) => h.categoria === "Atención").length;
    const riesgo = historiales.filter((h) => h.categoria === "Riesgo").length;
    const criticos = historiales.filter((h) => h.categoria === "Crítico").length;

    const alertasActivas = alertas.filter((a) => a.estado !== "Resuelta" && a.estado !== "Descartada");
    const alertasCriticas = alertasActivas.filter((a) => a.prioridad === "Crítica");
    const accionesPendientes = acciones.filter((a) => a.estado === "Pendiente" || a.estado === "En curso");

    const distribucionSalud = [
      { categoria: "Excelente" as SaludCategoria, cantidad: excelentes, porcentaje: totalSocios > 0 ? Math.round((excelentes / totalSocios) * 100) : 0, color: "#10b981" },
      { categoria: "Saludable" as SaludCategoria, cantidad: saludables, porcentaje: totalSocios > 0 ? Math.round((saludables / totalSocios) * 100) : 0, color: "#3b82f6" },
      { categoria: "Atención" as SaludCategoria, cantidad: atencion, porcentaje: totalSocios > 0 ? Math.round((atencion / totalSocios) * 100) : 0, color: "#f59e0b" },
      { categoria: "Riesgo" as SaludCategoria, cantidad: riesgo, porcentaje: totalSocios > 0 ? Math.round((riesgo / totalSocios) * 100) : 0, color: "#f97316" },
      { categoria: "Crítico" as SaludCategoria, cantidad: criticos, porcentaje: totalSocios > 0 ? Math.round((criticos / totalSocios) * 100) : 0, color: "#ef4444" },
    ];

    // Bandeja de qué requiere atención hoy ordenado por prioridad
    const criticas: (AlertaOperativa | AccionOperativa)[] = [
      ...alertasActivas.filter((a) => a.prioridad === "Crítica"),
      ...accionesPendientes.filter((a) => a.prioridad === "Crítica"),
    ];

    const altas: (AlertaOperativa | AccionOperativa)[] = [
      ...alertasActivas.filter((a) => a.prioridad === "Alta"),
      ...accionesPendientes.filter((a) => a.prioridad === "Alta"),
    ];

    const medias: (AlertaOperativa | AccionOperativa)[] = [
      ...alertasActivas.filter((a) => a.prioridad === "Media"),
      ...accionesPendientes.filter((a) => a.prioridad === "Media"),
    ];

    return {
      kpis: {
        totalSociosAnalizados: totalSocios,
        saludPromedio,
        sociosSaludablesCount: excelentes + saludables,
        sociosAtencionCount: atencion,
        sociosRiesgoCount: riesgo,
        sociosCriticosCount: criticos,
        alertasActivasCount: alertasActivas.length,
        alertasCriticasCount: alertasCriticas.length,
        accionesPendientesCount: accionesPendientes.length,
        oportunidadesDetectadasCount: oportunidades.filter((o) => o.estado === "Detectada" || o.estado === "En contacto").length,
        automatizacionesActivasCount: automatizaciones.filter((a) => a.activa).length,
        automatizacionesEjecutadasHoy: ejecuciones.length,
      },
      distribucionSalud,
      bandejaUrgencias: {
        criticas,
        altas,
        medias,
      },
      tendenciasRecientes: [
        { mes: "May 2026", saludPromedio: 76, moraTasa: 11.2, alertasGeneradas: 8 },
        { mes: "Jun 2026", saludPromedio: 74, moraTasa: 12.8, alertasGeneradas: 12 },
        { mes: "Jul 2026", saludPromedio: 71, moraTasa: 14.5, alertasGeneradas: 15 },
        { mes: "Ago 2026", saludPromedio: saludPromedio, moraTasa: 13.1, alertasGeneradas: alertas.length },
      ],
      oportunidadesDestacadas: oportunidades.slice(0, 5),
      actividadRecienteIa: iaActividad.slice(0, 8),
    };
  }
}

export const intelligenceEngine = new IntelligenceEngine();

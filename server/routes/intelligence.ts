import { Router } from "express";
import { intelligenceRepository, sociosRepository } from "../repositories";
import { intelligenceEngine } from "../intelligence/engine";
import { AccionOperativa } from "../../src/types";

const router = Router();

// ==============================================================================
// 1. DASHBOARD & BANDEJA OPERATIVA
// ==============================================================================

// GET /api/intelligence/dashboard
router.get("/intelligence/dashboard", async (req, res) => {
  try {
    const resumen = await intelligenceEngine.getDashboardResumen();
    res.json(resumen);
  } catch (error: any) {
    console.error("Error al obtener dashboard de inteligencia:", error);
    res.status(500).json({ error: "Error al calcular métricas de inteligencia operativa" });
  }
});

// GET /api/intelligence/bandeja ("Qué requiere atención hoy")
router.get("/intelligence/bandeja", async (req, res) => {
  try {
    const resumen = await intelligenceEngine.getDashboardResumen();
    res.json(resumen.bandejaUrgencias);
  } catch (error: any) {
    res.status(500).json({ error: "Error al obtener bandeja operativa" });
  }
});

// POST /api/intelligence/run-analysis (Ejecutar motor de reglas)
router.post("/intelligence/run-analysis", async (req, res) => {
  try {
    const usuarioNombre = req.body?.usuarioNombre || "Operador CeCIP";
    const resultado = await intelligenceEngine.runFullAnalysis(usuarioNombre);
    res.json({
      success: true,
      mensaje: "Análisis operativo y evaluación de reglas completados exitosamente.",
      resultado,
    });
  } catch (error: any) {
    console.error("Error al ejecutar análisis de reglas:", error);
    res.status(500).json({ error: "Error al ejecutar análisis de reglas" });
  }
});

// ==============================================================================
// 2. ÍNDICE DE SALUD DEL SOCIO
// ==============================================================================

// GET /api/intelligence/salud
router.get("/intelligence/salud", async (req, res) => {
  try {
    const { categoria, tendencia, busqueda } = req.query;
    let list = await intelligenceRepository.getSaludHistorial({
      categoria: typeof categoria === "string" ? categoria : undefined,
      tendencia: typeof tendencia === "string" ? tendencia : undefined,
    });

    if (busqueda && typeof busqueda === "string") {
      const q = busqueda.toLowerCase();
      list = list.filter((s) => s.socioNombre?.toLowerCase().includes(q));
    }

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: "Error al listar índices de salud de socios" });
  }
});

// GET /api/intelligence/salud/:socioId
router.get("/intelligence/salud/:socioId", async (req, res) => {
  try {
    const { socioId } = req.params;
    const historiales = await intelligenceRepository.getSaludHistorial({ socioId });
    if (historiales.length === 0) {
      return res.status(404).json({ error: "No se encontró registro de salud para el socio indicado" });
    }
    const actual = historiales.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
    res.json(actual);
  } catch (error: any) {
    res.status(500).json({ error: "Error al obtener salud del socio" });
  }
});

// GET /api/intelligence/salud/:socioId/historial
router.get("/intelligence/salud/:socioId/historial", async (req, res) => {
  try {
    const { socioId } = req.params;
    const historiales = await intelligenceRepository.getSaludHistorial({ socioId });
    const ordenados = historiales.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    res.json(ordenados);
  } catch (error: any) {
    res.status(500).json({ error: "Error al obtener historial de salud" });
  }
});

// POST /api/intelligence/salud/recalcular
router.post("/intelligence/salud/recalcular", async (req, res) => {
  try {
    const nuevos = await intelligenceEngine.recalculateSaludAll();
    res.json({
      success: true,
      mensaje: `Se recalcularon ${nuevos.length} índices de salud de socios en base a información financiera, CRM, eventos y tickets.`,
      data: nuevos,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Error al recalcular salud de socios" });
  }
});

// ==============================================================================
// 3. CENTRO DE ALERTAS OPERATIVAS
// ==============================================================================

// GET /api/intelligence/alertas
router.get("/intelligence/alertas", async (req, res) => {
  try {
    const { estado, prioridad, socioId, tipo } = req.query;
    let list = await intelligenceRepository.getAlertas({
      estado: typeof estado === "string" ? estado : undefined,
      prioridad: typeof prioridad === "string" ? prioridad : undefined,
      socioId: typeof socioId === "string" ? socioId : undefined,
    });

    if (tipo && typeof tipo === "string") {
      list = list.filter((a) => a.tipo.toLowerCase() === tipo.toLowerCase());
    }

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: "Error al listar alertas operativas" });
  }
});

// PATCH /api/intelligence/alertas/:id
router.patch("/intelligence/alertas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, responsableNombre, responsableId, metadata, prioridad } = req.body;

    const actualizada = await intelligenceRepository.updateAlerta(id, {
      estado,
      responsableNombre,
      responsableId,
      prioridad,
      metadata,
    });

    if (!actualizada) {
      return res.status(404).json({ error: "Alerta no encontrada" });
    }

    await intelligenceRepository.logAuditoria({
      usuarioNombre: responsableNombre || "Operador CeCIP",
      accion: "ACTUALIZAR_ALERTA",
      entidad: "alerta",
      entidadId: id,
      despues: actualizada,
    });

    res.json(actualizada);
  } catch (error: any) {
    res.status(500).json({ error: "Error al actualizar alerta operativa" });
  }
});

// ==============================================================================
// 4. ACCIONES OPERATIVAS (BANDEJA DE TRABAJO)
// ==============================================================================

// GET /api/intelligence/acciones
router.get("/intelligence/acciones", async (req, res) => {
  try {
    const { estado, prioridad, socioId } = req.query;
    const list = await intelligenceRepository.getAcciones({
      estado: typeof estado === "string" ? estado : undefined,
      prioridad: typeof prioridad === "string" ? prioridad : undefined,
      socioId: typeof socioId === "string" ? socioId : undefined,
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: "Error al listar acciones operativas" });
  }
});

// POST /api/intelligence/acciones
router.post("/intelligence/acciones", async (req, res) => {
  try {
    const { titulo, descripcion, socioId, socioNombre, prioridad, responsableNombre, origenTipo, origenId, sugeridaPorIa } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({ error: "Título y descripción son requeridos." });
    }

    const nuevaAccion: AccionOperativa = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      titulo,
      descripcion,
      socioId,
      socioNombre,
      origenTipo: origenTipo || "manual",
      origenId,
      responsableNombre: responsableNombre || "Sin asignar",
      prioridad: prioridad || "Media",
      estado: "Pendiente",
      sugeridaPorIa: Boolean(sugeridaPorIa),
      automatica: false,
      fechaCreacion: new Date().toISOString(),
      fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const guardada = await intelligenceRepository.saveAccion(nuevaAccion);

    await intelligenceRepository.logAuditoria({
      usuarioNombre: responsableNombre || "Operador CeCIP",
      accion: "CREAR_ACCION_OPERATIVA",
      entidad: "alerta",
      entidadId: guardada.id,
      despues: guardada,
    });

    res.status(201).json(guardada);
  } catch (error: any) {
    res.status(500).json({ error: "Error al crear acción operativa" });
  }
});

// PATCH /api/intelligence/acciones/:id
router.patch("/intelligence/acciones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, responsableNombre, prioridad, metadata, titulo, descripcion } = req.body;

    const actualizada = await intelligenceRepository.updateAccion(id, {
      estado,
      responsableNombre,
      prioridad,
      metadata,
      titulo,
      descripcion,
    });

    if (!actualizada) {
      return res.status(404).json({ error: "Acción no encontrada" });
    }

    await intelligenceRepository.logAuditoria({
      usuarioNombre: responsableNombre || "Operador CeCIP",
      accion: "ACTUALIZAR_ACCION",
      entidad: "alerta",
      entidadId: id,
      despues: actualizada,
    });

    res.json(actualizada);
  } catch (error: any) {
    res.status(500).json({ error: "Error al actualizar acción" });
  }
});

// ==============================================================================
// 5. AUTOMATIZACIONES OPERATIVAS
// ==============================================================================

// GET /api/intelligence/automatizaciones
router.get("/intelligence/automatizaciones", async (req, res) => {
  try {
    const autos = await intelligenceRepository.getAutomatizaciones();
    res.json(autos);
  } catch (error: any) {
    res.status(500).json({ error: "Error al listar automatizaciones" });
  }
});

// PATCH /api/intelligence/automatizaciones/:id/toggle
router.patch("/intelligence/automatizaciones/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const autos = await intelligenceRepository.getAutomatizaciones();
    const auto = autos.find((a) => a.id === id);

    if (!auto) {
      return res.status(404).json({ error: "Automatización no encontrada" });
    }

    const actualizada = await intelligenceRepository.updateAutomatizacion(id, {
      activa: !auto.activa,
    });

    res.json(actualizada);
  } catch (error: any) {
    res.status(500).json({ error: "Error al alternar estado de automatización" });
  }
});

// POST /api/intelligence/automatizaciones/:id/ejecutar
router.post("/intelligence/automatizaciones/:id/ejecutar", async (req, res) => {
  try {
    const { id } = req.params;
    const autos = await intelligenceRepository.getAutomatizaciones();
    const auto = autos.find((a) => a.id === id);

    if (!auto) {
      return res.status(404).json({ error: "Automatización no encontrada" });
    }

    const resultadoAnalisis = await intelligenceEngine.runFullAnalysis("Ejecución Manual de Automatización");

    res.json({
      success: true,
      mensaje: `Automatización "${auto.nombre}" ejecutada.`,
      resultado: resultadoAnalisis,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Error al ejecutar automatización" });
  }
});

// GET /api/intelligence/automatizaciones/ejecuciones
router.get("/intelligence/automatizaciones/ejecuciones", async (req, res) => {
  try {
    const ejecuciones = await intelligenceRepository.getAutomatizacionEjecuciones(50);
    res.json(ejecuciones);
  } catch (error: any) {
    res.status(500).json({ error: "Error al listar historial de ejecuciones" });
  }
});

// ==============================================================================
// 6. OPORTUNIDADES OPERATIVAS
// ==============================================================================

// GET /api/intelligence/oportunidades
router.get("/intelligence/oportunidades", async (req, res) => {
  try {
    const { estado } = req.query;
    let list = await intelligenceRepository.getOportunidades();
    if (estado && typeof estado === "string") {
      list = list.filter((o) => o.estado.toLowerCase() === estado.toLowerCase());
    }
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: "Error al listar oportunidades" });
  }
});

// PATCH /api/intelligence/oportunidades/:id
router.patch("/intelligence/oportunidades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, metadata, score } = req.body;

    const actualizada = await intelligenceRepository.updateOportunidad(id, {
      estado,
      metadata,
      score,
    });

    if (!actualizada) {
      return res.status(404).json({ error: "Oportunidad no encontrada" });
    }

    res.json(actualizada);
  } catch (error: any) {
    res.status(500).json({ error: "Error al actualizar oportunidad" });
  }
});

// ==============================================================================
// 7. AUDITORÍA & BITÁCORA IA
// ==============================================================================

// GET /api/intelligence/ia-actividad
router.get("/intelligence/ia-actividad", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const list = await intelligenceRepository.getIaActividad(limit);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: "Error al listar bitácora de IA" });
  }
});

// GET /api/intelligence/auditoria
router.get("/intelligence/auditoria", async (req, res) => {
  try {
    const { entidad, limit } = req.query;
    const max = limit ? parseInt(limit as string, 10) : 100;
    let list = await intelligenceRepository.getAuditoria(max);
    if (entidad && typeof entidad === "string") {
      list = list.filter((a) => a.entidad === entidad);
    }
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: "Error al listar auditoría" });
  }
});

export default router;

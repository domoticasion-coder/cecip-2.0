import { Router } from "express";
import { eventosRepository } from "../repositories";
import { intelligenceEngine } from "../intelligence/engine";

const router = Router();

// GET /api/eventos
router.get("/eventos", async (req, res) => {
  try {
    const events = await eventosRepository.getAll();
    return res.json(events);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/eventos
router.post("/eventos", async (req, res) => {
  try {
    const body = req.body;
    const newEvent = await eventosRepository.create(body);

    intelligenceEngine.runFullAnalysis("Eventos").catch((e) => console.error("Error in intelligence analysis:", e));

    return res.status(201).json(newEvent);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/inscripciones
router.get("/inscripciones", async (req, res) => {
  try {
    const list = await eventosRepository.getAllInscripciones();
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/eventos/:id/inscripciones
router.get("/eventos/:id/inscripciones", async (req, res) => {
  try {
    const { id } = req.params;
    const list = await eventosRepository.getInscripcionesByEvento(id);
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/eventos/:id/inscripciones
router.post("/eventos/:id/inscripciones", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreSocio, email, telefono } = req.body;
    const enrollment = await eventosRepository.createInscripcion(id, {
      nombreSocio,
      email,
      telefono,
    });

    intelligenceEngine.runFullAnalysis("Inscripción Evento").catch((e) => console.error("Error in intelligence analysis:", e));

    return res.status(201).json(enrollment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/inscripciones/:id
router.patch("/inscripciones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await eventosRepository.updateInscripcion(id, updates);
    if (!updated) return res.status(404).json({ error: "Inscripción no encontrada." });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/eventos/:id
router.put("/eventos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updated = await eventosRepository.update(id, body);
    if (!updated) return res.status(404).json({ error: "Evento no encontrado." });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/eventos/:id
router.delete("/eventos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await eventosRepository.delete(id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

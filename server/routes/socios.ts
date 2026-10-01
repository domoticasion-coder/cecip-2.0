import { Router } from "express";
import { sociosRepository } from "../repositories";
import { intelligenceEngine } from "../intelligence/engine";

const router = Router();

// GET /api/socios
router.get("/socios", async (req, res) => {
  try {
    const socios = await sociosRepository.getAll();
    return res.json(socios);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/socios/:id
router.get("/socios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const socio = await sociosRepository.getById(id);
    if (!socio) return res.status(404).json({ error: "Socio no encontrado." });
    return res.json(socio);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/socios
router.post("/socios", async (req, res) => {
  try {
    const body = req.body;
    const created = await sociosRepository.create(body);

    // Trigger asynchronous health recalculation
    intelligenceEngine.runFullAnalysis("Alta Socio").catch((e) => console.error("Error running analysis on socio create:", e));

    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/socios/:id
router.put("/socios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updated = await sociosRepository.update(id, body);
    if (!updated) return res.status(404).json({ error: "Socio no encontrado." });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/socios/:id
router.delete("/socios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await sociosRepository.delete(id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/socios/:id/timeline
router.get("/socios/:id/timeline", async (req, res) => {
  try {
    const { id } = req.params;
    const timeline = await sociosRepository.getTimeline(id);
    return res.json(timeline);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/socios/:id/timeline
router.post("/socios/:id/timeline", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const event = await sociosRepository.addTimelineEvent(id, {
      tipo: body.tipo || "nota",
      titulo: body.titulo || "Nota agregada",
      descripcion: body.descripcion || "",
      fecha: body.fecha || new Date().toISOString(),
    });
    return res.status(201).json(event);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

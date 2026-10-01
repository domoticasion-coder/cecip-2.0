import { Router } from "express";
import { conveniosRepository } from "../repositories";
import { intelligenceEngine } from "../intelligence/engine";

const router = Router();

// GET /api/convenios
router.get("/convenios", async (req, res) => {
  try {
    const list = await conveniosRepository.getAll();
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/convenios
router.post("/convenios", async (req, res) => {
  try {
    const body = req.body;
    const newConvenio = await conveniosRepository.create(body);

    intelligenceEngine.runFullAnalysis("Convenios").catch((e) => console.error("Error in intelligence analysis:", e));

    return res.status(201).json(newConvenio);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/convenios/:id/adhesion
router.post("/convenios/:id/adhesion", async (req, res) => {
  try {
    const { id } = req.params;
    const { socioNombre } = req.body;
    if (!socioNombre) {
      return res.status(400).json({ error: "Nombre del socio es requerido." });
    }

    const adheridos = await conveniosRepository.toggleAdhesion(id, socioNombre);
    return res.json({ adheridos });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/convenios/:id
router.delete("/convenios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await conveniosRepository.delete(id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

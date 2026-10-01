import { Router } from "express";
import { bolsaRepository } from "../repositories";
import { intelligenceEngine } from "../intelligence/engine";

const router = Router();

// GET /api/cvs
router.get("/cvs", async (req, res) => {
  try {
    const { area } = req.query;
    const cvs = await bolsaRepository.getAll(typeof area === "string" ? area : undefined);
    return res.json(cvs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/cvs
router.post("/cvs", async (req, res) => {
  try {
    const body = req.body;
    const newCv = await bolsaRepository.create(body);

    intelligenceEngine.runFullAnalysis("Bolsa de Empleo").catch((e) => console.error("Error in intelligence analysis:", e));

    return res.status(201).json(newCv);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/cvs/:id/interes
router.post("/cvs/:id/interes", async (req, res) => {
  try {
    const { id } = req.params;
    const { socioNombre } = req.body;
    if (!socioNombre) {
      return res.status(400).json({ error: "Nombre del socio es requerido." });
    }

    const interesados = await bolsaRepository.addInteres(id, socioNombre);
    return res.json({ success: true, interesados });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cvs/:id/interes
router.delete("/cvs/:id/interes", async (req, res) => {
  try {
    const { id } = req.params;
    const { socioNombre } = req.body;
    if (!socioNombre) {
      return res.status(400).json({ error: "Nombre del socio es requerido." });
    }

    const interesados = await bolsaRepository.removeInteres(id, socioNombre);
    return res.json({ success: true, interesados });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cvs/:id
router.delete("/cvs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await bolsaRepository.delete(id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

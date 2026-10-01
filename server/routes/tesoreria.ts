import { Router } from "express";
import { tesoreriaRepository } from "../repositories";
import { intelligenceEngine } from "../intelligence/engine";

const router = Router();

// GET /api/tesoreria
router.get("/tesoreria", async (req, res) => {
  try {
    const entries = await tesoreriaRepository.getAll();
    return res.json(entries);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/tesoreria
router.post("/tesoreria", async (req, res) => {
  try {
    const body = req.body;
    const newEntry = await tesoreriaRepository.create(body);

    intelligenceEngine.runFullAnalysis("Tesorería").catch((e) => console.error("Error in intelligence analysis:", e));

    return res.status(201).json(newEntry);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/tesoreria/:id/conciliar
router.patch("/tesoreria/:id/conciliar", async (req, res) => {
  try {
    const { id } = req.params;
    const { conciliado } = req.body;
    const updated = await tesoreriaRepository.conciliar(id, Boolean(conciliado));
    if (!updated) return res.status(404).json({ error: "Movimiento no encontrado." });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tesoreria/:id
router.delete("/tesoreria/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await tesoreriaRepository.delete(id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

import { Router } from "express";
import { contactoRepository } from "../repositories";
import { intelligenceEngine } from "../intelligence/engine";

const router = Router();

// GET /api/contacto
router.get("/contacto", async (req, res) => {
  try {
    const list = await contactoRepository.getAll();
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/contacto
router.post("/contacto", async (req, res) => {
  try {
    const body = req.body;
    const newMsg = await contactoRepository.create(body);

    intelligenceEngine.runFullAnalysis("Mensaje Contacto").catch((e) => console.error("Error in intelligence analysis:", e));

    return res.status(201).json(newMsg);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/contacto/:id/responder
router.patch("/contacto/:id/responder", async (req, res) => {
  try {
    const { id } = req.params;
    const { respondido } = req.body;
    const updated = await contactoRepository.markRespondido(id, Boolean(respondido));
    if (!updated) return res.status(404).json({ error: "Mensaje no encontrado." });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/contacto/:id
router.delete("/contacto/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await contactoRepository.delete(id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

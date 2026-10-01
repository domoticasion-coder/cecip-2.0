import { Router } from "express";
import { documentosRepository } from "../repositories";

const router = Router();

// GET /api/documentos
router.get("/documentos", async (req, res) => {
  try {
    const docs = await documentosRepository.getAll();
    return res.json(docs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/documentos
router.post("/documentos", async (req, res) => {
  try {
    const body = req.body;
    const newDoc = await documentosRepository.create(body);
    return res.status(201).json(newDoc);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/documentos/:id/descargar
router.post("/documentos/:id/descargar", async (req, res) => {
  try {
    const { id } = req.params;
    await documentosRepository.incrementDescargas(id);
    const updated = await documentosRepository.getById(id);
    return res.json({ descargasCount: updated?.descargasCount || 1 });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/documentos/:id
router.delete("/documentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await documentosRepository.delete(id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

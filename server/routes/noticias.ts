import { Router } from "express";
import { noticiasRepository } from "../repositories";

const router = Router();

// GET /api/noticias
router.get("/noticias", async (req, res) => {
  try {
    const news = await noticiasRepository.getAll();
    return res.json(news);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/noticias
router.post("/noticias", async (req, res) => {
  try {
    const body = req.body;
    const newNews = await noticiasRepository.create(body);
    return res.status(201).json(newNews);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/noticias/:id
router.put("/noticias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updated = await noticiasRepository.update(id, body);
    if (!updated) return res.status(404).json({ error: "Noticia no encontrada." });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/noticias/:id
router.delete("/noticias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await noticiasRepository.delete(id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

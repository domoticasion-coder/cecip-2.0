import { Router } from "express";
import { crmRepository } from "../repositories";
import { intelligenceEngine } from "../intelligence/engine";

const router = Router();

// GET /api/crm
router.get("/crm", async (req, res) => {
  try {
    const { socioId } = req.query;
    const interactions = await crmRepository.getAll(typeof socioId === "string" ? socioId : undefined);
    return res.json(interactions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/crm
router.post("/crm", async (req, res) => {
  try {
    const body = req.body;
    const newInteraction = await crmRepository.create(body);

    intelligenceEngine.runFullAnalysis("CRM").catch((e) => console.error("Error in intelligence analysis:", e));

    return res.status(201).json(newInteraction);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/crm/:id
router.delete("/crm/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await crmRepository.delete(id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

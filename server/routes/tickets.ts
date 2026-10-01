import { Router } from "express";
import { ticketsRepository } from "../repositories";
import { intelligenceEngine } from "../intelligence/engine";

const router = Router();

// GET /api/tickets
router.get("/tickets", async (req, res) => {
  try {
    const { socioId } = req.query;
    const tickets = await ticketsRepository.getAll(typeof socioId === "string" ? socioId : undefined);
    return res.json(tickets);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/tickets
router.post("/tickets", async (req, res) => {
  try {
    const body = req.body;
    const newTicket = await ticketsRepository.create(body);

    intelligenceEngine.runFullAnalysis("Tickets").catch((e) => console.error("Error in intelligence analysis:", e));

    return res.status(201).json(newTicket);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/tickets/:id/mensajes
router.post("/tickets/:id/mensajes", async (req, res) => {
  try {
    const { id } = req.params;
    const { remitente, rol, texto } = req.body;
    const msg = await ticketsRepository.addMensaje(id, { remitente, rol, texto });
    return res.status(201).json(msg);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/tickets/:id
router.put("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await ticketsRepository.update(id, updates);
    if (!updated) return res.status(404).json({ error: "Ticket no encontrado." });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

import { Router } from "express";
import { facturasRepository } from "../repositories";
import { intelligenceEngine } from "../intelligence/engine";

const router = Router();

// GET /api/facturas
router.get("/facturas", async (req, res) => {
  try {
    const bills = await facturasRepository.getAll();
    return res.json(bills);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/facturas
router.post("/facturas", async (req, res) => {
  try {
    const body = req.body;
    const newBill = await facturasRepository.create(body);

    // Trigger analysis asynchronously for alerts / health
    intelligenceEngine.runFullAnalysis("Facturación").catch((e) => console.error("Error running analysis on bill create:", e));

    return res.status(201).json(newBill);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/facturas/:id/pagar -> Transacción atómica: Factura -> Tesorería -> Timeline
router.post("/facturas/:id/pagar", async (req, res) => {
  try {
    const { id } = req.params;
    const { metodoPago = "Transferencia", banco = "Banco Entre Ríos", reciboId, fechaPago } = req.body;

    const result = await facturasRepository.pagar(id, {
      metodoPago,
      banco,
      reciboId,
      fechaPago,
    });

    // Trigger analysis asynchronously
    intelligenceEngine.runFullAnalysis("Cobranza Factura").catch((e) => console.error("Error running analysis on bill pay:", e));

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/facturas/generar-automaticas
router.post("/facturas/generar-automaticas", async (req, res) => {
  try {
    const { mes = "Julio", anio = 2026 } = req.body;
    const result = await facturasRepository.generarAutomaticas(mes, anio);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/facturas/:id
router.delete("/facturas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await facturasRepository.delete(id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

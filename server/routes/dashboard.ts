import { Router } from "express";
import { db, supabase } from "../db";
import { DashboardStats } from "../../src/types";

const router = Router();

// GET /api/dashboard/stats
router.get("/dashboard/stats", async (req, res) => {
  try {
    const state = db.getState();

    let socios = state.socios;
    let facturas = state.facturas;
    let tesoreria = state.tesoreria;
    let tickets = state.tickets;
    let eventos = state.eventos;
    let inscripciones = state.inscripciones;

    if (supabase) {
      const [sRes, fRes, tRes, tkRes, eRes, iRes] = await Promise.all([
        supabase.from("socios").select("id, estado"),
        supabase.from("facturas_cuotas").select("monto, estado, mes, anio"),
        supabase.from("tesoreria_movimientos").select("monto, tipo, banco"),
        supabase.from("tickets_mesa_ayuda").select("id, estado"),
        supabase.from("eventos_capacitaciones").select("id"),
        supabase.from("inscripciones_eventos").select("id"),
      ]);

      if (sRes.data) socios = sRes.data as any;
      if (fRes.data) facturas = fRes.data as any;
      if (tRes.data) tesoreria = tRes.data as any;
      if (tkRes.data) tickets = tkRes.data as any;
      if (eRes.data) eventos = eRes.data as any;
      if (iRes.data) inscripciones = iRes.data as any;
    }

    const totalSocios = socios.length;
    const sociosActivos = socios.filter((s: any) => s.estado === "Activo").length;
    const sociosPendientes = socios.filter((s: any) => s.estado === "Pendiente" || s.estado === "Inactivo").length;

    const deudaTotal = facturas
      .filter((b: any) => b.estado === "Pendiente" || b.estado === "Mora" || b.estado === "Vencido")
      .reduce((sum: number, b: any) => sum + Number(b.monto || 0), 0);

    const facturacionTotalMes = facturas
      .filter((b: any) => b.mes === "Julio" && Number(b.anio) === 2026)
      .reduce((sum: number, b: any) => sum + Number(b.monto || 0), 0);

    const recaudacionMes = facturas
      .filter((b: any) => b.estado === "Pagado" && b.mes === "Julio" && Number(b.anio) === 2026)
      .reduce((sum: number, b: any) => sum + Number(b.monto || 0), 0);

    const facturasVencidas = facturas.filter((b: any) => b.estado === "Mora" || b.estado === "Vencido").length;
    const morosidadTasa = facturas.length > 0 ? Number(((facturasVencidas / facturas.length) * 100).toFixed(1)) : 0;

    const ticketsPendientes = tickets.filter((t: any) => t.estado === "Pendiente" || t.estado === "En proceso").length;

    const saldoTotalCajaBancos = tesoreria.reduce(
      (sum: number, t: any) => sum + (t.tipo === "Ingreso" ? Number(t.monto || 0) : -Number(t.monto || 0)),
      0
    );

    const stats: DashboardStats = {
      totalSocios,
      sociosActivos,
      sociosPendientes,
      deudaTotal,
      recaudacionMes,
      facturacionTotalMes,
      morosidadTasa,
      ticketsPendientes,
      eventosProximos: eventos.length,
      totalInscriptos: inscripciones.length,
      movimientosRecientesCount: tesoreria.length,
      saldoTotalCajaBancos,
    };

    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

import { DatabaseState } from "../../db";
import { AlertaOperativa } from "../../../src/types";

export function checkRecaudacion(state: DatabaseState): AlertaOperativa[] {
  const alertas: AlertaOperativa[] = [];
  const now = new Date();
  const mesActual = "Agosto";
  const anioActual = 2026;

  const facturasMes = state.facturas.filter(f => f.mes === mesActual && f.anio === anioActual);
  const totalFacturado = facturasMes.reduce((acc, f) => acc + f.monto, 0);
  const totalCobrado = facturasMes.filter(f => f.estado === "Pagado").reduce((acc, f) => acc + f.monto, 0);

  if (totalFacturado > 0) {
    const tasaCobranza = (totalCobrado / totalFacturado) * 100;
    // Si estamos a más de mitad de mes y la cobranza es menor al 40%
    if (now.getDate() > 15 && tasaCobranza < 40) {
      const fingerprint = `recaudacion_baja_${anioActual}_${mesActual}`;
      alertas.push({
        id: `alt-recaudacion-${anioActual}-${mesActual}`,
        tipo: "recaudacion_baja",
        titulo: `Recaudación mensual por debajo del umbral (${tasaCobranza.toFixed(1)}%)`,
        descripcion: `Al día ${now.getDate()} de ${mesActual} se ha recaudado $${totalCobrado.toLocaleString("es-AR")} de $${totalFacturado.toLocaleString("es-AR")} facturados.`,
        entidadTipo: "general",
        prioridad: tasaCobranza < 25 ? "Alta" : "Media",
        estado: "Nueva",
        detectadaPor: "motor_reglas",
        fingerprint,
        fechaDeteccion: now.toISOString(),
        metadata: {
          totalFacturado,
          totalCobrado,
          tasaCobranza,
          mes: mesActual,
          anio: anioActual,
        },
      });
    }
  }

  return alertas;
}

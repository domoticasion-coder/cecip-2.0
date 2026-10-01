import { DatabaseState } from "../../db";
import { AlertaOperativa } from "../../../src/types";

export function checkMorosidad(state: DatabaseState): AlertaOperativa[] {
  const alertas: AlertaOperativa[] = [];
  const now = new Date();

  for (const factura of state.facturas) {
    if (factura.estado === "Pagado") continue;

    const vencimiento = new Date(factura.vencimiento);
    const diffDays = Math.floor((now.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 15) {
      const prioridad = diffDays > 60 ? "Crítica" : diffDays > 30 ? "Alta" : "Media";
      const fingerprint = `mora_${factura.id}_${now.getFullYear()}_${now.getMonth() + 1}`;

      alertas.push({
        id: `alt-mora-${factura.id}`,
        tipo: "morosidad",
        titulo: `Cuota Social con mora prolongada (${diffDays} días)`,
        descripcion: `La factura ${factura.detalle} por $${factura.monto.toLocaleString("es-AR")} de ${factura.socioNombre} venció el ${factura.vencimiento}.`,
        entidadTipo: "factura",
        entidadId: factura.id,
        socioId: factura.socioId,
        socioNombre: factura.socioNombre,
        prioridad,
        estado: "Nueva",
        detectadaPor: "motor_reglas",
        fingerprint,
        fechaDeteccion: now.toISOString(),
        fechaLimite: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          facturaId: factura.id,
          monto: factura.monto,
          diasMora: diffDays,
          mes: factura.mes,
          anio: factura.anio,
        },
      });
    }
  }

  return alertas;
}

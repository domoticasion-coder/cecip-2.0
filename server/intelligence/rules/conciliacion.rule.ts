import { DatabaseState } from "../../db";
import { AlertaOperativa } from "../../../src/types";

export function checkConciliacion(state: DatabaseState): AlertaOperativa[] {
  const alertas: AlertaOperativa[] = [];
  const now = new Date();

  const noConciliados = state.tesoreria.filter(t => !t.conciliado);
  const totalMontoNoConciliado = noConciliados.reduce((acc, t) => acc + t.monto, 0);

  if (noConciliados.length >= 3 || totalMontoNoConciliado > 100000) {
    const fingerprint = `conciliacion_tesoreria_${now.getFullYear()}_${now.getMonth() + 1}`;
    alertas.push({
      id: `alt-concilia-${now.getFullYear()}-${now.getMonth() + 1}`,
      tipo: "conciliacion_pendiente",
      titulo: `Movimientos de Tesorería pendientes de conciliación (${noConciliados.length})`,
      descripcion: `Existen ${noConciliados.length} movimientos de caja/bancos sin conciliar por un total de $${totalMontoNoConciliado.toLocaleString("es-AR")}.`,
      entidadTipo: "tesoreria",
      prioridad: totalMontoNoConciliado > 200000 ? "Alta" : "Media",
      estado: "Nueva",
      detectadaPor: "motor_reglas",
      fingerprint,
      fechaDeteccion: now.toISOString(),
      metadata: {
        cantidadMovimientos: noConciliados.length,
        montoTotal: totalMontoNoConciliado,
      },
    });
  }

  return alertas;
}

import { DatabaseState } from "../../db";
import { AlertaOperativa } from "../../../src/types";

export function checkRiesgoDesvinculacion(state: DatabaseState): AlertaOperativa[] {
  const alertas: AlertaOperativa[] = [];
  const now = new Date();

  for (const salud of state.socioSaludHistorial) {
    if (salud.score < 40) {
      const prioridad = salud.score < 20 ? "Crítica" : "Alta";
      const fingerprint = `riesgo_desv_${salud.socioId}_${now.getFullYear()}_${now.getMonth() + 1}`;

      const socio = state.socios.find(s => s.id === salud.socioId);
      const socioNombre = socio ? (socio.nombreComercial || socio.razonSocial) : (salud.socioNombre || "Socio");

      alertas.push({
        id: `alt-riesgo-${salud.socioId}`,
        tipo: "socio_riesgo",
        titulo: `Riesgo de Desvinculación: Salud ${salud.score}/100 (${salud.categoria.toUpperCase()})`,
        descripcion: `${socioNombre} presenta indicadores críticos de salud institucional. Factores: ${salud.factores.slice(0, 3).join("; ")}.`,
        entidadTipo: "socio",
        entidadId: salud.socioId,
        socioId: salud.socioId,
        socioNombre,
        prioridad,
        estado: "Nueva",
        detectadaPor: "motor_reglas",
        fingerprint,
        fechaDeteccion: now.toISOString(),
        fechaLimite: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          score: salud.score,
          categoria: salud.categoria,
          factores: salud.factores,
          recomendaciones: salud.recomendaciones,
          tendencia: salud.tendencia,
        },
      });
    }
  }

  return alertas;
}

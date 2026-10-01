import { DatabaseState } from "../../db";
import { AlertaOperativa } from "../../../src/types";

export function checkEventos(state: DatabaseState): AlertaOperativa[] {
  const alertas: AlertaOperativa[] = [];
  const now = new Date();

  for (const evento of state.eventos) {
    const fechaEvento = new Date(evento.fecha);
    const diffDays = Math.floor((fechaEvento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Solo eventos futuros
    if (diffDays >= 0 && diffDays <= 30) {
      const porcentajeOcupacion = evento.cuposMax > 0 ? (evento.cuposInscriptos / evento.cuposMax) * 100 : 0;

      // 1. Alta Ocupación (>= 90%)
      if (porcentajeOcupacion >= 90) {
        const fingerprint = `evento_cupo_${evento.id}_${now.getFullYear()}_${now.getMonth() + 1}`;
        alertas.push({
          id: `alt-ev-cupo-${evento.id}`,
          tipo: "evento_cupo",
          titulo: `Evento próximo al límite de capacidad (${porcentajeOcupacion.toFixed(0)}%)`,
          descripcion: `"${evento.titulo}" cuenta con ${evento.cuposInscriptos} de ${evento.cuposMax} cupos cubiertos para el ${evento.fecha}.`,
          entidadTipo: "evento",
          entidadId: evento.id,
          prioridad: "Media",
          estado: "Nueva",
          detectadaPor: "motor_reglas",
          fingerprint,
          fechaDeteccion: now.toISOString(),
          metadata: {
            eventoId: evento.id,
            cuposInscriptos: evento.cuposInscriptos,
            cuposMax: evento.cuposMax,
            porcentaje: porcentajeOcupacion,
          },
        });
      }

      // 2. Baja Ocupación cercana al evento (< 30% a menos de 5 días)
      if (diffDays <= 5 && porcentajeOcupacion < 30) {
        const fingerprint = `evento_baja_insc_${evento.id}_${now.getFullYear()}_${now.getMonth() + 1}`;
        alertas.push({
          id: `alt-ev-baja-${evento.id}`,
          tipo: "evento_baja_ocupacion",
          titulo: `Evento cercano con baja inscripción (${porcentajeOcupacion.toFixed(0)}%)`,
          descripcion: `"${evento.titulo}" se realiza en ${diffDays} días (${evento.fecha}) y sólo tiene ${evento.cuposInscriptos} inscriptos de ${evento.cuposMax}.`,
          entidadTipo: "evento",
          entidadId: evento.id,
          prioridad: "Alta",
          estado: "Nueva",
          detectadaPor: "motor_reglas",
          fingerprint,
          fechaDeteccion: now.toISOString(),
          metadata: {
            eventoId: evento.id,
            diasRestantes: diffDays,
            cuposInscriptos: evento.cuposInscriptos,
            cuposMax: evento.cuposMax,
          },
        });
      }
    }
  }

  return alertas;
}

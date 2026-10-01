import { DatabaseState } from "../../db";
import { AlertaOperativa } from "../../../src/types";

export function checkTicketDemorado(state: DatabaseState, horasUmbral = 72): AlertaOperativa[] {
  const alertas: AlertaOperativa[] = [];
  const now = new Date();

  for (const ticket of state.tickets) {
    if (ticket.estado === "Resuelto" || ticket.estado === "Cerrado") continue;

    const creacion = new Date(ticket.fechaCreacion);
    const diffHours = Math.floor((now.getTime() - creacion.getTime()) / (1000 * 60 * 60));

    if (diffHours >= horasUmbral) {
      const prioridad = diffHours > 120 ? "Crítica" : "Alta";
      const fingerprint = `ticket_demorado_${ticket.id}_${now.getFullYear()}_${now.getMonth() + 1}`;

      alertas.push({
        id: `alt-ticket-${ticket.id}`,
        tipo: "ticket_demorado",
        titulo: `Ticket sin respuesta demorado (${diffHours} horas)`,
        descripcion: `El ticket "${ticket.titulo}" de ${ticket.socioNombre} (Categoría: ${ticket.categoria}) requiere atención urgente.`,
        entidadTipo: "ticket",
        entidadId: ticket.id,
        socioId: ticket.socioId,
        socioNombre: ticket.socioNombre,
        prioridad,
        estado: "Nueva",
        detectadaPor: "motor_reglas",
        fingerprint,
        fechaDeteccion: now.toISOString(),
        fechaLimite: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          ticketId: ticket.id,
          horasAbierto: diffHours,
          categoria: ticket.categoria,
          mensajesCount: ticket.mensajes?.length || 0,
        },
      });
    }
  }

  return alertas;
}

import { DatabaseState } from "../../db";
import { AlertaOperativa } from "../../../src/types";

export function checkCrmVencido(state: DatabaseState): AlertaOperativa[] {
  const alertas: AlertaOperativa[] = [];
  const now = new Date();

  for (const crm of state.crm) {
    if (crm.estado !== "Pendiente") continue;

    const fechaObjetivo = crm.fechaProximaAccion || crm.recordatorio || crm.fecha;
    if (!fechaObjetivo) continue;

    const fecha = new Date(fechaObjetivo);
    if (fecha.getTime() < now.getTime()) {
      const diffDays = Math.floor((now.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
      const fingerprint = `crm_vencido_${crm.id}_${now.getFullYear()}_${now.getMonth() + 1}`;

      alertas.push({
        id: `alt-crm-${crm.id}`,
        tipo: "crm_vencido",
        titulo: `Seguimiento CRM pendiente vencido (${diffDays} días)`,
        descripcion: `Tarea "${crm.proximaAccion || crm.detalle}" para ${crm.socioNombre} asignada a ${crm.responsable} expiró el ${fechaObjetivo.split("T")[0]}.`,
        entidadTipo: "crm",
        entidadId: crm.id,
        socioId: crm.socioId,
        socioNombre: crm.socioNombre,
        prioridad: diffDays > 7 ? "Alta" : "Media",
        estado: "Nueva",
        responsableNombre: crm.responsable,
        detectadaPor: "motor_reglas",
        fingerprint,
        fechaDeteccion: now.toISOString(),
        metadata: {
          crmId: crm.id,
          diasVencido: diffDays,
          responsable: crm.responsable,
          accion: crm.proximaAccion,
        },
      });
    }
  }

  return alertas;
}

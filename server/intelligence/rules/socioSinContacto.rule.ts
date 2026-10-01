import { DatabaseState } from "../../db";
import { AlertaOperativa } from "../../../src/types";

export function checkSocioSinContacto(state: DatabaseState, diasUmbral = 60): AlertaOperativa[] {
  const alertas: AlertaOperativa[] = [];
  const now = new Date();

  for (const socio of state.socios) {
    if (socio.estado !== "Activo") continue;

    const socioInteracciones = state.crm.filter(c => c.socioId === socio.id);
    let diasSinContacto = 999;

    if (socioInteracciones.length > 0) {
      const ordenadas = [...socioInteracciones].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      const ultima = new Date(ordenadas[0].fecha);
      diasSinContacto = Math.floor((now.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24));
    } else if (socio.fechaAlta) {
      const alta = new Date(socio.fechaAlta);
      diasSinContacto = Math.floor((now.getTime() - alta.getTime()) / (1000 * 60 * 60 * 24));
    }

    if (diasSinContacto >= diasUmbral) {
      const prioridad = diasSinContacto > 120 ? "Alta" : "Media";
      const fingerprint = `sin_contacto_${socio.id}_${now.getFullYear()}_${now.getMonth() + 1}`;

      alertas.push({
        id: `alt-sincont-${socio.id}`,
        tipo: "socio_sin_contacto",
        titulo: `Socio sin contacto institucional (> ${diasSinContacto} días)`,
        descripcion: `${socio.nombreComercial || socio.razonSocial} (${socio.categoria}) no registra interacciones CRM en los últimos ${diasSinContacto} días.`,
        entidadTipo: "socio",
        entidadId: socio.id,
        socioId: socio.id,
        socioNombre: socio.nombreComercial || socio.razonSocial,
        prioridad,
        estado: "Nueva",
        detectadaPor: "motor_reglas",
        fingerprint,
        fechaDeteccion: now.toISOString(),
        metadata: {
          diasSinContacto,
          categoria: socio.categoria,
          rubro: socio.rubro,
          whatsapp: socio.whatsapp,
        },
      });
    }
  }

  return alertas;
}

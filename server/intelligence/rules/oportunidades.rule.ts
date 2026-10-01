import { DatabaseState } from "../../db";
import { OportunidadOperativa } from "../../../src/types";

export function checkOportunidades(state: DatabaseState): OportunidadOperativa[] {
  const oportunidades: OportunidadOperativa[] = [];
  const now = new Date();
  const fechaHoy = now.toISOString().split("T")[0];

  const socioSaludHistorial = state.socioSaludHistorial || [];
  const socios = state.socios || [];
  const convenios = state.convenios || [];
  const cvs = state.cvs || [];
  const contacto = state.contacto || [];

  // 1. Socio con Salud Excelente (>= 80) sin convenio adherido
  for (const salud of socioSaludHistorial) {
    if (salud.score >= 80) {
      const socio = socios.find(s => s.id === salud.socioId);
      if (!socio) continue;

      const conveniosAdheridos = convenios.filter(c => c.adheridos && c.adheridos.includes(socio.nombreComercial));
      if (conveniosAdheridos.length === 0 && convenios.length > 0) {
        oportunidades.push({
          id: `opo-conv-${socio.id}`,
          tipo: "convenio_no_utilizado",
          titulo: `Socio de alto compromiso sin convenios adheridos`,
          descripcion: `${socio.nombreComercial} tiene salud ${salud.score}/100 y no utiliza los convenios de beneficios comerciales (ej: tasas bancarias, salud).`,
          socioId: socio.id,
          socioNombre: socio.nombreComercial,
          score: 90,
          estado: "Detectada",
          detectadaPor: "motor_inteligencia",
          fecha: fechaHoy,
          metadata: {
            saludScore: salud.score,
            conveniosDisponibles: convenios.length,
          },
        });
      }
    }
  }

  // 2. Postulantes en Bolsa de Empleo coincidentes con rubros de socios
  if (cvs.length > 0) {
    const cvsComercio = cvs.filter(cv => (cv.areaBusqueda || "").includes("Ventas") || (cv.areaBusqueda || "").includes("Comercial"));
    if (cvsComercio.length >= 2) {
      const sociosComercio = socios.filter(s => (s.rubro || "").toLowerCase().includes("calzado") || (s.rubro || "").toLowerCase().includes("comercio") || (s.rubro || "").toLowerCase().includes("indumentaria"));
      for (const socio of sociosComercio.slice(0, 2)) {
        oportunidades.push({
          id: `opo-cv-${socio.id}`,
          tipo: "perfil_laboral_busqueda",
          titulo: `Perfiles de ventas calificados disponibles para ${socio.nombreComercial}`,
          descripcion: `Hay ${cvsComercio.length} nuevos aspirantes en la Bolsa de Empleo del CeCIP con perfil en Ventas afines a su actividad.`,
          socioId: socio.id,
          socioNombre: socio.nombreComercial,
          score: 82,
          estado: "Detectada",
          detectadaPor: "motor_inteligencia",
          fecha: fechaHoy,
          metadata: {
            candidatosCount: cvsComercio.length,
            area: "Ventas y Comercial",
          },
        });
      }
    }
  }

  // 3. Contactos institucionales no respondidos con demanda de capacitación
  for (const msg of contacto) {
    if (!msg.respondido && (msg.mensaje || "").toLowerCase().includes("capacita")) {
      oportunidades.push({
        id: `opo-cont-${msg.id}`,
        tipo: "demanda_capacitacion",
        titulo: `Interés explícito en capacitaciones para empresas`,
        descripcion: `${msg.nombre} (${msg.empresa || "Empresa"}) solicitó información formativa: "${(msg.mensaje || "").slice(0, 100)}..."`,
        score: 88,
        estado: "Detectada",
        detectadaPor: "motor_inteligencia",
        fecha: fechaHoy,
        metadata: {
          contactoId: msg.id,
          email: msg.email,
          telefono: msg.telefono,
        },
      });
    }
  }

  return oportunidades;
}

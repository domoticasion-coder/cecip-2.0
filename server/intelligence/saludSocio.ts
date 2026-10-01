import { 
  ErpSocio, ErpBill, ErpCrmInteraction, ErpEvent, 
  ErpEnrollment, ErpTicket, SocioSaludHistorial, SaludCategoria, TendenciaSalud 
} from "../../src/types";

export interface CalculoSaludConfig {
  pesoFinanciero: number; // default 0.35
  pesoRelacion: number;   // default 0.25
  pesoParticipacion: number; // default 0.15
  pesoAtencion: number;   // default 0.15
  pesoAntiguedad: number; // default 0.10
}

const defaultConfig: CalculoSaludConfig = {
  pesoFinanciero: 0.35,
  pesoRelacion: 0.25,
  pesoParticipacion: 0.15,
  pesoAtencion: 0.15,
  pesoAntiguedad: 0.10,
};

export function calcularIndiceSaludSocio(
  socio: ErpSocio,
  facturas: ErpBill[],
  crmInteracciones: ErpCrmInteraction[],
  eventos: ErpEvent[],
  inscripciones: ErpEnrollment[],
  tickets: ErpTicket[],
  historialPrevio?: SocioSaludHistorial[],
  config: CalculoSaludConfig = defaultConfig
): SocioSaludHistorial {
  const factores: string[] = [];
  const recomendaciones: string[] = [];
  const now = new Date();

  // 1. Cumplimiento Financiero (35%)
  const socioFacturas = facturas.filter(f => f.socioId === socio.id);
  let subscoreFinanciero = 100;
  const facturasVencidas = socioFacturas.filter(f => f.estado === "Vencido" || f.estado === "Mora");
  const facturasPendientes = socioFacturas.filter(f => f.estado === "Pendiente");
  const totalDeuda = facturasVencidas.reduce((acc, f) => acc + (f.monto || 0), 0);

  if (facturasVencidas.length > 0) {
    subscoreFinanciero -= Math.min(80, facturasVencidas.length * 35);
    factores.push(`${facturasVencidas.length} cuota(s) vencida(s) ($${totalDeuda.toLocaleString("es-AR")})`);
    recomendaciones.push("Contactar para acordar regularización de cuotas pendientes");
  } else if (facturasPendientes.length > 0) {
    subscoreFinanciero -= 10;
    factores.push("Cuota corriente en periodo de pago");
  } else {
    factores.push("Sin deuda registrada; cuotas al día");
  }
  subscoreFinanciero = Math.max(0, Math.min(100, subscoreFinanciero));
  const scoreFinancieroPonderado = Number((subscoreFinanciero * config.pesoFinanciero).toFixed(2));

  // 2. Relación Institucional / CRM (25%)
  const socioCrm = crmInteracciones.filter(c => c.socioId === socio.id);
  let subscoreRelacion = 100;
  let diasSinContacto = 999;

  if (socioCrm.length > 0) {
    const ordenados = [...socioCrm].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    const ultimaFecha = new Date(ordenados[0].fecha);
    const diffMs = now.getTime() - ultimaFecha.getTime();
    diasSinContacto = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (diasSinContacto > 90) {
      subscoreRelacion = 25;
      factores.push(`${diasSinContacto} días sin contacto institucional`);
      recomendaciones.push("Agendar visita o contacto institucional para revitalizar el vínculo");
    } else if (diasSinContacto > 60) {
      subscoreRelacion = 50;
      factores.push(`${diasSinContacto} días sin interacción CRM`);
      recomendaciones.push("Realizar llamada de cortesía y actualización de necesidades");
    } else if (diasSinContacto > 30) {
      subscoreRelacion = 75;
      factores.push(`Último contacto hace ${diasSinContacto} días`);
    } else {
      subscoreRelacion = 100;
      factores.push(`Contacto reciente (${diasSinContacto} días)`);
    }

    const pendientesCrm = socioCrm.filter(c => c.estado === "Pendiente");
    if (pendientesCrm.length > 0) {
      subscoreRelacion = Math.max(0, subscoreRelacion - 15);
      factores.push(`${pendientesCrm.length} seguimiento(s) CRM pendiente(s)`);
    }
  } else {
    subscoreRelacion = 30;
    factores.push("Sin registros de interacciones CRM registradas");
    recomendaciones.push("Registrar primera llamada institucional de relevamiento comercial");
  }
  const scoreRelacionPonderado = Number((subscoreRelacion * config.pesoRelacion).toFixed(2));

  // 3. Participación en Eventos y Capacitaciones (15%)
  const socioInscripciones = inscripciones.filter(i => 
    i.nombreSocio.toLowerCase().includes(socio.nombreComercial.toLowerCase()) ||
    i.nombreSocio.toLowerCase().includes(socio.razonSocial.toLowerCase())
  );
  let subscoreParticipacion = 50;

  if (socioInscripciones.length >= 3) {
    subscoreParticipacion = 100;
    factores.push(`Alta participación: ${socioInscripciones.length} inscripciones a eventos`);
  } else if (socioInscripciones.length > 0) {
    subscoreParticipacion = 75;
    factores.push(`${socioInscripciones.length} participación(es) en capacitaciones`);
  } else {
    subscoreParticipacion = 20;
    factores.push("Sin participación registrada en capacitaciones o eventos recientes");
    recomendaciones.push("Invitar a próximos talleres formativos afines a su rubro");
  }
  const scoreParticipacionPonderado = Number((subscoreParticipacion * config.pesoParticipacion).toFixed(2));

  // 4. Atención y Reclamos / Tickets (15%)
  const socioTickets = tickets.filter(t => t.socioId === socio.id);
  let subscoreAtencion = 100;
  const ticketsAbiertos = socioTickets.filter(t => t.estado === "Pendiente" || t.estado === "En proceso");

  if (ticketsAbiertos.length > 0) {
    subscoreAtencion = Math.max(20, 100 - ticketsAbiertos.length * 35);
    factores.push(`${ticketsAbiertos.length} ticket(s) de atención en curso`);
    recomendaciones.push("Priorizar resolución de tickets y reclamos pendientes del socio");
  } else {
    factores.push("Mesa de ayuda sin reclamos abiertos");
  }
  const scoreAtencionPonderado = Number((subscoreAtencion * config.pesoAtencion).toFixed(2));

  // 5. Antigüedad y Vínculo (10%)
  let subscoreAntiguedad = 70;
  if (socio.fechaAlta) {
    const fechaAlta = new Date(socio.fechaAlta);
    const antiguedadAnios = (now.getTime() - fechaAlta.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (antiguedadAnios >= 3) {
      subscoreAntiguedad = 100;
      factores.push(`Socio consolidado (${antiguedadAnios.toFixed(1)} años de antigüedad)`);
    } else if (antiguedadAnios >= 1) {
      subscoreAntiguedad = 85;
      factores.push(`Socio activo (${antiguedadAnios.toFixed(1)} años)`);
    } else {
      subscoreAntiguedad = 60;
      factores.push("Nuevo socio (< 1 año)");
      recomendaciones.push("Realizar acompañamiento de inducción a beneficios CeCIP");
    }
  }
  const scoreAntiguedadPonderado = Number((subscoreAntiguedad * config.pesoAntiguedad).toFixed(2));

  // Total Score (0 - 100)
  const totalScore = Math.round(
    scoreFinancieroPonderado +
    scoreRelacionPonderado +
    scoreParticipacionPonderado +
    scoreAtencionPonderado +
    scoreAntiguedadPonderado
  );

  // Clasificación
  let categoria: SaludCategoria = "Atención";
  if (totalScore >= 80) categoria = "Excelente";
  else if (totalScore >= 60) categoria = "Saludable";
  else if (totalScore >= 40) categoria = "Atención";
  else if (totalScore >= 20) categoria = "Riesgo";
  else categoria = "Crítico";

  // Tendencia comparando con historial previo
  let tendencia: TendenciaSalud = "estable";
  if (historialPrevio && historialPrevio.length > 0) {
    const previosSocio = historialPrevio
      .filter(h => h.socioId === socio.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    if (previosSocio.length > 0) {
      const ultimoScore = previosSocio[0].score;
      if (totalScore - ultimoScore >= 4) tendencia = "ascendente";
      else if (ultimoScore - totalScore >= 4) tendencia = "descendente";
    }
  }

  if (recomendaciones.length === 0) {
    recomendaciones.push("Mantener seguimiento regular e invitar a próximos eventos y convenios");
  }

  return {
    id: `sh-${socio.id}-${now.toISOString().split("T")[0]}`,
    socioId: socio.id,
    socioNombre: socio.nombreComercial || socio.razonSocial,
    score: totalScore,
    categoria,
    scoreFinanciero: scoreFinancieroPonderado,
    scoreRelacion: scoreRelacionPonderado,
    scoreParticipacion: scoreParticipacionPonderado,
    scoreAtencion: scoreAtencionPonderado,
    scoreAntiguedad: scoreAntiguedadPonderado,
    factores,
    recomendaciones,
    tendencia,
    fecha: now.toISOString().split("T")[0],
    createdAt: now.toISOString(),
  };
}

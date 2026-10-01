import { ErpSocio, ErpCrmInteraction, ErpBill, ErpTesoreriaEntry, ErpEvent, ErpEnrollment, ErpConvenio, ErpDoc, ErpTicket } from "../../types";
import { ALL_CECIP_SOCIOS } from "../../data/sociosData";

const SEED_SOCIOS: ErpSocio[] = ALL_CECIP_SOCIOS;

const SEED_CRM: ErpCrmInteraction[] = [
  {
    id: "crm-1",
    socioId: "b0000000-0000-0000-0000-000000000001",
    socioNombre: "Zapatilandia Paraná",
    tipo: "Llamada",
    fecha: "2026-06-10",
    responsable: "Mariela G. (Atención)",
    detalle: "El socio consulta sobre los descuentos vigentes del convenio con Banco Entre Ríos. Se le envían detalles por PDF.",
    remitente: "Comercio",
    estado: "Realizado"
  },
  {
    id: "crm-2",
    socioId: "b0000000-0000-0000-0000-000000000002",
    socioNombre: "MetER Estructuras",
    tipo: "Reunión",
    fecha: "2026-06-15",
    responsable: "Ing. Carlos Rossi (Gerente)",
    detalle: "Reunión en Parque Industrial sobre el dictado de un seminario de seguridad laboral. Aceptaron patrocinar el coffee break.",
    remitente: "Institucional",
    estado: "Realizado"
  },
  {
    id: "crm-3",
    socioId: "b0000000-0000-0000-0000-000000000003",
    socioNombre: "El Sol Dulce",
    tipo: "Correo",
    fecha: "2026-06-25",
    responsable: "Esteban F. (Tesorero)",
    detalle: "Envío de intimación cordial por mora en cuotas. Respondieron pidiendo plan de refinanciación.",
    remitente: "Cobranzas",
    estado: "Realizado"
  },
  {
    id: "crm-4",
    socioId: "b0000000-0000-0000-0000-000000000001",
    socioNombre: "Zapatilandia Paraná",
    tipo: "Visita",
    fecha: "2026-07-05",
    responsable: "Mariela G. (Atención)",
    detalle: "Visita programada para entregar la nueva calcomanía oficial del CeCIP 'Comercio Adherido'.",
    remitente: "Promoción",
    recordatorio: "Llevar sticker y folletos de eventos.",
    estado: "Pendiente"
  }
];

function getFeeByCategory(cat: string) {
  if (cat === "Gran Industria") return 12000;
  if (cat === "Mediana Empresa") return 6000;
  if (cat === "Servicios") return 4500;
  return 3500;
}

const generateAffiliateBills = (): ErpBill[] => {
  const months = [
    { name: "Mayo", num: "05", due: "2026-05-10", paidPct: 0.98, moraPct: 0.02 },
    { name: "Junio", num: "06", due: "2026-06-10", paidPct: 0.92, moraPct: 0.06 },
    { name: "Julio", num: "07", due: "2026-07-10", paidPct: 0.68, moraPct: 0.12 }
  ];
  const methods: ("Transferencia" | "Mercado Pago" | "Efectivo" | "Tarjeta de Crédito")[] = [
    "Transferencia", "Mercado Pago", "Efectivo", "Tarjeta de Crédito"
  ];
  const list: ErpBill[] = [];
  let recCounter = 2000;

  months.forEach((m) => {
    SEED_SOCIOS.forEach((s, idx) => {
      if (s.estado !== "Activo") return;
      const fee = getFeeByCategory(s.categoria);
      const rand = ((idx * 17 + m.name.length * 31) % 100) / 100;
      let estado: "Pagado" | "Pendiente" | "Mora" = "Pendiente";
      let fechaPago: string | undefined = undefined;
      let reciboId: string | undefined = undefined;
      let metodoPago: ("Transferencia" | "Mercado Pago" | "Efectivo" | "Tarjeta de Crédito") | undefined = undefined;
      let intereses: number | undefined = undefined;

      if (rand < m.paidPct) {
        estado = "Pagado";
        const day = Math.min(28, Math.max(1, (idx * 7) % 28));
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        fechaPago = `2026-${m.num}-${dayStr}`;
        reciboId = `REC-2026-${recCounter++}`;
        metodoPago = methods[(idx + m.name.length) % methods.length];
      } else if (rand < m.paidPct + m.moraPct) {
        estado = "Mora";
        intereses = Math.round(fee * 0.12);
      } else {
        estado = "Pendiente";
      }

      list.push({
        id: `fac-${m.name.toLowerCase()}-${s.id.slice(-6)}`,
        socioId: s.id,
        socioNombre: s.nombreComercial || s.razonSocial,
        mes: m.name,
        anio: 2026,
        detalle: `Cuota Social ${m.name} 2026 - ${s.categoria}`,
        monto: fee,
        vencimiento: m.due,
        estado,
        fechaPago,
        reciboId,
        metodoPago,
        intereses,
      });
    });
  });

  return list;
};

const SEED_BILLS: ErpBill[] = generateAffiliateBills();

const SEED_TESORERIA: ErpTesoreriaEntry[] = [
  {
    id: "t-entry-1",
    tipo: "Ingreso",
    detalle: "Cobro cuotas sociales comercios adheridos (Banco Entre Ríos)",
    monto: 512000,
    fecha: "2026-07-08",
    categoria: "Cuotas Sociales",
    banco: "Banco Entre Ríos",
    conciliado: true
  },
  {
    id: "t-entry-2",
    tipo: "Ingreso",
    detalle: "Recaudación digital Mercado Pago cuotas julio comercios socios",
    monto: 248500,
    fecha: "2026-07-06",
    categoria: "Cuotas Sociales",
    banco: "Mercado Pago Cuenta",
    conciliado: true
  },
  {
    id: "t-entry-3",
    tipo: "Egreso",
    detalle: "Servicios de conectividad y hosting portal CeCIP",
    monto: 65000,
    fecha: "2026-07-03",
    categoria: "Mantenimiento",
    banco: "Banco Nación",
    conciliado: true
  },
  {
    id: "t-entry-4",
    tipo: "Egreso",
    detalle: "Mantenimiento y servicios Sede Peatonal",
    monto: 98000,
    fecha: "2026-07-02",
    categoria: "Mantenimiento",
    banco: "Caja Efectiva",
    conciliado: true
  },
  {
    id: "t-entry-5",
    tipo: "Egreso",
    detalle: "Liquidación haberes y cargas sociales personal administrativo",
    monto: 450000,
    fecha: "2026-07-04",
    categoria: "Sueldos",
    banco: "Banco Entre Ríos",
    conciliado: true
  }
];

const SEED_EVENTS: ErpEvent[] = [
  {
    id: "ev-1",
    titulo: "Transformación Digital para Pymes y Comercios",
    fecha: "2026-07-15",
    hora: "19:30",
    lugar: "Salón Auditorio CeCIP, Paraná",
    cuposMax: 60,
    cuposInscriptos: 48,
    asistentesCount: 0,
    descripcion: "Un taller enfocado en herramientas gratuitas de automatización, comercio electrónico y cómo integrar inteligencia artificial en negocios tradicionales. Incluye ronda de networking al finalizar.",
    orador: "Lic. Esteban Peralta (UADER)",
    categoria: "Curso"
  },
  {
    id: "ev-2",
    titulo: "Liderazgo y Gestión de Equipos de Venta",
    fecha: "2026-07-28",
    hora: "18:00",
    lugar: "Modalidad Virtual (Zoom CeCIP)",
    cuposMax: 150,
    cuposInscriptos: 94,
    asistentesCount: 0,
    descripcion: "Estrategias para motivar personal, diseñar metas realistas, técnicas modernas de venta consultiva y manejo de clientes difíciles.",
    orador: "Coach Andrea Varela (Consultora Litoral)",
    categoria: "Seminario"
  },
  {
    id: "ev-3",
    titulo: "Reunión de Comisión Directiva Extraordinaria",
    fecha: "2026-07-08",
    hora: "20:00",
    lugar: "Oficinas CeCIP Paraná",
    cuposMax: 15,
    cuposInscriptos: 12,
    asistentesCount: 0,
    descripcion: "Reunión mensual para el análisis de finanzas, aprobación de nuevos convenios médicos para asociados y planificación del aniversario institucional.",
    orador: "Ing. Carlos Rossi (Presidente)",
    categoria: "Reunión de Comisión"
  }
];

const SEED_ENROLLMENTS: ErpEnrollment[] = [
  { id: "en-1", eventoId: "ev-1", eventoTitulo: "Transformación Digital para Pymes", nombreSocio: "Daniel Carbonell", email: "carbonelldaniel04@gmail.com", telefono: "3434665544", asistio: false, certificadoEnviado: false },
  { id: "en-2", eventoId: "ev-1", eventoTitulo: "Transformación Digital para Pymes", nombreSocio: "Mariana Gómez (Zapatilandia)", email: "mariana@zapatilandia.com.ar", telefono: "3434551234", asistio: false, certificadoEnviado: false },
  { id: "en-3", eventoId: "ev-2", eventoTitulo: "Liderazgo y Gestión de Equipos", nombreSocio: "Roberto Rossi (MetER)", email: "r.rossi@meterestructuras.com", telefono: "3434119988", asistio: false, certificadoEnviado: false }
];

const SEED_CONVENIOS: ErpConvenio[] = [
  {
    id: "conv-1",
    titulo: "Descuento en Publicidad de El Diario de Paraná",
    descripcion: "Tarifa preferencial con un 30% de bonificación en anuncios destacados en las ediciones impresas y digitales.",
    descuento: "30% OFF",
    adheridos: ["Zapatilandia Paraná", "MetER Estructuras"],
    vigencia: "Hasta 31/12/2026",
    categoria: "Comercios"
  },
  {
    id: "conv-2",
    titulo: "Atención Médica en Sanatorio de la Ciudad",
    descripcion: "Aranceles preferenciales para empleados y directores de empresas socias del CeCIP sin cobertura social o con planes básicos.",
    descuento: "Bonificación Especial",
    adheridos: ["Panadería El Sol"],
    vigencia: "Vigente (Renovación Anual)",
    categoria: "Salud"
  },
  {
    id: "conv-3",
    titulo: "Capacitaciones UADER Bonificadas",
    descripcion: "Becas de descuento del 50% en diplomaturas universitarias de negocios y marketing organizadas en conjunto.",
    descuento: "50% de Descuento",
    adheridos: [],
    vigencia: "Ciclo Lectivo 2026",
    categoria: "Educación"
  }
];

const SEED_DOCS: ErpDoc[] = [
  { id: "doc-1", nombre: "Acta_Asamblea_Ordinaria_2025.pdf", carpeta: "Actas", version: "1.0", fechaSubida: "2025-11-12", tamanio: "2.4 MB", permisos: ["Administrador", "Gerencia", "Atención al Socio"], descargasCount: 18 },
  { id: "doc-2", nombre: "Balance_Contable_Anual_2025.pdf", carpeta: "Balances", version: "2.1 (Auditoría)", fechaSubida: "2026-04-10", tamanio: "4.8 MB", permisos: ["Administrador", "Gerencia", "Tesorería"], descargasCount: 8 },
  { id: "doc-3", nombre: "Contrato_Convenio_UADER.pdf", carpeta: "Contratos", version: "Firmado", fechaSubida: "2026-03-01", tamanio: "1.1 MB", permisos: ["Administrador", "Gerencia", "Atención al Socio"], descargasCount: 14 },
  { id: "doc-4", nombre: "Estatuto_Social_Vigente_CeCIP.pdf", carpeta: "Estatutos", version: "Revisión 2024", fechaSubida: "2024-05-15", tamanio: "3.2 MB", permisos: ["Administrador", "Gerencia", "Tesorería", "Atención al Socio", "Prensa"], descargasCount: 45 }
];

const SEED_TICKETS: ErpTicket[] = [
  {
    id: "tk-1",
    socioId: "b0000000-0000-0000-0000-000000000001",
    socioNombre: "Zapatilandia Paraná",
    titulo: "Error en el link de pago de cuota de Junio",
    asunto: "Error en el link de pago de cuota de Junio",
    estado: "Resuelto",
    categoria: "Facturación",
    fechaCreacion: "2026-06-15",
    mensajes: [
      { id: "m-1", remitente: "Mariana Gómez (Socio)", rol: "socio", texto: "Hola, intento pagar la cuota con Mercado Pago pero me arroja un error 403. ¿Podrían revisar si el link de pago es correcto?", mensaje: "Hola, intento pagar la cuota con Mercado Pago pero me arroja un error 403. ¿Podrían revisar si el link de pago es correcto?", fecha: "2026-06-15 10:15" },
      { id: "m-2", remitente: "Sistema IA", rol: "ia", texto: "Sugerencia del Asistente IA: Este error suele originarse por un token de Mercado Pago vencido o por una desvinculación temporal de la cuenta del CeCIP. Se aconseja regenerar el link individual y enviar el CVU del banco como alternativa.", mensaje: "Sugerencia del Asistente IA: Este error suele originarse por un token de Mercado Pago vencido o por una desvinculación temporal de la cuenta del CeCIP. Se aconseja regenerar el link individual y enviar el CVU del banco como alternativa.", fecha: "2026-06-15 10:16" },
      { id: "m-3", remitente: "Esteban F. (Tesorero)", rol: "staff", texto: "Hola Mariana, efectivamente el token de Mercado Pago se había desvinculado. Ya regeneramos el link para tu cuenta, o bien puedes transferir a nuestro CBU. Saludos!", mensaje: "Hola Mariana, efectivamente el token de Mercado Pago se había desvinculado. Ya regeneramos el link para tu cuenta, o bien puedes transferir a nuestro CBU. Saludos!", fecha: "2026-06-16 09:30" }
    ],
    sugerenciaIA: "Token desvinculado o vencido. Regenerar link en pasarela de cobros o proponer CBU."
  },
  {
    id: "tk-2",
    socioId: "b0000000-0000-0000-0000-000000000003",
    socioNombre: "El Sol Dulce",
    titulo: "Solicitud de Facilidades de Pago (Mora)",
    asunto: "Solicitud de Facilidades de Pago (Mora)",
    estado: "Abierto",
    categoria: "Asesoría Contable / Impositiva",
    fechaCreacion: "2026-07-02",
    mensajes: [
      { id: "m-4", remitente: "Administración El Sol (Socio)", rol: "socio", texto: "Buenos días. Hemos recibido el aviso de deuda por los meses de Mayo y Junio. Debido a una caída en las ventas quisiéramos saber si podemos consolidar la deuda sin intereses en tres pagos quincenales.", mensaje: "Buenos días. Hemos recibido el aviso de deuda por los meses de Mayo y Junio. Debido a una caída en las ventas quisiéramos saber si podemos consolidar la deuda sin intereses en tres pagos quincenales.", fecha: "2026-07-02 11:00" },
      { id: "m-5", remitente: "Asistente IA", rol: "ia", texto: "Sugerencia del Asistente IA: Para socios activos con caída de ventas, se recomienda aceptar refinanciación condonando el 50% de los intereses si el pago se debita automáticamente, asegurando la continuidad del asociado.", mensaje: "Sugerencia del Asistente IA: Para socios activos con caída de ventas, se recomienda aceptar refinanciación condonando el 50% de los intereses si el pago se debita automáticamente, asegurando la continuidad del asociado.", fecha: "2026-07-02 11:02" }
    ],
    sugerenciaIA: "Proponer plan de 3 cuotas condonando el 50% de los intereses moratorios para conservar al asociado."
  }
];

// Helper to seed and retrieve data from localstorage
function getLocalStorageItem<T>(key: string, seed: T[]): T[] {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(item);
  } catch {
    return seed;
  }
}

function saveLocalStorageItem<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Global getters/setters with LocalStorage persistence
export const getErpSocios = (): ErpSocio[] => {
  const loaded = getLocalStorageItem<ErpSocio>("cecip_erp_socios", SEED_SOCIOS);
  if (!loaded || loaded.length < 50) {
    saveLocalStorageItem("cecip_erp_socios", SEED_SOCIOS);
    return SEED_SOCIOS;
  }
  return loaded;
};
export const saveErpSocios = (data: ErpSocio[]) => saveLocalStorageItem("cecip_erp_socios", data);

export const getErpCrm = (): ErpCrmInteraction[] => getLocalStorageItem<ErpCrmInteraction>("cecip_erp_crm", SEED_CRM);
export const saveErpCrm = (data: ErpCrmInteraction[]) => saveLocalStorageItem("cecip_erp_crm", data);

export const getErpBills = (): ErpBill[] => getLocalStorageItem<ErpBill>("cecip_erp_bills", SEED_BILLS);
export const saveErpBills = (data: ErpBill[]) => saveLocalStorageItem("cecip_erp_bills", data);

export const getErpTesoreria = (): ErpTesoreriaEntry[] => getLocalStorageItem<ErpTesoreriaEntry>("cecip_erp_tesoreria", SEED_TESORERIA);
export const saveErpTesoreria = (data: ErpTesoreriaEntry[]) => saveLocalStorageItem("cecip_erp_tesoreria", data);

export const getErpEvents = (): ErpEvent[] => getLocalStorageItem<ErpEvent>("cecip_erp_events", SEED_EVENTS);
export const saveErpEvents = (data: ErpEvent[]) => saveLocalStorageItem("cecip_erp_events", data);

export const getErpEnrollments = (): ErpEnrollment[] => getLocalStorageItem<ErpEnrollment>("cecip_erp_enrollments", SEED_ENROLLMENTS);
export const saveErpEnrollments = (data: ErpEnrollment[]) => saveLocalStorageItem("cecip_erp_enrollments", data);

export const getErpConvenios = (): ErpConvenio[] => getLocalStorageItem<ErpConvenio>("cecip_erp_convenios", SEED_CONVENIOS);
export const saveErpConvenios = (data: ErpConvenio[]) => saveLocalStorageItem("cecip_erp_convenios", data);

export const getErpDocs = (): ErpDoc[] => getLocalStorageItem<ErpDoc>("cecip_erp_docs", SEED_DOCS);
export const saveErpDocs = (data: ErpDoc[]) => saveLocalStorageItem("cecip_erp_docs", data);

export const getErpTickets = (): ErpTicket[] => getLocalStorageItem<ErpTicket>("cecip_erp_tickets", SEED_TICKETS);
export const saveErpTickets = (data: ErpTicket[]) => saveLocalStorageItem("cecip_erp_tickets", data);

export interface ErpAllData {
  socios: ErpSocio[];
  crm: ErpCrmInteraction[];
  bills: ErpBill[];
  tesoreria: ErpTesoreriaEntry[];
  events: ErpEvent[];
  enrollments: ErpEnrollment[];
  convenios: ErpConvenio[];
  docs: ErpDoc[];
  tickets: ErpTicket[];
}

export const getErpData = (): ErpAllData => {
  return {
    socios: getErpSocios(),
    crm: getErpCrm(),
    bills: getErpBills(),
    tesoreria: getErpTesoreria(),
    events: getErpEvents(),
    enrollments: getErpEnrollments(),
    convenios: getErpConvenios(),
    docs: getErpDocs(),
    tickets: getErpTickets()
  };
};

export const saveErpData = (data: Partial<ErpAllData>) => {
  if (data.socios) saveErpSocios(data.socios);
  if (data.crm) saveErpCrm(data.crm);
  if (data.bills) saveErpBills(data.bills);
  if (data.tesoreria) saveErpTesoreria(data.tesoreria);
  if (data.events) saveErpEvents(data.events);
  if (data.enrollments) saveErpEnrollments(data.enrollments);
  if (data.convenios) saveErpConvenios(data.convenios);
  if (data.docs) saveErpDocs(data.docs);
  if (data.tickets) saveErpTickets(data.tickets);
};

export const seedInitialErpData = () => {
  localStorage.setItem("cecip_erp_socios", JSON.stringify(SEED_SOCIOS));
  localStorage.setItem("cecip_erp_crm", JSON.stringify(SEED_CRM));
  localStorage.setItem("cecip_erp_bills", JSON.stringify(SEED_BILLS));
  localStorage.setItem("cecip_erp_tesoreria", JSON.stringify(SEED_TESORERIA));
  localStorage.setItem("cecip_erp_events", JSON.stringify(SEED_EVENTS));
  localStorage.setItem("cecip_erp_enrollments", JSON.stringify(SEED_ENROLLMENTS));
  localStorage.setItem("cecip_erp_convenios", JSON.stringify(SEED_CONVENIOS));
  localStorage.setItem("cecip_erp_docs", JSON.stringify(SEED_DOCS));
  localStorage.setItem("cecip_erp_tickets", JSON.stringify(SEED_TICKETS));
};

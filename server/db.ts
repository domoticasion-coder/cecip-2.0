import fs from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { 
  ErpSocio, ErpBill, ErpTesoreriaEntry, ErpCrmInteraction, 
  ErpEvent, ErpEnrollment, ErpConvenio, ErpDoc, ErpTicket, 
  CVSubmission, WebNewsItem, ContactMessage, Usuario, SocioTimelineEvent,
  SocioSaludHistorial, AlertaOperativa, AccionOperativa, Automatizacion,
  AutomatizacionEjecucion, OportunidadOperativa, IaActividad, AuditoriaEntry
} from "../src/types";

// Check for Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Conectado exitosamente a Supabase PostgreSQL.");
  } catch (e) {
    console.warn("No se pudo inicializar cliente Supabase en backend:", e);
  }
}

// Fallback JSON persistence store file path
const DATA_FILE = path.join(process.cwd(), "server_data.json");

export interface DatabaseState {
  usuarios: Usuario[];
  socios: ErpSocio[];
  facturas: ErpBill[];
  tesoreria: ErpTesoreriaEntry[];
  crm: ErpCrmInteraction[];
  eventos: ErpEvent[];
  inscripciones: ErpEnrollment[];
  convenios: ErpConvenio[];
  documentos: ErpDoc[];
  tickets: ErpTicket[];
  cvs: CVSubmission[];
  noticias: WebNewsItem[];
  contacto: ContactMessage[];
  socioSaludHistorial: SocioSaludHistorial[];
  alertas: AlertaOperativa[];
  acciones: AccionOperativa[];
  automatizaciones: Automatizacion[];
  automatizacionesEjecuciones: AutomatizacionEjecucion[];
  oportunidades: OportunidadOperativa[];
  iaActividad: IaActividad[];
  auditoria: AuditoriaEntry[];
}

// Initial Seed Data
const initialData: DatabaseState = {
  usuarios: [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      nombre: "Carlos",
      apellido: "Rossi",
      email: "admin@cecip.org",
      rol: "Administrador General",
      estado: "Activo"
    },
    {
      id: "a0000000-0000-0000-0000-000000000002",
      nombre: "Esteban",
      apellido: "Peralta",
      email: "tesorero@cecip.org",
      rol: "Tesorería",
      estado: "Activo"
    },
    {
      id: "a0000000-0000-0000-0000-000000000003",
      nombre: "Clara",
      apellido: "Viggiano",
      email: "atencion@cecip.org",
      rol: "Atención al Socio",
      estado: "Activo"
    }
  ],
  socios: [
    {
      id: "b0000000-0000-0000-0000-000000000001",
      razonSocial: "Calzados Paraná S.R.L.",
      nombreComercial: "Zapatilandia Paraná",
      cuit: "30-76543210-9",
      rubro: "Calzado y Vestimenta",
      categoria: "Pequeño Comercio",
      estado: "Activo",
      direccion: "Peatonal San Martín 420",
      localidad: "Paraná",
      provincia: "Entre Ríos",
      email: "contacto@zapatilandia.com.ar",
      whatsapp: "3434551234",
      web: "https://www.zapatilandia.com.ar",
      redesSociales: { instagram: "@zapatilandia.parana" },
      observaciones: "Socio fundador, siempre participa de reuniones de comercio minorista.",
      fechaAlta: "2021-03-15",
      timeline: [
        {
          id: "tl-1",
          tipo: "sistema",
          titulo: "Socio Registrado",
          descripcion: "Alta formal en el padrón del CeCIP.",
          fecha: "2021-03-15T10:00:00Z"
        },
        {
          id: "tl-2",
          tipo: "crm",
          titulo: "Contacto CRM",
          descripcion: "Consulta sobre subsidios de energía y tasas municipales.",
          fecha: "2026-06-10T11:30:00Z"
        }
      ]
    },
    {
      id: "b0000000-0000-0000-0000-000000000002",
      razonSocial: "Metalúrgica Entre Ríos S.A.",
      nombreComercial: "MetER Estructuras",
      cuit: "30-55443322-8",
      rubro: "Industria / Metalúrgica",
      categoria: "Gran Industria",
      estado: "Activo",
      direccion: "Parque Industrial Paraná, Lote 12",
      localidad: "Paraná",
      provincia: "Entre Ríos",
      email: "info@meterestructuras.com",
      whatsapp: "3434119988",
      web: "https://www.meterestructuras.com",
      observaciones: "Interesado en capacitaciones técnicas de soldadura avanzada y convenios de exportación.",
      fechaAlta: "2019-08-20",
      timeline: [
        {
          id: "tl-3",
          tipo: "sistema",
          titulo: "Ingreso al CeCIP",
          descripcion: "Incorporación como Socio Gran Industria.",
          fecha: "2019-08-20T09:00:00Z"
        }
      ]
    },
    {
      id: "b0000000-0000-0000-0000-000000000003",
      razonSocial: "Panadería El Sol S.A.S.",
      nombreComercial: "El Sol Dulce",
      cuit: "27-99887766-5",
      rubro: "Gastronomía / Alimentos",
      categoria: "Mediana Empresa",
      estado: "Activo",
      direccion: "Av. Ramirez 1540",
      localidad: "Paraná",
      provincia: "Entre Ríos",
      email: "administracion@elsoldulce.com",
      whatsapp: "3434992211",
      observaciones: "Registra retraso en el pago de las últimas cuotas. Riesgo de mora evaluado.",
      fechaAlta: "2023-11-02",
      timeline: [
        {
          id: "tl-4",
          tipo: "sistema",
          titulo: "Alta de Cuenta",
          descripcion: "Ingresó como socio categoría Mediana Empresa.",
          fecha: "2023-11-02T12:00:00Z"
        }
      ]
    },
    {
      id: "b0000000-0000-0000-0000-000000000004",
      razonSocial: "Gómez Computación",
      nombreComercial: "Gómez Tecno",
      cuit: "20-33445566-1",
      rubro: "Tecnología / Software",
      categoria: "Pequeño Comercio",
      estado: "Pendiente",
      direccion: "Almafuerte 850",
      localidad: "Paraná",
      provincia: "Entre Ríos",
      email: "gomezcomputacion@gmail.com",
      whatsapp: "3434771122",
      observaciones: "Inscripción en proceso de aprobación por Comisión Directiva.",
      fechaAlta: "2026-06-28",
      timeline: []
    }
  ],
  facturas: [
    {
      id: "c0000000-0000-0000-0000-000000000001",
      socioId: "b0000000-0000-0000-0000-000000000001",
      socioNombre: "Zapatilandia Paraná",
      mes: "Julio",
      anio: 2026,
      detalle: "Cuota Social Julio 2026",
      monto: 3500,
      vencimiento: "2026-07-10",
      estado: "Pendiente"
    },
    {
      id: "c0000000-0000-0000-0000-000000000002",
      socioId: "b0000000-0000-0000-0000-000000000002",
      socioNombre: "MetER Estructuras",
      mes: "Julio",
      anio: 2026,
      detalle: "Cuota Social Julio 2026 - Gran Empresa",
      monto: 12000,
      vencimiento: "2026-07-10",
      estado: "Pagado",
      fechaPago: "2026-07-02",
      reciboId: "REC-00219",
      metodoPago: "Transferencia"
    },
    {
      id: "c0000000-0000-0000-0000-000000000003",
      socioId: "b0000000-0000-0000-0000-000000000003",
      socioNombre: "El Sol Dulce",
      mes: "Junio",
      anio: 2026,
      detalle: "Cuota Social Junio 2026",
      monto: 6000,
      vencimiento: "2026-06-10",
      estado: "Mora",
      intereses: 450
    },
    {
      id: "c0000000-0000-0000-0000-000000000004",
      socioId: "b0000000-0000-0000-0000-000000000003",
      socioNombre: "El Sol Dulce",
      mes: "Mayo",
      anio: 2026,
      detalle: "Cuota Social Mayo 2026",
      monto: 6000,
      vencimiento: "2026-05-10",
      estado: "Mora",
      intereses: 900
    },
    {
      id: "c0000000-0000-0000-0000-000000000005",
      socioId: "b0000000-0000-0000-0000-000000000001",
      socioNombre: "Zapatilandia Paraná",
      mes: "Junio",
      anio: 2026,
      detalle: "Cuota Social Junio 2026",
      monto: 3500,
      vencimiento: "2026-06-10",
      estado: "Pagado",
      fechaPago: "2026-06-08",
      reciboId: "REC-00185",
      metodoPago: "Mercado Pago"
    }
  ],
  tesoreria: [
    {
      id: "d0000000-0000-0000-0000-000000000001",
      tipo: "Ingreso",
      detalle: "Cobro transferencia Cuota MetER Estructuras",
      monto: 12000,
      fecha: "2026-07-02",
      categoria: "Cuotas Sociales",
      banco: "Banco Entre Ríos",
      conciliado: true,
      facturaId: "c0000000-0000-0000-0000-000000000002"
    },
    {
      id: "d0000000-0000-0000-0000-000000000002",
      tipo: "Egreso",
      detalle: "Pago servicio Internet Fibra Óptica CeCIP",
      monto: 4500,
      fecha: "2026-07-01",
      categoria: "Servicios Públicos",
      banco: "Caja Efectiva",
      conciliado: true
    },
    {
      id: "d0000000-0000-0000-0000-000000000003",
      tipo: "Ingreso",
      detalle: "Acreditación Mercado Pago cuotas minoristas (Junio)",
      monto: 87500,
      fecha: "2026-06-29",
      categoria: "Cuotas Sociales",
      banco: "Mercado Pago Cuenta",
      conciliado: true
    },
    {
      id: "d0000000-0000-0000-0000-000000000004",
      tipo: "Egreso",
      detalle: "Honorarios Diseñador Web - Mantenimiento",
      monto: 35000,
      fecha: "2026-06-28",
      categoria: "Mantenimiento",
      banco: "Banco Nación",
      conciliado: false
    },
    {
      id: "d0000000-0000-0000-0000-000000000005",
      tipo: "Egreso",
      detalle: "Sueldo Secretaria Administrativa (Adelanto)",
      monto: 120000,
      fecha: "2026-06-25",
      categoria: "Sueldos",
      banco: "Banco Entre Ríos",
      conciliado: true
    }
  ],
  crm: [
    {
      id: "e0000000-0000-0000-0000-000000000001",
      socioId: "b0000000-0000-0000-0000-000000000001",
      socioNombre: "Zapatilandia Paraná",
      tipo: "Llamada",
      fecha: "2026-06-10T10:30:00Z",
      responsable: "Mariela G. (Atención)",
      detalle: "El socio consulta sobre los descuentos vigentes del convenio con Banco Entre Ríos. Se le envían detalles por PDF.",
      remitente: "Comercio",
      estado: "Realizado"
    },
    {
      id: "e0000000-0000-0000-0000-000000000002",
      socioId: "b0000000-0000-0000-0000-000000000002",
      socioNombre: "MetER Estructuras",
      tipo: "Reunión",
      fecha: "2026-06-15T15:00:00Z",
      responsable: "Ing. Carlos Rossi (Gerente)",
      detalle: "Reunión en Parque Industrial sobre el dictado de un seminario de seguridad laboral. Aceptaron patrocinar el coffee break.",
      remitente: "Institucional",
      estado: "Realizado"
    },
    {
      id: "e0000000-0000-0000-0000-000000000003",
      socioId: "b0000000-0000-0000-0000-000000000003",
      socioNombre: "El Sol Dulce",
      tipo: "Correo",
      fecha: "2026-06-25T09:00:00Z",
      responsable: "Esteban F. (Tesorero)",
      detalle: "Envío de intimación cordial por mora en cuotas. Respondieron pidiendo plan de refinanciación.",
      remitente: "Cobranzas",
      estado: "Realizado"
    }
  ],
  eventos: [
    {
      id: "f0000000-0000-0000-0000-000000000001",
      titulo: "Transformación Digital para Pymes y Comercios",
      fecha: "2026-07-15",
      hora: "19:30",
      lugar: "Salón Auditorio CeCIP, Paraná",
      cuposMax: 60,
      cuposInscriptos: 2,
      asistentesCount: 0,
      descripcion: "Un taller enfocado en herramientas gratuitas de automatización, comercio electrónico y cómo integrar inteligencia artificial en negocios tradicionales.",
      orador: "Lic. Esteban Peralta (UADER)",
      categoria: "Curso",
      bannerUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=500&q=80",
      color: "bg-rose-500",
      borderColor: "border-rose-500",
      textColor: "text-rose-600"
    },
    {
      id: "f0000000-0000-0000-0000-000000000002",
      titulo: "Liderazgo y Gestión de Equipos de Venta",
      fecha: "2026-07-28",
      hora: "18:00",
      lugar: "Modalidad Virtual (Zoom CeCIP)",
      cuposMax: 150,
      cuposInscriptos: 1,
      asistentesCount: 0,
      descripcion: "Estrategias para motivar personal, diseñar metas realistas, técnicas modernas de venta consultiva y manejo de clientes difíciles.",
      orador: "Coach Andrea Varela (Consultora Litoral)",
      categoria: "Seminario",
      bannerUrl: "https://images.unsplash.com/photo-1552581230-2641474dd514?auto=format&fit=crop&w=500&q=80",
      color: "bg-indigo-600",
      borderColor: "border-indigo-600",
      textColor: "text-indigo-600"
    }
  ],
  inscripciones: [
    {
      id: "ins-1",
      eventoId: "f0000000-0000-0000-0000-000000000001",
      eventoTitulo: "Transformación Digital para Pymes y Comercios",
      nombreSocio: "Daniel Carbonell",
      email: "carbonelldaniel04@gmail.com",
      telefono: "3434665544",
      asistio: false,
      certificadoEnviado: false
    },
    {
      id: "ins-2",
      eventoId: "f0000000-0000-0000-0000-000000000001",
      eventoTitulo: "Transformación Digital para Pymes y Comercios",
      nombreSocio: "Mariana Gómez (Zapatilandia)",
      email: "mariana@zapatilandia.com.ar",
      telefono: "3434551234",
      asistio: false,
      certificadoEnviado: false
    },
    {
      id: "ins-3",
      eventoId: "f0000000-0000-0000-0000-000000000002",
      eventoTitulo: "Liderazgo y Gestión de Equipos de Venta",
      nombreSocio: "Roberto Rossi (MetER)",
      email: "r.rossi@meterestructuras.com",
      telefono: "3434119988",
      asistio: false,
      certificadoEnviado: false
    }
  ],
  convenios: [
    {
      id: "20000000-0000-0000-0000-000000000001",
      titulo: "Descuento en Publicidad de El Diario de Paraná",
      descripcion: "Tarifa preferencial con un 30% de bonificación en anuncios destacados en las ediciones impresas y digitales.",
      descuento: "30% OFF",
      vigencia: "Hasta 31/12/2026",
      categoria: "Comercios",
      adheridos: ["Zapatilandia Paraná", "MetER Estructuras"]
    },
    {
      id: "20000000-0000-0000-0000-000000000002",
      titulo: "Atención Médica en Sanatorio de la Ciudad",
      descripcion: "Aranceles preferenciales para empleados y directores de empresas socias del CeCIP sin cobertura social o con planes básicos.",
      descuento: "Bonificación Especial",
      vigencia: "Vigente (Renovación Anual)",
      categoria: "Salud",
      adheridos: ["MetER Estructuras"]
    },
    {
      id: "20000000-0000-0000-0000-000000000003",
      titulo: "Capacitaciones UADER Bonificadas",
      descripcion: "Becas de descuento del 50% en diplomaturas universitarias de negocios y marketing organizadas en conjunto.",
      descuento: "50% de Descuento",
      vigencia: "Ciclo Lectivo 2026",
      categoria: "Educación",
      adheridos: []
    }
  ],
  documentos: [
    {
      id: "30000000-0000-0000-0000-000000000001",
      nombre: "Acta_Asamblea_Ordinaria_2025.pdf",
      carpeta: "Actas",
      version: "1.0",
      fechaSubida: "2025-11-12",
      tamanio: "2.4 MB",
      permisos: ["Administrador", "Gerencia", "Atención al Socio"],
      descargasCount: 18
    },
    {
      id: "30000000-0000-0000-0000-000000000002",
      nombre: "Balance_Contable_Anual_2025.pdf",
      carpeta: "Balances",
      version: "2.1 (Auditoría)",
      fechaSubida: "2026-04-10",
      tamanio: "4.8 MB",
      permisos: ["Administrador", "Gerencia", "Tesorería"],
      descargasCount: 8
    },
    {
      id: "30000000-0000-0000-0000-000000000003",
      nombre: "Contrato_Convenio_UADER.pdf",
      carpeta: "Contratos",
      version: "Firmado",
      fechaSubida: "2026-03-01",
      tamanio: "1.1 MB",
      permisos: ["Administrador", "Gerencia", "Atención al Socio"],
      descargasCount: 14
    },
    {
      id: "30000000-0000-0000-0000-000000000004",
      nombre: "Estatuto_Social_Vigente_CeCIP.pdf",
      carpeta: "Estatutos",
      version: "Revisión 2024",
      fechaSubida: "2024-05-15",
      tamanio: "3.2 MB",
      permisos: ["Administrador", "Gerencia", "Tesorería", "Atención al Socio", "Prensa"],
      descargasCount: 45
    }
  ],
  tickets: [
    {
      id: "40000000-0000-0000-0000-000000000001",
      socioId: "b0000000-0000-0000-0000-000000000001",
      socioNombre: "Zapatilandia Paraná",
      titulo: "Error en el link de pago de cuota de Junio",
      estado: "Resuelto",
      categoria: "Facturación",
      fechaCreacion: "2026-06-15T10:15:00Z",
      ultimaActualizacion: "2026-06-16T09:30:00Z",
      sugerenciaIA: "Token desvinculado o vencido. Regenerar link en pasarela de cobros o proponer CBU.",
      mensajes: [
        {
          id: "m-1",
          remitente: "Mariana Gómez (Socio)",
          rol: "socio",
          texto: "Hola, intento pagar la cuota con Mercado Pago pero me arroja un error 403. ¿Podrían revisar si el link de pago es correcto?",
          fecha: "2026-06-15T10:15:00Z"
        },
        {
          id: "m-2",
          remitente: "Sistema IA",
          rol: "ia",
          texto: "Sugerencia del Asistente IA: Este error suele originarse por un token de Mercado Pago vencido o por una desvinculación temporal de la cuenta del CeCIP. Se aconseja regenerar el link individual y enviar el CVU del banco como alternativa.",
          fecha: "2026-06-15T10:16:00Z"
        },
        {
          id: "m-3",
          remitente: "Esteban F. (Tesorero)",
          rol: "staff",
          texto: "Hola Mariana, efectivamente el token de Mercado Pago se había desvinculado. Ya regeneramos el link para tu cuenta, o bien puedes transferir a nuestro CBU. Saludos!",
          fecha: "2026-06-16T09:30:00Z"
        }
      ]
    },
    {
      id: "40000000-0000-0000-0000-000000000002",
      socioId: "b0000000-0000-0000-0000-000000000003",
      socioNombre: "El Sol Dulce",
      titulo: "Solicitud de Facilidades de Pago (Mora)",
      estado: "Pendiente",
      categoria: "Facturación",
      fechaCreacion: "2026-07-02T11:00:00Z",
      ultimaActualizacion: "2026-07-02T11:02:00Z",
      sugerenciaIA: "Proponer plan de 3 cuotas condonando el 50% de los intereses moratorios para conservar al asociado.",
      mensajes: [
        {
          id: "m-4",
          remitente: "Administración El Sol (Socio)",
          rol: "socio",
          texto: "Buenos días. Hemos recibido el aviso de deuda por los meses de Mayo y Junio. Debido a una caída en las ventas quisiéramos saber si podemos consolidar la deuda sin intereses en tres pagos quincenales.",
          fecha: "2026-07-02T11:00:00Z"
        },
        {
          id: "m-5",
          remitente: "Asistente IA",
          rol: "ia",
          texto: "Sugerencia del Asistente IA: Para socios activos con caída de ventas, se recomienda aceptar refinanciación condonando el 50% de los intereses si el pago se debita automáticamente, asegurando la continuidad del asociado.",
          fecha: "2026-07-02T11:02:00Z"
        }
      ]
    }
  ],
  cvs: [
    {
      id: "10000000-0000-0000-0000-000000000001",
      nombre: "Mariana Alejandra Gómez",
      email: "mariana.gomez@gmail.com",
      telefono: "343 154889922",
      areaBusqueda: "Administración",
      tipoProfesional: "Técnico Especialista",
      fileName: "gomez_mariana_cv_2026.pdf",
      fileSize: "1.2 MB",
      fechaSubida: "2026-06-28",
      comentarios: "Tengo 5 años de experiencia en liquidación de sueldos, atención a proveedores y manejo de sistemas contables tango/bejerman. Busco jornada completa en Paraná.",
      interesados: ["Supermercados Paraná S.A."]
    },
    {
      id: "10000000-0000-0000-0000-000000000002",
      nombre: "Nicolás Agustín Fontana",
      email: "nicolas.fontana.tech@gmail.com",
      telefono: "343 155331144",
      areaBusqueda: "Tecnología y Sistemas",
      tipoProfesional: "Estudiante / Junior",
      fileName: "cv_fontana_desarrollador.pdf",
      fileSize: "850 KB",
      fechaSubida: "2026-06-29",
      comentarios: "Estudiante avanzado de Licenciatura en Sistemas en UTN Paraná. Conocimientos en React, TypeScript y Node.js. Busco mi primera experiencia formal.",
      interesados: []
    },
    {
      id: "10000000-0000-0000-0000-000000000003",
      nombre: "Claudio Rubén Martínez",
      email: "claudio_martinez77@hotmail.com",
      telefono: "343 156221199",
      areaBusqueda: "Industria y Producción",
      tipoProfesional: "Oficios / Operativo",
      fileName: "curriculum_martinez_metalurgico.docx",
      fileSize: "1.4 MB",
      fechaSubida: "2026-06-30",
      comentarios: "Soldador calificado MIG-MAG y electricista industrial matriculado con más de 10 años en plantas industriales del Parque Industrial Paraná.",
      interesados: ["Metalúrgica Entre Ríos S.A."]
    },
    {
      id: "10000000-0000-0000-0000-000000000004",
      nombre: "Sofía Belén Rossi",
      email: "sofia.rossi.ventas@gmail.com",
      telefono: "343 154774411",
      areaBusqueda: "Ventas y Comercial",
      tipoProfesional: "Profesional Senior",
      fileName: "rossi_sofia_comercial_cv.pdf",
      fileSize: "980 KB",
      fechaSubida: "2026-06-30",
      comentarios: "Licenciada en Marketing con trayectoria liderando equipos comerciales de retail y preventas. Excelente manejo de CRM y relaciones públicas.",
      interesados: []
    }
  ],
  noticias: [
    {
      id: "50000000-0000-0000-0000-000000000001",
      title: "Día del Padre 2026: las ventas bajaron 0,3% anual",
      date: "18/06/2026",
      category: "Informe de Prensa",
      badge: "Relevamiento Local",
      description: "El relevamiento del CeCIP junto a CAME reflejó un comportamiento dispar según los rubros comerciales de la ciudad de Paraná.",
      additionalInfo: "De acuerdo con el relevamiento efectuado por el Departamento de Estadísticas del CeCIP en conjunto con la CAME, las ventas minoristas por la celebración del Día del Padre experimentaron una leve contracción del 0,3% en comparación con el mismo período del año anterior, medidas a precios constantes.\n\nEl ticket promedio en los comercios de Paraná se ubicó en torno a los $34.500, destacándose el uso intensivo de promociones con tarjetas de crédito bancarias y cuotas sin interés coordinadas con la Cámara de Comercio local.",
      imageUrl: "/src/assets/images/dia_del_padre_1782854741068.jpg",
      itemsList: [
        "El ticket promedio fue de $34.500 en comercios de Paraná.",
        "Los rubros más destacados fueron Indumentaria y Tecnología.",
        "Se acordaron promociones especiales con entidades bancarias locales.",
        "El 68% de las operaciones se concretaron en planes de pago con tarjetas."
      ],
      publicada: true
    },
    {
      id: "50000000-0000-0000-0000-000000000002",
      title: "Turismo: 2,6 millones de personas viajaron el fin de semana largo",
      date: "23/06/2026",
      category: "Comercio y Turismo",
      badge: "Impacto Económico",
      description: "Paraná y la provincia de Entre Ríos alcanzaron altos niveles de ocupación hotelera y gastronómica.",
      additionalInfo: "Un total de 2,6 millones de turistas y excursionistas recorrieron los principales destinos del país durante el fin de semana extra largo. En la ciudad de Paraná, el impacto económico en la hotelería, la gastronomía costera y el comercio céntrico superó las expectativas iniciales de la temporada invernal.\n\nDesde el CeCIP destacamos la importancia de continuar fortaleciendo la agenda cultural y deportiva como motor de atracción turística que irrigue recursos directos hacia nuestros socios del rubro servicios y comercio.",
      imageUrl: "/src/assets/images/turismo_parana_1782854754924.jpg",
      itemsList: [
        "Ocupación hotelera en Paraná superior al 85%.",
        "Fuerte afluencia de visitantes de Santa Fe, Buenos Aires y Córdoba.",
        "Dinamización del paseo gastronómico de la Costanera y el Puerto.",
        "Crecimiento del consumo en artesanías y productos regionales."
      ],
      publicada: true
    },
    {
      id: "50000000-0000-0000-0000-000000000003",
      title: "Seleccionamos Analista de Gestión de Personas y Empleo",
      date: "27/06/2026",
      category: "Institucional",
      badge: "Búsqueda Laboral",
      description: "Abrimos convocatoria laboral para sumarse al equipo interdisciplinario del CeCIP Paraná.",
      additionalInfo: "En el marco del proceso de expansión institucional y mejora continua de los servicios al socio, el CeCIP abre la búsqueda formal de un/a Analista de Gestión de Personas y Empleo.\n\nLa persona seleccionada tendrá a su cargo la coordinación técnica de la Bolsa de Empleo, la intermediación de perfiles laborales para las pymes socias y la gestión de planes de capacitación junto a las universidades de Entre Ríos.",
      imageUrl: "/src/assets/images/cecip_representatives_1782854765721.jpg",
      itemsList: [
        "Requisitos: Título universitario en RRHH, Relaciones Laborales o Administración.",
        "Experiencia comprobable mínima de 2 años en reclutamiento y selección.",
        "Excelente manejo de herramientas digitales y comunicación interpersonal.",
        "Modalidad: Presencial en Sede Central Paraná."
      ],
      publicada: true
    }
  ],
  contacto: [
    {
      id: "msg-1",
      nombre: "Esteban Rossi",
      empresa: "Rossi Distribuidora",
      telefono: "343 154121212",
      email: "esteban@rossidistribuidora.com.ar",
      mensaje: "Hola, nos interesa asociarnos al CeCIP para acceder al plan de capacitaciones de marketing digital para nuestros 15 empleados de ventas. ¿Me envían información de costos?",
      fecha: "2026-06-29",
      respondido: false
    },
    {
      id: "msg-2",
      nombre: "Clara Viggiano",
      empresa: "Heladerías Trevi",
      telefono: "343 155998877",
      email: "administracion@treviparanade.com.ar",
      mensaje: "Buenas tardes, quisiéramos consultar sobre la mediación comercial del estatuto por un inconveniente con un local de la peatonal San Martín. Muchas gracias.",
      fecha: "2026-06-30",
      respondido: true
    }
  ],
  socioSaludHistorial: [
    {
      id: "sh-1",
      socioId: "b0000000-0000-0000-0000-000000000001",
      socioNombre: "Calzados Paraná S.R.L. (Zapatilandia)",
      score: 88,
      categoria: "Excelente",
      scoreFinanciero: 35,
      scoreRelacion: 23,
      scoreParticipacion: 12,
      scoreAtencion: 13,
      scoreAntiguedad: 10,
      factores: ["Sin deuda pendiente", "Interacción CRM reciente (14 días)", "Inscripción en capacitaciones", "Sin tickets pendientes"],
      recomendaciones: ["Ofrecer adhesión a nuevo convenio comercial", "Invitar a mesa sectorial de comercio minorista"],
      tendencia: "ascendente",
      fecha: "2026-08-01"
    },
    {
      id: "sh-2",
      socioId: "b0000000-0000-0000-0000-000000000002",
      socioNombre: "Metalúrgica del Litoral S.A.",
      score: 36,
      categoria: "Riesgo",
      scoreFinanciero: 10,
      scoreRelacion: 8,
      scoreParticipacion: 4,
      scoreAtencion: 6,
      scoreAntiguedad: 8,
      factores: ["2 cuotas vencidas ($110.000)", "94 días sin interacción institucional", "Ticket de reclamo abierto hace 18 días", "Sin participación en eventos recientes"],
      recomendaciones: ["Contactar telefónicamente dentro de las próximas 48hs", "Ofrecer plan de refinanciación sin interés para regularizar", "Asignar gestor de cuenta personalizado"],
      tendencia: "descendente",
      fecha: "2026-08-01"
    },
    {
      id: "sh-3",
      socioId: "b0000000-0000-0000-0000-000000000003",
      socioNombre: "Distribuidora San Agustín",
      score: 52,
      categoria: "Atención",
      scoreFinanciero: 20,
      scoreRelacion: 12,
      scoreParticipacion: 6,
      scoreAtencion: 9,
      scoreAntiguedad: 5,
      factores: ["1 cuota vencida de julio", "Último contacto hace 65 días", "Recordatorio CRM pendiente"],
      recomendaciones: ["Enviar aviso preventivo de vencimiento", "Agendar visita institucional"],
      tendencia: "descendente",
      fecha: "2026-08-01"
    }
  ],
  alertas: [
    {
      id: "alt-1",
      tipo: "socio_riesgo",
      titulo: "Socio en Riesgo Crítico de Desvinculación",
      descripcion: "Metalúrgica del Litoral S.A. presenta salud 36/100 con 2 cuotas vencidas y ticket abierto hace 18 días sin respuesta.",
      entidadTipo: "socio",
      entidadId: "b0000000-0000-0000-0000-000000000002",
      socioId: "b0000000-0000-0000-0000-000000000002",
      socioNombre: "Metalúrgica del Litoral S.A.",
      prioridad: "Crítica",
      estado: "Nueva",
      detectadaPor: "motor_reglas",
      fingerprint: "socio_riesgo_b0000000-0000-0000-0000-000000000002_202608",
      fechaDeteccion: "2026-08-20T10:00:00Z",
      fechaLimite: "2026-08-26T18:00:00Z",
      metadata: { score: 36, cuotasVencidas: 2, montoDeuda: 110000 }
    },
    {
      id: "alt-2",
      tipo: "ticket_demorado",
      titulo: "Ticket de Asesoramiento Legal demorado (>72 hs)",
      descripcion: "El ticket 'Consulta por convenio paritario comercio' lleva 96 horas en estado Pendiente.",
      entidadTipo: "ticket",
      entidadId: "t-1",
      socioId: "b0000000-0000-0000-0000-000000000002",
      socioNombre: "Metalúrgica del Litoral S.A.",
      prioridad: "Alta",
      estado: "En revisión",
      responsableNombre: "Dra. Clara Viggiano",
      detectadaPor: "motor_reglas",
      fingerprint: "ticket_demorado_t-1_202608",
      fechaDeteccion: "2026-08-21T09:30:00Z",
      fechaLimite: "2026-08-25T12:00:00Z",
      metadata: { ticketId: "t-1", horasAbierto: 96 }
    },
    {
      id: "alt-3",
      tipo: "morosidad",
      titulo: "Cuota Social con mora > 30 días",
      descripcion: "Factura FC-2026-004 de Distribuidora San Agustín venció el 15/07/2026.",
      entidadTipo: "factura",
      entidadId: "c0000000-0000-0000-0000-000000000004",
      socioId: "b0000000-0000-0000-0000-000000000003",
      socioNombre: "Distribuidora San Agustín",
      prioridad: "Media",
      estado: "Nueva",
      detectadaPor: "motor_reglas",
      fingerprint: "mora_c0000000-0000-0000-0000-000000000004_202608",
      fechaDeteccion: "2026-08-16T08:00:00Z",
      metadata: { facturaId: "c0000000-0000-0000-0000-000000000004", monto: 35000, diasMora: 39 }
    },
    {
      id: "alt-4",
      tipo: "evento_cupo",
      titulo: "Evento con alta demanda próximo a agotar capacidad",
      descripcion: "El curso 'Taller de Inteligencia Artificial para Comercio Minorista' ha cubierto el 92% de los cupos disponibles.",
      entidadTipo: "evento",
      entidadId: "d0000000-0000-0000-0000-000000000001",
      prioridad: "Media",
      estado: "En gestión",
      detectadaPor: "motor_reglas",
      fingerprint: "evento_cupo_d0000000-0000-0000-0000-000000000001_202608",
      fechaDeteccion: "2026-08-22T14:15:00Z",
      metadata: { cuposInscriptos: 46, cuposMax: 50, porcentaje: 92 }
    }
  ],
  acciones: [
    {
      id: "act-1",
      titulo: "Llamada institucional de retención urgente",
      descripcion: "Contactar a la gerencia de Metalúrgica del Litoral para consensuar refinanciación y responder reclamo pendiente.",
      socioId: "b0000000-0000-0000-0000-000000000002",
      socioNombre: "Metalúrgica del Litoral S.A.",
      origenTipo: "alerta",
      origenId: "alt-1",
      responsableNombre: "Ing. Carlos Rossi",
      prioridad: "Crítica",
      estado: "Pendiente",
      sugeridaPorIa: true,
      automatica: false,
      fechaCreacion: "2026-08-20T10:30:00Z",
      fechaLimite: "2026-08-25T18:00:00Z",
      metadata: { tipoGestion: "Retención y Refinanciación" }
    },
    {
      id: "act-2",
      titulo: "Responder consulta legal demorada",
      descripcion: "Elaborar y remitir dictamen sobre encuadre paritario para Metalúrgica del Litoral.",
      socioId: "b0000000-0000-0000-0000-000000000002",
      socioNombre: "Metalúrgica del Litoral S.A.",
      origenTipo: "alerta",
      origenId: "alt-2",
      responsableNombre: "Dra. Clara Viggiano",
      prioridad: "Alta",
      estado: "En curso",
      sugeridaPorIa: false,
      automatica: false,
      fechaCreacion: "2026-08-21T10:00:00Z",
      fechaLimite: "2026-08-25T12:00:00Z"
    },
    {
      id: "act-3",
      titulo: "Preparar recordatorio de pago amistoso",
      descripcion: "Borrador de WhatsApp/Email para cuota de julio de Distribuidora San Agustín.",
      socioId: "b0000000-0000-0000-0000-000000000003",
      socioNombre: "Distribuidora San Agustín",
      origenTipo: "automatizacion",
      responsableNombre: "Lic. Esteban Peralta",
      prioridad: "Media",
      estado: "Pendiente",
      sugeridaPorIa: true,
      automatica: true,
      fechaCreacion: "2026-08-22T08:00:00Z"
    }
  ],
  automatizaciones: [
    {
      id: "auto-1",
      nombre: "Detección y Alerta de Socios en Riesgo",
      descripcion: "Monitorea socios con salud < 40 puntos y genera alerta crítica con acción sugerida para la gerencia.",
      triggerTipo: "socio_riesgo",
      condiciones: { scoreMax: 40 },
      acciones: [
        { tipo: "crear_alerta", config: { prioridad: "Crítica" } },
        { tipo: "crear_accion", config: { sugeridaPorIa: true } }
      ],
      activa: true,
      prioridad: 1,
      ejecucionesCount: 14,
      ultimaEjecucion: "2026-08-24T08:00:00Z"
    },
    {
      id: "auto-2",
      nombre: "Alerta de Tickets Demorados (>72hs)",
      descripcion: "Detecta tickets de atención al socio sin resolución por más de 72 horas.",
      triggerTipo: "ticket_demorado",
      condiciones: { horasMax: 72 },
      acciones: [
        { tipo: "crear_alerta", config: { prioridad: "Alta" } },
        { tipo: "notificar_responsable", config: { rol: "Atención al Socio" } }
      ],
      activa: true,
      prioridad: 2,
      ejecucionesCount: 22,
      ultimaEjecucion: "2026-08-24T08:00:00Z"
    },
    {
      id: "auto-3",
      nombre: "Alerta de Cuota Vencida y Mora Prolongada",
      descripcion: "Identifica cuotas impagas con más de 15 días de vencimiento y genera tarea de gestión.",
      triggerTipo: "cuota_vencida",
      condiciones: { diasMoraMin: 15 },
      acciones: [
        { tipo: "crear_alerta", config: { prioridad: "Media" } },
        { tipo: "preparar_comunicacion", config: { canal: "email_whatsapp" } }
      ],
      activa: true,
      prioridad: 3,
      ejecucionesCount: 31,
      ultimaEjecucion: "2026-08-24T08:00:00Z"
    },
    {
      id: "auto-4",
      nombre: "Aviso de Cupo Crítico en Eventos (>=90%)",
      descripcion: "Monitorea ocupación de salas y capacitaciones para habilitar lista de espera o segundo turno.",
      triggerTipo: "evento_cupo",
      condiciones: { ocupacionMin: 90 },
      acciones: [
        { tipo: "crear_alerta", config: { prioridad: "Media" } }
      ],
      activa: true,
      prioridad: 4,
      ejecucionesCount: 8,
      ultimaEjecucion: "2026-08-23T18:00:00Z"
    },
    {
      id: "auto-5",
      nombre: "Recordatorio Escalonado de Cuotas por Email",
      descripcion: "Envía recordatorios automáticos por correo a socios con cuotas sociales pendientes previo al vencimiento y aviso con link de pago.",
      triggerTipo: "vencimiento_cuota",
      condiciones: {
        diasPreviosVencimiento: 5,
        diasGracia: 3,
        canales: ["email"],
        incluirBotonPago: true,
        plantilla: "recordatorio_cuota_institucional"
      },
      acciones: [
        {
          tipo: "preparar_comunicacion",
          config: {
            canal: "email",
            asunto: "CeCIP: Aviso de Cuota Social y Comprobante Digital",
            remitente: "cobranzas@cecip.org.ar"
          }
        },
        {
          tipo: "crear_accion",
          config: {
            prioridad: "Media",
            sugeridaPorIa: true
          }
        }
      ],
      activa: true,
      prioridad: 2,
      ejecucionesCount: 16,
      ultimaEjecucion: "2026-08-24T09:00:00Z"
    }
  ],
  automatizacionesEjecuciones: [
    {
      id: "ae-1",
      automatizacionId: "auto-1",
      automatizacionNombre: "Detección y Alerta de Socios en Riesgo",
      entidadTipo: "socio",
      entidadId: "b0000000-0000-0000-0000-000000000002",
      socioNombre: "Metalúrgica del Litoral S.A.",
      inicio: "2026-08-24T08:00:00Z",
      finalizacion: "2026-08-24T08:00:02Z",
      estado: "Completada",
      resultado: { accion: "Alerta crítica alt-1 generada exitosamente", score: 36 }
    },
    {
      id: "ae-2",
      automatizacionId: "auto-2",
      automatizacionNombre: "Alerta de Tickets Demorados (>72hs)",
      entidadTipo: "ticket",
      entidadId: "t-1",
      socioNombre: "Metalúrgica del Litoral S.A.",
      inicio: "2026-08-24T08:00:01Z",
      finalizacion: "2026-08-24T08:00:02Z",
      estado: "Completada",
      resultado: { accion: "Alerta alt-2 generada, asignada a Clara Viggiano" }
    }
  ],
  oportunidades: [
    {
      id: "opo-1",
      tipo: "convenio_no_utilizado",
      titulo: "Socio activo con alta concurrencia sin adhesión a Convenio Banco",
      descripcion: "Calzados Paraná S.R.L. califica para el convenio de tasa preferencial Banco Entre Ríos por su excelente índice de salud (88/100).",
      socioId: "b0000000-0000-0000-0000-000000000001",
      socioNombre: "Calzados Paraná S.R.L.",
      score: 92,
      estado: "Detectada",
      detectadaPor: "motor_inteligencia",
      fecha: "2026-08-23",
      metadata: { convenioId: "conv-1", potencialImpacto: "Fidelización y beneficio comercial" }
    },
    {
      id: "opo-2",
      tipo: "perfil_laboral_busqueda",
      titulo: "Candidato en Bolsa compatible con búsqueda de Comercio",
      descripcion: "Se registraron 3 perfiles en la Bolsa de Empleo especializados en 'Ventas y Atención Comercial' coincidentes con el rubro Calzado y Vestimenta.",
      socioId: "b0000000-0000-0000-0000-000000000001",
      socioNombre: "Calzados Paraná S.R.L.",
      score: 85,
      estado: "Detectada",
      detectadaPor: "motor_inteligencia",
      fecha: "2026-08-24",
      metadata: { postulantesCoincidentes: 3, area: "Ventas y Comercial" }
    },
    {
      id: "opo-3",
      tipo: "demanda_capacitacion",
      titulo: "Empresa con interés en capacitación in-company",
      descripcion: "Rossi Distribuidora consultó en formulario de contacto por plan de marketing para 15 empleados.",
      score: 88,
      estado: "En contacto",
      detectadaPor: "motor_inteligencia",
      fecha: "2026-08-24",
      metadata: { contactoId: "msg-1", empleados: 15 }
    }
  ],
  iaActividad: [
    {
      id: "ia-act-1",
      usuarioNombre: "Ing. Carlos Rossi",
      tipo: "analisis_salud",
      accion: "Cálculo global de Índices de Salud de Socios",
      inputResumen: "Análisis determinístico de mora, CRM, eventos y tickets para 3 socios.",
      outputResumen: "1 socio Excelente, 1 socio Atención, 1 socio Riesgo Crítico.",
      modelo: "gemini-3.8-flash",
      herramienta: "calcularIndiceSalud",
      resultado: "Exitoso",
      fecha: "2026-08-24T08:00:00Z"
    },
    {
      id: "ia-act-2",
      usuarioNombre: "CeCIP Copilot",
      tipo: "sugerencia_accion",
      accion: "Generación de recomendación explicable para socio en riesgo",
      entidadTipo: "socio",
      entidadId: "b0000000-0000-0000-0000-000000000002",
      inputResumen: "Socio: Metalúrgica del Litoral S.A., Score: 36, Mora: 2 cuotas, Ticket abierto: 18 días.",
      outputResumen: "Sugerida llamada de retención y plan de refinanciación sin recargo.",
      modelo: "gemini-3.8-flash",
      herramienta: "getSocioSalud",
      resultado: "Exitoso",
      fecha: "2026-08-24T08:00:05Z"
    }
  ],
  auditoria: [
    {
      id: "aud-1",
      usuarioNombre: "Sistema Automático",
      accion: "ANALISIS_DIARIO_INTELIGENCIA",
      entidad: "alerta",
      entidadId: "alt-1",
      despues: { alertasGeneradas: 4, accionesGeneradas: 3, saludCalculada: 3 },
      fecha: "2026-08-24T08:00:00Z"
    },
    {
      id: "aud-2",
      usuarioNombre: "Carlos Rossi",
      accion: "LOGIN_ADMIN",
      entidad: "usuario",
      entidadId: "a0000000-0000-0000-0000-000000000001",
      despues: { rol: "Administrador General", email: "admin@cecip.org" },
      fecha: "2026-08-24T09:15:00Z"
    }
  ]
};

// Database state management
class DatabaseStore {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          ...initialData,
          ...parsed,
          socioSaludHistorial: parsed.socioSaludHistorial || initialData.socioSaludHistorial,
          alertas: parsed.alertas || initialData.alertas,
          acciones: parsed.acciones || initialData.acciones,
          automatizaciones: parsed.automatizaciones || initialData.automatizaciones,
          automatizacionesEjecuciones: parsed.automatizacionesEjecuciones || initialData.automatizacionesEjecuciones,
          oportunidades: parsed.oportunidades || initialData.oportunidades,
          iaActividad: parsed.iaActividad || initialData.iaActividad,
          auditoria: parsed.auditoria || initialData.auditoria,
        };
      }
    } catch (e) {
      console.warn("No se pudo leer server_data.json, inicializando con datos semilla:", e);
    }
    return initialData;
  }

  public save(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (e) {
      console.error("Error guardando datos en disco:", e);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public logAuditoria(entry: Omit<AuditoriaEntry, "id" | "fecha">): AuditoriaEntry {
    const newEntry: AuditoriaEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fecha: new Date().toISOString(),
      ...entry,
    };
    this.state.auditoria.unshift(newEntry);
    // Keep max 500 audit entries
    if (this.state.auditoria.length > 500) {
      this.state.auditoria = this.state.auditoria.slice(0, 500);
    }
    this.save();
    return newEntry;
  }

  public logIaActividad(entry: Omit<IaActividad, "id" | "fecha">): IaActividad {
    const newEntry: IaActividad = {
      id: `ia-act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fecha: new Date().toISOString(),
      ...entry,
    };
    this.state.iaActividad.unshift(newEntry);
    // Keep max 500 IA activity entries
    if (this.state.iaActividad.length > 500) {
      this.state.iaActividad = this.state.iaActividad.slice(0, 500);
    }
    this.save();
    return newEntry;
  }
}

export const db = new DatabaseStore();

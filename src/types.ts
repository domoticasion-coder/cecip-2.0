// ==============================================================================
// Tipos e Interfaces de Dominio CeCIP Paraná V1 Productiva
// Compatibilidad 100% con la interfaz actual + Persistencia PostgreSQL/Supabase
// ==============================================================================

export interface Usuario {
  id: string;
  authId?: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: "Administrador General" | "Tesorería" | "Atención al Socio" | "Gerencia";
  estado: "Activo" | "Inactivo" | "Suspendido";
  createdAt?: string;
  updatedAt?: string;
}

export type ErpUser = Usuario;

export interface CVSubmission {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  areaBusqueda: string; // e.g. "Administración", "Ventas y Comercial", "Industria y Producción", "Tecnología y Sistemas", "Soporte Técnico", "Otros"
  tipoProfesional: string; // e.g. "Estudiante / Junior", "Técnico Especialista", "Profesional Senior", "Oficios / Operativo"
  fileName: string;
  fileSize: string | number;
  filePath?: string;
  fileData?: string; // base64 or mock fallback
  fechaSubida: string;
  fechaPostulacion?: string;
  localidad?: string;
  experienciaPrevia?: string;
  comentarios?: string;
  interesados: string[]; // List of company names that are interested
  interesSocios?: string[];
}

export type ErpCv = CVSubmission;

export interface CvInteresSocio {
  id: string;
  cvId: string;
  socioId?: string;
  socioNombre: string;
  fecha: string;
  estado?: string;
  observacion?: string;
}

export interface WebNewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  badge: string;
  description: string;
  additionalInfo: string;
  imageUrl: string;
  itemsList?: string[];
  publicada?: boolean;
}

export type NewsItem = WebNewsItem;

export interface ContactMessage {
  id: string;
  nombre: string;
  empresa?: string;
  telefono: string;
  email: string;
  mensaje: string;
  fecha: string;
  respondido: boolean;
}

export interface PartnerCompany {
  id: string;
  nombre: string;
  rubro: string;
}

export interface SocioTimelineEvent {
  id: string;
  socioId?: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: "crm" | "factura" | "sistema" | "nota" | "evento";
  origenTipo?: string;
  origenId?: string;
  usuario?: string;
}

// ERP Domain Interfaces
export interface ErpSocio {
  id: string;
  razonSocial: string;
  nombreComercial: string;
  cuit: string;
  rubro: string;
  categoria: "Pequeño Comercio" | "Mediana Empresa" | "Gran Industria" | "Servicios";
  estado: "Activo" | "Inactivo" | "Pendiente";
  direccion: string;
  localidad: string;
  provincia: string;
  email: string;
  whatsapp: string;
  web?: string;
  redesSociales?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  observaciones?: string;
  fechaAlta: string;
  historialDocumentos?: { id: string; nombre: string; fecha: string; url: string }[];
  timeline: SocioTimelineEvent[];
}

export interface ErpCrmInteraction {
  id: string;
  socioId: string;
  socioNombre: string;
  tipo: "Llamada" | "Correo" | "Reunión" | "Reclamo" | "Consulta" | "Visita";
  fecha: string;
  responsable: string;
  responsableId?: string;
  detalle: string;
  remitente: string;
  recordatorio?: string;
  estado: "Pendiente" | "Realizado" | "Cancelado";
  resultado?: string;
  proximaAccion?: string;
  fechaProximaAccion?: string;
  prioridad?: "Baja" | "Normal" | "Alta" | "Urgente";
}

export interface ErpBill {
  id: string;
  socioId: string;
  socioNombre: string;
  mes: string;
  anio: number;
  detalle: string;
  monto: number;
  vencimiento: string;
  estado: "Pagado" | "Pendiente" | "Vencido" | "Mora";
  fechaPago?: string;
  reciboId?: string;
  intereses?: number;
  refinanciada?: boolean;
  metodoPago?: "Mercado Pago" | "Transferencia" | "Efectivo" | "Tarjeta de Crédito";
}

export interface ErpTesoreriaEntry {
  id: string;
  tipo: "Ingreso" | "Egreso";
  detalle: string;
  monto: number;
  fecha: string;
  categoria: "Cuotas Sociales" | "Sueldos" | "Servicios Públicos" | "Capacitaciones" | "Mantenimiento" | "Eventos" | "Otros";
  banco: "Banco Entre Ríos" | "Banco Nación" | "Caja Efectiva" | "Mercado Pago Cuenta";
  conciliado: boolean;
  facturaId?: string;
  createdBy?: string;
}

export interface ErpEvent {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  lugar: string;
  cuposMax: number;
  cuposInscriptos: number;
  asistentesCount: number;
  descripcion: string;
  orador: string;
  categoria: "Curso" | "Charla" | "Seminario" | "Reunión de Comisión" | "Muestra" | "Capacitación";
  tipo?: string;
  bannerUrl?: string;
  color?: string;
  borderColor?: string;
  textColor?: string;
}

export interface ErpEnrollment {
  id: string;
  eventoId: string;
  eventoTitulo?: string;
  nombreSocio: string;
  email: string;
  telefono: string;
  asistio: boolean;
  certificadoEnviado: boolean;
  fechaInscripcion?: string;
}

export interface ErpConvenio {
  id: string;
  titulo: string;
  descripcion: string;
  descuento: string;
  adheridos: string[];
  vigencia: string;
  vigenciaTexto?: string;
  categoria: "Comercios" | "Salud" | "Educación" | "Gastronomía" | "Turismo";
  imagenUrl?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  estado?: "Activo" | "Pausado" | "Vencido";
}

export interface ConvenioSocio {
  id: string;
  convenioId: string;
  socioId?: string;
  socioNombre: string;
  fechaAdhesion: string;
  estado?: string;
}

export interface ErpDoc {
  id: string;
  nombre: string;
  carpeta: "Actas" | "Balances" | "Contratos" | "Estatutos" | "Reglamentos" | "Prensa";
  version: string;
  fechaSubida: string;
  tamanio: string;
  tamanioFormato?: string;
  filePath?: string;
  mimeType?: string;
  creadoPor?: string;
  permisos: string[]; // e.g. ["Administrador", "Gerencia", "Tesorería", "Atención al Socio"]
  descargasCount: number;
}

export type ErpDocument = ErpDoc;

export interface TicketMensaje {
  id?: string;
  ticketId?: string;
  remitente: string;
  rol?: "socio" | "staff" | "ia";
  texto?: string;
  mensaje?: string;
  esStaff?: boolean;
  fecha: string;
  createdAt?: string;
}

export interface ErpTicket {
  id: string;
  socioId: string;
  socioNombre: string;
  titulo?: string;
  asunto?: string;
  estado: "Pendiente" | "En proceso" | "Resuelto" | "Cerrado" | "Abierto";
  categoria: "Facturación" | "Asesoramiento" | "Inscripción Evento" | "Inconveniente Técnico" | "Asesoría Legal" | "Asesoría Contable / Impositiva" | "Gestión Municipal" | "Soporte Tecnológico" | "Reserva Salón de Actos" | "Otros";
  prioridad?: "Baja" | "Media" | "Alta" | "Urgente";
  fechaCreacion: string;
  ultimaActualizacion?: string;
  fechaActualizacion?: string;
  mensajes: TicketMensaje[];
  sugerenciaIA?: string;
  sugerenciaIa?: string;
  asignadoA?: string;
}

export interface DashboardStats {
  totalSocios: number;
  sociosActivos: number;
  sociosPendientes: number;
  deudaTotal: number;
  recaudacionMes: number;
  facturacionTotalMes: number;
  morosidadTasa: number;
  ticketsPendientes: number;
  eventosProximos: number;
  totalInscriptos: number;
  movimientosRecientesCount: number;
  saldoTotalCajaBancos: number;
}

// ==============================================================================
// ERP V2 - Módulo de Inteligencia Operativa
// ==============================================================================

export type SaludCategoria = "Excelente" | "Saludable" | "Atención" | "Riesgo" | "Crítico";
export type TendenciaSalud = "ascendente" | "estable" | "descendente";

export interface SocioSaludHistorial {
  id: string;
  socioId: string;
  socioNombre?: string;
  score: number; // 0 - 100
  categoria: SaludCategoria;
  scoreFinanciero: number; // 0 - 35
  scoreRelacion: number; // 0 - 25
  scoreParticipacion: number; // 0 - 15
  scoreAtencion: number; // 0 - 15
  scoreAntiguedad: number; // 0 - 10
  factores: string[];
  recomendaciones: string[];
  tendencia: TendenciaSalud;
  fecha: string;
  createdAt?: string;
}

export type AlertaPrioridad = "Baja" | "Media" | "Alta" | "Crítica";
export type AlertaEstado = "Nueva" | "En revisión" | "En gestión" | "Resuelta" | "Descartada";

export interface AlertaOperativa {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  entidadTipo: "socio" | "factura" | "ticket" | "evento" | "crm" | "tesoreria" | "general";
  entidadId?: string;
  socioId?: string;
  socioNombre?: string;
  prioridad: AlertaPrioridad;
  estado: AlertaEstado;
  responsableId?: string;
  responsableNombre?: string;
  detectadaPor: "motor_reglas" | "ia" | "sistema";
  fingerprint?: string;
  fechaDeteccion: string;
  fechaLimite?: string;
  fechaResolucion?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export type AccionPrioridad = "Baja" | "Media" | "Alta" | "Crítica";
export type AccionEstado = "Pendiente" | "En curso" | "Completada" | "Cancelada";

export interface AccionOperativa {
  id: string;
  titulo: string;
  descripcion: string;
  socioId?: string;
  socioNombre?: string;
  origenTipo: "alerta" | "automatizacion" | "manual" | "ia_copilot" | "crm";
  origenId?: string;
  responsableId?: string;
  responsableNombre?: string;
  prioridad: AccionPrioridad;
  estado: AccionEstado;
  sugeridaPorIa: boolean;
  automatica: boolean;
  fechaCreacion: string;
  fechaLimite?: string;
  fechaCompletada?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Automatizacion {
  id: string;
  nombre: string;
  descripcion: string;
  triggerTipo: "vencimiento_cuota" | "cuota_vencida" | "mora_prolongada" | "ticket_demorado" | "crm_recordatorio" | "socio_riesgo" | "evento_cupo" | "conciliacion_pendiente";
  condiciones: Record<string, any>;
  acciones: {
    tipo: "crear_alerta" | "crear_accion" | "preparar_comunicacion" | "crear_crm" | "notificar_responsable";
    config: Record<string, any>;
  }[];
  activa: boolean;
  prioridad: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  ejecucionesCount?: number;
  ultimaEjecucion?: string;
}

export interface AutomatizacionEjecucion {
  id: string;
  automatizacionId: string;
  automatizacionNombre: string;
  entidadTipo: string;
  entidadId?: string;
  socioId?: string;
  socioNombre?: string;
  inicio: string;
  finalizacion?: string;
  estado: "Pendiente" | "Ejecutando" | "Completada" | "Error" | "Cancelada";
  resultado: Record<string, any>;
  error?: string;
  createdAt?: string;
}

export interface OportunidadOperativa {
  id: string;
  tipo: "convenio_no_utilizado" | "demanda_capacitacion" | "socio_alta_participacion" | "perfil_laboral_busqueda" | "evento_alta_demanda" | "rubro_expansion" | "contacto_comercial";
  titulo: string;
  descripcion: string;
  socioId?: string;
  socioNombre?: string;
  score: number;
  estado: "Detectada" | "En contacto" | "Concretada" | "Descartada";
  detectadaPor: string;
  metadata?: Record<string, any>;
  fecha: string;
  createdAt?: string;
}

export interface IaActividad {
  id: string;
  usuarioId?: string;
  usuarioNombre?: string;
  tipo: "consulta_copilot" | "analisis_salud" | "sugerencia_accion" | "herramienta_ejecutada" | "alerta_generada";
  accion: string;
  entidadTipo?: string;
  entidadId?: string;
  inputResumen?: string;
  outputResumen?: string;
  modelo: string;
  herramienta?: string;
  resultado: "Exitoso" | "Advertencia" | "Error";
  fecha: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface AuditoriaEntry {
  id: string;
  usuarioId?: string;
  usuarioNombre?: string;
  accion: string;
  entidad: "factura" | "socio" | "tesoreria" | "usuario" | "documento" | "alerta" | "automatizacion" | "ticket";
  entidadId: string;
  antes?: any;
  despues?: any;
  ip?: string;
  fecha: string;
  createdAt?: string;
}

export interface InteligenciaDashboardResumen {
  kpis: {
    totalSociosAnalizados: number;
    saludPromedio: number;
    sociosSaludablesCount: number;
    sociosAtencionCount: number;
    sociosRiesgoCount: number;
    sociosCriticosCount: number;
    alertasActivasCount: number;
    alertasCriticasCount: number;
    accionesPendientesCount: number;
    oportunidadesDetectadasCount: number;
    automatizacionesActivasCount: number;
    automatizacionesEjecutadasHoy: number;
  };
  distribucionSalud: {
    categoria: SaludCategoria;
    cantidad: number;
    porcentaje: number;
    color: string;
  }[];
  bandejaUrgencias: {
    criticas: (AlertaOperativa | AccionOperativa)[];
    altas: (AlertaOperativa | AccionOperativa)[];
    medias: (AlertaOperativa | AccionOperativa)[];
  };
  tendenciasRecientes: {
    mes: string;
    saludPromedio: number;
    moraTasa: number;
    alertasGeneradas: number;
  }[];
  oportunidadesDestacadas: OportunidadOperativa[];
  actividadRecienteIa: IaActividad[];
}


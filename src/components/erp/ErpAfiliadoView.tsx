import React, { useState, useMemo } from "react";
import { 
  Building2, 
  Receipt, 
  Briefcase, 
  Calendar, 
  Newspaper, 
  HelpCircle, 
  Award, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Search, 
  Send, 
  Eye, 
  UserCheck, 
  Filter, 
  Plus, 
  Download, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight, 
  Bot, 
  ShieldCheck, 
  Zap, 
  Users, 
  GraduationCap, 
  Scale, 
  Home, 
  Check, 
  MessageSquare,
  DollarSign
} from "lucide-react";
import { ErpSocio, ErpBill, ErpEvent, ErpTicket } from "../../types";
import { WebNewsItem, CVSubmission } from "../../types";
import { ALL_CECIP_SOCIOS } from "../../data/sociosData";

interface ErpAfiliadoViewProps {
  currentSocio: ErpSocio;
  darkMode: boolean;
  erpData: {
    socios: ErpSocio[];
    bills: ErpBill[];
    events: ErpEvent[];
    enrollments: any[];
    tickets: ErpTicket[];
    news?: WebNewsItem[];
  };
  onUpdateBills: (updated: ErpBill[]) => void;
  onUpdateEvents: (updated: ErpEvent[]) => void;
  onUpdateEnrollments: (updated: any[]) => void;
  onUpdateTickets: (updated: ErpTicket[]) => void;
  cvs: CVSubmission[];
  newsList: WebNewsItem[];
}

export default function ErpAfiliadoView({
  currentSocio,
  darkMode,
  erpData,
  onUpdateBills,
  onUpdateEvents,
  onUpdateEnrollments,
  onUpdateTickets,
  cvs,
  newsList
}: ErpAfiliadoViewProps) {
  // Navigation tabs for the affiliate
  const [activeTab, setActiveTab] = useState<
    "comercia" | "facturas" | "empleo" | "eventos" | "noticias" | "iec" | "beneficios"
  >("comercia");

  // State for CVs search and detail
  const [cvSearch, setCvSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("Todos");
  const [selectedCv, setSelectedCv] = useState<CVSubmission | null>(null);
  const [interestedCvIds, setInterestedCvIds] = useState<string[]>([]);

  // State for IEC Service request form
  const [iecSubject, setIecSubject] = useState("");
  const [iecCategory, setIecCategory] = useState<"Asesoría Legal" | "Asesoría Contable / Impositiva" | "Gestión Municipal" | "Soporte Tecnológico" | "Reserva Salón de Actos">("Asesoría Legal");
  const [iecPriority, setIecPriority] = useState<"Baja" | "Media" | "Alta" | "Urgente">("Media");
  const [iecDescription, setIecDescription] = useState("");
  const [iecSuccessMsg, setIecSuccessMsg] = useState("");

  // State for payment notification modal / feedback
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // State for Commercial Report Request in Beneficios
  const [verazCuit, setVerazCuit] = useState("");
  const [verazRazon, setVerazRazon] = useState("");
  const [verazSuccess, setVerazSuccess] = useState(false);

  // Filter bills specific to this affiliate
  const socioBills = useMemo(() => {
    return (erpData.bills || []).filter(
      (b) => b.socioId === currentSocio.id || (b.socioNombre && b.socioNombre.toLowerCase() === (currentSocio.nombreComercial || currentSocio.razonSocial).toLowerCase())
    );
  }, [erpData.bills, currentSocio]);

  // Financial summary for this affiliate
  const totalBillsCount = socioBills.length;
  const paidBillsCount = socioBills.filter((b) => b.estado === "Pagado").length;
  const pendingBills = socioBills.filter((b) => b.estado === "Pendiente" || b.estado === "Mora");
  const totalDebt = pendingBills.reduce((acc, b) => acc + (b.monto || 0) + (b.intereses || 0), 0);

  // Filter tickets created by this affiliate
  const socioTickets = useMemo(() => {
    return (erpData.tickets || []).filter(
      (t) => t.socioId === currentSocio.id || t.socioNombre?.toLowerCase() === (currentSocio.nombreComercial || currentSocio.razonSocial).toLowerCase()
    );
  }, [erpData.tickets, currentSocio]);

  // Handle Affiliate Payment Action (Self-pay simulation)
  const handlePayBill = (billId: string, method: "Transferencia" | "Mercado Pago") => {
    const updatedBills = erpData.bills.map((b) => {
      if (b.id === billId) {
        return {
          ...b,
          estado: "Pagado" as const,
          fechaPago: new Date().toISOString().split("T")[0],
          reciboId: `REC-${Date.now().toString().slice(-6)}`,
          metodoPago: method,
          intereses: 0,
        };
      }
      return b;
    });

    onUpdateBills(updatedBills);
    setPaymentNotice(`¡Pago registrado con éxito vía ${method}! El recibo oficial ya se encuentra disponible para descarga.`);
    setPayingBillId(null);
    setTimeout(() => setPaymentNotice(null), 6000);
  };

  // Handle Event Enrollment
  const handleEnrollEvent = (event: ErpEvent) => {
    const isAlreadyEnrolled = (erpData.enrollments || []).some(
      (en) => en.eventoId === event.id && (en.socioId === currentSocio.id || en.socioNombre === (currentSocio.nombreComercial || currentSocio.razonSocial))
    );

    if (isAlreadyEnrolled) {
      alert("Ya te encuentras inscripto en este evento. Te esperamos en la Sede CeCIP.");
      return;
    }

    // Add enrollment
    const newEnrollment = {
      id: `enr-${Date.now()}`,
      eventoId: event.id,
      socioId: currentSocio.id,
      socioNombre: currentSocio.nombreComercial || currentSocio.razonSocial,
      asistenteNombre: currentSocio.nombreComercial || currentSocio.razonSocial,
      asistenteEmail: currentSocio.email || "socio@cecip.org",
      asistenteTelefono: currentSocio.whatsapp || "343 4575070",
      fechaInscripcion: new Date().toISOString().split("T")[0],
      asistio: false,
    };

    const updatedEnrollments = [...(erpData.enrollments || []), newEnrollment];
    onUpdateEnrollments(updatedEnrollments);

    // Increment count on event
    const updatedEvents = erpData.events.map((ev) => {
      if (ev.id === event.id) {
        return {
          ...ev,
          cuposInscriptos: (ev.cuposInscriptos || 0) + 1,
        };
      }
      return ev;
    });
    onUpdateEvents(updatedEvents);

    alert(`¡Inscripción confirmada para "${event.titulo}"!\nTu empresa tiene un lugar reservado sin costo por ser socio de CeCIP.`);
  };

  // Handle IEC Service ticket submission
  const handleSubmitIecTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iecSubject.trim() || !iecDescription.trim()) return;

    const newTicket: ErpTicket = {
      id: `tck-${Date.now().toString().slice(-6)}`,
      socioId: currentSocio.id,
      socioNombre: currentSocio.nombreComercial || currentSocio.razonSocial,
      titulo: iecSubject,
      asunto: iecSubject,
      categoria: iecCategory,
      prioridad: iecPriority,
      estado: "Abierto",
      fechaCreacion: new Date().toISOString().split("T")[0],
      fechaActualizacion: new Date().toISOString().split("T")[0],
      ultimaActualizacion: new Date().toISOString().split("T")[0],
      asignadoA: "Equipo de Asistencia CeCIP",
      mensajes: [
        {
          id: `msg-${Date.now()}`,
          remitente: currentSocio.nombreComercial || currentSocio.razonSocial,
          rol: "socio",
          esStaff: false,
          fecha: new Date().toISOString().split("T")[0],
          texto: iecDescription,
          mensaje: iecDescription,
        },
      ],
    };

    onUpdateTickets([newTicket, ...(erpData.tickets || [])]);
    setIecSuccessMsg("¡Solicitud enviada con éxito! Nuestro gabinete técnico revisará tu consulta y te responderá a la brevedad.");
    setIecSubject("");
    setIecDescription("");
    setTimeout(() => setIecSuccessMsg(""), 6000);
  };

  // Handle toggle CV interest
  const toggleCvInterest = (cvId: string) => {
    if (interestedCvIds.includes(cvId)) {
      setInterestedCvIds(interestedCvIds.filter((id) => id !== cvId));
    } else {
      setInterestedCvIds([...interestedCvIds, cvId]);
    }
  };

  // Filter CVs
  const filteredCvs = useMemo(() => {
    return (cvs || []).filter((cv) => {
      const matchSearch =
        cv.nombre.toLowerCase().includes(cvSearch.toLowerCase()) ||
        cv.areaBusqueda.toLowerCase().includes(cvSearch.toLowerCase()) ||
        cv.tipoProfesional.toLowerCase().includes(cvSearch.toLowerCase());
      const matchArea = selectedArea === "Todos" || cv.areaBusqueda === selectedArea;
      return matchSearch && matchArea;
    });
  }, [cvs, cvSearch, selectedArea]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      
      {/* 1. TOP HEADER BRANDING FOR AFFILIATE */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#00a3e0] flex items-center justify-center font-bold text-lg border border-blue-100 dark:border-blue-800 shrink-0">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Socio CeCIP Adherido
              </span>
              <span className="text-xs text-slate-400 font-mono">CUIT: {currentSocio.cuit}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {currentSocio.nombreComercial || currentSocio.razonSocial}
            </h2>
          </div>
        </div>

        {/* Affiliate Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <span className="text-slate-400">Categoría:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{currentSocio.categoria || "Pequeño Comercio"}</span>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold ${
            totalDebt === 0 
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
              : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          }`}>
            <span>Estado:</span>
            <span>{totalDebt === 0 ? "Cuotas al Día ✓" : `Saldo Pendiente: $${totalDebt.toLocaleString()}`}</span>
          </div>
        </div>
      </div>

      {/* 2. SUBNAV TABS SPECIFIC FOR AFFILIATE (In order requested by user) */}
      <div className="bg-slate-100/80 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-8 py-2 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none shrink-0">
        
        {/* Tab 1: ComercIA (Initial Default) */}
        <button
          onClick={() => setActiveTab("comercia")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "comercia"
              ? "bg-[#00a3e0] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <Sparkles size={14} className={activeTab === "comercia" ? "text-sky-200" : "text-[#00a3e0]"} />
          <span>ComercIA (Adopción IA)</span>
        </button>

        {/* Tab 2: Facturación y Cuotas */}
        <button
          onClick={() => setActiveTab("facturas")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "facturas"
              ? "bg-[#00a3e0] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <Receipt size={14} />
          <span>Facturación y Cuotas</span>
          {pendingBills.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-black">
              {pendingBills.length}
            </span>
          )}
        </button>

        {/* Tab 3: Bolsa de Empleo */}
        <button
          onClick={() => setActiveTab("empleo")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "empleo"
              ? "bg-[#00a3e0] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <Briefcase size={14} />
          <span>Bolsa de Empleo ({cvs.length})</span>
        </button>

        {/* Tab 4: Eventos */}
        <button
          onClick={() => setActiveTab("eventos")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "eventos"
              ? "bg-[#00a3e0] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <Calendar size={14} />
          <span>Eventos e Inscripciones</span>
        </button>

        {/* Tab 5: Noticias */}
        <button
          onClick={() => setActiveTab("noticias")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "noticias"
              ? "bg-[#00a3e0] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <Newspaper size={14} />
          <span>Noticias CeCIP</span>
        </button>

        {/* Tab 6: IEC Service */}
        <button
          onClick={() => setActiveTab("iec")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "iec"
              ? "bg-[#00a3e0] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <HelpCircle size={14} />
          <span>IEC Service (Pedidos)</span>
          {socioTickets.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center font-black">
              {socioTickets.length}
            </span>
          )}
        </button>

        {/* Tab 7: Beneficios */}
        <button
          onClick={() => setActiveTab("beneficios")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "beneficios"
              ? "bg-[#00a3e0] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <Award size={14} />
          <span>Beneficios CeCIP</span>
        </button>
      </div>

      {/* 3. MAIN TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        
        {/* ========================================================================= */}
        {/* PESTAÑA 1: COMERCIA (Pestaña Inicial) */}
        {/* ========================================================================= */}
        {activeTab === "comercia" && (
          <div className="max-w-6xl mx-auto space-y-8 text-left">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-[#0c2356] via-[#0c2356] to-[#00a3e0] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="max-w-3xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold text-sky-200">
                  <Sparkles size={13} className="text-sky-300" />
                  <span>Programa Oficial CeCIP de Adopción Tecnológica 2026</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  ComercIA · Inteligencia Artificial para tu Comercio
                </h1>

                <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
                  Bienvenido al hub de innovación para asociados. Como miembro activo de CeCIP, {currentSocio.nombreComercial || currentSocio.razonSocial} tiene acceso bonificado a herramientas de IA generativa, optimización de ventas, atención automática y asesoría para pymes.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button 
                    onClick={() => setActiveTab("iec")}
                    className="px-5 py-2.5 bg-white text-[#0c2356] rounded-xl text-xs font-bold hover:bg-sky-50 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap size={14} className="text-[#00a3e0]" />
                    <span>Pedir Asistencia de Implementación en mi Negocio</span>
                  </button>
                  <a 
                    href="#diagnostico"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Diagnóstico de Madurez Digital: Tu empresa califica para el Nivel 2 (En Transición). Tienes bonificadas 3 horas de consultoría y acceso a CeCIP Copilot.");
                    }}
                    className="px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
                  >
                    Ver Diagnóstico de mi Empresa
                  </a>
                </div>
              </div>
            </div>

            {/* Grid of ComercIA Features & Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 hover:border-[#00a3e0] transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#00a3e0] flex items-center justify-center">
                  <MessageSquare size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Atención WhatsApp 24/7 con IA
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Automatiza las consultas frecuentes de tus clientes, envíos de catálogo, horarios y disponibilidad de productos sin perder el trato humano personalizado.
                </p>
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                    Bonificado 100% socios
                  </span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 hover:border-[#00a3e0] transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Generador de Catálogos y Promos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Crea textos persuasivos, descripciones de productos y promociones para redes sociales en segundos usando la inteligencia oficial de CeCIP Copilot.
                </p>
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-100 dark:border-purple-800">
                    Incluido en membresía
                  </span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 hover:border-[#00a3e0] transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                  <DollarSign size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Financiamiento y Subsidios
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Acceso prioritario a líneas de crédito del Banco Entre Ríos y subsidios CAME/CAC para adquisición de computadoras, software y equipamiento comercial.
                </p>
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                    Tasa preferencial CeCIP
                  </span>
                </div>
              </div>

            </div>

            {/* Quick Action Box */}
            <div className="p-6 bg-blue-50/70 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00a3e0] text-white flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">¿Tienes dudas sobre cómo aplicar IA en tu negocio?</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Puedes consultar a CeCIP Copilot en cualquier momento desde la burbuja flotante inferior.</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab("iec")}
                className="px-4 py-2 bg-[#00a3e0] hover:bg-[#0c2356] text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
              >
                Solicitar Asesoría Personalizada
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 2: FACTURACIÓN Y CUOTAS DEL SOCIO (CORRELATIVO CON ADMIN) */}
        {/* ========================================================================= */}
        {activeTab === "facturas" && (
          <div className="max-w-5xl mx-auto space-y-6 text-left">
            
            {/* Header info & Payment Alert */}
            {paymentNotice && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-bold flex items-center justify-between shadow-sm animate-pulse">
                <span>{paymentNotice}</span>
                <button onClick={() => setPaymentNotice(null)} className="text-emerald-600 hover:text-emerald-800">✕</button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Historial de Cuotas Sociales y Facturación
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Registro oficial sincronizado con la Tesorería General del CeCIP.
                </p>
              </div>

              {pendingBills.length > 0 && (
                <button
                  onClick={() => setPayingBillId(pendingBills[0].id)}
                  className="px-4 py-2 bg-[#00a3e0] hover:bg-[#0c2356] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                >
                  Pagar Cuota Pendiente (${totalDebt.toLocaleString()})
                </button>
              )}
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cuota Mensual Base</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  ${(socioBills[0]?.monto || 3500).toLocaleString()} <span className="text-xs font-normal text-slate-400">/ mes</span>
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Categoría: {currentSocio.categoria}</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cuotas Abonadas</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {paidBillsCount} <span className="text-xs font-normal text-slate-400">de {totalBillsCount}</span>
                </p>
                <span className="text-[11px] text-emerald-600">Historial verificado</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado de Cuenta</span>
                <p className={`text-2xl font-black ${totalDebt === 0 ? "text-emerald-600" : "text-amber-500"}`}>
                  {totalDebt === 0 ? "Al Día ✓" : `$${totalDebt.toLocaleString()}`}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {totalDebt === 0 ? "Sin cuotas vencidas" : `${pendingBills.length} cuota(s) pendiente(s)`}
                </span>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Detalle de Comprobantes Emitidos
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Socio #{currentSocio.id.slice(-6)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Concepto / Período</th>
                      <th className="py-3 px-4 font-semibold">Vencimiento</th>
                      <th className="py-3 px-4 font-semibold">Monto</th>
                      <th className="py-3 px-4 font-semibold">Estado</th>
                      <th className="py-3 px-4 font-semibold">Recibo / Pago</th>
                      <th className="py-3 px-4 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {socioBills.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No hay comprobantes emitidos para este afiliado.
                        </td>
                      </tr>
                    ) : (
                      socioBills.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                            Cuota Social CeCIP ({b.mes})
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">{b.vencimiento}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            ${((b.monto || 0) + (b.intereses || 0)).toLocaleString()}
                            {b.intereses ? (
                              <span className="block text-[10px] text-rose-500 font-normal">
                                (incluye ${b.intereses} interés mora)
                              </span>
                            ) : null}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.estado === "Pagado" 
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200" 
                                : b.estado === "Mora"
                                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200"
                                : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200"
                            }`}>
                              {b.estado}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">
                            {b.reciboId ? (
                              <span className="text-[#00a3e0] font-bold">{b.reciboId}</span>
                            ) : (
                              <span className="text-slate-400 italic">Pendiente</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {b.estado === "Pagado" ? (
                              <button
                                onClick={() => {
                                  alert(`Descargando comprobante oficial ${b.reciboId} correspondiente a la cuota ${b.mes} de ${currentSocio.nombreComercial || currentSocio.razonSocial}.`);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                              >
                                <Download size={12} />
                                <span>Recibo PDF</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setPayingBillId(b.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-[#00a3e0] hover:bg-[#0c2356] text-white rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <span>Pagar Ahora</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Modal */}
            {payingBillId && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a3e0] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded">
                        Tesorería CeCIP
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        Abonar Cuota Social
                      </h4>
                    </div>
                    <button onClick={() => setPayingBillId(null)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Afiliado:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{currentSocio.nombreComercial || currentSocio.razonSocial}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CBU CeCIP Oficial:</span>
                      <span className="font-mono font-bold text-[#00a3e0]">3860001003000000000001</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Alias:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">CECIP.PARANA.OFICIAL</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Selecciona el método de pago:</p>
                    
                    <button
                      onClick={() => handlePayBill(payingBillId, "Transferencia")}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#00a3e0] hover:bg-blue-50/20 text-left transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🏦</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Transferencia Bancaria Inmediata</p>
                          <p className="text-[11px] text-slate-400">Confirmación y emisión automática de recibo</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => handlePayBill(payingBillId, "Mercado Pago")}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#00a3e0] hover:bg-blue-50/20 text-left transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">💳</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Mercado Pago / Tarjeta de Débito</p>
                          <p className="text-[11px] text-slate-400">Acreditación instantánea</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setPayingBillId(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 3: BOLSA DE EMPLEO (POSTULANTES DE LA WEB) */}
        {/* ========================================================================= */}
        {activeTab === "empleo" && (
          <div className="max-w-6xl mx-auto space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Bolsa de Empleo CeCIP · Postulantes de Paraná
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acceso exclusivo para afiliados a la base de currículums cargados a través de la web oficial.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200">
                  {cvs.length} Perfiles Activos
                </span>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar postulante por nombre, puesto, habilidades o experiencia..."
                  value={cvSearch}
                  onChange={(e) => setCvSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-[#00a3e0]"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-[#00a3e0]"
                >
                  <option value="Todos">Todas las áreas</option>
                  <option value="Ventas y Comercial">Ventas y Comercial</option>
                  <option value="Administración y Contabilidad">Administración y Contabilidad</option>
                  <option value="Atención al Cliente">Atención al Cliente</option>
                  <option value="Logística y Depósito">Logística y Depósito</option>
                  <option value="Informática y Redes">Informática y Redes</option>
                </select>
              </div>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCvs.map((cv) => {
                const isInterested = interestedCvIds.includes(cv.id);
                return (
                  <div
                    key={cv.id}
                    className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#00a3e0] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#00a3e0] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded uppercase tracking-wider">
                            {cv.areaBusqueda}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                            {cv.nombre}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">{cv.tipoProfesional || "Comercio"}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{cv.fechaPostulacion || cv.fechaSubida}</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{cv.localidad || "Paraná"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate font-mono">{cv.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          <span className="font-mono">{cv.telefono}</span>
                        </div>
                      </div>

                      {(cv.experienciaPrevia || cv.comentarios) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                          "{cv.experienciaPrevia || cv.comentarios}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedCv(cv)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>Ver Perfil</span>
                      </button>

                      <button
                        onClick={() => toggleCvInterest(cv.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isInterested
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-blue-50 dark:bg-blue-950/40 text-[#00a3e0] hover:bg-blue-100"
                        }`}
                      >
                        <UserCheck size={13} />
                        <span>{isInterested ? "Interesado ✓" : "Contactar"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Candidate Detail Modal */}
            {selectedCv && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 text-left relative">
                  <button 
                    onClick={() => setSelectedCv(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                  >
                    ✕
                  </button>

                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#00a3e0] flex items-center justify-center font-bold text-lg shrink-0">
                      👤
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#00a3e0]">
                        {selectedCv.areaBusqueda}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                        {selectedCv.nombre}
                      </h3>
                      <p className="text-xs text-slate-500">{selectedCv.tipoProfesional || "Postulante Registrado"}</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="font-semibold text-slate-500">Teléfono:</span>
                      <a href={`tel:${selectedCv.telefono}`} className="font-bold text-[#00a3e0] hover:underline">
                        {selectedCv.telefono}
                      </a>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="font-semibold text-slate-500">E-mail:</span>
                      <a href={`mailto:${selectedCv.email}`} className="font-bold text-[#00a3e0] hover:underline">
                        {selectedCv.email}
                      </a>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="font-semibold text-slate-500">Localidad:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{selectedCv.localidad || "Paraná"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-semibold text-slate-500">Fecha Postulación:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCv.fechaPostulacion || selectedCv.fechaSubida}</span>
                    </div>
                  </div>

                  {(selectedCv.experienciaPrevia || selectedCv.comentarios) && (
                    <div className="space-y-1.5">
                      <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                        Experiencia y Perfil Laboral:
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-blue-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-blue-100 dark:border-slate-700 leading-relaxed">
                        {selectedCv.experienciaPrevia || selectedCv.comentarios}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setSelectedCv(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <a
                      href={`https://wa.me/549${selectedCv.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageSquare size={13} />
                      <span>Contactar por WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 4: EVENTOS DONDE PUEDEN INSCRIBIRSE PARA PARTICIPAR */}
        {/* ========================================================================= */}
        {activeTab === "eventos" && (
          <div className="max-w-5xl mx-auto space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Agenda de Eventos y Capacitaciones CeCIP
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Talleres, seminarios y conferencias oficiales organizadas por la institución. Inscripción 100% bonificada para socios.
                </p>
              </div>

              <span className="text-xs font-bold text-[#00a3e0] bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-200">
                {erpData.events.length} Eventos Programados
              </span>
            </div>

            <div className="space-y-4">
              {erpData.events.map((ev) => {
                const isEnrolled = (erpData.enrollments || []).some(
                  (en) => en.eventoId === ev.id && (en.socioId === currentSocio.id || en.socioNombre === (currentSocio.nombreComercial || currentSocio.razonSocial))
                );

                return (
                  <div
                    key={ev.id}
                    className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#00a3e0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-[#00a3e0] border border-blue-200">
                          {ev.tipo || ev.categoria || "Seminario"}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          <Clock size={12} /> {ev.fecha} · {ev.hora} hs
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        {ev.titulo}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {ev.descripcion}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          <span>{ev.lugar}</span>
                        </span>
                        {ev.orador && (
                          <span className="flex items-center gap-1">
                            <GraduationCap size={13} className="text-slate-400" />
                            <span>Disertante: <strong>{ev.orador}</strong></span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users size={13} className="text-slate-400" />
                          <span>Cupos: {ev.cuposInscriptos} / {ev.cuposMax}</span>
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {isEnrolled ? (
                        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle size={15} />
                          <span>Inscripto Oficialmente ✓</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnrollEvent(ev)}
                          className="px-5 py-2.5 bg-[#00a3e0] hover:bg-[#0c2356] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Calendar size={14} />
                          <span>Inscribirme al Evento</span>
                        </button>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium">Gratis para {currentSocio.nombreComercial || currentSocio.razonSocial}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 5: NOTICIAS (VINCULADA A LAS NOTICIAS DE CECIP) */}
        {/* ========================================================================= */}
        {activeTab === "noticias" && (
          <div className="max-w-5xl mx-auto space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Noticias y Comunicados Oficiales CeCIP
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Actualizaciones gremiales, informes de ventas, acuerdos municipales y boletines para el sector productivo.
                </p>
              </div>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Canal Oficial de Prensa CeCIP
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {item.imageUrl && (
                    <div className="h-44 bg-slate-100 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-[#00a3e0] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded uppercase tracking-wider">
                          {item.badge || item.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                      <span className="text-slate-400">CeCIP Prensa</span>
                      <button
                        onClick={() => {
                          alert(`Comunicado Oficial CeCIP:\n\n${item.title}\n\n${item.description}\n\n${item.additionalInfo || ""}`);
                        }}
                        className="text-[#00a3e0] font-bold hover:underline cursor-pointer"
                      >
                        Leer artículo completo →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 6: IEC SERVICE (SOLICITUD DE SERVICIOS) */}
        {/* ========================================================================= */}
        {activeTab === "iec" && (
          <div className="max-w-5xl mx-auto space-y-8 text-left">
            
            {iecSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-bold flex items-center justify-between shadow-sm">
                <span>{iecSuccessMsg}</span>
                <button onClick={() => setIecSuccessMsg("")} className="text-emerald-600 hover:text-emerald-800">✕</button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  IEC Service · Mesa de Servicios para Afiliados
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Canal directo para solicitar gestiones, asesoramiento profesional, habilitaciones o soporte técnico.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form to submit request */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <Plus size={16} className="text-[#00a3e0]" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Nuevo Pedido de Servicio</h4>
                </div>

                <form onSubmit={handleSubmitIecTicket} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Asunto de la Solicitud *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Asesoría sobre Tasa de Higiene / Reserva Salón de Actos"
                      value={iecSubject}
                      onChange={(e) => setIecSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-[#00a3e0]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Área de Servicio *
                      </label>
                      <select
                        value={iecCategory}
                        onChange={(e: any) => setIecCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-[#00a3e0]"
                      >
                        <option value="Asesoría Legal">Asesoría Legal y Laboral</option>
                        <option value="Asesoría Contable / Impositiva">Asesoría Contable / Impositiva</option>
                        <option value="Gestión Municipal">Gestión Municipal / Habilitaciones</option>
                        <option value="Soporte Tecnológico">Soporte Tecnológico e IA</option>
                        <option value="Reserva Salón de Actos">Reserva Salón de Actos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Prioridad
                      </label>
                      <select
                        value={iecPriority}
                        onChange={(e: any) => setIecPriority(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-[#00a3e0]"
                      >
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Detalle de la consulta o necesidad *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe los antecedentes, fechas requeridas o detalles de la solicitud..."
                      value={iecDescription}
                      onChange={(e) => setIecDescription(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-[#00a3e0] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#00a3e0] hover:bg-[#0c2356] text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>Enviar Solicitud a CeCIP</span>
                  </button>
                </form>
              </div>

              {/* List of Previous Requests / Status */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Mis Solicitudes Activas ({socioTickets.length})
                </h4>

                {socioTickets.length === 0 ? (
                  <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs">
                    No tienes solicitudes registradas. Envía tu primera consulta desde el formulario.
                  </div>
                ) : (
                  socioTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-[#00a3e0] bg-blue-50 px-2 py-0.5 rounded">
                          {t.categoria}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          t.estado === "Cerrado" || t.estado === "Resuelto"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {t.estado}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">{t.asunto || t.titulo}</h5>
                      <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                        <span>Ticket #{t.id}</span>
                        <span>{t.fechaCreacion}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 7: BENEFICIOS DE CECIP */}
        {/* ========================================================================= */}
        {activeTab === "beneficios" && (
          <div className="max-w-5xl mx-auto space-y-8 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Beneficios y Servicios Estatutarios CeCIP
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Herramientas y derechos exclusivos incluidos en tu cuota social como miembro de CeCIP Paraná.
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200">
                100% Bonificados para Asociados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Benefit 1: Capacitaciones */}
              <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#00a3e0] flex items-center justify-center">
                  <GraduationCap size={24} />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  1. Plan Integral de Capacitaciones
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Cursos presenciales y virtuales dictados junto a la Confederación Argentina de la Mediana Empresa (CAME) y la Cámara Argentina de Comercio (CAC) con certificación oficial sin costo.
                </p>
                <button
                  onClick={() => setActiveTab("eventos")}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Ver Cursos Disponibles →
                </button>
              </div>

              {/* Benefit 2: Asesoramiento legal e impositivo */}
              <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                  <Scale size={24} />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  2. Asesoramiento Legal e Impositivo
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Gabinete de profesionales especializados para evacuar dudas laborales, convenios colectivos mercantiles, liquidación de la Tasa de Higiene de Paraná y normativas impositivas de AFIP/ATER.
                </p>
                <button
                  onClick={() => setActiveTab("iec")}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Pedir Consulta con Asesor →
                </button>
              </div>

              {/* Benefit 3: Acceso a Informes Comerciales */}
              <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  3. Acceso a Informes Comerciales (Veraz / Nosis)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Consulta de solvencia financiera y antecedentes comerciales de nuevos clientes o proveedores con tarifa corporativa bonificada.
                </p>

                {verazSuccess ? (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl">
                    Solicitud de informe enviada. Recibirás el PDF en tu correo ({currentSocio.email}).
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!verazCuit.trim()) return;
                      setVerazSuccess(true);
                      setTimeout(() => setVerazSuccess(false), 5000);
                    }}
                    className="flex gap-2 text-xs"
                  >
                    <input
                      type="text"
                      placeholder="Ingresar CUIT a consultar..."
                      value={verazCuit}
                      onChange={(e) => setVerazCuit(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#00a3e0] text-white font-bold rounded-xl cursor-pointer"
                    >
                      Consultar
                    </button>
                  </form>
                )}
              </div>

              {/* Benefit 4: Uso de Instalaciones */}
              <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                  <Home size={24} />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  4. Uso de Instalaciones (Sede Central)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Salón de Actos histórico para 80 personas (con proyector HD, sonido y climatización) y salas privadas de reuniones en Calle 25 de Mayo 28 para eventos propios de tu empresa.
                </p>
                <button
                  onClick={() => setActiveTab("iec")}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Reservar Salón o Sala →
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

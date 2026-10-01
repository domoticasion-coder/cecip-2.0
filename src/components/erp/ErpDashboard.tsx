import React, { useState, useEffect } from "react";
import { ErpSocio, ErpBill, ErpTicket, CVSubmission } from "../../types";
import ErpCalendarioInteractivo from "./ErpCalendarioInteractivo";
import { 
  Users, TrendingUp, AlertTriangle, Coins, Calendar, Award, 
  HelpCircle, Clock, Plus, ArrowUpRight, ArrowDownRight, CheckCircle2, ChevronRight, FileText,
  Search, Briefcase, Mail, Phone, Upload, Bookmark, Newspaper, ArrowRight, Lock, PlusCircle,
  Download, Check, Building2, Sparkles, ShieldCheck, Eye, X
} from "lucide-react";

interface ErpDashboardProps {
  socios: ErpSocio[];
  bills: ErpBill[];
  tickets: ErpTicket[];
  role: string;
  onNavigate: (view: string) => void;
  onAddSocio: () => void;
  onAddInteraction: () => void;
  onAddBill: () => void;
  onAddEvent: () => void;
}

export default function ErpDashboard({ 
  socios, bills, tickets, role, onNavigate,
  onAddSocio, onAddInteraction, onAddBill, onAddEvent 
}: ErpDashboardProps) {
  const [metricFilter, setMetricFilter] = useState<"mes" | "anio">("mes");

  // Socio Portal Dashboard specific states (declared at top-level before any conditional returns)
  const [cvsList, setCvsList] = useState<CVSubmission[]>([]);
  const [cvSearch, setCvSearch] = useState("");
  const [cvAreaFilter, setCvAreaFilter] = useState("Todos");
  const [viewingCv, setViewingCv] = useState<CVSubmission | null>(null);
  const [showAddCvModal, setShowAddCvModal] = useState(false);
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [enrolledEvents, setEnrolledEvents] = useState<string[]>([]);
  const [activeAnnouncement, setActiveAnnouncement] = useState<any | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // New ticket form states
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState("Asesoramiento");
  const [newTicketMessage, setNewTicketMessage] = useState("");

  // New CV form states
  const [newCvName, setNewCvName] = useState("");
  const [newCvEmail, setNewCvEmail] = useState("");
  const [newCvPhone, setNewCvPhone] = useState("");
  const [newCvArea, setNewCvArea] = useState("Administración");
  const [newCvType, setNewCvType] = useState("Estudiante / Junior");
  const [newCvComments, setNewCvComments] = useState("");
  const [newCvFileName, setNewCvFileName] = useState("mi_curriculum_vitae_2026.pdf");

  // Load CVs on mount or when role changes
  useEffect(() => {
    if (role === "Atención al Socio") {
      const loaded = JSON.parse(localStorage.getItem("cecip_cvs") || "[]");
      if (loaded.length === 0) {
        const seed: CVSubmission[] = [
          {
            id: "cv-seed-1",
            nombre: "Mariana Alejandra Gómez",
            email: "mariana.gomez@gmail.com",
            telefono: "343 154889922",
            areaBusqueda: "Administración",
            tipoProfesional: "Técnico Especialista",
            fileName: "gomez_mariana_cv_2026.pdf",
            fileSize: "1.2 MB",
            fechaSubida: "28/06/2026",
            comentarios: "Tengo 5 años de experiencia en liquidación de sueldos, atención a proveedores y manejo de sistemas contables tango/bejerman. Busco jornada completa en Paraná.",
            interesados: ["Supermercados Paraná S.A."]
          },
          {
            id: "cv-seed-2",
            nombre: "Nicolás Agustín Fontana",
            email: "nicolas.fontana.tech@gmail.com",
            telefono: "343 155331144",
            areaBusqueda: "Tecnología y Sistemas",
            tipoProfesional: "Estudiante / Junior",
            fileName: "cv_fontana_desarrollador.pdf",
            fileSize: "850 KB",
            fechaSubida: "29/06/2026",
            comentarios: "Estudiante avanzado de Licenciatura en Sistemas en UTN Paraná. Conocimientos en React, TypeScript y Node.js. Busco mi primera experiencia formal.",
            interesados: []
          },
          {
            id: "cv-seed-3",
            nombre: "Claudio Rubén Martínez",
            email: "claudio_martinez77@hotmail.com",
            telefono: "343 156221199",
            areaBusqueda: "Industria y Producción",
            tipoProfesional: "Oficios / Operario calificado",
            fileName: "curriculum_martinez_metalurgico.docx",
            fileSize: "1.4 MB",
            fechaSubida: "30/06/2026",
            comentarios: "Soldador calificado MIG-MAG y electricista industrial matriculado con más de 10 años en plantas industriales del Parque Industrial Paraná.",
            interesados: ["Metalúrgica Entre Ríos"]
          },
          {
            id: "cv-seed-4",
            nombre: "Sofía Belén Rossi",
            email: "sofia.rossi.ventas@gmail.com",
            telefono: "343 154774411",
            areaBusqueda: "Ventas y Comercial",
            tipoProfesional: "Profesional Senior",
            fileName: "rossi_sofia_comercial_cv.pdf",
            fileSize: "980 KB",
            fechaSubida: "30/06/2026",
            comentarios: "Licenciada en Marketing con trayectoria liderando equipos comerciales de retail y preventas. Excelente manejo de CRM y relaciones públicas.",
            interesados: []
          }
        ];
        localStorage.setItem("cecip_cvs", JSON.stringify(seed));
        setCvsList(seed);
      } else {
        setCvsList(loaded);
      }
    }
  }, [role]);

  // Submit handers
  const handleAddCvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCvName || !newCvEmail || !newCvPhone) {
      alert("Por favor, complete los campos obligatorios.");
      return;
    }
    const newCv: CVSubmission = {
      id: "cv-" + Date.now(),
      nombre: newCvName,
      email: newCvEmail,
      telefono: newCvPhone,
      areaBusqueda: newCvArea,
      tipoProfesional: newCvType,
      fileName: newCvFileName || "curriculum.pdf",
      fileSize: "1.1 MB",
      fechaSubida: new Date().toLocaleDateString("es-AR"),
      comentarios: newCvComments,
      interesados: []
    };
    const updated = [newCv, ...cvsList];
    localStorage.setItem("cecip_cvs", JSON.stringify(updated));
    setCvsList(updated);
    
    // Reset fields
    setNewCvName("");
    setNewCvEmail("");
    setNewCvPhone("");
    setNewCvComments("");
    setShowAddCvModal(false);
    alert("¡Currículum vitae cargado con éxito en la Bolsa de Empleo de CeCIP!");
  };

  const handleAddTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle || !newTicketMessage) {
      alert("Por favor, complete todos los campos.");
      return;
    }
    alert(`¡Ticket de Soporte Creado!\n\nAsunto: ${newTicketTitle}\nCategoría: ${newTicketCategory}\nMensaje: ${newTicketMessage}\n\nNuestro equipo técnico y de atención de CeCIP responderá a la brevedad.`);
    setNewTicketTitle("");
    setNewTicketMessage("");
    setShowNewTicketModal(false);
  };

  // Filter CV candidates
  const cvAreasList = [
    "Todos",
    "Administración",
    "Ventas y Comercial",
    "Industria y Producción",
    "Tecnología y Sistemas",
    "Soporte Técnico",
    "Logística y Depósito",
    "Atención al Cliente",
    "Oficios / Operativo",
    "Otros"
  ];

  const filteredCvs = cvsList.filter(cv => {
    const matchesSearch = 
      cv.nombre.toLowerCase().includes(cvSearch.toLowerCase()) || 
      (cv.comentarios && cv.comentarios.toLowerCase().includes(cvSearch.toLowerCase())) ||
      cv.areaBusqueda.toLowerCase().includes(cvSearch.toLowerCase());
    const matchesArea = cvAreaFilter === "Todos" || cv.areaBusqueda === cvAreaFilter;
    return matchesSearch && matchesArea;
  });

  // Conditional rendering for Atención al Socio (Socio Dashboard Portal)
  if (role === "Atención al Socio") {
    return (
      <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-100">
        
        {/* Welcome banner with responsive layout */}
        <div className="bg-gradient-to-r from-cecip-blue/10 to-blue-600/5 dark:from-slate-800/60 dark:to-slate-700/30 p-6 sm:p-8 rounded-3xl border border-cecip-blue/20 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cecip-blue/10 dark:bg-slate-700 text-cecip-blue dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider">
                Área de Servicios Integrales
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Sparkles size={11} fill="currentColor" /> Vista de Socio
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Bienvenido al Portal del Socio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Como empresa adherida, tienes acceso a la Bolsa de Trabajo de CeCIP, consulta del estado de membresía, próximos eventos de capacitación, beneficios gremiales y asistencia en línea.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button 
              onClick={() => setShowAddCvModal(true)}
              className="px-4 py-2.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-cecip-blue/10 transition-colors cursor-pointer"
            >
              <Upload size={14} />
              <span>Cargar mi Currículum</span>
            </button>
            <button 
              onClick={() => setShowNewTicketModal(true)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <HelpCircle size={14} />
              <span>Abrir Consulta</span>
            </button>
          </div>
        </div>

        {/* Bento Grid: Estado de Membresía & Próximo Vencimiento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Estado de la membresía */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider block">Estado de la membresía</span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Socio Platino</h3>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block mt-0.5">ID Socio: #C-2045</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-500">
                <Award size={20} fill="currentColor" />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-700/60 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Asociado desde:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">14/03/2021</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Condición de Cuenta:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-500">
                  <CheckCircle2 size={12} fill="currentColor" className="text-white dark:text-slate-800" />
                  <span>Socio Activo</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Próximo Vencimiento de Cuota */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider block font-medium">Próximo vencimiento</span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {isFeePaid ? "Julio Cubierto" : "$12,500.00"}
                </h3>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
                  {isFeePaid ? "¡Pago procesado con éxito!" : "Membresía Mensual CeCIP (Julio 2026)"}
                </span>
              </div>
              <div className={`p-3 rounded-xl ${isFeePaid ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500" : "bg-blue-50 dark:bg-blue-950/40 text-cecip-blue"}`}>
                <Coins size={20} />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-700/60 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Fecha Vencimiento:</span>
                <span className={`font-bold ${isFeePaid ? "text-slate-400 line-through" : "text-amber-500"}`}>10/07/2026</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {isFeePaid ? (
                  <span className="w-full text-center py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider block">
                    ✓ Cuota Pagada Online
                  </span>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setIsFeePaid(true);
                        alert("¡Simulación de Pago Exitoso!\nLa cuota de Julio 2026 ha sido saldada mediante pago virtual CeCIP Pay.");
                      }}
                      className="flex-1 py-1.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white font-bold text-[10px] uppercase rounded-lg text-center transition-all cursor-pointer"
                    >
                      Pagar Online
                    </button>
                    <button 
                      onClick={() => alert("Descargando factura/cupón oficial de pago para Julio 2026...")}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                      title="Descargar cupón de pago"
                    >
                      Factura
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Accesos rápidos */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider block">Gestión Ágil</span>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Accesos Rápidos</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Atajos útiles para realizar trámites inmediatos.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              <button 
                onClick={() => alert("Simulando descarga de Certificado Analítico de Membresía Activa (CeCIP Paraná) en formato PDF...")}
                className="p-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-cecip-blue/5 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-left"
              >
                <Download size={11} className="text-cecip-blue" />
                <span>Certificado Socio</span>
              </button>
              <button 
                onClick={() => onNavigate("eventos")}
                className="p-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-cecip-blue/5 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-left"
              >
                <Calendar size={11} className="text-indigo-500" />
                <span>Ver Convenios</span>
              </button>
              <button 
                onClick={() => onNavigate("docs")}
                className="p-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-cecip-blue/5 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-left"
              >
                <FileText size={11} className="text-emerald-500" />
                <span>Biblioteca Digital</span>
              </button>
              <button 
                onClick={() => setShowNewTicketModal(true)}
                className="p-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-cecip-blue/5 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-left"
              >
                <HelpCircle size={11} className="text-amber-500" />
                <span>Consultas CD</span>
              </button>
            </div>
          </div>

        </div>

        {/* Sección principal: Calendario Interactivo de Eventos */}
        <ErpCalendarioInteractivo 
          enrolledEvents={enrolledEvents} 
          onEnrollToggle={(eventId) => {
            if (enrolledEvents.includes(eventId)) {
              setEnrolledEvents(enrolledEvents.filter(id => id !== eventId));
            } else {
              setEnrolledEvents([...enrolledEvents, eventId]);
            }
          }}
          role={role}
        />

        {/* Seccion principal: Beneficios y Alianzas de la Red */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Award className="text-amber-500" size={16} />
              <span>Beneficios y Alianzas de la Red (Descuentos)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ahorros corporativos exclusivos para firmas que integran la red CeCIP.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                titulo: "Logística del Litoral",
                descuento: "20% OFF",
                detalle: "En envíos nacionales e interurbanos presentando código de membresía virtual."
              },
              {
                titulo: "Capacitación UTN Paraná",
                descuento: "15% BONIFICACIÓN",
                detalle: "En carreras y diplomaturas técnicas para personal de tu negocio."
              },
              {
                titulo: "Firma Digital CeCIP",
                descuento: "50% DESCUENTO",
                detalle: "Gestión exprés de firma autorizada por CeCIP Paraná y certificada legalmente."
              },
              {
                titulo: "Sanatorio de la Ciudad",
                descuento: "TARIFA ESPECIAL",
                detalle: "Bonificaciones en planes de medicina prepaga laboral y chequeos preventivos."
              }
            ].map((ben, i) => (
              <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 rounded-xl space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 text-left">{ben.titulo}</h4>
                    <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                      {ben.descuento}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-1 text-left">
                    {ben.detalle}
                  </p>
                </div>
                <button 
                  onClick={() => alert(`Cupón de descuento generado para ${ben.titulo}.\nCódigo: CECIP-MEMBER-${1000 + i}\nPresenta este código en la entidad adherida para validar tu beneficio comercial.`)}
                  className="w-full text-center py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg text-[9px] font-bold text-slate-600 dark:text-slate-200 mt-2 transition-all cursor-pointer"
                >
                  Obtener Cupón
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Principal grid: Job bank on left (spans 2 cols), newsletters on right (spans 1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Job Bank list (Curriculums cargados) */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Briefcase size={16} className="text-cecip-blue" />
                  <span>Bolsa de Empleo (Currículums Cargados)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Busca perfiles calificados registrados en Paraná para tu comercio o industria.
                </p>
              </div>
              <button 
                onClick={() => setShowAddCvModal(true)}
                className="px-3 py-1.5 bg-cecip-blue/5 hover:bg-cecip-blue text-cecip-blue hover:text-white font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle size={12} />
                <span>Cargar nuevo CV</span>
              </button>
            </div>

            {/* Filters layout */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/55">
              {/* Search bar */}
              <div className="sm:col-span-7 relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, palabra clave o profesión..."
                  value={cvSearch}
                  onChange={(e) => setCvSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8.5 pr-4 py-2 text-xs focus:outline-none focus:border-cecip-blue transition-all dark:text-white"
                />
              </div>

              {/* Select area */}
              <div className="sm:col-span-5 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase whitespace-nowrap">Área:</span>
                <select 
                  value={cvAreaFilter}
                  onChange={(e) => setCvAreaFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-cecip-blue transition-all dark:text-white font-medium"
                >
                  {cvAreasList.map((area, i) => (
                    <option key={i} value={area}>{area === "Todos" ? "Todas las Áreas" : area}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCvs.length === 0 ? (
                <div className="col-span-2 text-center py-10 space-y-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-700/30">
                  <p className="text-xs font-bold text-slate-500">No se encontraron currículums</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Prueba cambiando la palabra clave o seleccionando otra área de búsqueda.</p>
                </div>
              ) : (
                filteredCvs.map((cv) => (
                  <div 
                    key={cv.id} 
                    className="p-4 border border-slate-100 dark:border-slate-700 hover:border-cecip-blue/30 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40 rounded-2xl hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded bg-cecip-blue/5 text-cecip-blue dark:text-blue-300 text-[9px] font-bold uppercase tracking-wider">
                          {cv.areaBusqueda}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">{cv.fechaSubida}</span>
                      </div>
                      
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm mt-2 leading-tight">
                        {cv.nombre}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{cv.tipoProfesional}</p>
                      
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                        "{cv.comentarios}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="text-[9.5px] text-slate-400 font-mono flex items-center gap-1">
                        <FileText size={10} /> {cv.fileName}
                      </span>
                      <button 
                        onClick={() => setViewingCv(cv)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-bold text-[9.5px] rounded-lg transition-colors cursor-pointer"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Últimos Comunicados */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Newspaper size={16} className="text-cecip-blue" />
                  <span>Últimos Comunicados</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Boletín informativo y novedades gremiales.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: "news-1",
                    titulo: "Subsidios de Tasa de Interés para Comercios",
                    copete: "El gobierno provincial lanzó una línea de créditos subsidiados para el fomento del consumo local. Descuento del 15% en tasa para socios de CeCIP Paraná...",
                    fecha: "01/07/2026",
                    categoria: "Fomento Gremial"
                  },
                  {
                    id: "news-2",
                    titulo: "Convocatoria a Asamblea General Ordinaria 2026",
                    copete: "Se convoca a los señores socios a la Asamblea General que se celebrará el 12 de Agosto de 2026 en el Salón Auditorio para el tratamiento de Memoria y Balance...",
                    fecha: "28/06/2026",
                    categoria: "Institucional"
                  },
                  {
                    id: "news-3",
                    titulo: "Actualización impositiva de tasas municipales",
                    copete: "Ponemos a disposición el nuevo informe elaborado por nuestro equipo tributario acerca del impacto del reordenamiento fiscal sobre el comercio minorista...",
                    fecha: "24/06/2026",
                    categoria: "Impuestos"
                  }
                ].map((news) => (
                  <div 
                    key={news.id} 
                    onClick={() => setActiveAnnouncement(news)}
                    className="p-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-cecip-blue/5 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700/50 rounded-xl cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-extrabold uppercase bg-indigo-50 dark:bg-slate-700 px-1.5 py-0.5 rounded text-indigo-600 dark:text-blue-300">
                        {news.categoria}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">{news.fecha}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                      {news.titulo}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {news.copete}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-700/60 flex justify-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">CeCIP Paraná · Oficina de Prensa</span>
            </div>
          </div>

        </div>

        {/* Bottom section: Events & Interactive News Calendar */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Upcoming events (Próximos eventos) */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" />
                <span>Próximos Eventos y Capacitaciones</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Cursos con tarifas bonificadas para personal de comercios socios.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "ev-1",
                  titulo: "Transformación Digital Pymes",
                  lugar: "Salón Auditorio CeCIP Paraná",
                  fecha: "15/07/2026",
                  hora: "19:30 h",
                  orador: "Lic. Horacio Cavazza"
                },
                {
                  id: "ev-2",
                  titulo: "Seminario de Liderazgo y Equipos de Ventas",
                  lugar: "Zoom Institucional (Virtual)",
                  fecha: "28/07/2026",
                  hora: "18:00 h",
                  orador: "Dra. Laura De Giusti"
                },
                {
                  id: "ev-3",
                  titulo: "Ronda de Negocios Sector Metalmecánico",
                  lugar: "Sede Centro CeCIP",
                  fecha: "05/08/2026",
                  hora: "09:00 h",
                  orador: "Comisión de Vinculación"
                }
              ].map((ev) => {
                const isEnrolled = enrolledEvents.includes(ev.id);
                return (
                  <div key={ev.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-500">{ev.fecha} · {ev.hora}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">• {ev.orador}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{ev.titulo}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">📍 {ev.lugar}</p>
                    </div>

                    <button 
                      onClick={() => {
                        if (isEnrolled) {
                          setEnrolledEvents(enrolledEvents.filter(id => id !== ev.id));
                          alert(`Cancelaste tu inscripción al curso: ${ev.titulo}`);
                        } else {
                          setEnrolledEvents([...enrolledEvents, ev.id]);
                          alert(`¡Inscripción Exitosa!\nTe has inscripto al evento "${ev.titulo}". Se ha enviado un correo de confirmación y el código QR de acceso al e-mail de tu empresa.`);
                        }
                      }}
                      className={`w-full py-1.5 rounded-lg font-bold text-[10px] uppercase transition-colors cursor-pointer ${
                        isEnrolled 
                          ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {isEnrolled ? "✓ Inscripto" : "Inscribirme"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* MODAL: Detalle de CV */}
        {viewingCv && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="h-2 w-full bg-cecip-blue" />
              
              <button 
                onClick={() => setViewingCv(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="p-6 sm:p-8 space-y-5">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-cecip-blue/5 text-cecip-blue dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                    {viewingCv.areaBusqueda}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-1">
                    {viewingCv.nombre}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {viewingCv.tipoProfesional} · Registrado el {viewingCv.fechaSubida}
                  </p>
                </div>

                <div className="space-y-2.5 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Información de Contacto</h4>
                  <div className="space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2"><Mail size={13} className="text-cecip-blue" /> {viewingCv.email}</div>
                    <div className="flex items-center gap-2"><Phone size={13} className="text-cecip-blue" /> {viewingCv.telefono}</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Presentación del Postulante</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {viewingCv.comentarios || "El candidato no ha ingresado comentarios de presentación."}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Archivo Adjunto</h4>
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                    <FileText size={20} className="text-cecip-blue shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{viewingCv.fileName}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Tamaño: {viewingCv.fileSize || "1.2 MB"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-semibold">Bolsa de Empleo CeCIP</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewingCv(null)}
                    className="px-4 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer font-bold"
                  >
                    Cerrar
                  </button>
                  <button 
                    onClick={() => {
                      alert(`Contacto coordinado. Se ha enviado una solicitud formal al equipo de atención de CeCIP indicando el interés de su empresa en contactar a ${viewingCv.nombre}.\nNos pondremos en contacto a la brevedad.`);
                    }}
                    className="px-4 py-1.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl font-bold text-xs shadow-md shadow-cecip-blue/10 transition-all cursor-pointer font-bold"
                  >
                    Coordinar Entrevista
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Cargar nuevo CV */}
        {showAddCvModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="h-2 w-full bg-cecip-blue" />
              
              <button 
                onClick={() => setShowAddCvModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <form onSubmit={handleAddCvSubmit}>
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Cargar Currículum a la Bolsa</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ingresa los datos para registrar un postulante en la bolsa gremial.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Nombre Completo *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="ej: Juan Pérez"
                        value={newCvName}
                        onChange={(e) => setNewCvName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cecip-blue focus:bg-white dark:text-white"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Email de Contacto *</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="ej: juanperez@gmail.com"
                        value={newCvEmail}
                        onChange={(e) => setNewCvEmail(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cecip-blue focus:bg-white dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Teléfono de Contacto *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="ej: 343 154889900"
                        value={newCvPhone}
                        onChange={(e) => setNewCvPhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cecip-blue focus:bg-white dark:text-white"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Área de Búsqueda</label>
                      <select 
                        value={newCvArea}
                        onChange={(e) => setNewCvArea(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cecip-blue focus:bg-white dark:text-white font-medium"
                      >
                        {cvAreasList.filter(a => a !== "Todos").map((area, i) => (
                          <option key={i} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Nivel / Tipo Profesional</label>
                      <select 
                        value={newCvType}
                        onChange={(e) => setNewCvType(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cecip-blue focus:bg-white dark:text-white font-medium"
                      >
                        <option value="Estudiante / Junior">Estudiante / Junior</option>
                        <option value="Técnico Especialista">Técnico Especialista</option>
                        <option value="Profesional Senior">Profesional Senior</option>
                        <option value="Oficios / Operario calificado">Oficios / Operario calificado</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Nombre del Archivo PDF/Doc *</label>
                      <input 
                        type="text" 
                        required 
                        value={newCvFileName}
                        onChange={(e) => setNewCvFileName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cecip-blue focus:bg-white dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Comentarios / Presentación Breve</label>
                    <textarea 
                      rows={3}
                      placeholder="Escribe comentarios acerca de tu experiencia u objetivos profesionales..."
                      value={newCvComments}
                      onChange={(e) => setNewCvComments(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cecip-blue focus:bg-white dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 px-6 py-4 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddCvModal(false)}
                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-cecip-blue hover:bg-cecip-blue/90 text-white font-bold text-xs rounded-xl shadow-md shadow-cecip-blue/10 transition-colors cursor-pointer font-bold"
                  >
                    Guardar Currículum
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Nuevo Ticket de Consulta */}
        {showNewTicketModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="h-2 w-full bg-cecip-blue" />
              
              <button 
                onClick={() => setShowNewTicketModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <form onSubmit={handleAddTicketSubmit}>
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Nueva Consulta / Ticket de Soporte</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Envía una consulta directa a la mesa de ayuda o comisión de CeCIP Paraná.</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Asunto / Título *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="ej: Duda con facturación de cuota societaria"
                      value={newTicketTitle}
                      onChange={(e) => setNewTicketTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cecip-blue focus:bg-white dark:text-white"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Categoría de Consulta</label>
                    <select 
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cecip-blue focus:bg-white dark:text-white font-medium"
                    >
                      <option value="Facturación">Facturación de Cuotas</option>
                      <option value="Asesoramiento">Asesoramiento Tributario / Legal</option>
                      <option value="Inscripción Evento">Inscripción a Cursos y Congresos</option>
                      <option value="Inconveniente Técnico">Problemas en la Plataforma</option>
                      <option value="Otros">Otras consultas generales</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Detalle del Mensaje *</label>
                    <textarea 
                      rows={4}
                      required
                      placeholder="Explica detalladamente tu consulta..."
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cecip-blue focus:bg-white dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 px-6 py-4 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowNewTicketModal(false)}
                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-cecip-blue hover:bg-cecip-blue/90 text-white font-bold text-xs rounded-xl shadow-md shadow-cecip-blue/10 transition-colors cursor-pointer font-bold"
                  >
                    Enviar Consulta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Detalle de Comunicado */}
        {activeAnnouncement && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="h-2 w-full bg-indigo-500" />
              
              <button 
                onClick={() => setActiveAnnouncement(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="p-6 sm:p-8 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-blue-300 px-1.5 py-0.5 rounded">
                      {activeAnnouncement.categoria}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-medium">Publicado el {activeAnnouncement.fecha}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight pt-1 leading-snug">
                    {activeAnnouncement.titulo}
                  </h3>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {activeAnnouncement.copete}
                  
                  <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Para más información o asesoramiento personalizado con nuestros especialistas de CeCIP, por favor comunícate de manera directa abriendo una consulta desde este portal o visitando las oficinas de la Sede Paraná.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-semibold">CeCIP Paraná Noticias</span>
                <button 
                  onClick={() => setActiveAnnouncement(null)}
                  className="px-4 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer font-bold"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Calculate stats for the general dashboard view directly from the 231 affiliates
  const activeSocios = socios.filter(s => s.estado === "Activo");
  const pendingSocios = socios.filter(s => s.estado === "Pendiente");
  const activeCount = activeSocios.length;
  
  // Billing stats directly tied to the affiliate billing base
  const julioBills = bills.filter(b => b.mes === "Julio" && Number(b.anio) === 2026);
  const totalBilledThisMonth = julioBills.reduce((sum, b) => sum + (b.monto || 0), 0);
  const collectedThisMonth = julioBills.filter(b => b.estado === "Pagado").reduce((sum, b) => sum + (b.monto || 0), 0);
  const pendingBillsCount = julioBills.filter(b => b.estado === "Pendiente" || b.estado === "Mora" || b.estado === "Vencido").length;
  
  const delinquentSociosCount = Array.from(new Set(
    bills.filter(b => b.estado === "Mora" || b.estado === "Vencido").map(b => b.socioId)
  )).length;

  // Aggregate distribution of the 231 affiliates by rubro
  const rubroStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    socios.forEach(s => {
      const r = s.rubro || "Otros";
      counts[r] = (counts[r] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([rubro, count]) => ({
        rubro,
        count,
        pct: Number(((count / (socios.length || 1)) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count);
  }, [socios]);

  // Aggregate distribution by category
  const categoriaStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    socios.forEach(s => {
      const c = s.categoria || "Pequeño Comercio";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({
      cat,
      count,
      pct: Number(((count / (socios.length || 1)) * 100).toFixed(1)),
    }));
  }, [socios]);

  // Dynamic monthly chart calculated from bills
  const monthlyChartData = React.useMemo(() => {
    const months = [
      { key: "Feb", name: "Febrero" },
      { key: "Mar", name: "Marzo" },
      { key: "Abr", name: "Abril" },
      { key: "May", name: "Mayo" },
      { key: "Jun", name: "Junio" },
      { key: "Jul", name: "Julio" },
    ];

    return months.map(m => {
      const mBills = bills.filter(b => b.mes === m.name && Number(b.anio) === 2026);
      if (mBills.length > 0) {
        const emitido = mBills.reduce((acc, b) => acc + (b.monto || 0), 0);
        const cobrado = mBills.filter(b => b.estado === "Pagado").reduce((acc, b) => acc + (b.monto || 0), 0);
        return { mes: m.key, emitido, cobrado };
      }
      // Historical monthly trend scaled to padrón
      const defaultEmitido = totalBilledThisMonth || 1054000;
      const rates: Record<string, number> = { Feb: 0.98, Mar: 0.97, Abr: 0.96, May: 0.95, Jun: 0.93, Jul: 0.68 };
      return {
        mes: m.key,
        emitido: defaultEmitido,
        cobrado: Math.round(defaultEmitido * (rates[m.key] || 0.9)),
      };
    });
  }, [bills, totalBilledThisMonth]);

  const maxChartVal = React.useMemo(() => {
    const highest = Math.max(...monthlyChartData.map(d => d.emitido), 100000);
    return highest * 1.15;
  }, [monthlyChartData]);

  // Tickets
  const openTickets = tickets.filter(t => t.estado === "Pendiente" || t.estado === "En proceso");

  // Aggregate recent activities from socio timelines
  const allActivities = socios.flatMap(s => 
    s.timeline.map(t => ({
      ...t,
      socioNombre: s.nombreComercial,
      socioId: s.id
    }))
  ).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);

  // Quick Action checks based on role
  const canEditSocio = ["Administrador General", "Gerencia", "Administración", "Atención al Socio"].includes(role);
  const canEditFinance = ["Administrador General", "Gerencia", "Tesorería", "Administración"].includes(role);
  const canEditEvents = ["Administrador General", "Gerencia", "Prensa", "Atención al Socio"].includes(role);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Resumen de Gestión
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bienvenido de nuevo. Estás navegando con el rol de <span className="font-semibold text-cecip-blue dark:text-cecip-light">{role}</span>.
          </p>
        </div>
        
        {/* Toggle metric range */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
          <button 
            onClick={() => setMetricFilter("mes")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${metricFilter === "mes" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"}`}
          >
            Este Mes (Julio)
          </button>
          <button 
            onClick={() => setMetricFilter("anio")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${metricFilter === "anio" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"}`}
          >
            Año Completo
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Socios */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Asociados Activos
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {activeCount}
              </span>
              <span className="text-xs text-green-500 font-semibold flex items-center bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded">
                <ArrowUpRight size={12} />
                +12%
              </span>
            </div>
            {pendingSocios.length > 0 && (
              <span className="text-xs text-amber-500 dark:text-amber-400 font-medium block">
                {pendingSocios.length} solicitudes pendientes
              </span>
            )}
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-cecip-blue dark:text-blue-400">
            <Users size={22} />
          </div>
        </div>

        {/* Card 2: Billing */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Cobranza Realizada
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ${metricFilter === "mes" ? collectedThisMonth.toLocaleString() : (collectedThisMonth * 11.2).toLocaleString()}
              </span>
              <span className="text-xs text-green-500 font-semibold flex items-center bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded">
                <ArrowUpRight size={12} />
                +8.4%
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              Emitido: ${totalBilledThisMonth.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Coins size={22} />
          </div>
        </div>

        {/* Card 3: Morosidad */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Morosidad Registrada
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {((delinquentSociosCount / socios.length) * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-amber-500 font-semibold flex items-center bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">
                <ArrowDownRight size={12} />
                -2.1%
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              {pendingBillsCount} cuotas vencidas
            </span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-600 dark:text-rose-400">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Card 4: Tickets */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Tickets Activos
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {openTickets.length}
              </span>
              <span className="text-xs text-blue-500 font-semibold flex items-center bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">
                {openTickets.filter(t => t.estado === "Pendiente").length} nuevos
              </span>
            </div>
            <span className="text-xs text-green-500 dark:text-green-400 font-medium block">
              Con sugerencia de IA activa
            </span>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-600 dark:text-purple-400">
            <HelpCircle size={22} />
          </div>
        </div>
      </div>

      {/* Calendario de Eventos Principal */}
      <ErpCalendarioInteractivo role={role} />

      {/* Graphs & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Evolución de Cobros y Morosidad
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparativa de facturación emitida vs cobrada en los últimos meses.
              </p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cecip-blue inline-block"></span>
                Emitido
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Cobrado
              </span>
            </div>
          </div>

          {/* Custom SVG Interactive Chart */}
          <div className="h-60 w-full relative flex items-end gap-6 pt-4 border-b border-slate-100 dark:border-slate-700/60 pb-2">
            {monthlyChartData.map((d, idx) => {
              const emitidoHeight = `${Math.min(100, Math.max(10, (d.emitido / maxChartVal) * 100))}%`;
              const cobradoHeight = `${Math.min(100, Math.max(8, (d.cobrado / maxChartVal) * 100))}%`;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 space-y-1">
                    <p className="font-bold">{d.mes} 2026</p>
                    <p>Facturado: ${d.emitido.toLocaleString()}</p>
                    <p>Cobrado: ${d.cobrado.toLocaleString()}</p>
                    <p className="text-emerald-400 font-semibold">{((d.cobrado / d.emitido) * 100).toFixed(1)}% cobrado</p>
                  </div>
                  
                  {/* Bars wrapper */}
                  <div className="flex-1 w-full flex items-end justify-center gap-1.5 h-full relative">
                    <div 
                      style={{ height: emitidoHeight }} 
                      className="w-4 bg-cecip-blue/20 dark:bg-cecip-blue/40 group-hover:bg-cecip-blue/35 transition-colors rounded-t"
                    />
                    <div 
                      style={{ height: cobradoHeight }} 
                      className="w-4 bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors rounded-t"
                    />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
                    {d.mes}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Accesos Rápidos ERP
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operaciones recurrentes según tus privilegios.
            </p>
          </div>

          <div className="space-y-3">
            {canEditSocio && (
              <button 
                onClick={onAddSocio}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-700 hover:bg-cecip-blue/5 dark:hover:bg-slate-700 rounded-xl text-left border border-slate-100 dark:border-transparent transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-cecip-blue dark:text-blue-300 rounded-lg">
                    <Users size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Registrar Nuevo Socio
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Ingresar datos al padrón general.
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {canEditSocio && (
              <button 
                onClick={onAddInteraction}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-700 hover:bg-cecip-blue/5 dark:hover:bg-slate-700 rounded-xl text-left border border-slate-100 dark:border-transparent transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-lg">
                    <Clock size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Cargar Contacto CRM
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Llamada, reunión o visita institucional.
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {canEditFinance && (
              <button 
                onClick={onAddBill}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-700 hover:bg-cecip-blue/5 dark:hover:bg-slate-700 rounded-xl text-left border border-slate-100 dark:border-transparent transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 rounded-lg">
                    <Coins size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Emitir Cuota / Factura
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Generación individual o masiva de cuota.
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {canEditEvents && (
              <button 
                onClick={onAddEvent}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-700 hover:bg-cecip-blue/5 dark:hover:bg-slate-700 rounded-xl text-left border border-slate-100 dark:border-transparent transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 rounded-lg">
                    <Calendar size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Crear Evento / Curso
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Taller presencial, virtual o asamblea.
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sectorial Breakdown & Affiliate Structure Panel */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-cecip-blue dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Estructura y Composición del Padrón ({socios.length} Afiliados)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribución de empresas y comercios por actividad económica y categoría institucional en Paraná.
            </p>
          </div>
          <button
            onClick={() => onNavigate("socios")}
            className="text-xs font-semibold text-cecip-blue dark:text-cecip-light hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            Explorar padrón completo <ArrowRight size={14} />
          </button>
        </div>

        {/* Categories summary chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoriaStats.map((c) => (
            <div
              key={c.cat}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/60 flex flex-col justify-between"
            >
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {c.cat}
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {c.count}
                </span>
                <span className="text-[11px] font-semibold text-cecip-blue dark:text-blue-300">
                  {c.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Rubros Progress Bars */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Principales Rubros de Actividad Comercial e Industrial
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {rubroStats.slice(0, 10).map((r) => (
              <div key={r.rubro} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[220px]">
                    {r.rubro}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {r.count} socios ({r.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cecip-blue dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(6, (r.count / (rubroStats[0]?.count || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Actividad Reciente del Sistema
            </h3>
            <button 
              onClick={() => onNavigate("socios")}
              className="text-xs font-semibold text-cecip-blue dark:text-cecip-light hover:underline cursor-pointer"
            >
              Ver socios
            </button>
          </div>

          <div className="space-y-4">
            {allActivities.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No hay actividades registradas recientemente.</p>
            ) : (
              allActivities.map((act) => (
                <div key={act.id} className="flex gap-4 items-start pb-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0">
                  <div className={`p-2 rounded-xl mt-0.5 text-xs ${
                    act.tipo === "crm" 
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" 
                      : act.tipo === "factura" 
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-50 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300"
                  }`}>
                    {act.tipo === "crm" ? "💬" : act.tipo === "factura" ? "💵" : "⚙️"}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {act.titulo}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {act.fecha}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {act.descripcion}
                    </p>
                    <span className="text-[10px] font-medium text-cecip-blue dark:text-blue-400">
                      Socio: {act.socioNombre}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Institucional Calendar Overview */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Próximos Compromisos
            </h3>
            <span className="p-1 px-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold">
              Agenda
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3.5 items-start">
              <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-950/50 p-2 py-1.5 rounded-xl min-w-[45px] text-center text-cecip-blue dark:text-blue-300">
                <span className="text-xs font-extrabold uppercase">Jul</span>
                <span className="text-sm font-extrabold -mt-1 block">08</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Reunión Extraordinaria CD
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  📍 Oficinas CeCIP / 20:00 h
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-950/50 p-2 py-1.5 rounded-xl min-w-[45px] text-center text-cecip-blue dark:text-blue-300">
                <span className="text-xs font-extrabold uppercase">Jul</span>
                <span className="text-sm font-extrabold -mt-1 block">15</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Transformación Digital Pymes
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  📍 Salón Auditorio CeCIP / 19:30 h
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-950/50 p-2 py-1.5 rounded-xl min-w-[45px] text-center text-cecip-blue dark:text-blue-300">
                <span className="text-xs font-extrabold uppercase">Jul</span>
                <span className="text-sm font-extrabold -mt-1 block">28</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Seminario Liderazgo de Ventas
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  📍 Zoom Institucional / 18:00 h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

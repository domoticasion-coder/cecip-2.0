import React, { useState, useEffect } from "react";
import { ErpSocio, ErpCrmInteraction, ErpBill } from "../../types";
import { 
  Plus, Search, Edit3, Trash2, CheckCircle, Clock, X, Phone, Mail, 
  MapPin, Globe, Instagram, Facebook, Linkedin, Filter, FileText, Calendar, User, Users, Eye,
  Send, Layers, History, Check, Square, MessageSquare, AlertCircle, Sparkles, RefreshCw,
  Receipt, DollarSign, CheckCircle2, AlertTriangle, Printer, Download, CreditCard, ShieldCheck
} from "lucide-react";

interface ErpSociosProps {
  socios: ErpSocio[];
  crm: ErpCrmInteraction[];
  bills?: ErpBill[];
  onSaveSocios: (updated: ErpSocio[]) => void;
  onSaveCrm: (updated: ErpCrmInteraction[]) => void;
  onSaveBills?: (updated: ErpBill[]) => void;
  role: string;
}

function getSocioFullBillsHistory(socio: ErpSocio, globalBills: ErpBill[] = []): ErpBill[] {
  const existing = globalBills.filter(
    b => b.socioId === socio.id || b.socioNombre?.toLowerCase() === socio.nombreComercial?.toLowerCase()
  );

  if (existing.length >= 8) {
    return existing.sort((a, b) => {
      const yearDiff = (b.anio || 2026) - (a.anio || 2026);
      if (yearDiff !== 0) return yearDiff;
      return (b.vencimiento || "").localeCompare(a.vencimiento || "");
    });
  }

  const result: ErpBill[] = [...existing];
  const startYear = parseInt(socio.fechaAlta ? socio.fechaAlta.split("-")[0] || socio.fechaAlta.split("/")[2] || "2023" : "2023", 10) || 2023;
  const currentYear = 2026;
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  for (let yr = startYear; yr <= currentYear; yr++) {
    const endMonthIdx = (yr === currentYear) ? 6 : 11;

    for (let m = 0; m <= endMonthIdx; m++) {
      const monthStr = monthNames[m];
      const monthNumStr = String(m + 1).padStart(2, "0");
      
      const alreadyHas = result.some(
        b => b.anio === yr && (b.mes?.toLowerCase() === monthStr.toLowerCase() || b.detalle?.toLowerCase().includes(monthStr.toLowerCase()))
      );

      if (!alreadyHas) {
        const isPast = (yr < 2026) || (yr === 2026 && m < 5);
        const isCurrentOrRecent = (yr === 2026 && m === 5);
        const isPaid = isPast || isCurrentOrRecent;
        const status = isPaid ? "Pagado" : "Pendiente";
        const feeAmount = socio.categoria === "Gran Industria" ? 28500 : socio.categoria === "Mediana Empresa" ? 18500 : 12500;

        result.push({
          id: `hist-bill-${socio.id}-${yr}-${m + 1}`,
          socioId: socio.id,
          socioNombre: socio.nombreComercial,
          mes: monthStr,
          anio: yr,
          detalle: `Cuota Social Institucional ${monthStr} ${yr}`,
          monto: feeAmount,
          vencimiento: `${yr}-${monthNumStr}-10`,
          estado: status,
          fechaPago: isPaid ? `${yr}-${monthNumStr}-05` : undefined,
          metodoPago: isPaid ? (m % 2 === 0 ? "Transferencia" : "Mercado Pago") : undefined,
          reciboId: isPaid ? `REC-${yr}${monthNumStr}-${socio.id.slice(0, 4)}` : undefined
        });
      }
    }
  }

  return result.sort((a, b) => {
    const yearDiff = (b.anio || 2026) - (a.anio || 2026);
    if (yearDiff !== 0) return yearDiff;
    const monthA = monthNames.findIndex(m => m.toLowerCase() === a.mes?.toLowerCase());
    const monthB = monthNames.findIndex(m => m.toLowerCase() === b.mes?.toLowerCase());
    return monthB - monthA;
  });
}

function calculateSeniorityYears(fechaAltaStr: string): string {
  if (!fechaAltaStr) return "Socio Registrado";
  const parts = fechaAltaStr.split("-");
  let year = parseInt(parts[0], 10);
  if (isNaN(year) || year > 2026) year = 2023;
  const years = 2026 - year;
  if (years <= 0) return "Socio Nuevo (< 1 año)";
  if (years === 1) return "1 año de antigüedad";
  return `${years} años de antigüedad`;
}

export default function ErpSocios({ socios, crm, bills = [], onSaveSocios, onSaveCrm, onSaveBills, role }: ErpSociosProps) {
  const [selectedSocio, setSelectedSocio] = useState<ErpSocio | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterRubro, setFilterRubro] = useState<string>("todos");
  
  // Tab/subview toggler inside general administration (Padrón or Bulk Messaging)
  const [subView, setSubView] = useState<"padron" | "masivo">("padron");
  
  // Bulk messaging campaign editor states
  const [campaignName, setCampaignName] = useState("");
  const [msgChannel, setMsgChannel] = useState<"email" | "whatsapp" | "portal">("email");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [filterRubroMasivo, setFilterRubroMasivo] = useState("todos");
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [attachedDocName, setAttachedDocName] = useState("");
  const [sendingProgress, setSendingProgress] = useState<{ active: boolean; current: number; total: number; logs: string[] }>({
    active: false,
    current: 0,
    total: 0,
    logs: []
  });

  // Load previous campaign history
  const [campaignHistory, setCampaignHistory] = useState<any[]>(() => {
    const cached = localStorage.getItem("cecip_campaigns");
    if (cached) return JSON.parse(cached);
    return [
      {
        id: "camp-1",
        nombre: "Circular Informativa #12 - Subsidios Tasa de Interés",
        canal: "email",
        asunto: "Nuevos Créditos con Tasa Subsidiada para Comercios de Paraná",
        fecha: "01/07/2026",
        destinatariosCount: 4,
        cuerpo: "Estimado {nombre_comercial},\n\nNos dirigimos a usted para informarle que CeCIP Paraná ha gestionado una línea especial de financiamiento bancario con bonificación de tasa...\n\nAtentamente,\nComisión Directiva CeCIP",
        adjunto: "circular_gremial_12.pdf"
      },
      {
        id: "camp-2",
        nombre: "Recordatorio General de Pago - Julio 2026",
        canal: "whatsapp",
        asunto: "Vencimiento de Cuota Social CeCIP",
        fecha: "29/06/2026",
        destinatariosCount: 3,
        cuerpo: "Hola {nombre_comercial}! Te recordamos que el próximo 10 de Julio vence la cuota social. Podés abonar de forma online en el portal. ¡Gracias por acompañarnos!",
        adjunto: ""
      }
    ];
  });

  // Auto-select recipients on segment filter changes
  useEffect(() => {
    const filtered = socios.filter(s => {
      if (s.estado !== "Activo") return false;
      const matchCat = filterCategory === "todos" || s.categoria === filterCategory;
      const matchRubro = filterRubroMasivo === "todos" || s.rubro === filterRubroMasivo;
      return matchCat && matchRubro;
    });
    setSelectedRecipientIds(filtered.map(s => s.id));
  }, [filterCategory, filterRubroMasivo, socios, subView]);

  // Bulk sender logic
  const handleSendMassMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecipientIds.length === 0) {
      alert("Por favor, seleccione al menos un socio destinatario.");
      return;
    }
    if (!msgBody) {
      alert("Por favor, ingrese el cuerpo del mensaje.");
      return;
    }
    if (msgChannel === "email" && !msgSubject) {
      alert("Por favor, ingrese el asunto del correo.");
      return;
    }

    const campaignTitle = campaignName || msgSubject || `Campaña masiva por ${msgChannel}`;
    
    // Start simulation
    setSendingProgress({
      active: true,
      current: 0,
      total: selectedRecipientIds.length,
      logs: [`Iniciando campaña masiva: "${campaignTitle}"`, `Canal de envío: ${msgChannel.toUpperCase()}`]
    });

    let currentStep = 0;
    const totalSteps = selectedRecipientIds.length;
    const recipientLogs: string[] = [];

    const interval = setInterval(() => {
      if (currentStep < totalSteps) {
        const recipientId = selectedRecipientIds[currentStep];
        const socioObj = socios.find(s => s.id === recipientId);
        if (socioObj) {
          const logMsg = `[ENVIADO] Canal: ${msgChannel.toUpperCase()} -> ${socioObj.nombreComercial} (${msgChannel === "email" ? socioObj.email : socioObj.whatsapp})`;
          recipientLogs.push(logMsg);
          setSendingProgress(prev => ({
            ...prev,
            current: currentStep + 1,
            logs: [...prev.logs, logMsg]
          }));
        }
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Save Campaign History
        const newCampaign = {
          id: `camp-${Date.now()}`,
          nombre: campaignTitle,
          canal: msgChannel,
          asunto: msgSubject,
          fecha: new Date().toLocaleDateString("es-AR"),
          destinatariosCount: totalSteps,
          cuerpo: msgBody,
          adjunto: attachedDocName || ""
        };

        const updatedCampaigns = [newCampaign, ...campaignHistory];
        setCampaignHistory(updatedCampaigns);
        localStorage.setItem("cecip_campaigns", JSON.stringify(updatedCampaigns));

        // Inject campaign notification record to each socio timeline chronologically
        const updatedSocios = socios.map(s => {
          if (selectedRecipientIds.includes(s.id)) {
            return {
              ...s,
              timeline: [
                ...s.timeline,
                {
                  id: `t-mass-${Date.now()}-${s.id}`,
                  titulo: `Mensaje Masivo (${msgChannel.toUpperCase()})`,
                  descripcion: `Campaña: "${campaignTitle}". Detalle: ${msgSubject || "Sin Asunto"}.`,
                  fecha: new Date().toLocaleDateString("es-AR"),
                  tipo: "sistema" as const
                }
              ]
            };
          }
          return s;
        });

        onSaveSocios(updatedSocios);

        alert(`¡Campaña finalizada con éxito!\nSe enviaron ${totalSteps} mensajes mediante ${msgChannel.toUpperCase()} y se registró en la cronología de cada socio.`);
        
        setSendingProgress({
          active: false,
          current: 0,
          total: 0,
          logs: []
        });

        // Reset inputs
        setCampaignName("");
        setMsgSubject("");
        setMsgBody("");
        setAttachedDocName("");
      }
    }, 300);
  };
  
  // CRM temporary state
  const [showCrmModal, setShowCrmModal] = useState(false);
  const [newCrm, setNewCrm] = useState({
    tipo: "Llamada" as const,
    detalle: "",
    responsable: "",
    remitente: "Staff CeCIP",
    recordatorio: "",
    estado: "Realizado" as const
  });

  // Socio Details Tab State (Histórico de Cuotas, Resumen, Cronología, Legajo)
  const [socioTab, setSocioTab] = useState<"historico" | "resumen" | "cronologia" | "legajo">("historico");
  const [billFilterState, setBillFilterState] = useState<string>("todas");
  const [billYearFilter, setBillYearFilter] = useState<string>("todos");
  const [billPage, setBillPage] = useState<number>(1);
  const [selectedBillReceipt, setSelectedBillReceipt] = useState<ErpBill | null>(null);
  const [paymentModalBill, setPaymentModalBill] = useState<ErpBill | null>(null);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<"Transferencia" | "Efectivo" | "Mercado Pago" | "Tarjeta de Crédito">("Transferencia");

  // Payment confirmation handler
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalBill || !selectedSocio) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const receiptNum = `REC-${Date.now().toString().slice(-6)}`;

    const updatedBill: ErpBill = {
      ...paymentModalBill,
      estado: "Pagado",
      fechaPago: todayStr,
      metodoPago: paymentMethodChoice,
      reciboId: receiptNum
    };

    if (bills && onSaveBills) {
      const existingIdx = bills.findIndex(b => b.id === paymentModalBill.id);
      let newBills: ErpBill[];
      if (existingIdx >= 0) {
        newBills = bills.map((b, i) => i === existingIdx ? updatedBill : b);
      } else {
        newBills = [updatedBill, ...bills];
      }
      onSaveBills(newBills);
    }

    const newTimelineEvent = {
      id: `t-pay-${Date.now()}`,
      titulo: "Pago de Cuota Social Registrado",
      descripcion: `Abonó $${paymentModalBill.monto.toLocaleString("es-AR")} por ${paymentModalBill.detalle} vía ${paymentMethodChoice}. Recibo #${receiptNum}`,
      fecha: todayStr,
      tipo: "factura" as const
    };

    const updatedSocioObj: ErpSocio = {
      ...selectedSocio,
      timeline: [...selectedSocio.timeline, newTimelineEvent]
    };

    const updatedSocios = socios.map(s => s.id === selectedSocio.id ? updatedSocioObj : s);
    onSaveSocios(updatedSocios);
    setSelectedSocio(updatedSocioObj);

    setPaymentModalBill(null);
    setSelectedBillReceipt(updatedBill);
  };

  // Socio Edit Form State
  const [formSocio, setFormSocio] = useState<Partial<ErpSocio>>({
    razonSocial: "",
    nombreComercial: "",
    cuit: "",
    rubro: "",
    categoria: "Pequeño Comercio",
    estado: "Activo",
    direccion: "",
    localidad: "Paraná",
    provincia: "Entre Ríos",
    email: "",
    whatsapp: "",
    web: "",
    observaciones: "",
    redesSociales: { instagram: "", facebook: "", linkedin: "" }
  });

  const canEdit = ["Administrador General", "Gerencia", "Administración", "Atención al Socio"].includes(role);

  // Filter lists
  const rubros = Array.from(new Set(socios.map(s => s.rubro)));

  const filteredSocios = socios.filter(s => {
    const matchesSearch = 
      s.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cuit.includes(searchTerm);
    const matchesEstado = filterEstado === "todos" || s.estado === filterEstado;
    const matchesRubro = filterRubro === "todos" || s.rubro === filterRubro;
    return matchesSearch && matchesEstado && matchesRubro;
  });

  const handleSelectSocio = (soc: ErpSocio) => {
    setSelectedSocio(soc);
    setFormSocio({ ...soc });
    setIsEditing(false);
    setIsAddingNew(false);
  };

  const handleStartEdit = () => {
    if (!canEdit) return;
    setIsEditing(true);
  };

  const handleStartAdd = () => {
    if (!canEdit) return;
    setIsAddingNew(true);
    setSelectedSocio(null);
    setFormSocio({
      razonSocial: "",
      nombreComercial: "",
      cuit: "",
      rubro: "",
      categoria: "Pequeño Comercio",
      estado: "Activo",
      direccion: "",
      localidad: "Paraná",
      provincia: "Entre Ríos",
      email: "",
      whatsapp: "",
      web: "",
      observaciones: "",
      redesSociales: { instagram: "", facebook: "", linkedin: "" }
    });
  };

  const handleSaveSocio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (isAddingNew) {
      const newSocioObj: ErpSocio = {
        id: `soc-${Date.now()}`,
        razonSocial: formSocio.razonSocial || "Nueva Razón Social",
        nombreComercial: formSocio.nombreComercial || "Nuevo Comercio",
        cuit: formSocio.cuit || "XX-XXXXXXXX-X",
        rubro: formSocio.rubro || "Comercio",
        categoria: formSocio.categoria as any || "Pequeño Comercio",
        estado: formSocio.estado as any || "Activo",
        direccion: formSocio.direccion || "",
        localidad: formSocio.localidad || "Paraná",
        provincia: formSocio.provincia || "Entre Ríos",
        email: formSocio.email || "",
        whatsapp: formSocio.whatsapp || "",
        web: formSocio.web || "",
        redesSociales: formSocio.redesSociales as any,
        observaciones: formSocio.observaciones || "",
        fechaAlta: new Date().toISOString().split("T")[0],
        historialDocumentos: [],
        timeline: [
          {
            id: `t-new-${Date.now()}`,
            titulo: "Socio Registrado",
            descripcion: "Alta formal en el padrón del CeCIP.",
            fecha: new Date().toISOString().split("T")[0],
            tipo: "sistema"
          }
        ]
      };

      const updated = [...socios, newSocioObj];
      onSaveSocios(updated);
      setSelectedSocio(newSocioObj);
      setIsAddingNew(false);
    } else if (selectedSocio) {
      const updated = socios.map(s => {
        if (s.id === selectedSocio.id) {
          return {
            ...s,
            ...formSocio,
            timeline: [
              ...s.timeline,
              {
                id: `t-edit-${Date.now()}`,
                titulo: "Ficha Actualizada",
                descripcion: "Modificación de datos de perfil.",
                fecha: new Date().toISOString().split("T")[0],
                tipo: "sistema"
              }
            ]
          } as ErpSocio;
        }
        return s;
      });

      onSaveSocios(updated);
      const updatedSocio = updated.find(s => s.id === selectedSocio.id) || selectedSocio;
      setSelectedSocio(updatedSocio);
      setIsEditing(false);
    }
  };

  const handleDeleteSocio = (id: string) => {
    if (!canEdit || !window.confirm("¿Está seguro de eliminar este socio?")) return;
    const updated = socios.filter(s => s.id !== id);
    onSaveSocios(updated);
    setSelectedSocio(null);
  };

  // CRM Logging
  const handleSaveCrm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSocio) return;

    const newCrmObj: ErpCrmInteraction = {
      id: `crm-${Date.now()}`,
      socioId: selectedSocio.id,
      socioNombre: selectedSocio.nombreComercial,
      fecha: new Date().toISOString().split("T")[0],
      ...newCrm
    };

    // Update CRM general logs
    const updatedCrm = [newCrmObj, ...crm];
    onSaveCrm(updatedCrm);

    // Update Socio timeline
    const updatedSocios = socios.map(s => {
      if (s.id === selectedSocio.id) {
        return {
          ...s,
          timeline: [
            ...s.timeline,
            {
              id: `t-crm-${Date.now()}`,
              titulo: `CRM: ${newCrmObj.tipo}`,
              descripcion: `${newCrmObj.detalle} (${newCrmObj.responsable})`,
              fecha: new Date().toISOString().split("T")[0],
              tipo: "crm" as const
            }
          ]
        };
      }
      return s;
    });

    onSaveSocios(updatedSocios);
    const updatedSocio = updatedSocios.find(s => s.id === selectedSocio.id) || selectedSocio;
    setSelectedSocio(updatedSocio);
    setShowCrmModal(false);
    
    // Reset CRM Form
    setNewCrm({
      tipo: "Llamada",
      detalle: "",
      responsable: "",
      remitente: "Staff CeCIP",
      recordatorio: "",
      estado: "Realizado"
    });
  };

  // Mock Document Upload
  const handleAddDocument = () => {
    if (!selectedSocio) return;
    const docName = window.prompt("Ingrese el nombre del documento a simular (ej: Constancia_Inscripcion.pdf):");
    if (!docName) return;

    const updatedSocios = socios.map(s => {
      if (s.id === selectedSocio.id) {
        return {
          ...s,
          historialDocumentos: [
            ...(s.historialDocumentos || []),
            { id: `doc-add-${Date.now()}`, nombre: docName, fecha: new Date().toISOString().split("T")[0], url: "#" }
          ],
          timeline: [
            ...s.timeline,
            {
              id: `t-doc-${Date.now()}`,
              titulo: "Documento Adjunto",
              descripcion: `Se adjuntó el documento: ${docName}`,
              fecha: new Date().toISOString().split("T")[0],
              tipo: "sistema" as const
            }
          ]
        };
      }
      return s;
    });

    onSaveSocios(updatedSocios);
    const updatedSocio = updatedSocios.find(s => s.id === selectedSocio.id) || selectedSocio;
    setSelectedSocio(updatedSocio);
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers size={16} className="text-cecip-blue" />
            <span>Gestión y Servicios al Socio CeCIP</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Legajos de socios y mensajería masiva para la comunicación oficial gremial.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto shrink-0 flex-wrap gap-1 sm:gap-0">
          <button
            type="button"
            onClick={() => setSubView("padron")}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${subView === "padron" ? "bg-white dark:bg-slate-800 text-cecip-blue shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
          >
            <Users size={14} />
            <span>Padrón de Socios</span>
          </button>
          {role === "Administrador General" && (
            <button
              type="button"
              onClick={() => setSubView("masivo")}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${subView === "masivo" ? "bg-white dark:bg-slate-800 text-cecip-blue shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
            >
              <Send size={14} />
              <span>Mensajería Masiva</span>
            </button>
          )}
        </div>
      </div>

      {subView === "padron" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* LEFT COLUMN: LIST AND FILTERS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Padrón de Socios</h3>
                {canEdit && (
                  <button 
                    onClick={handleStartAdd}
                    className="p-1.5 bg-cecip-blue text-white rounded-lg hover:bg-cecip-blue/90 cursor-pointer transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o CUIT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-cecip-blue dark:text-white"
                />
              </div>

              {/* Advanced Filters */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  <Filter size={12} />
                  <span>Filtros Rápidos</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Estado</label>
                    <select 
                      value={filterEstado}
                      onChange={(e) => setFilterEstado(e.target.value)}
                      className="w-full mt-1 p-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                    >
                      <option value="todos">Todos</option>
                      <option value="Activo">Activos</option>
                      <option value="Inactivo">Inactivos</option>
                      <option value="Pendiente">Pendientes</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Rubro</label>
                    <select 
                      value={filterRubro}
                      onChange={(e) => setFilterRubro(e.target.value)}
                      className="w-full mt-1 p-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                    >
                      <option value="todos">Todos</option>
                      {rubros.map((r, idx) => (
                        <option key={idx} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden max-h-[75vh] overflow-y-auto">
              {filteredSocios.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No se encontraron socios que coincidan.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredSocios.map((soc) => (
                    <button
                      key={soc.id}
                      onClick={() => handleSelectSocio(soc)}
                      className={`w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer ${selectedSocio?.id === soc.id ? "bg-cecip-blue/5 dark:bg-slate-700/60 border-l-4 border-cecip-blue" : ""}`}
                    >
                      <div className="space-y-1 pr-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                          {soc.nombreComercial}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">{soc.razonSocial}</p>
                        <span className="text-[9px] text-slate-500 font-mono">{soc.cuit}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                          soc.estado === "Activo" ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300" :
                          soc.estado === "Pendiente" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                          "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}>
                          {soc.estado}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {soc.categoria}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAIL OR ADD FORM */}
          <div className="lg:col-span-2 space-y-6">
            {isAddingNew || isEditing ? (
              /* FORM VIEW */
              <form onSubmit={handleSaveSocio} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/60">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">
                    {isAddingNew ? "Dar de Alta Nuevo Asociado" : `Modificar Ficha: ${selectedSocio?.nombreComercial}`}
                  </h3>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setIsAddingNew(false);
                      if (selectedSocio) setFormSocio({ ...selectedSocio });
                    }}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Nombre Comercial</label>
                    <input 
                      type="text"
                      required
                      value={formSocio.nombreComercial}
                      onChange={(e) => setFormSocio({ ...formSocio, nombreComercial: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Razón Social</label>
                    <input 
                      type="text"
                      required
                      value={formSocio.razonSocial}
                      onChange={(e) => setFormSocio({ ...formSocio, razonSocial: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">CUIT</label>
                    <input 
                      type="text"
                      required
                      placeholder="30-XXXXXXXX-X"
                      value={formSocio.cuit}
                      onChange={(e) => setFormSocio({ ...formSocio, cuit: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Rubro Comercial / Industrial</label>
                    <input 
                      type="text"
                      required
                      placeholder="ej: Alimentos, Metalúrgica"
                      value={formSocio.rubro}
                      onChange={(e) => setFormSocio({ ...formSocio, rubro: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Categoría de Socio</label>
                    <select 
                      value={formSocio.categoria}
                      onChange={(e) => setFormSocio({ ...formSocio, categoria: e.target.value as any })}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                    >
                      <option value="Pequeño Comercio">Pequeño Comercio</option>
                      <option value="Mediana Empresa">Mediana Empresa</option>
                      <option value="Gran Industria">Gran Industria</option>
                      <option value="Servicios">Servicios</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Estado</label>
                    <select 
                      value={formSocio.estado}
                      onChange={(e) => setFormSocio({ ...formSocio, estado: e.target.value as any })}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Teléfono de WhatsApp</label>
                    <input 
                      type="tel"
                      required
                      placeholder="343XXXXXXX"
                      value={formSocio.whatsapp}
                      onChange={(e) => setFormSocio({ ...formSocio, whatsapp: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Correo Electrónico</label>
                    <input 
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={formSocio.email}
                      onChange={(e) => setFormSocio({ ...formSocio, email: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Dirección Completa (Calle, Número, Planta)</label>
                    <input 
                      type="text"
                      required
                      value={formSocio.direccion}
                      onChange={(e) => setFormSocio({ ...formSocio, direccion: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Observaciones Internas</label>
                    <textarea 
                      rows={3}
                      value={formSocio.observaciones}
                      onChange={(e) => setFormSocio({ ...formSocio, observaciones: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setIsAddingNew(false);
                      if (selectedSocio) setFormSocio({ ...selectedSocio });
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    {isAddingNew ? "Registrar Socio" : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            ) : selectedSocio ? (
              /* DETAILS VIEW */
              <div className="space-y-6">
                {(() => {
                  const socioBills = getSocioFullBillsHistory(selectedSocio, bills);
                  const totalEmitido = socioBills.reduce((acc, b) => acc + (b.monto || 0), 0);
                  const totalAbonado = socioBills.filter(b => b.estado === "Pagado").reduce((acc, b) => acc + (b.monto || 0), 0);
                  const totalPendiente = socioBills.filter(b => b.estado !== "Pagado").reduce((acc, b) => acc + (b.monto || 0), 0);
                  const paidCount = socioBills.filter(b => b.estado === "Pagado").length;
                  const pendingCount = socioBills.filter(b => b.estado !== "Pagado").length;
                  const fulfillmentPct = socioBills.length > 0 ? Math.round((paidCount / socioBills.length) * 100) : 100;

                  const filteredBills = socioBills.filter(b => {
                    if (billFilterState === "Pagado" && b.estado !== "Pagado") return false;
                    if (billFilterState === "Pendiente" && b.estado === "Pagado") return false;
                    if (billYearFilter !== "todos" && String(b.anio) !== billYearFilter) return false;
                    return true;
                  });

                  const pageSize = 8;
                  const totalPages = Math.ceil(filteredBills.length / pageSize) || 1;
                  const currentPage = Math.min(billPage, totalPages);
                  const paginatedBills = filteredBills.slice((currentPage - 1) * pageSize, currentPage * pageSize);

                  return (
                    <>
                      {/* Header profile card */}
                      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-700/60">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-cecip-blue/10 text-cecip-blue dark:bg-slate-700 dark:text-blue-300 rounded-2xl flex items-center justify-center text-2xl font-bold font-sans">
                              {selectedSocio.nombreComercial.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                  {selectedSocio.nombreComercial}
                                </h3>
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                  selectedSocio.estado === "Activo" ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300" :
                                  selectedSocio.estado === "Pendiente" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                                  "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                }`}>
                                  {selectedSocio.estado}
                                </span>
                                {pendingCount > 0 ? (
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 flex items-center gap-1">
                                    <AlertTriangle size={10} />
                                    <span>{pendingCount} cuota(s) pendiente(s)</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center gap-1">
                                    <ShieldCheck size={10} />
                                    <span>Al Día con Tesorería</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {selectedSocio.razonSocial}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5">
                                <span>CUIT: {selectedSocio.cuit}</span>
                                <span>•</span>
                                <span className="text-cecip-blue dark:text-blue-400 font-sans font-bold flex items-center gap-1">
                                  <Calendar size={12} />
                                  <span>Desde: {selectedSocio.fechaAlta} ({calculateSeniorityYears(selectedSocio.fechaAlta)})</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Edit Actions */}
                          <div className="flex gap-2">
                            {canEdit && (
                              <button 
                                onClick={handleStartEdit}
                                className="p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                                title="Editar ficha"
                              >
                                <Edit3 size={16} />
                              </button>
                            )}
                            {canEdit && (
                              <button 
                                onClick={() => handleDeleteSocio(selectedSocio.id)}
                                className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:border-rose-900/50 rounded-xl transition-all cursor-pointer"
                                title="Dar de baja"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* TAB BAR FOR SOCIO DETAIL VIEW */}
                        <div className="flex border-b border-slate-100 dark:border-slate-700 gap-2 overflow-x-auto pb-1">
                          <button
                            type="button"
                            onClick={() => setSocioTab("historico")}
                            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                              socioTab === "historico" 
                                ? "bg-cecip-blue text-white shadow-sm" 
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                          >
                            <Receipt size={15} />
                            <span>Historial de Cuotas & Pagos</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                              socioTab === "historico" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}>
                              {socioBills.length}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSocioTab("resumen")}
                            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                              socioTab === "resumen" 
                                ? "bg-cecip-blue text-white shadow-sm" 
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                          >
                            <FileText size={15} />
                            <span>Datos Legajo & Contacto</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSocioTab("cronologia")}
                            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                              socioTab === "cronologia" 
                                ? "bg-cecip-blue text-white shadow-sm" 
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                          >
                            <History size={15} />
                            <span>Cronología & CRM</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSocioTab("legajo")}
                            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                              socioTab === "legajo" 
                                ? "bg-cecip-blue text-white shadow-sm" 
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                          >
                            <FileText size={15} />
                            <span>Documentos Adjuntos</span>
                          </button>
                        </div>

                        {/* TAB CONTENT 1: HISTORIAL DE CUOTAS Y ESTADO DE CUENTA */}
                        {socioTab === "historico" && (
                          <div className="space-y-6 animate-fade-in pt-2">
                            {/* Summary Metrics Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/80 space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Abonado</span>
                                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                                  ${totalAbonado.toLocaleString("es-AR")}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {paidCount} cuotas saldadas
                                </p>
                              </div>

                              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/80 space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Saldo Pendiente</span>
                                <p className={`text-base font-extrabold font-mono ${totalPendiente > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"}`}>
                                  ${totalPendiente.toLocaleString("es-AR")}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {pendingCount} cuotas por cobrar
                                </p>
                              </div>

                              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/80 space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cumplimiento de Pago</span>
                                <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                                  {fulfillmentPct}%
                                </p>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                                  <div 
                                    className={`h-full ${fulfillmentPct >= 90 ? "bg-emerald-500" : fulfillmentPct >= 70 ? "bg-amber-500" : "bg-rose-500"}`} 
                                    style={{ width: `${fulfillmentPct}%` }}
                                  />
                                </div>
                              </div>

                              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/80 space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Histórico de Registros</span>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {calculateSeniorityYears(selectedSocio.fechaAlta)}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  Registrado el {selectedSocio.fechaAlta}
                                </p>
                              </div>
                            </div>

                            {/* Filters and Header Bar */}
                            <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/80 space-y-3">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-cecip-blue/10 text-cecip-blue dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
                                    <Receipt size={18} />
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                                      Registro de Cuotas Sociales ({selectedSocio.nombreComercial})
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                      {socioBills.length} cuotas generadas en el historial
                                    </p>
                                  </div>
                                </div>

                                {/* Filter Controls */}
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  {/* Year Pills */}
                                  <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                                    {["todos", "2026", "2025", "2024"].map((yr) => (
                                      <button
                                        key={yr}
                                        type="button"
                                        onClick={() => { setBillYearFilter(yr); setBillPage(1); }}
                                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                          billYearFilter === yr
                                            ? "bg-cecip-blue text-white shadow-xs"
                                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        }`}
                                      >
                                        {yr === "todos" ? "Todos los años" : yr}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Status Select */}
                                  <select 
                                    value={billFilterState}
                                    onChange={(e) => { setBillFilterState(e.target.value); setBillPage(1); }}
                                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium dark:text-white cursor-pointer shadow-2xs"
                                  >
                                    <option value="todas">Todas las cuotas ({socioBills.length})</option>
                                    <option value="Pagado">Solo Abonadas ({paidCount})</option>
                                    <option value="Pendiente">Solo Pendientes ({pendingCount})</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Bills History Table Card */}
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                      <th className="py-3 px-4">Período / Cuota</th>
                                      <th className="py-3 px-4">Concepto</th>
                                      <th className="py-3 px-4">Monto</th>
                                      <th className="py-3 px-4">Vencimiento</th>
                                      <th className="py-3 px-4">Estado</th>
                                      <th className="py-3 px-4">Fecha & Método</th>
                                      <th className="py-3 px-4 text-right">Acción</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-sans">
                                    {paginatedBills.length === 0 ? (
                                      <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">
                                          <Receipt size={28} className="mx-auto mb-2 opacity-40" />
                                          <p className="font-semibold text-xs">No hay cuotas que coincidan con los filtros seleccionados.</p>
                                        </td>
                                      </tr>
                                    ) : (
                                      paginatedBills.map((b) => (
                                        <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                          <td className="py-3 px-4 font-extrabold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                            {b.mes} {b.anio}
                                          </td>
                                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                                            {b.detalle}
                                          </td>
                                          <td className="py-3 px-4 font-extrabold font-mono text-slate-900 dark:text-white whitespace-nowrap">
                                            ${b.monto.toLocaleString("es-AR")}
                                          </td>
                                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                            {b.vencimiento}
                                          </td>
                                          <td className="py-3 px-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                              b.estado === "Pagado" 
                                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                            }`}>
                                              {b.estado === "Pagado" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                                              <span>{b.estado}</span>
                                            </span>
                                          </td>
                                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                            {b.estado === "Pagado" ? (
                                              <div className="space-y-0.5">
                                                <p className="font-semibold text-slate-700 dark:text-slate-300">{b.fechaPago || "2026-06-05"}</p>
                                                <p className="text-[10px] text-slate-400">{b.metodoPago || "Transferencia Bancaria"}</p>
                                              </div>
                                            ) : (
                                              <span className="text-slate-400 italic text-[11px]">Pendiente de cobro</span>
                                            )}
                                          </td>
                                          <td className="py-3 px-4 text-right whitespace-nowrap">
                                            {b.estado === "Pagado" ? (
                                              <button
                                                type="button"
                                                onClick={() => setSelectedBillReceipt(b)}
                                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                              >
                                                <Receipt size={12} />
                                                <span>Ver Recibo</span>
                                              </button>
                                            ) : (
                                              canEdit && (
                                                <button
                                                  type="button"
                                                  onClick={() => setPaymentModalBill(b)}
                                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                                                >
                                                  <DollarSign size={12} />
                                                  <span>Registrar Pago</span>
                                                </button>
                                              )
                                            )}
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {/* Pagination Footer */}
                              {filteredBills.length > pageSize && (
                                <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                                  <span className="text-slate-500 font-medium text-[11px]">
                                    Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredBills.length)} de {filteredBills.length} cuotas
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={currentPage === 1}
                                      onClick={() => setBillPage(p => Math.max(1, p - 1))}
                                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-[11px]"
                                    >
                                      Anterior
                                    </button>
                                    <span className="px-2 font-mono font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                                      {currentPage} / {totalPages}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={currentPage === totalPages}
                                      onClick={() => setBillPage(p => Math.min(totalPages, p + 1))}
                                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-[11px]"
                                    >
                                      Siguiente
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* TAB CONTENT 2: RESUMEN Y FICHA GENERAL */}
                        {socioTab === "resumen" && (
                          <div className="space-y-6 animate-fade-in pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contacto Principal</span>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                  <Phone size={14} className="text-slate-400" />
                                  <span>{selectedSocio.whatsapp}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                  <Mail size={14} className="text-slate-400" />
                                  <span className="truncate">{selectedSocio.email}</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ubicación y Localidad</span>
                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                  <MapPin size={14} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{selectedSocio.direccion}</span>
                                </div>
                                <p className="text-slate-500 pl-5">{selectedSocio.localidad}, {selectedSocio.provincia}</p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Categoría / Alta</span>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedSocio.categoria}</p>
                                <p className="text-slate-500 font-medium">Desde: {selectedSocio.fechaAlta}</p>
                              </div>
                            </div>

                            {selectedSocio.observaciones && (
                              <div className="p-3.5 bg-slate-50 dark:bg-slate-700 border-l-4 border-slate-300 dark:border-slate-600 rounded-r-xl text-xs text-slate-600 dark:text-slate-300 italic">
                                &ldquo;{selectedSocio.observaciones}&rdquo;
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB CONTENT 3: CRONOLOGÍA Y CRM */}
                        {socioTab === "cronologia" && (
                          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Cronología del Socio</h4>
                              <button 
                                onClick={() => setShowCrmModal(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                <Plus size={12} />
                                <span>Registrar CRM</span>
                              </button>
                            </div>

                            <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-2.5 pl-6 space-y-6">
                              {selectedSocio.timeline.slice().reverse().map((evt) => (
                                <div key={evt.id} className="relative">
                                  <span className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] ${
                                    evt.tipo === "crm" ? "bg-indigo-500 text-white" :
                                    evt.tipo === "factura" ? "bg-emerald-500 text-white" :
                                    "bg-slate-400 text-white"
                                  }`}>
                                    {evt.tipo === "crm" ? "💬" : evt.tipo === "factura" ? "💵" : "⚙️"}
                                  </span>
                                  
                                  <div className="space-y-0.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {evt.titulo}
                                      </h5>
                                      <span className="text-[10px] text-slate-400 font-medium font-mono">{evt.fecha}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {evt.descripcion}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB CONTENT 4: LEGAJO DE DOCUMENTACIÓN */}
                        {socioTab === "legajo" && (
                          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Legajo de Documentación</h4>
                              {canEdit && (
                                <button 
                                  onClick={handleAddDocument}
                                  className="text-xs font-bold text-cecip-blue dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <Plus size={12} />
                                  <span>Cargar PDF</span>
                                </button>
                              )}
                            </div>

                            <div className="space-y-3">
                              {!selectedSocio.historialDocumentos || selectedSocio.historialDocumentos.length === 0 ? (
                                <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl text-center text-xs text-slate-400">
                                  Sin archivos adjuntos.
                                </div>
                              ) : (
                                selectedSocio.historialDocumentos.map((doc) => (
                                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-transparent rounded-xl group hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 rounded-lg shrink-0">
                                        <FileText size={14} />
                                      </span>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-2">
                                          {doc.nombre}
                                        </p>
                                        <p className="text-[10px] text-slate-400">Subido: {doc.fecha}</p>
                                      </div>
                                    </div>
                                    <a 
                                      href="#" 
                                      onClick={(e) => { e.preventDefault(); alert(`Simulando descarga de: ${doc.nombre}`); }}
                                      className="p-1.5 text-slate-400 hover:text-cecip-blue hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shrink-0"
                                    >
                                      <Eye size={14} />
                                    </a>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              /* EMPTY STATE */
              <div className="h-full min-h-[40vh] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-800">
                <div className="p-4 bg-slate-50 dark:bg-slate-700 text-slate-400 rounded-2xl mb-4">
                  <Users size={32} />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">Ficha de Información de Socio</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1.5">
                  Seleccione un comercio o empresa asociada del panel izquierdo para visualizar su perfil completo, cronología de actividades, documentos y cargar gestiones del CRM.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MASS MESSAGING VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-slate-800 dark:text-slate-100">
          
          {/* LEFT COLUMN: FILTERS & RECIPIENTS */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Segment filters */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                <Filter size={16} className="text-cecip-blue" />
                <span>Segmentación de Destinatarios</span>
              </h3>
              
              {/* Filter Category */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Filtrar por Categoría</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white font-medium"
                >
                  <option value="todos">Todas las Categorías</option>
                  <option value="Pequeño Comercio">Pequeño Comercio</option>
                  <option value="Mediana Empresa">Mediana Empresa</option>
                  <option value="Gran Industria">Gran Industria</option>
                  <option value="Servicios">Servicios</option>
                </select>
              </div>

              {/* Filter Rubro */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Filtrar por Rubro</label>
                <select
                  value={filterRubroMasivo}
                  onChange={(e) => setFilterRubroMasivo(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white font-medium"
                >
                  <option value="todos">Todos los Rubros</option>
                  {rubros.map((r, idx) => (
                    <option key={idx} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Destinatarios Seleccionados:</span>
                <span className="font-extrabold text-cecip-blue bg-cecip-blue/10 px-2 py-0.5 rounded-full">
                  {selectedRecipientIds.length} de {socios.filter(s => s.estado === "Activo").length} activos
                </span>
              </div>
            </div>

            {/* Checklist of individuals */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Lista de Socios Activos</span>
                <button
                  type="button"
                  onClick={() => {
                    const activeS = socios.filter(s => s.estado === "Activo");
                    if (selectedRecipientIds.length === activeS.length) {
                      setSelectedRecipientIds([]);
                    } else {
                      setSelectedRecipientIds(activeS.map(s => s.id));
                    }
                  }}
                  className="text-[10px] text-cecip-blue font-bold hover:underline cursor-pointer"
                >
                  {selectedRecipientIds.length === socios.filter(s => s.estado === "Activo").length ? "Desmarcar Todos" : "Marcar Todos"}
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-[30vh] lg:max-h-[40vh] overflow-y-auto pr-1">
                {socios.filter(s => s.estado === "Activo").map((soc) => {
                  const isChecked = selectedRecipientIds.includes(soc.id);
                  return (
                    <div
                      key={soc.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedRecipientIds(selectedRecipientIds.filter(id => id !== soc.id));
                        } else {
                          setSelectedRecipientIds([...selectedRecipientIds, soc.id]);
                        }
                      }}
                      className="py-2 flex items-center justify-between cursor-pointer group text-xs hover:bg-slate-50/50 dark:hover:bg-slate-700/20 px-1 rounded-lg"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`shrink-0 ${isChecked ? "text-cecip-blue" : "text-slate-300 dark:text-slate-600"}`}>
                          {isChecked ? <CheckCircle size={15} fill="currentColor" className="text-white dark:text-slate-800" /> : <Square size={15} />}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{soc.nombreComercial}</p>
                          <p className="text-[10px] text-slate-400 truncate font-mono">{soc.email || soc.whatsapp || "Sin contacto"}</p>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-400 rounded shrink-0">
                        {soc.categoria.substring(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: EDITOR & HISTORY */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Editor card */}
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                    <MessageSquare size={18} className="text-cecip-blue" />
                    <span>Redactar Comunicado Gremial Masivo</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Escribe el mensaje y define las variables de personalización.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold">Canal:</span>
                  <div className="flex gap-1">
                    {[
                      { id: "email", label: "Email" },
                      { id: "whatsapp", label: "WhatsApp" },
                      { id: "portal", label: "Portal" }
                    ].map(chan => (
                      <button
                        key={chan.id}
                        type="button"
                        onClick={() => setMsgChannel(chan.id as any)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${msgChannel === chan.id ? "bg-cecip-blue text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}
                      >
                        {chan.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message form */}
              <form onSubmit={handleSendMassMessage} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Internal campaign identification */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Identificador de Campaña (Interno)</label>
                    <input
                      type="text"
                      placeholder="ej: Boletín Informativo de Julio 2026"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white text-xs"
                    />
                  </div>

                  {/* Document Attachment */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Documento Adjunto (Opcional)</label>
                    <input
                      type="text"
                      placeholder="ej: circular_oficial_cecip_12.pdf"
                      value={attachedDocName}
                      onChange={(e) => setAttachedDocName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Subject for Email */}
                {msgChannel === "email" && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Asunto del Correo Electrónico *</label>
                    <input
                      type="text"
                      required
                      placeholder="ej: Convocatoria Gremial: Análisis de Tasas Comerciales en Paraná"
                      value={msgSubject}
                      onChange={(e) => setMsgSubject(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white text-xs"
                    />
                  </div>
                )}

                {/* Message Body */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cuerpo del Comunicado *</label>
                    <span className="text-[9.5px] text-amber-500 font-semibold flex items-center gap-1">
                      <Sparkles size={11} fill="currentColor" /> Variables habilitadas
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    required
                    placeholder={`ej: Estimado {nombre_comercial},\n\nNos dirigimos a usted ({nombre_socio}) para invitarle a la próxima reunión de mesa directiva...\n\nAtentamente,\nCeCIP Paraná.`}
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white text-xs font-sans leading-relaxed"
                  />
                  
                  {/* Variables Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {[
                      { code: "{nombre_comercial}", desc: "Nombre Fantasía" },
                      { code: "{nombre_socio}", desc: "Razón Social" },
                      { code: "{cuit}", desc: "CUIT Oficial" },
                      { code: "{categoria}", desc: "Cat. de Socio" }
                    ].map((v, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setMsgBody(prev => prev + " " + v.code)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-left text-[9px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <code className="text-cecip-blue dark:text-blue-300 font-extrabold font-mono block">{v.code}</code>
                        <span className="text-slate-400 block mt-0.5">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress simulator details */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <AlertCircle size={14} />
                    <span>Se enviará a {selectedRecipientIds.length} destinatarios vía {msgChannel.toUpperCase()}.</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={sendingProgress.active || selectedRecipientIds.length === 0}
                    className={`px-6 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                      selectedRecipientIds.length === 0 
                        ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-cecip-blue hover:bg-cecip-blue/90 text-white shadow-cecip-blue/10"
                    }`}
                  >
                    {sendingProgress.active ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Enviando... ({sendingProgress.current}/{sendingProgress.total})</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Iniciar Envío Masivo</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* Visual Terminal / Console logs when processing bulk messages */}
              {sendingProgress.active && (
                <div className="mt-4 p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[10px] space-y-3 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span>CONSOLA DE ENVÍO MASIVO CECIP-SENDER</span>
                    <span className="animate-pulse">● PROCESANDO</span>
                  </div>
                  
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                    />
                  </div>

                  <div className="max-h-[15vh] overflow-y-auto space-y-1">
                    {sendingProgress.logs.map((log, idx) => (
                      <p key={idx}>{log}</p>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Campañas Historial */}
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                  <History size={16} className="text-slate-400" />
                  <span>Historial de Campañas Gremiales</span>
                </h4>
                <p className="text-[11px] text-slate-500">Historial de notificaciones y circularización masiva de la Administración.</p>
              </div>

              <div className="space-y-3.5">
                {campaignHistory.map((camp) => (
                  <div 
                    key={camp.id} 
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-200 transition-all text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-blue-300 text-[8px] font-extrabold uppercase tracking-wider">
                          {camp.canal}
                        </span>
                        {camp.adjunto && (
                          <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-1.5 py-0.2 rounded">
                            📎 {camp.adjunto}
                          </span>
                        )}
                        <span className="text-[9px] text-slate-400 font-medium font-mono">{camp.fecha}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{camp.nombre}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono italic line-clamp-1 max-w-lg">
                        "{camp.cuerpo}"
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2.5">
                      <span className="text-[10px] font-bold text-slate-400">
                        {camp.destinatariosCount} socios
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCampaignName(camp.nombre);
                          setMsgChannel(camp.canal);
                          setMsgSubject(camp.asunto || "");
                          setMsgBody(camp.cuerpo);
                          setAttachedDocName(camp.adjunto || "");
                          alert("Plantilla de campaña cargada de forma exitosa en el editor.");
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-bold text-[9.5px] rounded-lg transition-colors cursor-pointer"
                      >
                        Reutilizar Plantilla
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* CRM INTERACTION MODAL */}
      {showCrmModal && selectedSocio && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-fade-in">
            <div className="bg-indigo-600 text-white px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm">Registrar Gestión CRM: {selectedSocio.nombreComercial}</h4>
              <button 
                onClick={() => setShowCrmModal(false)}
                className="text-white hover:text-white/80 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCrm} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Tipo de Interacción</label>
                <select 
                  value={newCrm.tipo}
                  onChange={(e) => setNewCrm({ ...newCrm, tipo: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white"
                >
                  <option value="Llamada">Llamada</option>
                  <option value="Correo">Correo</option>
                  <option value="Reunión">Reunión</option>
                  <option value="Reclamo">Reclamo</option>
                  <option value="Consulta">Consulta</option>
                  <option value="Visita">Visita</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Responsable de Gestión</label>
                <input 
                  type="text"
                  required
                  placeholder="ej: Mariela G. / Carlos R."
                  value={newCrm.responsable}
                  onChange={(e) => setNewCrm({ ...newCrm, responsable: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Descripción del Contacto</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Describa brevemente los puntos conversados, acuerdos o inconvenientes..."
                  value={newCrm.detalle}
                  onChange={(e) => setNewCrm({ ...newCrm, detalle: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Recordatorio / Tarea Pendiente (Opcional)</label>
                <input 
                  type="text"
                  placeholder="ej: Enviar mail el lunes con cotizaciones"
                  value={newCrm.recordatorio}
                  onChange={(e) => setNewCrm({ ...newCrm, recordatorio: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Estado</label>
                  <select 
                    value={newCrm.estado}
                    onChange={(e) => setNewCrm({ ...newCrm, estado: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white"
                  >
                    <option value="Realizado">Realizado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowCrmModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Registrar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION OF PAYMENT MODAL */}
      {paymentModalBill && selectedSocio && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-fade-in">
            <div className="bg-emerald-600 text-white px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <DollarSign size={18} />
                <span>Registrar Cobro de Cuota Social</span>
              </h4>
              <button 
                onClick={() => setPaymentModalBill(null)}
                className="text-white hover:text-white/80 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-700">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {selectedSocio.nombreComercial}
                </p>
                <p className="text-slate-500 font-mono text-[11px]">CUIT: {selectedSocio.cuit}</p>
                <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">{paymentModalBill.detalle}</span>
                  <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                    ${paymentModalBill.monto.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Medio / Forma de Pago</label>
                <select 
                  value={paymentMethodChoice}
                  onChange={(e) => setPaymentMethodChoice(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white font-medium"
                >
                  <option value="Transferencia">Transferencia Bancaria (CBU/CVU)</option>
                  <option value="Efectivo">Efectivo / Caja Tesorería</option>
                  <option value="Mercado Pago">Mercado Pago / Débito Inmediato</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito / Posnet</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                <span>Al confirmar, la cuota quedará marcada como "Pagada", se actualizará el saldo del socio y se generará el recibo digital oficial en la cronología.</span>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setPaymentModalBill(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Confirmar Cobro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL RECEIPT VOUCHER MODAL */}
      {selectedBillReceipt && (
        <div className="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-fade-in font-sans">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={20} />
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">CeCIP Paraná</h4>
                  <p className="text-[10px] text-slate-400">Comprobante Oficial de Pago de Cuota Social</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBillReceipt(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Razón Social / Socio</p>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedBillReceipt.socioNombre}</h3>
                  <p className="text-xs text-slate-500">
                    CUIT: {selectedSocio?.cuit || "30-58291048-2"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Nº Recibo</span>
                  <span className="text-sm font-extrabold font-mono text-cecip-blue">
                    {selectedBillReceipt.reciboId || `REC-2026-${selectedBillReceipt.id.slice(-6)}`}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Fecha: {selectedBillReceipt.fechaPago || "2026-07-21"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Concepto:</span>
                    <span className="font-bold text-slate-800">{selectedBillReceipt.detalle}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Período:</span>
                    <span className="font-bold text-slate-800">{selectedBillReceipt.mes} {selectedBillReceipt.anio}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Forma de Pago:</span>
                    <span className="font-bold text-slate-800">{selectedBillReceipt.metodoPago || "Transferencia Bancaria"}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-extrabold uppercase text-slate-700">Monto Abonado:</span>
                    <span className="text-lg font-extrabold font-mono text-emerald-600">
                      ${selectedBillReceipt.monto.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-100 rounded-xl text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Sello Digital de Tesorería · Centro Comercial e Industrial de Paraná</span>
                  <CheckCircle2 className="text-emerald-600" size={14} />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedBillReceipt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Imprimiendo recibo oficial ${selectedBillReceipt.reciboId}...`)}
                  className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Imprimir Comprobante</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

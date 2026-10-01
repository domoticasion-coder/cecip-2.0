import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { 
  Bot, Sparkles, Send, RefreshCw, Copy, Check, FileText, Users, 
  Receipt, Briefcase, HelpCircle, ShieldAlert, TrendingUp, Lightbulb,
  CheckCircle2, AlertTriangle, ArrowRight, CornerDownLeft, Database,
  Cpu, MessageSquare, Zap, AlertCircle, Globe, Building2, Landmark,
  Award, Newspaper, Phone
} from "lucide-react";

interface ErpCopilotProps {
  erpData: any;
  role: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  date: string;
  tag?: string;
  isError?: boolean;
}

export default function ErpCopilot({ erpData, role }: ErpCopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: `¡Bienvenido al **CeCIP Copilot · ERP & Portal Web Oficial**! 🚀\n\nCuento con acceso integral y en tiempo real a todo el ecosistema de la institución:\n\n- 🏛️ **Portal Web Oficial:** Comisión Directiva (Presidente Mauricio Benitende, Vicepresidente Victor Bejar), Sede Central en Calle 25 de Mayo 28 (09:00 a 17:00 hs, Tel: 0343 4312785, WhatsApp: 343 4575070), más de 125 años de trayectoria (1898), Cámaras de Comercio, Industria, Servicios y Jóvenes, convenios CAME/CAC/FEDER, beneficios a socios e informes de prensa.\n- 📊 **Sistema ERP Operativo:** Padrón de 231 socios categorizados, facturación mensual, cobranzas, morosidad por socio, tesorería bancaria, bolsa interna de empleo, CRM y mesa de ayuda.\n\n*Puede consultarme en lenguaje natural sobre cualquier aspecto de la institución o de la base operativa.*`,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      tag: "CeCIP Copilot · ERP & Web IA",
    },
  ]);

  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"todas" | "web" | "morosidad" | "empleo" | "socios" | "redaccion">("todas");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Live metrics calculation from real erpData & localStorage
  const totalSocios = erpData?.socios?.length || 0;
  const sociosActivos = erpData?.socios?.filter((s: any) => s.estado === "Activo").length || 0;
  const totalBills = erpData?.bills?.length || 0;
  const billsPendientes = erpData?.bills?.filter((b: any) => b.estado === "Pendiente" || b.estado === "Mora" || b.estado === "Vencido").length || 0;
  const montoDeuda = erpData?.bills
    ?.filter((b: any) => b.estado === "Pendiente" || b.estado === "Mora" || b.estado === "Vencido")
    ?.reduce((sum: number, b: any) => sum + (b.monto || 0), 0) || 0;
  
  // Real CVs count from localStorage
  const cvsList = (() => {
    try {
      return JSON.parse(localStorage.getItem("cecip_cvs") || "[]");
    } catch {
      return [];
    }
  })();
  const totalCvs = cvsList.length;

  const ticketsPendientes = erpData?.tickets?.filter((t: any) => t.estado === "Pendiente" || t.estado === "En proceso").length || 0;

  // Build real-time ERP context snapshot for the AI
  const getFullErpContext = () => {
    return {
      socios: erpData?.socios || [],
      bills: erpData?.bills || [],
      crm: erpData?.crm || [],
      tesoreria: erpData?.tesoreria || [],
      events: erpData?.events || [],
      enrollments: erpData?.enrollments || [],
      convenios: erpData?.convenios || [],
      docs: erpData?.docs || [],
      tickets: erpData?.tickets || [],
      cvs: cvsList,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text || isThinking) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: "user",
      text: text,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput("");
    setIsThinking(true);

    try {
      // Gather latest ERP context
      const fullContext = getFullErpContext();

      // Send to server API endpoint connected to real Gemini AI
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          erpContext: fullContext,
          userRole: role,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || `Error HTTP ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.reply || "No se recibió respuesta del modelo.";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botReply,
          date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tag: data.model ? `CeCIP IA · ${data.model}` : "CeCIP IA · Conectado",
        },
      ]);
    } catch (err: any) {
      console.error("Error al consultar CeCIP Copilot:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: `⚠️ **No se pudo completar la consulta con la IA:** ${err.message || "Error de conexión con el servidor."}\n\nPor favor verifique que la variable de entorno \`GEMINI_API_KEY\` esté configurada en el panel de secretos y vuelva a intentar.`,
          date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tag: "Error de IA",
          isError: true,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickActions = [
    {
      cat: "web",
      title: "Comisión Directiva y Autoridades",
      desc: "Presidente, vicepresidente y miembros directivos con sus empresas",
      prompt: "¿Quiénes integran la Comisión Directiva del CeCIP, quién es el presidente actual y a qué empresas pertenecen sus autoridades?",
      icon: Landmark,
      iconColor: "text-amber-600 bg-amber-100 dark:bg-amber-950/50",
    },
    {
      cat: "web",
      title: "Sede, Horarios y Contacto",
      desc: "Dirección de Sede Central, teléfonos, WhatsApp y horario de atención",
      prompt: "¿Dónde queda la sede central del CeCIP, cuáles son los canales de contacto (teléfono, WhatsApp) y los horarios de atención al público?",
      icon: Phone,
      iconColor: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50",
    },
    {
      cat: "web",
      title: "Beneficios y Servicios al Socio",
      desc: "Informes Veraz/Nosis, salón de actos, asesorías y descuentos",
      prompt: "Detalla todos los beneficios exclusivos que ofrece el CeCIP a los comercios e industrias asociadas según su portal web oficial.",
      icon: Award,
      iconColor: "text-purple-600 bg-purple-100 dark:bg-purple-950/50",
    },
    {
      cat: "web",
      title: "Cámaras Sectoriales y Red Gremial",
      desc: "Cámaras de Comercio, Industria, Servicios, Jóvenes y vínculo con CAME/CAC",
      prompt: "¿Cuáles son las Cámaras Sectoriales que funcionan dentro del CeCIP y a qué entidades provinciales y nacionales está adherida la institución?",
      icon: Building2,
      iconColor: "text-sky-600 bg-sky-100 dark:bg-sky-950/50",
    },
    {
      cat: "web",
      title: "Noticias e IPC de Paraná",
      desc: "Informes económicos, reclamos por tasas y comunicados de prensa",
      prompt: "¿Cuáles son las noticias y comunicados institucionales más recientes publicados en la web del CeCIP, incluyendo el último Índice de Precios al Consumidor?",
      icon: Newspaper,
      iconColor: "text-rose-600 bg-rose-100 dark:bg-rose-950/50",
    },
    {
      cat: "morosidad",
      title: "Auditar Morosidad y Cuotas",
      desc: "Diagnóstico de cuotas pendientes con detalle por socio y montos",
      prompt: "Realiza una auditoría completa del estado de cobranzas y morosidad de cuotas del CeCIP. Detalla los socios con facturas pendientes o en mora, los montos y brinda recomendaciones de cobro.",
      icon: ShieldAlert,
      iconColor: "text-amber-600 bg-amber-100 dark:bg-amber-950/50",
    },
    {
      cat: "empleo",
      title: "Informe de Bolsa de Empleo",
      desc: "Análisis de postulantes, profesiones y perfiles disponibles",
      prompt: "Dame un informe exhaustivo de los postulantes cargados en la Bolsa de Empleo del CeCIP. Qué perfiles tenemos (administrativos, técnicos, vendedores, etc.), sus competencias y cómo contactarlos para una empresa asociada.",
      icon: Briefcase,
      iconColor: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50",
    },
    {
      cat: "socios",
      title: "Diagnóstico de Padrón",
      desc: "Distribución por rubros, categorías e historial de empresas",
      prompt: "Analiza el padrón de socios del CeCIP. Indica cuántos socios tenemos por rubro, por categoría (Pequeño Comercio, Mediana Empresa, Gran Industria), cuántos están activos y si hay observaciones relevantes en sus legajos.",
      icon: Users,
      iconColor: "text-purple-600 bg-purple-100 dark:bg-purple-950/50",
    },
    {
      cat: "redaccion",
      title: "Redactor de Comunicados",
      desc: "Borrador de notas institucionales y circulares a socios",
      prompt: "Redacta un comunicado oficial de la Comisión Directiva del CeCIP Paraná dirigido a todos los comercios e industrias asociadas, destacando los beneficios de capacitaciones gratuitas, el uso de la Bolsa de Empleo y convenios vigentes.",
      icon: FileText,
      iconColor: "text-blue-600 bg-blue-100 dark:bg-blue-950/50",
    },
    {
      cat: "morosidad",
      title: "Intimación Cordial de Pago",
      desc: "Nota formal de regularización de cuotas para socios en mora",
      prompt: "Redacta una nota cordial pero formal de la Tesorería del CeCIP para socios que tienen cuotas vencidas (ej: El Sol Dulce), ofreciendo opciones de pago por transferencia o plan de regularización sin recargos.",
      icon: Receipt,
      iconColor: "text-rose-600 bg-rose-100 dark:bg-rose-950/50",
    },
    {
      cat: "socios",
      title: "Resumen Ejecutivo de Gestión",
      desc: "Informe consolidado para reunión de Comisión Directiva",
      prompt: "Elabora un resumen ejecutivo global para la próxima reunión de Comisión Directiva del CeCIP: estado de socios, cobranzas, tickets de ayuda pendientes, próximos eventos y postulaciones laborales recibidas.",
      icon: TrendingUp,
      iconColor: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50",
    },
  ];

  const filteredQuickActions = activeCategory === "todas" 
    ? quickActions 
    : quickActions.filter(a => a.cat === activeCategory);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Banner Branding */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-300 text-[11px] font-bold">
            <Sparkles size={13} className="text-amber-400 animate-spin-slow" />
            <span>Asistente Inteligente CeCIP Copilot</span>
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 border border-emerald-400/30">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              IA Real Activa
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>CeCIP Copilot IA</span>
            <span className="text-xs bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 font-mono font-normal px-2.5 py-1 rounded-lg">
              ERP & Portal Web
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Inteligencia artificial conectada con los módulos del ERP y el Portal Web Institucional. Respuestas fundamentadas en autoridades directivas, estatuto, sede central, padrón de 231 socios, deudas, CVs y tesorería.
          </p>
        </div>

        {/* Live System Context Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full md:w-auto shrink-0 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">Web</span>
            <span className="text-base font-extrabold text-emerald-300">1898</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">Socios</span>
            <span className="text-base font-extrabold text-white">{totalSocios}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">Mora</span>
            <span className="text-base font-extrabold text-amber-300">${(montoDeuda / 1000).toFixed(0)}k</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">Empleo</span>
            <span className="text-base font-extrabold text-sky-300">{totalCvs} CVs</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">Directiva</span>
            <span className="text-base font-extrabold text-indigo-200">10 M</span>
          </div>
        </div>

      </div>

      {/* Main Copilot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Quick Prompts & Commands */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb size={15} className="text-amber-500" />
                <span>Acciones Rápidas Copilot</span>
              </h3>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                {filteredQuickActions.length} disponibles
              </span>
            </div>

            {/* Filter category pills */}
            <div className="flex flex-wrap gap-1 pb-1">
              {[
                { id: "todas", label: "Todas" },
                { id: "web", label: "Web CeCIP" },
                { id: "morosidad", label: "Cobranzas" },
                { id: "empleo", label: "Empleo" },
                { id: "socios", label: "Socios" },
                { id: "redaccion", label: "Redacción" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Prompt Buttons */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredQuickActions.map((action, idx) => {
                const IconComponent = action.icon;
                return (
                  <button 
                    key={idx}
                    disabled={isThinking}
                    onClick={() => handleSendMessage(action.prompt)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/40 text-left transition-all group cursor-pointer flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${action.iconColor}`}>
                        <IconComponent size={15} />
                      </div>
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">
                          {action.title}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {action.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-indigo-100 dark:border-slate-700 text-xs space-y-2">
            <p className="font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Database size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>Sincronización Total del ERP</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Cualquier cambio que realice en los socios, facturas registradas, nuevos CVs cargados o tickets de ayuda se refleja inmediatamente en el contexto del CeCIP Copilot.
            </p>
          </div>
        </div>

        {/* Right Section: Chat Interface */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[620px] overflow-hidden">
            
            {/* Header chat title */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>CeCIP Copilot Console</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      En línea
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Modo Activo: Asistente Ejecutivo ERP (Operador: {role})
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setMessages([
                  {
                    id: "msg-reset",
                    sender: "bot",
                    text: "Historial de conversación reiniciado. Estoy listo para responder cualquier consulta sobre el ERP del CeCIP.",
                    date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    tag: "Reinicio",
                  }
                ])}
                className="px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-all text-xs flex items-center gap-1.5 cursor-pointer font-bold border border-slate-200 dark:border-slate-700"
                title="Limpiar conversación"
              >
                <RefreshCw size={13} />
                <span className="hidden sm:inline">Reiniciar Chat</span>
              </button>
            </div>

            {/* Chat message body */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  
                  {msg.sender === "bot" && (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                      msg.isError 
                        ? "bg-rose-100 dark:bg-rose-950 text-rose-600" 
                        : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                    }`}>
                      {msg.isError ? <AlertCircle size={16} /> : <Bot size={16} />}
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl text-xs max-w-2xl relative group ${
                    msg.sender === "user" 
                      ? "bg-cecip-blue text-white font-medium rounded-tr-xs shadow-md shadow-blue-600/10" 
                      : msg.isError
                        ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 leading-relaxed font-medium rounded-tl-xs"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 leading-relaxed font-medium rounded-tl-xs shadow-xs"
                  }`}>
                    
                    {/* Copy Button for Bot Messages */}
                    {msg.sender === "bot" && !msg.isError && (
                      <button 
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-2xs"
                        title="Copiar respuesta"
                      >
                        {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    )}

                    {/* Content Rendering */}
                    <div className="prose prose-xs dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-li:my-0.5">
                      <Markdown>{msg.text}</Markdown>
                    </div>

                    <div className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[9px] ${
                      msg.sender === "user" 
                        ? "border-white/20 text-white/80" 
                        : "border-slate-100 dark:border-slate-800 text-slate-400"
                    }`}>
                      <span className="font-semibold">{msg.tag || (msg.sender === "user" ? "Operador CeCIP" : "CeCIP Copilot")}</span>
                      <span className="font-mono">{msg.date}</span>
                    </div>

                  </div>

                </div>
              ))}

              {isThinking && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 animate-bounce shadow-xs">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-2xl rounded-tl-xs text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-2.5 shadow-xs">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping" />
                    <span>CeCIP Copilot IA procesando datos del ERP...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input form */}
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2">
              {/* Quick suggestion chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">Sugerencias:</span>
                {[
                  "¿Quién es el presidente?",
                  "¿Dónde queda la sede y horarios?",
                  "¿Quiénes deben cuotas?",
                  "Beneficios para socios",
                  "Resumen de postulantes",
                  "Socios por rubro",
                ].map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={isThinking}
                    onClick={() => handleSendMessage(chip)}
                    className="px-2.5 py-0.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 rounded-full whitespace-nowrap cursor-pointer transition-all disabled:opacity-50 text-[10px] font-medium"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                className="flex gap-2"
              >
                <input 
                  type="text"
                  placeholder="Consulte a CeCIP Copilot (ej: '¿Quién es el presidente?', '¿Cuánto debe El Sol Dulce?', 'Sede y horarios')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isThinking}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || isThinking}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 shrink-0"
                >
                  <span>Enviar</span>
                  <Send size={13} />
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

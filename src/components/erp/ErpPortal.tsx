import React, { useState, useEffect, useMemo } from "react";
import { 
  getErpData, saveErpData, 
  seedInitialErpData 
} from "./MockData";
import { 
  sociosService, 
  facturacionService, 
  tesoreriaService, 
  crmService, 
  eventosService, 
  conveniosService, 
  documentosService, 
  ticketsService,
  authService,
  noticiasService,
  bolsaService
} from "../../services";
import ErpDashboard from "./ErpDashboard";
import ErpSocios from "./ErpSocios";
import ErpFacturacion from "./ErpFacturacion";
import ErpDirectorio from "./ErpDirectorio";
import ErpEventos from "./ErpEventos";
import ErpDocumentos from "./ErpDocumentos";
import ErpComercia from "./ErpComercia";
import ErpCopilot from "./ErpCopilot";
import ErpBolsaEmpleo from "./ErpBolsaEmpleo";
import ErpAfiliadoView from "./ErpAfiliadoView";
import { ErpSocio, CVSubmission, WebNewsItem } from "../../types";
import { ALL_CECIP_SOCIOS } from "../../data/sociosData";
import { ErpIntelligenceDashboard } from "./intelligence/ErpIntelligenceDashboard";
import { ErpSaludSocios } from "./intelligence/ErpSaludSocios";
import { ErpAlertasOperativas } from "./intelligence/ErpAlertasOperativas";
import { ErpAccionesOperativas } from "./intelligence/ErpAccionesOperativas";
import { ErpAutomatizaciones } from "./intelligence/ErpAutomatizaciones";
import { ErpOportunidades } from "./intelligence/ErpOportunidades";
import { ErpAuditoriaBitacora } from "./intelligence/ErpAuditoriaBitacora";
import { 
  Building2, Users, Receipt, Newspaper, FolderOpen, ShieldCheck, 
  LogOut, Sun, Moon, LayoutDashboard, Calendar, Search, HelpCircle, 
  Menu, X, Sparkles, Key, FileText, Settings, Database, Briefcase, Bot,
  RefreshCw, Check, Activity, AlertTriangle, Zap, Lightbulb
} from "lucide-react";

interface ErpPortalProps {
  onClose?: () => void;
}

export default function ErpPortal({ onClose }: ErpPortalProps) {
  // Authentication & Session States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMode, setLoginMode] = useState<"afiliado" | "admin">("afiliado");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    ALL_CECIP_SOCIOS[0]?.id || "b0000000-0000-0000-0000-000000000001"
  );
  const [socioPasscode, setSocioPasscode] = useState("socio123");
  const [companySearch, setCompanySearch] = useState("");
  const [currentSocio, setCurrentSocio] = useState<ErpSocio | null>(null);

  // Admin Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [userRole, setUserRole] = useState("Administrador General");
  const [userNombre, setUserNombre] = useState("Ing. Carlos Rossi");
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<"online" | "syncing" | "offline">("online");

  // Web & Portal Cross-Data
  const [cvs, setCvs] = useState<CVSubmission[]>([]);
  const [newsList, setNewsList] = useState<WebNewsItem[]>([]);

  // Visual Theme Mode
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active module tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "inteligencia" | "salud" | "alertas" | "acciones" | "automatizaciones" | "oportunidades" | "auditoria" |
    "socios" | "facturas" | "directorio" | "eventos" | "docs" | "comercia" | "copilot" | "empleo"
  >("inteligencia");

  // ERP State Data (synchronised through localstorage cache & database service)
  const [erpData, setErpData] = useState(() => {
    const data = getErpData();
    if (!data.socios || data.socios.length === 0) {
      seedInitialErpData();
      return getErpData();
    }
    return data;
  });

  // Load CVs and News on Mount
  useEffect(() => {
    bolsaService.getAllCVs().then(setCvs).catch(() => {});
    noticiasService.getAll().then((items) => {
      if (items && items.length > 0) setNewsList(items);
    }).catch(() => {});
    try {
      const stored = localStorage.getItem("cecip_web_news") || localStorage.getItem("cecip_news");
      if (stored) {
        setNewsList(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Fetch live records from backend API / PostgreSQL
  const refreshFromDatabase = async () => {
    setIsLoadingDb(true);
    setDbStatus("syncing");
    try {
      const [
        sociosRes,
        billsRes,
        tesoreriaRes,
        crmRes,
        eventsRes,
        enrollmentsRes,
        conveniosRes,
        docsRes,
        ticketsRes,
      ] = await Promise.allSettled([
        sociosService.getAll(),
        facturacionService.getAll(),
        tesoreriaService.getAll(),
        crmService.getAll(),
        eventosService.getAll(),
        eventosService.getEnrollments(),
        conveniosService.getAll(),
        documentosService.getAll(),
        ticketsService.getAll(),
      ]);

      const newData = { ...erpData };

      if (sociosRes.status === "fulfilled" && sociosRes.value.length > 0) {
        newData.socios = sociosRes.value;
      }
      if (billsRes.status === "fulfilled" && billsRes.value.length > 0) {
        newData.bills = billsRes.value;
      }
      if (tesoreriaRes.status === "fulfilled" && tesoreriaRes.value.length > 0) {
        newData.tesoreria = tesoreriaRes.value;
      }
      if (crmRes.status === "fulfilled" && crmRes.value.length > 0) {
        newData.crm = crmRes.value;
      }
      if (eventsRes.status === "fulfilled" && eventsRes.value.length > 0) {
        newData.events = eventsRes.value;
      }
      if (enrollmentsRes.status === "fulfilled" && enrollmentsRes.value.length > 0) {
        newData.enrollments = enrollmentsRes.value;
      }
      if (conveniosRes.status === "fulfilled" && conveniosRes.value.length > 0) {
        newData.convenios = conveniosRes.value;
      }
      if (docsRes.status === "fulfilled" && docsRes.value.length > 0) {
        newData.docs = docsRes.value;
      }
      if (ticketsRes.status === "fulfilled" && ticketsRes.value.length > 0) {
        newData.tickets = ticketsRes.value;
      }

      setErpData(newData);
      saveErpData(newData);
      setDbStatus("online");
    } catch (err) {
      console.warn("Backend database fetch error, using local cached store:", err);
      setDbStatus("online");
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    refreshFromDatabase();
  }, []);

  // Keep state, localStorage and backend synced
  const handleSaveSocios = (updated: any[]) => {
    const newData = { ...erpData, socios: updated };
    setErpData(newData);
    saveErpData(newData);
  };

  const handleSaveBills = (updated: any[]) => {
    const newData = { ...erpData, bills: updated };
    setErpData(newData);
    saveErpData(newData);
  };

  const handleSaveTesoreria = (updated: any[]) => {
    const newData = { ...erpData, tesoreria: updated };
    setErpData(newData);
    saveErpData(newData);
  };

  const handleSaveEvents = (updated: any[]) => {
    const newData = { ...erpData, events: updated };
    setErpData(newData);
    saveErpData(newData);
  };

  const handleSaveEnrollments = (updated: any[]) => {
    const newData = { ...erpData, enrollments: updated };
    setErpData(newData);
    saveErpData(newData);
  };

  const handleSaveConvenios = (updated: any[]) => {
    const newData = { ...erpData, convenios: updated };
    setErpData(newData);
    saveErpData(newData);
  };

  const handleSaveDocs = (updated: any[]) => {
    const newData = { ...erpData, docs: updated };
    setErpData(newData);
    saveErpData(newData);
  };

  const handleSaveCrm = (updated: any[]) => {
    const newData = { ...erpData, crm: updated };
    setErpData(newData);
    saveErpData(newData);
  };

  const handleSaveTickets = (updated: any[]) => {
    const newData = { ...erpData, tickets: updated };
    setErpData(newData);
    saveErpData(newData);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Try backend authentication
    try {
      const authRes = await authService.login(email, password);
      if (authRes && authRes.user) {
        setUserRole(authRes.user.rol || "Administrador General");
        setUserNombre(`${authRes.user.nombre} ${authRes.user.apellido || ""}`.trim());
        setIsLoggedIn(true);
        refreshFromDatabase();
        return;
      }
    } catch (err: any) {
      console.warn("Backend auth fallback to local credentials:", err);
    }

    // Sample Credentials fallback
    if (email === "admin@cecip.org" && password === "cecip2026") {
      setUserRole("Administrador General");
      setUserNombre("Ing. Carlos Rossi");
      setIsLoggedIn(true);
      refreshFromDatabase();
    } else if (email === "tesorero@cecip.org" && password === "caja123") {
      setUserRole("Tesorería");
      setUserNombre("Lic. Esteban Peralta");
      setIsLoggedIn(true);
      refreshFromDatabase();
    } else if (email === "atencion@cecip.org" && password === "soporte123") {
      setUserRole("Atención al Socio");
      setUserNombre("Dra. Clara Viggiano");
      setIsLoggedIn(true);
      refreshFromDatabase();
    } else {
      setErrorMsg("Credenciales inválidas. Utilice las sugeridas en la guía inferior.");
    }
  };

  // Affiliate login handler
  const handleAffiliateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const socio = erpData.socios.find((s) => s.id === selectedCompanyId) || erpData.socios[0];
    if (!socio) {
      setErrorMsg("Por favor, selecciona una empresa socia.");
      return;
    }
    if (socioPasscode.trim() !== "socio123") {
      setErrorMsg("La clave de demostración para afiliados es 'socio123'.");
      return;
    }
    setCurrentSocio(socio);
    setUserRole("Afiliado");
    setUserNombre(socio.nombreComercial || socio.razonSocial);
    setIsLoggedIn(true);
    refreshFromDatabase();
  };

  // Instant login helper for affiliate demo
  const triggerAffiliateQuickLogin = (socioId: string) => {
    const socio = erpData.socios.find((s) => s.id === socioId) || erpData.socios[0];
    if (socio) {
      setSelectedCompanyId(socio.id);
      setCurrentSocio(socio);
      setUserRole("Afiliado");
      setUserNombre(socio.nombreComercial || socio.razonSocial);
      setIsLoggedIn(true);
      refreshFromDatabase();
    }
  };

  // Instant login helper for demo
  const triggerQuickLogin = (profile: "admin" | "treasury" | "support") => {
    if (profile === "admin") {
      setEmail("admin@cecip.org");
      setPassword("cecip2026");
    } else if (profile === "treasury") {
      setEmail("tesorero@cecip.org");
      setPassword("caja123");
    } else {
      setEmail("atencion@cecip.org");
      setPassword("soporte123");
    }
  };

  // Filtered socios for login search
  const filteredSociosForLogin = useMemo(() => {
    if (!companySearch.trim()) return erpData.socios;
    const q = companySearch.toLowerCase();
    return erpData.socios.filter(
      (s) =>
        (s.nombreComercial && s.nombreComercial.toLowerCase().includes(q)) ||
        (s.razonSocial && s.razonSocial.toLowerCase().includes(q)) ||
        (s.cuit && s.cuit.includes(q)) ||
        (s.rubro && s.rubro.toLowerCase().includes(q))
    );
  }, [erpData.socios, companySearch]);

  const currentSelectedSocioObj = useMemo(() => {
    return erpData.socios.find((s) => s.id === selectedCompanyId) || erpData.socios[0];
  }, [erpData.socios, selectedCompanyId]);

  // Render correct module depending on Role-Based Access Controls (RBAC)
  const isTabAllowed = (tab: string) => {
    if (userRole === "Administrador General") return true;
    if (userRole === "Tesorería") {
      return ["dashboard", "facturas", "docs", "comercia", "copilot", "empleo"].includes(tab);
    }
    if (userRole === "Atención al Socio") {
      return ["dashboard", "socios", "directorio", "eventos", "docs", "comercia", "copilot", "empleo"].includes(tab);
    }
    return true;
  };

  // RENDER AFILIADO ERP VIEW (Separated dedicated experience with all requested features)
  if (isLoggedIn && userRole === "Afiliado" && currentSocio) {
    return (
      <div className={`w-full h-screen h-full transition-colors duration-300 font-sans flex flex-col overflow-hidden ${darkMode ? "dark bg-slate-900 text-white" : "bg-slate-50 text-slate-800"}`}>
        {/* Affiliate Top Navigation Bar */}
        <header className="bg-[#071738] border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight select-none">
                <span className="text-[#00a3e0]">Ce</span>
                <span className="text-white">CI</span>
                <span className="text-[#00a3e0]">P</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider bg-blue-500/20 text-sky-300 border border-blue-400/30">
                Portal de Afiliados
              </span>
            </div>

            <span className="hidden md:inline text-slate-600">|</span>
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-slate-400">Empresa:</span>
              <select
                value={currentSocio.id}
                onChange={(e) => {
                  const s = erpData.socios.find((x) => x.id === e.target.value);
                  if (s) {
                    setCurrentSocio(s);
                    setSelectedCompanyId(s.id);
                    setUserNombre(s.nombreComercial || s.razonSocial);
                  }
                }}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-[#00a3e0] max-w-[240px] truncate cursor-pointer"
                title="Cambiar empresa socia para verificar cuotas o eventos de otro afiliado"
              >
                {erpData.socios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombreComercial || s.razonSocial}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 font-mono">({currentSocio.categoria})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Switch to Admin View to verify correlation */}
            <button
              onClick={() => {
                setUserRole("Administrador General");
                setUserNombre("Ing. Carlos Rossi");
              }}
              className="px-2.5 py-1 text-[11px] font-bold text-sky-200 hover:text-white bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Cambiar a la Consola Administrativa para verificar correlación de datos (pagos, eventos, etc.)"
            >
              <ShieldCheck size={13} />
              <span>Consola Admin (Correlación)</span>
            </button>

            {/* Dark Mode toggle */}
            <button 
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Alternar Modo Claro / Oscuro"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                setIsLoggedIn(false);
                setCurrentSocio(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer border border-rose-500/30"
              title="Cerrar Sesión del Portal de Socio"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Volver a la Web Principal"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </header>

        {/* Affiliate Content View */}
        <ErpAfiliadoView
          currentSocio={currentSocio}
          darkMode={darkMode}
          erpData={erpData}
          onUpdateBills={handleSaveBills}
          onUpdateEvents={handleSaveEvents}
          onUpdateEnrollments={handleSaveEnrollments}
          onUpdateTickets={handleSaveTickets}
          cvs={cvs}
          newsList={newsList}
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-screen h-full transition-colors duration-300 font-sans flex flex-col overflow-hidden ${darkMode ? "dark bg-slate-900 text-white" : "bg-slate-50 text-slate-800"}`}>
       {!isLoggedIn ? (
        /* LOGIN SaaS FORM CARD */
        <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 overflow-y-auto relative">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700/60 shadow-lg"
            >
              <X size={16} />
              <span>Volver al Portal Web</span>
            </button>
          )}

          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700/60 flex flex-col space-y-6 relative my-auto">
            
            {/* Absolute positioned theme toggler for convenience */}
            <button 
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-300 transition-all cursor-pointer"
              title="Alternar Modo Claro / Oscuro"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Header branding */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#00a3e0] dark:text-sky-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                <Building2 size={13} />
                <span>Centro Comercial e Industrial de Paraná · Sistema ERP</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Ingreso al Sistema Integral CeCIP
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Selecciona tu perfil de acceso para ingresar al portal correspondiente según tu rol en la institución.
              </p>
            </div>

            {/* DUAL ROLE SELECTOR TABS */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-2xl">
              <button
                type="button"
                onClick={() => { setLoginMode("afiliado"); setErrorMsg(""); }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  loginMode === "afiliado"
                    ? "bg-white dark:bg-slate-800 text-[#00a3e0] shadow-sm ring-1 ring-blue-500/20"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Building2 size={16} />
                <span>Portal de Afiliados (Socios)</span>
              </button>
              <button
                type="button"
                onClick={() => { setLoginMode("admin"); setErrorMsg(""); }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  loginMode === "admin"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-500/20"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <ShieldCheck size={16} />
                <span>ERP Administrativo (CeCIP)</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs rounded-xl font-medium text-center">
                {errorMsg}
              </div>
            )}

            {/* CASE A: AFILIADO LOGIN FORM */}
            {loginMode === "afiliado" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side: Benefits of being an affiliate */}
                <div className="lg:col-span-5 bg-gradient-to-br from-blue-50 to-sky-50/50 dark:from-slate-900/80 dark:to-slate-800/80 p-5 rounded-2xl border border-blue-100 dark:border-slate-700 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00a3e0] dark:text-sky-300 uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Módulos Exclusivos para Socios</span>
                  </div>
                  
                  <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-start gap-2">
                      <span className="text-[#00a3e0] font-bold">1.</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">ComercIA:</strong> Adopción de IA para comercios y beneficios del programa digital (Pestaña inicial).
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#00a3e0] font-bold">2.</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Facturación y Cuotas:</strong> Consulta de estado de cuenta, cuotas al día y descarga de recibos oficiales.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#00a3e0] font-bold">3.</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Bolsa de Empleo:</strong> Acceso a candidatos y CVs postulados en la web del CeCIP.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#00a3e0] font-bold">4.</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Eventos CeCIP:</strong> Inscripción 100% bonificada a cursos, seminarios y conferencias.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#00a3e0] font-bold">5.</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Noticias Oficiales:</strong> Prensa institucional, acuerdos y boletines gremiales.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#00a3e0] font-bold">6.</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">IEC Service:</strong> Pedidos de servicios, asistencia legal, contable y municipal.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#00a3e0] font-bold">7.</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Beneficios Estatutarios:</strong> Informes Veraz, asesoramiento y uso de instalaciones de la Sede.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Affiliate Form */}
                <form onSubmit={handleAffiliateLogin} className="lg:col-span-7 space-y-4 text-xs">
                  
                  {/* Search filter for socios */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                      1. Buscar Empresa Socia (por Nombre o CUIT)
                    </label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Escriba el nombre o CUIT para filtrar..."
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:border-cecip-blue text-xs transition-all ${
                          darkMode 
                            ? "bg-slate-900 text-white border-slate-700 focus:bg-slate-800" 
                            : "bg-slate-50 text-slate-900 border-slate-200 focus:bg-white"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Company select dropdown */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                        2. Seleccionar Comercio / Empresa Afiliada *
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {filteredSociosForLogin.length} de {erpData.socios.length} socios
                      </span>
                    </div>
                    <select 
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-cecip-blue text-xs transition-all ${
                        darkMode 
                          ? "bg-slate-900 text-white border-slate-700 focus:bg-slate-800" 
                          : "bg-slate-50 text-slate-900 border-slate-200 focus:bg-white"
                      }`}
                    >
                      {filteredSociosForLogin.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombreComercial || s.razonSocial} (CUIT: {s.cuit} · {s.categoria})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Company Preview Pill */}
                  {currentSelectedSocioObj && (
                    <div className="p-3 bg-blue-50/50 dark:bg-slate-900/50 rounded-xl border border-blue-100 dark:border-slate-700/80 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {currentSelectedSocioObj.nombreComercial || currentSelectedSocioObj.razonSocial}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                          CUIT: {currentSelectedSocioObj.cuit} · {currentSelectedSocioObj.rubro} · {currentSelectedSocioObj.direccion}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {currentSelectedSocioObj.categoria}
                      </span>
                    </div>
                  )}

                  {/* Passcode input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                        3. Clave de Acceso de Socio *
                      </label>
                      <span className="text-[10px] text-slate-400">Clave demo: <strong className="text-[#00a3e0]">socio123</strong></span>
                    </div>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={socioPasscode}
                      onChange={(e) => setSocioPasscode(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-cecip-blue text-xs sm:text-sm transition-all ${
                        darkMode 
                          ? "bg-slate-900 text-white border-slate-700 focus:bg-slate-800" 
                          : "bg-slate-50 text-slate-900 border-slate-200 focus:bg-white"
                      }`}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#00a3e0] hover:bg-[#0c2356] text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/15 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Building2 size={14} />
                    <span>Ingresar a Mi Portal de Afiliado</span>
                  </button>

                  {/* Quick Shortcuts for Affiliate Demo with accurate IDs */}
                  <div className="border-t border-slate-100 dark:border-slate-700/60 pt-3 space-y-2">
                    <p className="text-[10px] text-slate-400 text-center uppercase font-bold">
                      Empresas Socias Destacadas (Acceso Rápido 1-Clic)
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => triggerAffiliateQuickLogin("b0000000-0000-0000-0000-000000000001")}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-left truncate"
                        title="Zapatilandia Paraná - Pequeño Comercio"
                      >
                        👞 Zapatilandia
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAffiliateQuickLogin("b0000000-0000-0000-0000-000000000002")}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-left truncate"
                        title="MetER Estructuras - Gran Industria"
                      >
                        🏗️ MetER Estructuras
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAffiliateQuickLogin("b0000000-0000-0000-0000-000000000003")}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-left truncate"
                        title="El Sol Dulce - Mediana Empresa"
                      >
                        🥖 El Sol Dulce
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAffiliateQuickLogin("socio-cecip-1960")}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-left truncate"
                        title="25 de Junio S.A. - Estación de Servicio"
                      >
                        ⛽ 25 de Junio S.A.
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAffiliateQuickLogin("socio-cecip-2611")}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-left truncate"
                        title="Pinturería Zurdo - Comercio"
                      >
                        🎨 Pinturería Zurdo
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAffiliateQuickLogin("socio-cecip-2075")}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-left truncate"
                        title="Aberturas Valentinuz - Industria Metalúrgica"
                      >
                        🪟 Valentinuz S.A.
                      </button>
                    </div>
                  </div>
                </form>

              </div>
            ) : (
              /* CASE B: ADMINISTRATIVO LOGIN FORM */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side: Admin duties summary */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-100 to-blue-50/30 dark:from-slate-900/80 dark:to-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    <ShieldCheck size={14} className="text-[#00a3e0]" />
                    <span>Consola de Gestión CeCIP</span>
                  </div>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Panel integral reservado para Directivos, Tesorería, Personal Operativo y Atención al Socio.
                  </p>

                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a3e0]" />
                      <span><strong>Tesorería:</strong> Cobranzas y confirmación de pago de cuotas.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a3e0]" />
                      <span><strong>Eventos:</strong> Creación de cursos, talleres y control de inscriptos.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a3e0]" />
                      <span><strong>Bolsa de Empleo:</strong> Administración y seguimiento de CVs.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a3e0]" />
                      <span><strong>IEC Service:</strong> Bandeja de tickets y asistencia profesional.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a3e0]" />
                      <span><strong>Inteligencia Operativa:</strong> Score de salud y alertas tempranas.</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Admin form */}
                <form onSubmit={handleLogin} className="lg:col-span-7 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Correo Electrónico Administrativo *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="ej: admin@cecip.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-cecip-blue text-xs sm:text-sm transition-all ${
                        darkMode 
                          ? "bg-slate-900 text-white border-slate-700 focus:bg-slate-800" 
                          : "bg-slate-50 text-slate-900 border-slate-200 focus:bg-white"
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Contraseña *</label>
                      <a href="#recovery" onClick={(e) => { e.preventDefault(); alert("Por seguridad, póngase en contacto directo con el Administrador de Sistemas de la Sede CeCIP Paraná."); }} className="text-[10px] text-cecip-blue font-bold hover:underline">¿Olvidó su contraseña?</a>
                    </div>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-cecip-blue text-xs sm:text-sm transition-all ${
                        darkMode 
                          ? "bg-slate-900 text-white border-slate-700 focus:bg-slate-800" 
                          : "bg-slate-50 text-slate-900 border-slate-200 focus:bg-white"
                      }`}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-cecip-blue hover:bg-cecip-blue/90 text-white font-bold rounded-xl transition-all shadow-md shadow-cecip-blue/10 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Key size={13} />
                    <span>Ingresar a Consola Administrativa</span>
                  </button>

                  {/* Quick selectors for evaluation */}
                  <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4 space-y-2.5">
                    <p className="text-[10px] text-slate-400 text-center uppercase font-bold">Perfiles Administrativos (Acceso Rápido 1-Clic)</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-[9px] font-bold">
                      <button 
                        type="button"
                        onClick={() => triggerQuickLogin("admin")}
                        className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-center"
                      >
                        👑 Admin General
                      </button>
                      <button 
                        type="button"
                        onClick={() => triggerQuickLogin("treasury")}
                        className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-center"
                      >
                        💵 Tesorero
                      </button>
                      <button 
                        type="button"
                        onClick={() => triggerQuickLogin("support")}
                        className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-center"
                      >
                        🤝 Atención Socio
                      </button>
                    </div>
                  </div>
                </form>

              </div>
            )}

          </div>
        </div>
      ) : (
        /* CORE ACTIVE ERP LAYOUT */
        <div className="flex-1 flex flex-col md:flex-row min-h-0 h-full overflow-hidden">
          
          {/* SIDEBAR NAVIGATION PANEL */}
          <aside className={`bg-slate-900 text-slate-300 py-6 border-r border-slate-800 transition-all flex flex-col justify-between shrink-0 h-full overflow-y-auto ${sidebarOpen ? "w-64 px-4" : "w-16 px-2 items-center"}`}>
            
            {/* Upper sidebar body */}
            <div className="space-y-6 w-full">
              {/* Sidebar branding */}
              <div className={`flex items-center gap-2.5 ${sidebarOpen ? "px-2" : "justify-center"}`}>
                <div className="w-9 h-9 bg-cecip-blue text-white rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-extrabold text-xs">Ce</span>
                </div>
                {sidebarOpen && (
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-white text-xs tracking-wide uppercase leading-tight">CeCIP Paraná</h4>
                    <span className="text-[9px] text-slate-400 font-bold block leading-none mt-0.5">Área Administrativa</span>
                  </div>
                )}
              </div>

              {/* Menu items list */}
              <nav className="space-y-1 w-full text-xs">
                {/* Sección Inteligencia Operativa V2 */}
                <div className="pb-1">
                  {sidebarOpen && (
                    <span className="px-2.5 text-[9px] font-extrabold uppercase tracking-wider text-blue-400">
                      Inteligencia Operativa V2
                    </span>
                  )}
                  
                  {/* Dashboard Inteligencia */}
                  <button 
                    onClick={() => setActiveTab("inteligencia")}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer mt-1 ${activeTab === "inteligencia" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                  >
                    <Activity size={15} className={activeTab === "inteligencia" ? "text-white" : "text-blue-400"} />
                    {sidebarOpen && <span className="flex items-center justify-between w-full"><span>Centro Inteligencia</span> <span className="text-[9px] bg-blue-400/20 text-blue-200 px-1.5 py-0.5 rounded font-black">IO</span></span>}
                  </button>

                  {/* Salud del Socio */}
                  <button 
                    onClick={() => setActiveTab("salud")}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "salud" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                  >
                    <ShieldCheck size={15} className={activeTab === "salud" ? "text-white" : "text-emerald-400"} />
                    {sidebarOpen && <span>Salud de Socios (0-100)</span>}
                  </button>

                  {/* Alertas */}
                  <button 
                    onClick={() => setActiveTab("alertas")}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "alertas" ? "bg-rose-700 text-white shadow-md shadow-rose-900/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                  >
                    <AlertTriangle size={15} className={activeTab === "alertas" ? "text-white" : "text-rose-400"} />
                    {sidebarOpen && <span>Centro de Alertas</span>}
                  </button>

                  {/* Acciones */}
                  <button 
                    onClick={() => setActiveTab("acciones")}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "acciones" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                  >
                    <Zap size={15} className={activeTab === "acciones" ? "text-white" : "text-amber-400"} />
                    {sidebarOpen && <span>Bandeja de Acciones</span>}
                  </button>

                  {/* Automatizaciones */}
                  <button 
                    onClick={() => setActiveTab("automatizaciones")}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "automatizaciones" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                  >
                    <Bot size={15} className={activeTab === "automatizaciones" ? "text-white" : "text-purple-400"} />
                    {sidebarOpen && <span>Automatizaciones</span>}
                  </button>

                  {/* Oportunidades */}
                  <button 
                    onClick={() => setActiveTab("oportunidades")}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "oportunidades" ? "bg-purple-700 text-white shadow-md shadow-purple-900/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                  >
                    <Lightbulb size={15} className={activeTab === "oportunidades" ? "text-white" : "text-amber-400"} />
                    {sidebarOpen && <span>Oportunidades</span>}
                  </button>

                  {/* Auditoría */}
                  <button 
                    onClick={() => setActiveTab("auditoria")}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "auditoria" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                  >
                    <FileText size={15} className={activeTab === "auditoria" ? "text-white" : "text-slate-400"} />
                    {sidebarOpen && <span>Auditoría & Bitácora IA</span>}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  {sidebarOpen && (
                    <span className="px-2.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
                      Gestión Operativa V1
                    </span>
                  )}

                  {/* Dashboard Menu Row */}
                  {isTabAllowed("dashboard") && (
                    <button 
                      onClick={() => setActiveTab("dashboard")}
                      className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer mt-1 ${activeTab === "dashboard" ? "bg-cecip-blue text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                    >
                      <LayoutDashboard size={15} />
                      {sidebarOpen && <span>Dashboard ERP</span>}
                    </button>
                  )}

                  {/* Socios Menu Row */}
                  {isTabAllowed("socios") && (
                    <button 
                      onClick={() => setActiveTab("socios")}
                      className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "socios" ? "bg-cecip-blue text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                    >
                      <Users size={15} />
                      {sidebarOpen && <span>Administración de Socios</span>}
                    </button>
                  )}

                  {/* Billing/Facturacion Menu Row */}
                  {isTabAllowed("facturas") && (
                    <button 
                      onClick={() => setActiveTab("facturas")}
                      className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "facturas" ? "bg-cecip-blue text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                    >
                      <Receipt size={15} />
                      {sidebarOpen && <span>Facturación y Tesorería</span>}
                    </button>
                  )}

                  {/* Directory Menu Row */}
                  {isTabAllowed("directorio") && (
                    <button 
                      onClick={() => setActiveTab("directorio")}
                      className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "directorio" ? "bg-cecip-blue text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                    >
                      <Building2 size={15} />
                      {sidebarOpen && <span>Directorio de Socios</span>}
                    </button>
                  )}

                  {/* Eventos Menu Row */}
                  {isTabAllowed("eventos") && (
                    <button 
                      onClick={() => setActiveTab("eventos")}
                      className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "eventos" ? "bg-cecip-blue text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                    >
                      <Calendar size={15} />
                      {sidebarOpen && <span>Eventos y Convenios</span>}
                    </button>
                  )}

                  {/* Documentos & Tickets Menu Row */}
                  {isTabAllowed("docs") && (
                    <button 
                      onClick={() => setActiveTab("docs")}
                      className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "docs" ? "bg-cecip-blue text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                    >
                      <FolderOpen size={15} />
                      {sidebarOpen && <span>Documentos y Tickets</span>}
                    </button>
                  )}

                  {/* Bolsa de Empleo Menu Row */}
                  {isTabAllowed("empleo") && (
                    <button 
                      onClick={() => setActiveTab("empleo")}
                      className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "empleo" ? "bg-cecip-blue text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                    >
                      <Briefcase size={15} className={activeTab === "empleo" ? "text-white" : "text-emerald-400"} />
                      {sidebarOpen && <span className="flex items-center justify-between w-full"><span>Bolsa de Empleo</span> <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-extrabold">CVs</span></span>}
                    </button>
                  )}

                  {/* CeCIP Copilot IA Menu Row */}
                  {isTabAllowed("copilot") && (
                    <button 
                      onClick={() => setActiveTab("copilot")}
                      className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "copilot" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
                    >
                      <Bot size={15} className={activeTab === "copilot" ? "text-amber-300" : "text-indigo-400"} />
                      {sidebarOpen && <span className="flex items-center justify-between w-full"><span>CeCIP Copilot</span> <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-1.5 py-0.5 rounded font-black tracking-wide">IA</span></span>}
                    </button>
                  )}

                  {/* ComercIA Menu Row */}
                  {isTabAllowed("comercia") && (
                    <button 
                      onClick={() => setActiveTab("comercia")}
                      className={`w-full p-2.5 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "comercia" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
                    >
                      <Sparkles size={15} className={activeTab === "comercia" ? "text-amber-300" : "text-indigo-400"} />
                      {sidebarOpen && <span className="flex items-center gap-1.5">ComercIA <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-300 font-extrabold tracking-wide">Pymes</span></span>}
                    </button>
                  )}
                </div>
              </nav>
            </div>

            {/* Lower sidebar body */}
            <div className="space-y-4 w-full">
              {/* User badge */}
              {sidebarOpen && (
                <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl space-y-1 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{userRole}</p>
                  <p className="text-xs font-bold text-white truncate">{userNombre}</p>
                </div>
              )}

              {/* Actions footer (Theme switcher & log out) */}
              <div className={`flex gap-1.5 ${sidebarOpen ? "justify-between" : "flex-col items-center"}`}>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Alternar Modo Claro / Oscuro"
                >
                  {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                </button>
                
                {sidebarOpen && (
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Colapsar menú lateral"
                  >
                    <X size={15} />
                  </button>
                )}

                {!sidebarOpen && (
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Expandir menú lateral"
                  >
                    <Menu size={15} />
                  </button>
                )}

                <button 
                  onClick={() => {
                    setIsLoggedIn(false);
                    setEmail("");
                    setPassword("");
                  }}
                  className="p-2 hover:bg-rose-950/20 rounded-xl text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  title="Cerrar sesión ERP"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>

          </aside>

          {/* MAIN MODULE CONTENT VIEWPORT */}
          <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto h-full min-h-0 scroll-smooth">
            {/* Header navbar inside view */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {activeTab === "inteligencia" && "Centro de Inteligencia Operativa CeCIP (V2) 🧠"}
                  {activeTab === "salud" && "Matriz y Diagnóstico de Salud de Socios (0-100 pts) 🛡️"}
                  {activeTab === "alertas" && "Centro de Alertas Operativas y Detección Temprana ⚠️"}
                  {activeTab === "acciones" && "Bandeja de Acciones Operativas y Retención ⚡"}
                  {activeTab === "automatizaciones" && "Motor de Automatizaciones y Reglas Autónomas 🤖"}
                  {activeTab === "oportunidades" && "Detección de Oportunidades y Beneficios Comerciales 💡"}
                  {activeTab === "auditoria" && "Trazabilidad, Auditoría y Bitácora de IA 📜"}
                  {activeTab === "dashboard" && "Panel de Control Operativo (Dashboard V1)"}
                  {activeTab === "socios" && "Padrón e Historial de Asociados"}
                  {activeTab === "facturas" && "Módulo de Facturas y Caja Diaria"}
                  {activeTab === "directorio" && "Directorio del Comercio Asociado"}
                  {activeTab === "eventos" && "Centro de Eventos y Convenios de Alianzas"}
                  {activeTab === "docs" && "Repositorio Digital y Mesa de Ayuda (Tickets)"}
                  {activeTab === "empleo" && "Bolsa de Empleo & Postulaciones Institucionales"}
                  {activeTab === "copilot" && "CeCIP Copilot · Asistente IA de Gestión ERP 🚀"}
                  {activeTab === "comercia" && "ComercIA · Asesoría y Simulación Digital de Negocios ✨"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Usuario Activo: <span className="font-bold text-slate-800 dark:text-slate-200">{userNombre}</span> ({userRole}) · CeCIP Paraná Cloud.
                </p>
              </div>

              {/* Status indicator pill, refresh & Close button */}
              <div className="flex items-center gap-2.5">
                {/* Switch to Affiliate simulation view */}
                <button
                  type="button"
                  onClick={() => {
                    const defaultSocio = erpData.socios[0];
                    setCurrentSocio(defaultSocio);
                    setUserRole("Afiliado");
                    setUserNombre(defaultSocio.nombreComercial || defaultSocio.razonSocial);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 hover:dark:bg-blue-900/50 text-[#00a3e0] dark:text-sky-300 border border-blue-200 dark:border-blue-800 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                  title="Cambiar a la vista del socio para verificar cómo ve sus cuotas y servicios"
                >
                  <Building2 size={13} />
                  <span className="hidden sm:inline">Ver como Afiliado</span>
                </button>

                <button
                  type="button"
                  onClick={refreshFromDatabase}
                  disabled={isLoadingDb}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 hover:dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  title="Sincronizar base de datos PostgreSQL / Cloud"
                >
                  <RefreshCw size={13} className={isLoadingDb ? "animate-spin text-cecip-blue" : ""} />
                  <span className="hidden sm:inline">{isLoadingDb ? "Sincronizando..." : "Sincronizar"}</span>
                </button>

                <div className="flex gap-2 items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold">
                  <span className={`w-2 h-2 rounded-full ${isLoadingDb ? "bg-amber-400 animate-spin" : "bg-emerald-500 animate-pulse"}`}></span>
                  <span className="text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {isLoadingDb ? "Sincronizando..." : "PostgreSQL / DB: Online"}
                  </span>
                </div>

                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 hover:dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    title="Salir del ERP y volver a la web principal"
                  >
                    <X size={15} />
                    <span className="hidden sm:inline">Volver a la Web</span>
                  </button>
                )}
              </div>
            </div>

            {/* Render selected subcomponent */}
            {activeTab === "inteligencia" && (
              <ErpIntelligenceDashboard
                onNavigateToTab={(t: any) => setActiveTab(t)}
                onOpenSocioDetail={() => setActiveTab("socios")}
              />
            )}

            {activeTab === "salud" && (
              <ErpSaludSocios
                onOpenSocioDetail={() => setActiveTab("socios")}
              />
            )}

            {activeTab === "alertas" && (
              <ErpAlertasOperativas
                onOpenSocioDetail={() => setActiveTab("socios")}
              />
            )}

            {activeTab === "acciones" && (
              <ErpAccionesOperativas
                onOpenSocioDetail={() => setActiveTab("socios")}
              />
            )}

            {activeTab === "automatizaciones" && (
              <ErpAutomatizaciones />
            )}

            {activeTab === "oportunidades" && (
              <ErpOportunidades
                onOpenSocioDetail={() => setActiveTab("socios")}
              />
            )}

            {activeTab === "auditoria" && (
              <ErpAuditoriaBitacora />
            )}

            {activeTab === "dashboard" && (
              <ErpDashboard 
                socios={erpData.socios} 
                bills={erpData.bills} 
                tickets={erpData.tickets} 
                role={userRole}
                onNavigate={(tab: any) => {
                  if (isTabAllowed(tab)) {
                    setActiveTab(tab);
                  } else {
                    alert("Su rol no tiene permisos para acceder a ese módulo.");
                  }
                }}
                onAddSocio={() => { setActiveTab("socios"); }}
                onAddInteraction={() => { setActiveTab("socios"); }}
                onAddBill={() => { setActiveTab("facturas"); }}
                onAddEvent={() => { setActiveTab("eventos"); }}
              />
            )}

            {activeTab === "socios" && (
              <ErpSocios 
                socios={erpData.socios} 
                crm={erpData.crm}
                bills={erpData.bills}
                onSaveSocios={handleSaveSocios} 
                onSaveCrm={handleSaveCrm}
                onSaveBills={handleSaveBills}
                role={userRole} 
              />
            )}

            {activeTab === "facturas" && (
              <ErpFacturacion 
                bills={erpData.bills} 
                tesoreria={erpData.tesoreria} 
                socios={erpData.socios} 
                onSaveBills={handleSaveBills} 
                onSaveTesoreria={handleSaveTesoreria} 
                onSaveSocios={handleSaveSocios} 
                role={userRole} 
              />
            )}

            {activeTab === "directorio" && (
              <ErpDirectorio 
                socios={erpData.socios} 
                onSaveSocios={handleSaveSocios} 
                role={userRole} 
              />
            )}

            {activeTab === "eventos" && (
              <ErpEventos 
                events={erpData.events} 
                enrollments={erpData.enrollments} 
                convenios={erpData.convenios} 
                onSaveEvents={handleSaveEvents} 
                onSaveEnrollments={handleSaveEnrollments} 
                onSaveConvenios={handleSaveConvenios} 
                role={userRole} 
              />
            )}

            {activeTab === "docs" && (
              <ErpDocumentos 
                docs={erpData.docs} 
                tickets={erpData.tickets} 
                socios={erpData.socios} 
                onSaveDocs={handleSaveDocs} 
                onSaveTickets={handleSaveTickets} 
                role={userRole} 
              />
            )}

            {activeTab === "empleo" && (
              <ErpBolsaEmpleo 
                role={userRole} 
                socios={erpData.socios} 
              />
            )}

            {activeTab === "copilot" && (
              <ErpCopilot 
                erpData={erpData} 
                role={userRole} 
              />
            )}

            {activeTab === "comercia" && (
              <ErpComercia 
                socios={erpData.socios} 
                onSaveSocios={handleSaveSocios} 
                crm={erpData.crm} 
                onSaveCrm={handleSaveCrm} 
                role={userRole} 
              />
            )}

          </main>
          
        </div>
      )}

    </div>
  );
}

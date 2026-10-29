import React, { useState, useEffect } from "react";
import { WebNewsItem, ContactMessage } from "../types";
import { 
  Lock, CheckCircle, Trash2, Plus, Edit3, Save, X, Eye, 
  BarChart3, MessageSquare, Newspaper, FileText, Check, ArrowRight,
  Calendar, Image, Sparkles, Award, Clock, MapPin, User, Upload
} from "lucide-react";
import { noticiasService, contactoService, eventosService, bolsaService } from "../services";
import ImageFieldEditor from "./ImageFieldEditor";
import CalendarDateField from "./CalendarDateField";

interface PrivateAdminPortalProps {
  onNewsUpdated: () => void;
  onEventsUpdated: () => void;
  onHeroUpdated: () => void;
  onOpenErp?: () => void;
}

export default function PrivateAdminPortal({ 
  onNewsUpdated, 
  onEventsUpdated, 
  onHeroUpdated,
  onOpenErp
}: PrivateAdminPortalProps) {
  const [passcode, setPasscode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Lists state
  const [newsList, setNewsList] = useState<WebNewsItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    cvCount: 0,
    messageCount: 0,
    newsCount: 0,
    eventsCount: 0
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<"news" | "messages" | "events" | "hero" | "stats">("news");

  // Edit / Add News states
  const [editingNews, setEditingNews] = useState<WebNewsItem | null>(null);
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [newNewsForm, setNewNewsForm] = useState({
    title: "",
    category: "Noticia",
    badge: "Actualidad",
    description: "",
    additionalInfo: "",
    imageUrl: "/images/cecip_representatives_1782854765721.jpg"
  });

  // Edit / Add Event states
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    fecha: "20/07/2026",
    day: 20,
    month: "Julio",
    titulo: "",
    type: "Capacitación",
    hora: "19:00 h",
    lugar: "Salón de Usos Múltiples CeCIP",
    orador: "",
    description: "",
    banner: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=80",
    color: "bg-rose-500",
    borderColor: "border-rose-500",
    textColor: "text-rose-600 dark:text-rose-400"
  });

  // Quick image change states
  const [quickImageEvent, setQuickImageEvent] = useState<any | null>(null);
  const [quickImageNews, setQuickImageNews] = useState<WebNewsItem | null>(null);

  // Additional institutional images
  const [asociarseImageUrl, setAsociarseImageUrl] = useState(() => {
    return localStorage.getItem("cecip_asociarse_img") || "/images/collaboration_meeting_1782854725514.jpg";
  });
  const [bannerFlyerUrl, setBannerFlyerUrl] = useState(() => {
    return localStorage.getItem("cecip_banner_flyer") || "";
  });

  // Hero Section State
  const [heroForm, setHeroForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: ""
  });
  const [heroSuccessMessage, setHeroSuccessMessage] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      loadAdminData();
    }
  }, [isLoggedIn]);

  const loadAdminData = async () => {
    try {
      // 1. Load news
      let loadedNews: WebNewsItem[] = [];
      try {
        loadedNews = await noticiasService.getAll();
      } catch (err) {
        console.warn("Could not fetch news from API, using storage fallback", err);
      }
      if (loadedNews && loadedNews.length > 0) {
        setNewsList(loadedNews);
        localStorage.setItem("cecip_news", JSON.stringify(loadedNews));
      } else {
        const stored = localStorage.getItem("cecip_news");
        if (stored) {
          try {
            setNewsList(JSON.parse(stored));
          } catch {}
        }
      }

      // 2. Load contact messages
      const loadedMessages = await contactoService.getAll();
      setMessages(loadedMessages);

      // 3. Load events
      let loadedEvents: any[] = [];
      try {
        loadedEvents = await eventosService.getAll();
      } catch (err) {
        console.warn("Could not fetch events from API, using storage fallback", err);
      }
      if (loadedEvents && loadedEvents.length > 0) {
        setEventsList(loadedEvents);
        localStorage.setItem("cecip_events", JSON.stringify(loadedEvents));
      } else {
        const stored = localStorage.getItem("cecip_events");
        if (stored) {
          try {
            setEventsList(JSON.parse(stored));
          } catch {}
        }
      }

      // 4. Load CVs
      const cvs = await bolsaService.getAllCVs();

      const loadedHero = JSON.parse(localStorage.getItem("cecip_hero") || "{}");
      setHeroForm({
        title: loadedHero.title || "",
        subtitle: loadedHero.subtitle || "",
        description: loadedHero.description || "",
        imageUrl: loadedHero.imageUrl || ""
      });

      const storedAsociarse = localStorage.getItem("cecip_asociarse_img");
      if (storedAsociarse) {
        setAsociarseImageUrl(storedAsociarse);
      }
      const storedBanner = localStorage.getItem("cecip_banner_flyer");
      if (storedBanner) {
        setBannerFlyerUrl(storedBanner);
      }

      setStats({
        cvCount: cvs.length,
        messageCount: loadedMessages.length,
        newsCount: loadedNews.length || newsList.length,
        eventsCount: loadedEvents.length || eventsList.length
      });
    } catch (e) {
      console.error("Error loading admin data:", e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === "admin123") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Contraseña incorrecta. La contraseña demo es 'admin123'.");
    }
  };

  // ------------------------------------------
  // NEWS MANAGEMENT FUNCTIONS
  // ------------------------------------------
  const handleDeleteNews = async (id: string) => {
    try {
      try {
        await noticiasService.delete(id);
      } catch (err) {
        console.warn("Delete news API warning:", err);
      }
      // Update local storage and state
      const updatedList = newsList.filter(n => n.id !== id);
      setNewsList(updatedList);
      localStorage.setItem("cecip_news", JSON.stringify(updatedList));
      onNewsUpdated();
    } catch (e) {
      console.error("Error deleting news:", e);
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsForm.title || !newNewsForm.description) return;

    try {
      const formattedDate = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const newItem: WebNewsItem = {
        id: "news-" + Date.now(),
        title: newNewsForm.title,
        date: formattedDate,
        category: newNewsForm.category,
        badge: newNewsForm.badge,
        description: newNewsForm.description,
        additionalInfo: newNewsForm.additionalInfo,
        imageUrl: newNewsForm.imageUrl || "/images/cecip_representatives_1782854765721.jpg",
        itemsList: ["Información del rubro actual", "Acceso directo a convenios CeCIP"]
      };

      try {
        const created = await noticiasService.create(newItem);
        if (created?.id) newItem.id = created.id;
      } catch (err) {
        console.warn("Create news API warning:", err);
      }

      const updatedList = [newItem, ...newsList];
      setNewsList(updatedList);
      localStorage.setItem("cecip_news", JSON.stringify(updatedList));
      setShowAddNewsModal(false);
      onNewsUpdated();

      // Reset form
      setNewNewsForm({
        title: "",
        category: "Noticia",
        badge: "Actualidad",
        description: "",
        additionalInfo: "",
        imageUrl: "/images/cecip_representatives_1782854765721.jpg"
      });
    } catch (e) {
      console.error("Error creating news:", e);
    }
  };

  const handleUpdateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;

    try {
      try {
        await noticiasService.update(editingNews.id, editingNews);
      } catch (err) {
        console.warn("Update news API warning:", err);
      }

      const updatedList = newsList.map(n => n.id === editingNews.id ? editingNews : n);
      setNewsList(updatedList);
      localStorage.setItem("cecip_news", JSON.stringify(updatedList));
      setEditingNews(null);
      onNewsUpdated();
    } catch (e) {
      console.error("Error updating news:", e);
    }
  };

  // ------------------------------------------
  // EVENTS MANAGEMENT FUNCTIONS
  // ------------------------------------------
  const handleDeleteEvent = async (id: string) => {
    try {
      try {
        await eventosService.delete(id);
      } catch (err) {
        console.warn("Delete event API warning:", err);
      }
      const updatedList = eventsList.filter(ev => ev.id !== id);
      setEventsList(updatedList);
      localStorage.setItem("cecip_events", JSON.stringify(updatedList));
      onEventsUpdated();
    } catch (e) {
      console.error("Error deleting event:", e);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventForm.titulo || !newEventForm.fecha) return;

    try {
      let color = "bg-rose-500";
      let borderColor = "border-rose-500";
      let textColor = "text-rose-600 dark:text-rose-400";

      if (newEventForm.type === "Muestra") {
        color = "bg-emerald-500";
        borderColor = "border-emerald-500";
        textColor = "text-emerald-600 dark:text-emerald-400";
      } else if (newEventForm.type === "Seminario") {
        color = "bg-indigo-600";
        borderColor = "border-indigo-600";
        textColor = "text-indigo-600 dark:text-indigo-400";
      } else if (newEventForm.type === "Reunión") {
        color = "bg-sky-500";
        borderColor = "border-sky-500";
        textColor = "text-sky-600 dark:text-sky-400";
      }

      const eventPayload = {
        titulo: newEventForm.titulo,
        fecha: newEventForm.fecha,
        day: newEventForm.day,
        month: newEventForm.month,
        hora: newEventForm.hora,
        lugar: newEventForm.lugar,
        orador: newEventForm.orador,
        description: newEventForm.description,
        descripcion: newEventForm.description,
        banner: newEventForm.banner,
        bannerUrl: newEventForm.banner,
        categoria: (newEventForm.type as any) || "Capacitación",
        type: newEventForm.type,
        color,
        borderColor,
        textColor
      };

      let newId = "ev-" + Date.now();
      try {
        const created = await eventosService.create(eventPayload);
        if (created?.id) newId = created.id;
      } catch (err) {
        console.warn("Create event API warning:", err);
      }

      const fullNewEvent = { id: newId, ...eventPayload };
      const updatedList = [...eventsList, fullNewEvent];
      setEventsList(updatedList);
      localStorage.setItem("cecip_events", JSON.stringify(updatedList));

      setShowAddEventModal(false);
      onEventsUpdated();

      // Reset form
      setNewEventForm({
        fecha: "20/07/2026",
        day: 20,
        month: "Julio",
        titulo: "",
        type: "Capacitación",
        hora: "19:00 h",
        lugar: "Salón de Usos Múltiples CeCIP",
        orador: "",
        description: "",
        banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        color: "bg-rose-500",
        borderColor: "border-rose-500",
        textColor: "text-rose-600 dark:text-rose-400"
      });
    } catch (e) {
      console.error("Error creating event:", e);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      const bannerUrl = editingEvent.banner || editingEvent.bannerUrl || "";
      const updatedData = {
        ...editingEvent,
        banner: bannerUrl,
        bannerUrl: bannerUrl,
        descripcion: editingEvent.description || editingEvent.descripcion || ""
      };

      try {
        await eventosService.update(editingEvent.id, updatedData);
      } catch (err) {
        console.warn("Update event API warning:", err);
      }

      const updatedList = eventsList.map(ev => ev.id === editingEvent.id ? updatedData : ev);
      setEventsList(updatedList);
      localStorage.setItem("cecip_events", JSON.stringify(updatedList));

      setEditingEvent(null);
      onEventsUpdated();
    } catch (e) {
      console.error("Error updating event:", e);
    }
  };

  const handleEditEventClick = (item: any) => {
    setEditingEvent({
      ...item,
      banner: item.banner || item.bannerUrl || "",
      bannerUrl: item.banner || item.bannerUrl || "",
      fecha: item.fecha || "20/07/2026",
      day: item.day || 20,
      month: item.month || "Julio",
      hora: item.hora || "19:00 h",
      lugar: item.lugar || "Salón de Usos Múltiples CeCIP",
      orador: item.orador || "",
      description: item.description || item.descripcion || "",
      type: item.type || item.categoria || "Capacitación"
    });
  };

  // ------------------------------------------
  // QUICK IMAGE REPLACEMENT HANDLERS
  // ------------------------------------------
  const handleSaveQuickEventImage = async (newUrl: string) => {
    if (!quickImageEvent) return;
    try {
      const updated = {
        ...quickImageEvent,
        banner: newUrl,
        bannerUrl: newUrl
      };
      try {
        await eventosService.update(quickImageEvent.id, updated);
      } catch (err) {
        console.warn("Update event image API warning:", err);
      }
      const updatedList = eventsList.map(ev => ev.id === quickImageEvent.id ? updated : ev);
      setEventsList(updatedList);
      localStorage.setItem("cecip_events", JSON.stringify(updatedList));
      setQuickImageEvent(null);
      onEventsUpdated();
    } catch (e) {
      console.error("Error updating event image:", e);
    }
  };

  const handleSaveQuickNewsImage = async (newUrl: string) => {
    if (!quickImageNews) return;
    try {
      const updated = {
        ...quickImageNews,
        imageUrl: newUrl
      };
      try {
        await noticiasService.update(quickImageNews.id, updated);
      } catch (err) {
        console.warn("Update news image API warning:", err);
      }
      const updatedList = newsList.map(n => n.id === quickImageNews.id ? updated : n);
      setNewsList(updatedList);
      localStorage.setItem("cecip_news", JSON.stringify(updatedList));
      setQuickImageNews(null);
      onNewsUpdated();
    } catch (e) {
      console.error("Error updating news image:", e);
    }
  };

  // ------------------------------------------
  // HERO & WEB IMAGES MANAGEMENT FUNCTIONS
  // ------------------------------------------
  const handleUpdateHero = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("cecip_hero", JSON.stringify(heroForm));
    localStorage.setItem("cecip_asociarse_img", asociarseImageUrl);
    localStorage.setItem("cecip_banner_flyer", bannerFlyerUrl);
    onHeroUpdated();
    setHeroSuccessMessage("¡Imágenes y contenidos de la web guardados correctamente!");
    setTimeout(() => setHeroSuccessMessage(""), 4000);
  };

  // ------------------------------------------
  // MESSAGE CENTER FUNCTIONS
  // ------------------------------------------
  const toggleMessageStatus = async (id: string) => {
    const target = messages.find(m => m.id === id);
    if (!target) return;
    try {
      await contactoService.responder(id, !target.respondido);
      await loadAdminData();
    } catch (e) {
      console.error("Error toggling message status:", e);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await contactoService.delete(id);
      await loadAdminData();
    } catch (e) {
      console.error("Error deleting message:", e);
    }
  };

  return (
    <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden min-h-[500px]">
      
      {!isLoggedIn ? (
        <div className="max-w-md mx-auto space-y-6 py-12">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-200">
              <Lock size={20} className="text-cecip-blue" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Consola de Gestión Privada</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Accede al panel de control administrativo para gestionar contenidos de la web y formularios de contacto.
            </p>
          </div>

          <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-medium">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Clave de Administración *</label>
                <span className="text-[10px] text-cecip-blue font-bold">Clave demo: admin123</span>
              </div>
              <input 
                type="password" 
                placeholder="Ingresar clave..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-cecip-blue focus:bg-white transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors bg-slate-900 hover:bg-slate-800 cursor-pointer"
            >
              Iniciar Gestión
            </button>
          </form>

          {/* Test Access Box for Socios Login & ERP */}
          {onOpenErp && (
            <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200/90 rounded-2xl p-5 text-center space-y-2.5 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wide">
                <Sparkles size={14} className="text-[#00a3e0]" />
                <span>Entorno de Pruebas (/admincecip)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                El botón de <strong>Login Socios</strong> está bloqueado al público en la web general con aviso <em>"Próximamente"</em>. Puedes acceder y probar el sistema desde aquí:
              </p>
              <button 
                type="button"
                onClick={onOpenErp}
                className="w-full py-2.5 px-4 bg-[#00a3e0] hover:bg-[#0c2356] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
              >
                <User size={15} />
                <span>Probar Login de Socios y ERP Institucional</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Admin Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">
                🛠️
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">Administrador Web</p>
                <p className="text-sm sm:text-base font-extrabold text-slate-800 pt-1">Gestión CeCIP Paraná</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              {onOpenErp && (
                <button 
                  type="button"
                  onClick={onOpenErp}
                  className="px-3.5 py-1.5 bg-[#00a3e0] hover:bg-[#0c2356] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Abrir y probar la sección de socios y ERP"
                >
                  <User size={13} />
                  <span>Probar Login Socios (ERP)</span>
                </button>
              )}
              <button 
                onClick={() => { setIsLoggedIn(false); setPasscode(""); }}
                className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Salir del Panel
              </button>
            </div>
          </div>

          {/* Test Access Banner in Admin Dashboard */}
          {onOpenErp && (
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-blue-900/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wide">
                    Modo Pruebas
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">Login Socios y Sistema ERP Institucional</h4>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  En la web pública el botón de socios está bloqueado con el cartel <strong>"Próximamente"</strong>. Utiliza este acceso para probar el login, la consulta de deudas, estado de cuenta y certificados.
                </p>
              </div>
              <button 
                type="button"
                onClick={onOpenErp}
                className="whitespace-nowrap px-4 py-2 bg-[#00a3e0] hover:bg-[#0c2356] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer self-stretch sm:self-auto justify-center"
              >
                <User size={14} />
                <span>Iniciar Portal Socios / ERP</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-cecip-blue/5 text-cecip-blue rounded-xl">
                <Newspaper size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none font-sans">Noticias</p>
                <p className="text-sm sm:text-base font-extrabold text-slate-800 pt-1">{newsList.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/5 text-amber-600 rounded-xl">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none font-sans">CVs Cargados</p>
                <p className="text-sm sm:text-base font-extrabold text-slate-800 pt-1">{stats.cvCount}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/5 text-emerald-600 rounded-xl">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none font-sans">Contactos</p>
                <p className="text-sm sm:text-base font-extrabold text-slate-800 pt-1">{messages.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/5 text-indigo-600 rounded-xl">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none font-sans">Eventos Web</p>
                <p className="text-sm sm:text-base font-extrabold text-slate-800 pt-1">{eventsList.length}</p>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex flex-wrap border-b border-slate-200 gap-1 pb-px">
            <button 
              onClick={() => setActiveTab("news")}
              className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === "news" 
                  ? "border-cecip-blue text-cecip-blue" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Gestionar Noticias
            </button>
            <button 
              onClick={() => setActiveTab("events")}
              className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === "events" 
                  ? "border-cecip-blue text-cecip-blue" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Gestionar Eventos
            </button>
            <button 
              onClick={() => setActiveTab("hero")}
              className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "hero" 
                  ? "border-cecip-blue text-cecip-blue" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Image size={14} />
              <span>Modificar Imágenes y Portada</span>
            </button>
            <button 
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === "messages" 
                  ? "border-cecip-blue text-cecip-blue" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Mensajes de Contacto
            </button>
          </div>

          {/* TAB 1: NEWS MANAGER */}
          {activeTab === "news" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-extrabold text-slate-800">Listado de Artículos Activos</h4>
                <button 
                  onClick={() => setShowAddNewsModal(true)}
                  className="px-3 py-1.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Plus size={14} />
                  <span>Nueva Noticia</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {newsList.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start sm:items-center gap-3.5 max-w-xl">
                      {item.imageUrl && (
                        <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                            {item.badge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{item.date}</span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-950 truncate leading-snug">{item.title}</h5>
                        <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button 
                        type="button"
                        onClick={() => setQuickImageNews(item)}
                        className="px-2.5 py-1 text-slate-600 hover:text-cecip-blue hover:bg-sky-50 rounded-lg transition-colors cursor-pointer border border-slate-200 text-xs font-semibold flex items-center gap-1"
                        title="Cambiar fotografía de esta noticia"
                      >
                        <Image size={13} className="text-cecip-blue" />
                        <span className="hidden sm:inline">Cambiar Imagen</span>
                      </button>
                      <button 
                        onClick={() => setEditingNews(item)}
                        className="p-1.5 text-slate-500 hover:text-cecip-blue hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar Noticia"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar Noticia"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT MESSAGES */}
          {activeTab === "messages" && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-800">Formularios Recibidos</h4>
              
              <div className="grid grid-cols-1 gap-4">
                {messages.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 text-xs">
                    No hay mensajes recibidos en este momento.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`bg-white p-5 rounded-2xl border shadow-sm space-y-3 transition-all ${
                        msg.respondido ? "border-slate-100 opacity-75" : "border-cecip-blue/30 bg-cecip-blue/5"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{msg.nombre}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Empresa: {msg.empresa} · Tel: {msg.telefono}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold sm:text-right">{msg.fecha}</span>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50/75 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        "{msg.mensaje}"
                      </p>

                      <div className="flex justify-between items-center pt-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">{msg.email}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleMessageStatus(msg.id)}
                            className={`px-3 py-1 rounded-lg font-bold text-[10px] transition-colors flex items-center gap-1 ${
                              msg.respondido 
                                ? "bg-slate-100 text-slate-500 hover:bg-slate-200" 
                                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            }`}
                          >
                            {msg.respondido ? "Reabrir" : "Marcar respondido"}
                          </button>
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EVENTS MANAGER */}
          {activeTab === "events" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-extrabold text-slate-800">Próximos Eventos y Capacitaciones del Calendario</h4>
                <button 
                  onClick={() => setShowAddEventModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Nuevo Evento</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {eventsList.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 text-xs">
                    No hay eventos programados. Haz clic en "Nuevo Evento" para agregar uno.
                  </div>
                ) : (
                  eventsList.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                      <div className="flex items-start sm:items-center gap-3.5 max-w-xl">
                        {(item.banner || item.bannerUrl) && (
                          <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <img 
                              src={item.banner || item.bannerUrl} 
                              alt={item.titulo} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wide ${item.color || "bg-indigo-500"}`}>
                              {item.type}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                              <Clock size={10} /> {item.fecha} a las {item.hora}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                              <MapPin size={10} /> {item.lugar}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-sm text-slate-950 leading-snug">{item.titulo}</h5>
                          <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                          {item.orador && (
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                              <Award size={10} /> {item.orador}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button 
                          type="button"
                          onClick={() => setQuickImageEvent(item)}
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-slate-200 text-xs font-semibold flex items-center gap-1"
                          title="Cambiar flyer o imagen de este evento"
                        >
                          <Image size={13} className="text-indigo-600" />
                          <span className="hidden sm:inline">Cambiar Imagen</span>
                        </button>
                        <button 
                          onClick={() => handleEditEventClick(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Evento"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar Evento"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HERO MANAGER */}
          {activeTab === "hero" && (
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <Image size={18} className="text-cecip-blue" />
                    <span>Gestión Integral de Imágenes y Portada Web</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Modifica en tiempo real las imágenes institucionales principales de la web: sube fotografías desde tu computadora, selecciona imágenes institucionales de la galería o ingresa URLs directas.
                  </p>
                </div>

                {heroSuccessMessage && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <span>{heroSuccessMessage}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateHero} className="space-y-6 text-xs">
                  {/* SECCIÓN 1: PORTADA PRINCIPAL (HERO) */}
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cecip-blue text-white text-[11px] font-bold flex items-center justify-center">1</span>
                      <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                        Portada Superior (Hero / Fachada CeCIP)
                      </h5>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 uppercase tracking-wider block">Mensaje de Bienvenida (Volanta) *</label>
                      <input 
                        type="text" 
                        required
                        value={heroForm.subtitle}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cecip-blue text-xs sm:text-sm font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 uppercase tracking-wider block">Título Principal de la Portada (H1) *</label>
                      <input 
                        type="text" 
                        required
                        value={heroForm.title}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-cecip-blue text-xs sm:text-sm font-bold"
                      />
                    </div>

                    {/* ImageFieldEditor for Hero Cover Photo */}
                    <ImageFieldEditor 
                      label="Fotografía Principal de la Portada (Hero / Fachada)"
                      value={heroForm.imageUrl}
                      onChange={(url) => setHeroForm(prev => ({ ...prev, imageUrl: url }))}
                      aspectRatio="wide"
                      helperText="Esta fotografía ilustra la presentación oficial de CeCIP en la parte superior de la página web."
                      presets={[
                        {
                          label: "Fachada CeCIP 25 de Mayo (Oficial)",
                          url: "https://i.postimg.cc/WpC996c2/cecip-fachada-r8rfoy7572gdw9e5kbngeimw58imq1bl0s153k6uq8.jpg"
                        },
                        {
                          label: "Reunión de Comisión y Autoridades",
                          url: "/images/collaboration_meeting_1782854725514.jpg"
                        },
                        {
                          label: "Centro Comercial Paraná / Peatonal",
                          url: "/images/turismo_parana_1782854754924.jpg"
                        },
                        {
                          label: "Actividad Comercial y Productiva",
                          url: "/images/dia_del_padre_1782854741068.jpg"
                        }
                      ]}
                    />

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 uppercase tracking-wider block">Texto Descriptivo de Presentación *</label>
                      <textarea 
                        rows={4}
                        required
                        value={heroForm.description}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cecip-blue text-xs leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* SECCIÓN 2: FOTOGRAFÍA ASOCIARSE */}
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#00a3e0] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                      <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                        Fotografía de la Sección "Asociarse" (Pymes y Socios)
                      </h5>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Imagen destacada que se muestra junto al formulario de afiliación pública para nuevos comercios e industrias.
                    </p>

                    <ImageFieldEditor 
                      label="Fotografía para Sección Asociarse"
                      value={asociarseImageUrl}
                      onChange={(url) => setAsociarseImageUrl(url)}
                      aspectRatio="video"
                      helperText="Sube una fotografía desde tu computadora o elige una de las opciones predefinidas."
                      presets={[
                        {
                          label: "Reunión de Socios y Pymes",
                          url: "/images/collaboration_meeting_1782854725514.jpg"
                        },
                        {
                          label: "Representantes Institucionales",
                          url: "/images/cecip_representatives_1782854765721.jpg"
                        },
                        {
                          label: "Actividad Comercial Minorista",
                          url: "/images/dia_del_padre_1782854741068.jpg"
                        },
                        {
                          label: "Comercio y Turismo Paraná",
                          url: "/images/turismo_parana_1782854754924.jpg"
                        }
                      ]}
                    />
                  </div>

                  {/* SECCIÓN 3: BANNER / FLYER INSTITUCIONAL */}
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                      <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                        Banner o Flyer Institucional Destacado (Web)
                      </h5>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Flyer especial para campañas comerciales (Día de la Madre, Navidad, Aniversario CeCIP, Rondas de Negocios).
                    </p>

                    <ImageFieldEditor 
                      label="Flyer o Banner Institucional"
                      value={bannerFlyerUrl}
                      onChange={(url) => setBannerFlyerUrl(url)}
                      aspectRatio="wide"
                      helperText="Sube un banner horizontal para anuncios institucionales o promociones vigentes."
                      presets={[
                        {
                          label: "Auditorio y Formación Profesional",
                          url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                        },
                        {
                          label: "Desarrollo Empresario e Innovación",
                          url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
                        }
                      ]}
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
                    <button 
                      type="submit"
                      className="px-6 py-2.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl font-bold shadow-md shadow-cecip-blue/10 flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
                    >
                      <Save size={15} />
                      <span>Guardar Todas las Imágenes y Portada</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL 1: ADD NEWS */}
      {showAddNewsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="h-2 w-full bg-cecip-blue" />
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-extrabold text-slate-900">Crear Nueva Noticia</h4>
                <button onClick={() => setShowAddNewsModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateNews} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Título de la Noticia *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Nueva Línea de Créditos Pyme Paraná"
                    value={newNewsForm.title}
                    onChange={(e) => setNewNewsForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cecip-blue focus:bg-white text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Categoría *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Informe de Prensa"
                      value={newNewsForm.category}
                      onChange={(e) => setNewNewsForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cecip-blue focus:bg-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Etiqueta (Badge) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Créditos 2026"
                      value={newNewsForm.badge}
                      onChange={(e) => setNewNewsForm(prev => ({ ...prev, badge: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cecip-blue focus:bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Descripción de Entrada *</label>
                  <textarea 
                    rows={2}
                    required
                    placeholder="Breve sumario introductorio que se verá en la grilla..."
                    value={newNewsForm.description}
                    onChange={(e) => setNewNewsForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cecip-blue focus:bg-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Información Detallada (Cuerpo de Nota)</label>
                  <textarea 
                    rows={3}
                    placeholder="Contenido extendido que el usuario leerá al hacer clic..."
                    value={newNewsForm.additionalInfo}
                    onChange={(e) => setNewNewsForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cecip-blue focus:bg-white text-xs"
                  />
                </div>

                {/* ImageFieldEditor for News item */}
                <ImageFieldEditor 
                  label="Imagen de la Noticia"
                  value={newNewsForm.imageUrl}
                  onChange={(url) => setNewNewsForm(prev => ({ ...prev, imageUrl: url }))}
                  aspectRatio="video"
                  helperText="Puedes pegar una URL directa o subir una foto desde tu dispositivo para ilustrar el artículo."
                />

                <div className="flex gap-2 justify-end pt-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddNewsModal(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl font-bold shadow-md shadow-cecip-blue/10"
                  >
                    Publicar Noticia
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT NEWS */}
      {editingNews && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="h-2 w-full bg-cecip-blue" />
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-extrabold text-slate-900">Editar Noticia</h4>
                <button onClick={() => setEditingNews(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateNews} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Título de la Noticia *</label>
                  <input 
                    type="text" 
                    required
                    value={editingNews.title}
                    onChange={(e) => setEditingNews(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cecip-blue focus:bg-white text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Categoría *</label>
                    <input 
                      type="text" 
                      required
                      value={editingNews.category}
                      onChange={(e) => setEditingNews(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cecip-blue focus:bg-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Etiqueta (Badge) *</label>
                    <input 
                      type="text" 
                      required
                      value={editingNews.badge}
                      onChange={(e) => setEditingNews(prev => prev ? ({ ...prev, badge: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cecip-blue focus:bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Descripción de Entrada *</label>
                  <textarea 
                    rows={2}
                    required
                    value={editingNews.description}
                    onChange={(e) => setEditingNews(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cecip-blue focus:bg-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Información Detallada (Cuerpo de Nota)</label>
                  <textarea 
                    rows={3}
                    value={editingNews.additionalInfo}
                    onChange={(e) => setEditingNews(prev => prev ? ({ ...prev, additionalInfo: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cecip-blue focus:bg-white text-xs"
                  />
                </div>

                {/* ImageFieldEditor for News item */}
                <ImageFieldEditor 
                  label="Imagen de la Noticia"
                  value={editingNews.imageUrl || ""}
                  onChange={(url) => setEditingNews(prev => prev ? ({ ...prev, imageUrl: url }) : null)}
                  aspectRatio="video"
                  helperText="Puedes cambiar la URL o subir una nueva foto desde tu dispositivo."
                />

                <div className="flex gap-2 justify-end pt-3">
                  <button 
                    type="button" 
                    onClick={() => setEditingNews(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl font-bold shadow-md shadow-cecip-blue/10"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD EVENT */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="h-2 w-full bg-indigo-600" />
            <div className="p-6 sm:p-8 space-y-4 text-left">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="text-indigo-600" size={18} />
                  <span>Crear Nuevo Evento</span>
                </h4>
                <button onClick={() => setShowAddEventModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Título del Evento *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Taller: Estrategias de Venta Minorista"
                    value={newEventForm.titulo}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs sm:text-sm"
                  />
                </div>

                {/* Interactive Calendar Date Picker */}
                <CalendarDateField 
                  label="Fecha del Evento (Seleccionar en Calendario) *"
                  value={newEventForm.fecha}
                  onChange={({ fecha, day, month }) => {
                    setNewEventForm(prev => ({ ...prev, fecha, day, month }));
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Tipo de Actividad *</label>
                    <select
                      value={newEventForm.type}
                      onChange={(e) => setNewEventForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                    >
                      <option value="Capacitación">Capacitación (Taller/Curso)</option>
                      <option value="Muestra">Muestra / Exposición</option>
                      <option value="Seminario">Seminario Ejecutivo</option>
                      <option value="Reunión">Reunión de Comisión</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Horario *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. 19:30 h"
                      value={newEventForm.hora}
                      onChange={(e) => setNewEventForm(prev => ({ ...prev, hora: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Lugar / Salón *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Auditorio Principal CeCIP"
                      value={newEventForm.lugar}
                      onChange={(e) => setNewEventForm(prev => ({ ...prev, lugar: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Disertante / Coordinador</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Mg. Esteban Garmendia"
                      value={newEventForm.orador}
                      onChange={(e) => setNewEventForm(prev => ({ ...prev, orador: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                    />
                  </div>
                </div>

                {/* ImageFieldEditor for Event Banner */}
                <ImageFieldEditor 
                  label="Banner / Imagen del Evento"
                  value={newEventForm.banner}
                  onChange={(url) => setNewEventForm(prev => ({ ...prev, banner: url }))}
                  aspectRatio="video"
                  helperText="Sube un flyer o selecciona una imagen ilustrativa para la capacitación o evento."
                  presets={[
                    {
                      label: "Auditorio Principal CeCIP",
                      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                    },
                    {
                      label: "Seminario de Negocios y Finanzas",
                      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
                    },
                    {
                      label: "Comercio Minorista e Innovación",
                      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"
                    },
                    {
                      label: "Reunión Gremial / Institucional",
                      url: "/images/collaboration_meeting_1782854725514.jpg"
                    }
                  ]}
                />

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Descripción del Evento *</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Escribe un breve detalle de lo que tratará la capacitación o muestra..."
                    value={newEventForm.description}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddEventModal(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    Crear Evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT EVENT */}
      {editingEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="h-2 w-full bg-indigo-600" />
            <div className="p-6 sm:p-8 space-y-4 text-left">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="text-indigo-600" size={18} />
                  <span>Editar Evento</span>
                </h4>
                <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Título del Evento *</label>
                  <input 
                    type="text" 
                    required
                    value={editingEvent.titulo}
                    onChange={(e) => setEditingEvent(prev => prev ? ({ ...prev, titulo: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs sm:text-sm"
                  />
                </div>

                {/* Interactive Calendar Date Picker */}
                <CalendarDateField 
                  label="Fecha del Evento (Seleccionar en Calendario) *"
                  value={editingEvent.fecha || ""}
                  onChange={({ fecha, day, month }) => {
                    setEditingEvent((prev: any) => prev ? ({ ...prev, fecha, day, month }) : null);
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Tipo de Actividad *</label>
                    <select
                      value={editingEvent.type}
                      onChange={(e) => setEditingEvent(prev => prev ? ({ ...prev, type: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                    >
                      <option value="Capacitación">Capacitación (Taller/Curso)</option>
                      <option value="Muestra">Muestra / Exposición</option>
                      <option value="Seminario">Seminario Ejecutivo</option>
                      <option value="Reunión">Reunión de Comisión</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Horario *</label>
                    <input 
                      type="text" 
                      required
                      value={editingEvent.hora}
                      onChange={(e) => setEditingEvent(prev => prev ? ({ ...prev, hora: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Lugar / Salón *</label>
                    <input 
                      type="text" 
                      required
                      value={editingEvent.lugar}
                      onChange={(e) => setEditingEvent(prev => prev ? ({ ...prev, lugar: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Disertante / Coordinador</label>
                    <input 
                      type="text" 
                      value={editingEvent.orador || ""}
                      onChange={(e) => setEditingEvent(prev => prev ? ({ ...prev, orador: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                    />
                  </div>
                </div>

                {/* ImageFieldEditor for Event Banner */}
                <ImageFieldEditor 
                  label="Banner / Imagen del Evento"
                  value={editingEvent.banner || editingEvent.bannerUrl || ""}
                  onChange={(url) => setEditingEvent((prev: any) => prev ? ({ ...prev, banner: url, bannerUrl: url }) : null)}
                  aspectRatio="video"
                  helperText="Actualiza el flyer o banner de este evento."
                  presets={[
                    {
                      label: "Auditorio Principal CeCIP",
                      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                    },
                    {
                      label: "Seminario de Negocios y Finanzas",
                      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
                    },
                    {
                      label: "Comercio Minorista e Innovación",
                      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"
                    },
                    {
                      label: "Reunión Gremial / Institucional",
                      url: "/images/collaboration_meeting_1782854725514.jpg"
                    }
                  ]}
                />

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Descripción del Evento *</label>
                  <textarea 
                    rows={3}
                    required
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button 
                    type="button" 
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: QUICK IMAGE CHANGER FOR EVENT */}
      {quickImageEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="h-2 w-full bg-indigo-600" />
            <div className="p-6 sm:p-8 space-y-4 text-left">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Image size={18} className="text-indigo-600" />
                  <span>Modificar Flyer / Imagen del Evento</span>
                </h4>
                <button onClick={() => setQuickImageEvent(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide block">Evento Seleccionado:</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{quickImageEvent.titulo}</p>
                <p className="text-[11px] text-slate-500">{quickImageEvent.fecha} • {quickImageEvent.hora}</p>
              </div>

              <ImageFieldEditor 
                label="Nueva Imagen / Flyer del Evento"
                value={quickImageEvent.banner || quickImageEvent.bannerUrl || ""}
                onChange={(url) => setQuickImageEvent((prev: any) => prev ? ({ ...prev, banner: url, bannerUrl: url }) : null)}
                aspectRatio="video"
                helperText="Puedes subir una imagen desde tu PC, pegar un enlace web o elegir una opción de la galería."
                presets={[
                  {
                    label: "Auditorio Principal CeCIP",
                    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                  },
                  {
                    label: "Seminario de Negocios y Finanzas",
                    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
                  },
                  {
                    label: "Comercio Minorista e Innovación",
                    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"
                  },
                  {
                    label: "Reunión Gremial / Institucional",
                    url: "/images/collaboration_meeting_1782854725514.jpg"
                  }
                ]}
              />

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setQuickImageEvent(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => handleSaveQuickEventImage(quickImageEvent.banner || quickImageEvent.bannerUrl || "")}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 cursor-pointer text-xs"
                >
                  Guardar Imagen del Evento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: QUICK IMAGE CHANGER FOR NEWS */}
      {quickImageNews && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="h-2 w-full bg-cecip-blue" />
            <div className="p-6 sm:p-8 space-y-4 text-left">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Image size={18} className="text-cecip-blue" />
                  <span>Modificar Fotografía de la Noticia</span>
                </h4>
                <button onClick={() => setQuickImageNews(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl">
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wide block">Noticia Seleccionada:</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{quickImageNews.title}</p>
                <p className="text-[11px] text-slate-500">{quickImageNews.date} • {quickImageNews.category}</p>
              </div>

              <ImageFieldEditor 
                label="Nueva Fotografía del Artículo"
                value={quickImageNews.imageUrl || ""}
                onChange={(url) => setQuickImageNews((prev) => prev ? ({ ...prev, imageUrl: url }) : null)}
                aspectRatio="video"
                helperText="Sube una fotografía desde tu computadora o elige una de las opciones institucionales."
                presets={[
                  {
                    label: "Fachada CeCIP 25 de Mayo",
                    url: "https://i.postimg.cc/WpC996c2/cecip-fachada-r8rfoy7572gdw9e5kbngeimw58imq1bl0s153k6uq8.jpg"
                  },
                  {
                    label: "Reunión de Socios y Autoridades",
                    url: "/images/collaboration_meeting_1782854725514.jpg"
                  },
                  {
                    label: "Actividad Comercial Minorista",
                    url: "/images/dia_del_padre_1782854741068.jpg"
                  },
                  {
                    label: "Comercio y Turismo Paraná",
                    url: "/images/turismo_parana_1782854754924.jpg"
                  },
                  {
                    label: "Representantes y Prensa",
                    url: "/images/cecip_representatives_1782854765721.jpg"
                  }
                ]}
              />

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setQuickImageNews(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => handleSaveQuickNewsImage(quickImageNews.imageUrl || "")}
                  className="px-5 py-2 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl font-bold shadow-md shadow-cecip-blue/10 cursor-pointer text-xs"
                >
                  Guardar Fotografía de Noticia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

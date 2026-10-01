import React, { useState, useEffect } from "react";
import { ErpSocio, ErpCrmInteraction } from "../../types";
import { 
  Sparkles, Laptop, Palette, ShoppingCart, Phone, ArrowRight, Check, 
  Percent, Star, Globe, HelpCircle, FileText, CheckCircle2, AlertCircle, 
  MessageCircle, RefreshCw
} from "lucide-react";

interface ErpComerciaProps {
  socios: ErpSocio[];
  onSaveSocios: (updated: ErpSocio[]) => void;
  crm: ErpCrmInteraction[];
  onSaveCrm: (updated: ErpCrmInteraction[]) => void;
  role: string;
}

export default function ErpComercia({ socios, onSaveSocios, crm, onSaveCrm, role }: ErpComerciaProps) {
  // ----------------------------------------------------
  // 1. STATE FOR WEB SIMULATOR
  // ----------------------------------------------------
  const [comercioNombre, setComercioNombre] = useState("Paraná Pizza & Chop");
  const [comercioSlogan, setComercioSlogan] = useState("La mejor pizza a la piedra frente al río Paraná");
  const [rubro, setRubro] = useState("Gastronomía");
  const [palette, setPalette] = useState<"atardecer" | "rio" | "campo" | "tech" | "premium">("rio");
  const [layoutStyle, setLayoutStyle] = useState<"landing" | "catalog" | "tienda">("tienda");
  
  const [showGallery, setShowGallery] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  const [showWhatsapp, setShowWhatsapp] = useState(true);
  
  // Custom interactive features on simulator
  const [cartCount, setCartCount] = useState(0);
  const [simulatorToast, setSimulatorToast] = useState<string | null>(null);

  // ----------------------------------------------------
  // 2. STATE FOR COTIZADOR (BUDGET)
  // ----------------------------------------------------
  const [complexity, setComplexity] = useState<"landing" | "pyme" | "ecommerce" | "custom">("ecommerce");
  const [addonWhatsapp, setAddonWhatsapp] = useState(true);
  const [addonDomain, setAddonDomain] = useState(true);
  const [addonHosting, setAddonHosting] = useState(true);
  const [addonSeo, setAddonSeo] = useState(false);
  const [addonPayment, setAddonPayment] = useState(true);
  const [addonErp, setAddonErp] = useState(false);

  // ----------------------------------------------------
  // 3. STATE FOR FORM / LEAD GENERATION
  // ----------------------------------------------------
  const [selectedSocioId, setSelectedSocioId] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [userComments, setUserComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-fill form contacts if a socio is selected in the dropdown
  useEffect(() => {
    if (selectedSocioId) {
      const socio = socios.find(s => s.id === selectedSocioId);
      if (socio) {
        setComercioNombre(socio.nombreComercial);
        setContactEmail(socio.email);
        setContactPhone(socio.whatsapp);
        setComercioSlogan(`Servicios profesionales de ${socio.nombreComercial}`);
        // match rubro if possible
        if (["Gastronomía", "Indumentaria", "Servicios", "Construcción", "Salud"].includes(socio.rubro)) {
          setRubro(socio.rubro);
        } else {
          setRubro("Servicios");
        }
      }
    }
  }, [selectedSocioId, socios]);

  // Set default first socio if any
  useEffect(() => {
    const activeSocios = socios.filter(s => s.estado === "Activo");
    if (activeSocios.length > 0 && !selectedSocioId) {
      setSelectedSocioId(activeSocios[0].id);
    }
  }, [socios]);

  // Toast auto-clear for simulator
  const triggerSimulatorToast = (msg: string) => {
    setSimulatorToast(msg);
    setTimeout(() => {
      setSimulatorToast(null);
    }, 3500);
  };

  // Color Palette Definitions
  const paletteClasses = {
    atardecer: {
      primary: "bg-amber-600 hover:bg-amber-700 text-white",
      primaryText: "text-amber-600",
      primaryBorder: "border-amber-600",
      bgGradient: "from-amber-50 to-orange-100 dark:from-slate-900 dark:to-orange-950/20",
      cardHeader: "bg-gradient-to-r from-amber-500 to-orange-600 text-white",
      badge: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
      footer: "bg-slate-900 text-amber-100",
      textAccent: "text-orange-500"
    },
    rio: {
      primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
      primaryText: "text-indigo-600",
      primaryBorder: "border-indigo-600",
      bgGradient: "from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950/20",
      cardHeader: "bg-gradient-to-r from-blue-600 to-indigo-700 text-white",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
      footer: "bg-slate-900 text-blue-100",
      textAccent: "text-blue-500"
    },
    campo: {
      primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
      primaryText: "text-emerald-600",
      primaryBorder: "border-emerald-600",
      bgGradient: "from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-teal-950/20",
      cardHeader: "bg-gradient-to-r from-emerald-600 to-teal-700 text-white",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
      footer: "bg-slate-900 text-emerald-100",
      textAccent: "text-emerald-500"
    },
    tech: {
      primary: "bg-violet-600 hover:bg-violet-700 text-white",
      primaryText: "text-violet-600",
      primaryBorder: "border-violet-600",
      bgGradient: "from-violet-50 to-fuchsia-100 dark:from-slate-900 dark:to-fuchsia-950/20",
      cardHeader: "bg-gradient-to-r from-violet-600 to-fuchsia-700 text-white",
      badge: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
      footer: "bg-slate-900 text-violet-100",
      textAccent: "text-violet-500"
    },
    premium: {
      primary: "bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600",
      primaryText: "text-slate-800 dark:text-slate-200",
      primaryBorder: "border-slate-800 dark:border-slate-600",
      bgGradient: "from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800/40",
      cardHeader: "bg-gradient-to-r from-slate-700 to-slate-900 text-white",
      badge: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
      footer: "bg-slate-950 text-slate-300",
      textAccent: "text-slate-400"
    }
  };

  const currentTheme = paletteClasses[palette];

  // Pricing constants (ARS)
  const complexityPrices = {
    landing: 150000,
    pyme: 280000,
    ecommerce: 450000,
    custom: 650000
  };

  const complexityNames = {
    landing: "Landing Page / Ficha Simple",
    pyme: "Web Institucional Pyme (Multi-página)",
    ecommerce: "E-Commerce Completo con Carrito",
    custom: "Plataforma / App Web a Medida"
  };

  const addonPrices = {
    whatsapp: 20000,
    domain: 15000,
    hosting: 35000,
    seo: 25000,
    payment: 30000,
    erp: 40000
  };

  // Budget Calculations
  const getSubtotal = () => {
    let price = complexityPrices[complexity];
    if (addonWhatsapp) price += addonPrices.whatsapp;
    if (addonDomain) price += addonPrices.domain;
    if (addonHosting) price += addonPrices.hosting;
    if (addonSeo) price += addonPrices.seo;
    if (addonPayment) price += addonPrices.payment;
    if (addonErp) price += addonPrices.erp;
    return price;
  };

  const subtotal = getSubtotal();
  const discountRate = 0.25; // 25% discount for members
  const discountAmount = subtotal * discountRate;
  const finalPrice = subtotal - discountAmount;

  // Form submit handler
  const handleRequestQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSocioId) {
      alert("Por favor, seleccione un socio para asociar la solicitud ComercIA.");
      return;
    }
    
    setIsSubmitting(true);

    setTimeout(() => {
      // Find socio
      const partner = socios.find(s => s.id === selectedSocioId);
      if (partner) {
        // Construct detailed CRM log entry
        const addonsList: string[] = [];
        if (addonWhatsapp) addonsList.push("Botón WhatsApp");
        if (addonDomain) addonsList.push("Dominio .com.ar");
        if (addonHosting) addonsList.push("Alojamiento Web Anual");
        if (addonSeo) addonsList.push("Optimización SEO");
        if (addonPayment) addonsList.push("Pasarela de Pagos");
        if (addonErp) addonsList.push("Sincronización ERP CeCIP");

        const crmDetail = `[ComercIA ✨] Solicitud de cotización web:
• Tipo de Sitio: ${complexityNames[complexity]}
• Palette de Estilo Simulado: ${palette.toUpperCase()}
• Adicionales: ${addonsList.length > 0 ? addonsList.join(", ") : "Ninguno"}
• Presupuesto original: $${subtotal.toLocaleString("es-AR")}
• Descuento Socio CeCIP (-25%): -$${discountAmount.toLocaleString("es-AR")}
• Valor Estimado Final: $${finalPrice.toLocaleString("es-AR")}
• Comentarios adicionales del Socio: "${userComments || "Sin comentarios"}"
• Contacto: Email ${contactEmail} / Celular ${contactPhone}`;

        const newInteraction: ErpCrmInteraction = {
          id: `crm-${Date.now()}`,
          socioId: partner.id,
          socioNombre: partner.nombreComercial,
          fecha: new Date().toLocaleDateString("es-AR") + " " + new Date().toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' }),
          tipo: "Consulta",
          detalle: crmDetail,
          responsable: role === "Administrador General" ? "Ing. Carlos Rossi (Vía ComercIA)" : "Staff CeCIP",
          remitente: "ComercIA Inteligencia Digital",
          estado: "Pendiente",
          recordatorio: "Llamar al socio para ultimar detalles del sitio web y enviar contrato de desarrollo."
        };

        // Inject interaction
        onSaveCrm([newInteraction, ...crm]);

        // Add to socio's internal timeline as system record too
        const updatedSocios = socios.map(s => {
          if (s.id === partner.id) {
            return {
              ...s,
              timeline: [
                ...s.timeline,
                {
                  id: `t-comercia-${Date.now()}`,
                  titulo: "Solicitud ComercIA ✨",
                  descripcion: `Cotización solicitada: ${complexityNames[complexity]}. Final Socio: $${finalPrice.toLocaleString("es-AR")}.`,
                  fecha: new Date().toLocaleDateString("es-AR"),
                  tipo: "sistema" as const
                }
              ]
            };
          }
          return s;
        });

        onSaveSocios(updatedSocios);
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setUserComments("");
    }, 1200);
  };

  // Mock Products according to selected Rubro
  const getMockProducts = () => {
    switch (rubro) {
      case "Gastronomía":
        return [
          { name: "Promo Paraná Especial", desc: "Muzzarella, jamón, morrones y aceitunas negras.", price: "$8.500" },
          { name: "Pinta Artesanal Rubia", desc: "Elaborada localmente, bien helada.", price: "$3.200" },
          { name: "Empanadas Entrerrianas", desc: "De carne cortada a cuchillo con condimentos suaves (docena).", price: "$9.600" }
        ];
      case "Indumentaria":
        return [
          { name: "Tapado Litoral", desc: "Paño premium, ideal para el viento de la costanera.", price: "$65.000" },
          { name: "Camisa Oxford CeCIP", desc: "100% algodón, corte slim fit formal.", price: "$28.500" },
          { name: "Jeans Paraná Stretch", desc: "Máxima flexibilidad para el comercio diario.", price: "$32.000" }
        ];
      case "Servicios":
        return [
          { name: "Asesoría Contable Completa", desc: "Monotributistas y Pymes. Balances anuales.", price: "Consulte" },
          { name: "Diseño de Marca Corporativa", desc: "Logo, tipografía, paleta de colores y manual.", price: "$85.000" },
          { name: "Planificación de Marketing", desc: "Campañas mensuales en Facebook/Google Ads.", price: "$120.000/mes" }
        ];
      default:
        return [
          { name: "Servicio Estándar", desc: "Prestación básica de alta calidad.", price: "$15.000" },
          { name: "Pack Emprendedor CeCIP", desc: "Solución integral de inicio rápido.", price: "$45.000" },
          { name: "Consultoría Premium", desc: "Sesión personalizada de 2 horas con informes.", price: "$75.000" }
        ];
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* HEADER HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles size={160} className="text-indigo-400" />
        </div>
        
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles size={12} className="animate-pulse" />
            <span>NUEVA SOLUCIÓN GREMIAL</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Comerc<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">IA</span> Paraná
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Impulsamos la digitalización de nuestros asociados. Creamos sitios web corporativos, 
            tiendas virtuales y páginas profesionales auto-gestionables con la solidez y el soporte 
            de <span className="text-white font-bold">CeCIP Paraná</span>. ¡Y con un <span className="text-emerald-400 font-extrabold">25% de descuento exclusivo</span> en el desarrollo!
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-emerald-400">✔</span> 100% Optimizado para Móviles
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-emerald-400">✔</span> Autoadministrable sin código
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-emerald-400">✔</span> Soporte Directo de CeCIP
            </div>
          </div>
        </div>
      </div>

      {/* CORE GRID: SIMULATOR (LEFT & BOTTOM PREVIEW) & BUDGET CALCULATOR */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* INTERACTIVE WEB SIMULATOR (8 COLS) */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/60">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Laptop size={16} className="text-indigo-600" />
                  <span>1. Simulador Web Interactivo</span>
                </h3>
                <p className="text-[11px] text-slate-400">Personalice en tiempo real cómo luciría la página web de su comercio o empresa.</p>
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-900 font-mono px-2 py-1 rounded text-slate-500 font-bold">
                MOCK-UP VIRTUAL
              </span>
            </div>

            {/* SIMULATOR CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              
              {/* INPUTS ROW 1 */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Nombre del Comercio</label>
                <input 
                  type="text"
                  value={comercioNombre}
                  onChange={(e) => setComercioNombre(e.target.value)}
                  placeholder="ej: Tienda Paraná"
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Eslogan Principal</label>
                <input 
                  type="text"
                  value={comercioSlogan}
                  onChange={(e) => setComercioSlogan(e.target.value)}
                  placeholder="ej: Calidad y servicio"
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Rubro Comercial</label>
                <select
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="Gastronomía">Gastronomía</option>
                  <option value="Indumentaria">Indumentaria</option>
                  <option value="Servicios">Servicios</option>
                  <option value="General">Otros Rubros</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Paleta de Colores</label>
                <div className="flex gap-1.5 pt-1">
                  {[
                    { key: "rio", color: "bg-indigo-600", label: "Río" },
                    { key: "atardecer", color: "bg-amber-500", label: "Atardecer" },
                    { key: "campo", color: "bg-emerald-600", label: "Campo" },
                    { key: "tech", color: "bg-violet-600", label: "Tech" },
                    { key: "premium", color: "bg-slate-800", label: "Premium" }
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPalette(p.key as any)}
                      title={p.label}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${p.color} ${palette === p.key ? "ring-2 ring-indigo-500 ring-offset-2 scale-110" : "opacity-80 hover:opacity-100"}`}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* SIMULATOR LAYOUT CONTROLS AND INTERACTIVE SWITCHES */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block mb-1">Estructura del Sitio</span>
                <div className="flex bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLayoutStyle("landing")}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all text-[11px] cursor-pointer ${layoutStyle === "landing" ? "bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-white" : "text-slate-400"}`}
                  >
                    Landing Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutStyle("catalog")}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all text-[11px] cursor-pointer ${layoutStyle === "catalog" ? "bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-white" : "text-slate-400"}`}
                  >
                    Institucional con Catálogo
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutStyle("tienda")}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all text-[11px] cursor-pointer ${layoutStyle === "tienda" ? "bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-white" : "text-slate-400"}`}
                  >
                    Tienda Online (E-Commerce)
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-600 dark:text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={showGallery}
                    onChange={(e) => setShowGallery(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Galería de fotos</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-600 dark:text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={showReviews}
                    onChange={(e) => setShowReviews(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Opiniones Clientes</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-600 dark:text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={showWhatsapp}
                    onChange={(e) => setShowWhatsapp(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Botón WhatsApp</span>
                </label>
              </div>
            </div>

            {/* LIVE PREVIEW CONTAINER - DESKTOP BROWSER FRAME */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md overflow-hidden bg-slate-100 dark:bg-slate-900 flex flex-col">
              
              {/* BROWSER TOP BAR */}
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700/60 text-xs">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
                </div>
                <div className="flex-1 max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-1 px-3 rounded-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>https://www.{(comercioNombre || "mi-comercio").toLowerCase().replace(/[^a-z0-9]/g, "")}.com.ar</span>
                  <span>🔒 SSL</span>
                </div>
                <div className="text-slate-400 text-[10px] font-bold font-mono">
                  MÓVIL / ESCRITORIO OK
                </div>
              </div>

              {/* BROWSER LIVE CLIENT WINDOW */}
              <div className={`p-6 ${currentTheme.bgGradient} transition-all duration-300 min-h-[420px] relative overflow-hidden text-slate-800`}>
                
                {/* Simulated Custom Toast */}
                {simulatorToast && (
                  <div className="absolute top-4 left-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs font-bold animate-fade-in flex items-center gap-2">
                    <span className="text-emerald-400">⚡</span>
                    <span>{simulatorToast}</span>
                  </div>
                )}

                {/* Simulated Web Header */}
                <header className="flex justify-between items-center pb-4 border-b border-slate-200/50 mb-6">
                  <div className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-md ${currentTheme.primary} inline-block`} />
                    <span>{comercioNombre || "Nombre del Comercio"}</span>
                  </div>
                  
                  <nav className="hidden sm:flex items-center gap-4 text-[11px] font-bold text-slate-600">
                    <span className="hover:text-slate-900 cursor-pointer">Inicio</span>
                    {layoutStyle !== "landing" && <span className="hover:text-slate-900 cursor-pointer">Productos</span>}
                    <span className="hover:text-slate-900 cursor-pointer">Nosotros</span>
                    <span className="hover:text-slate-900 cursor-pointer">Contacto</span>
                  </nav>

                  <div className="flex items-center gap-2">
                    {layoutStyle === "tienda" && (
                      <button 
                        onClick={() => triggerSimulatorToast("Simulador: Abriste el carrito de compras con tus artículos elegidos.")}
                        className="p-1.5 bg-white dark:bg-slate-800/80 rounded-lg shadow-sm border border-slate-200/40 relative cursor-pointer"
                      >
                        <ShoppingCart size={14} className="text-slate-700 dark:text-slate-300" />
                        {cartCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </button>
                    )}
                    <button 
                      onClick={() => triggerSimulatorToast(`Simulador: Contacto con ${comercioNombre}`)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${currentTheme.primary} cursor-pointer`}
                    >
                      Contacto
                    </button>
                  </div>
                </header>

                {/* Simulated Web Hero Section */}
                <section className="text-center py-6 max-w-xl mx-auto space-y-3 animate-fade-in">
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${currentTheme.badge}`}>
                    {rubro}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {comercioSlogan || "Escribe el eslogan de tu negocio..."}
                  </h1>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    Conozca nuestra amplia variedad de productos y servicios de alta calidad. 
                    Atención personalizada y entregas inmediatas en todo Paraná y zona de influencia.
                  </p>
                  
                  <div className="pt-2 flex justify-center gap-2">
                    <button 
                      onClick={() => triggerSimulatorToast("Simulador: Botón de acción principal clickeado.")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 ${currentTheme.primary}`}
                    >
                      <span>Ver Catálogo</span>
                      <ArrowRight size={12} />
                    </button>
                    <button 
                      onClick={() => triggerSimulatorToast("Simulador: Botón de información secundario clickeado.")}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white/80 border border-slate-200/60 hover:bg-white text-slate-700 shadow-sm cursor-pointer"
                    >
                      Saber Más
                    </button>
                  </div>
                </section>

                {/* Simulated Interactive Catalog / Shopping Cards */}
                {layoutStyle !== "landing" && (
                  <section className="mt-8 space-y-3.5">
                    <h3 className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">
                      Nuestras Especialidades
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {getMockProducts().map((prod, idx) => (
                        <div key={idx} className="bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200/40 shadow-sm flex flex-col justify-between text-left">
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-slate-900">{prod.name}</h4>
                            <p className="text-[10px] text-slate-400 leading-snug">{prod.desc}</p>
                          </div>
                          <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center">
                            <span className="font-extrabold text-xs text-slate-900">{prod.price}</span>
                            
                            {layoutStyle === "tienda" ? (
                              <button
                                onClick={() => {
                                  setCartCount(prev => prev + 1);
                                  triggerSimulatorToast(`Simulado: Añadiste "${prod.name}" al carrito.`);
                                }}
                                className={`px-2 py-1 rounded text-[9.5px] font-bold text-white cursor-pointer ${currentTheme.primary}`}
                              >
                                + Agregar
                              </button>
                            ) : (
                              <button
                                onClick={() => triggerSimulatorToast(`Simulado: Consultando por "${prod.name}".`)}
                                className={`px-2 py-1 rounded text-[9.5px] font-semibold bg-slate-100 text-slate-700 cursor-pointer`}
                              >
                                Consultar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Simulated Image Gallery Placeholder */}
                {showGallery && (
                  <section className="mt-8 space-y-3.5 text-left">
                    <h3 className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">
                      Instalaciones y Local
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { title: "Atención", sub: "Mostrador Paraná" },
                        { title: "Calidad", sub: "Control Gremial" },
                        { title: "Logística", sub: "Envío Seguro" },
                        { title: "Equipo", sub: "Socio CeCIP" }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-200/60 dark:bg-slate-800/40 aspect-video rounded-lg relative overflow-hidden group border border-slate-300/30 flex items-center justify-center">
                          <div className="text-center p-2">
                            <span className="block text-[10px] font-extrabold text-slate-700">{item.title}</span>
                            <span className="block text-[8px] text-slate-400">{item.sub}</span>
                          </div>
                          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Simulated Customer Reviews */}
                {showReviews && (
                  <section className="mt-8 pt-6 border-t border-slate-200/40 text-left">
                    <h3 className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 mb-3 flex items-center gap-1">
                      <Star size={11} className="text-yellow-500 fill-yellow-500" />
                      <span>Opiniones de Paraná</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px]">
                      <div className="bg-white/70 p-3 rounded-lg border border-slate-200/30">
                        <p className="italic text-slate-600">"¡Excelente atención comercial y el sitio web carga rapidísimo! Gran trabajo."</p>
                        <div className="mt-1.5 flex justify-between font-bold text-slate-500">
                          <span>- Viviana R. (Paraná Centro)</span>
                          <span className="text-yellow-500">★★★★★</span>
                        </div>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg border border-slate-200/30">
                        <p className="italic text-slate-600">"Súper cómodo hacer el pedido online y coordinar por WhatsApp al instante."</p>
                        <div className="mt-1.5 flex justify-between font-bold text-slate-500">
                          <span>- Marcelo T. (Paraná Norte)</span>
                          <span className="text-yellow-500">★★★★★</span>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Simulated Footer */}
                <footer className={`mt-8 -mx-6 -mb-6 p-4 text-center text-[9px] ${currentTheme.footer} border-t border-slate-800/50`}>
                  <div className="flex justify-between items-center flex-col sm:flex-row gap-2">
                    <span>© {new Date().getFullYear()} {comercioNombre || "Tu Comercio"} - Paraná, Entre Ríos.</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      🔒 Hecho por <span className="text-indigo-400 font-bold">ComercIA</span> de CeCIP
                    </span>
                  </div>
                </footer>

                {/* FLOATING WHATSAPP BUTTON */}
                {showWhatsapp && (
                  <button
                    onClick={() => triggerSimulatorToast(`Simulado: Un cliente presionó el botón de WhatsApp para chatear con ${comercioNombre}.`)}
                    className="absolute bottom-6 right-6 w-11 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer z-40"
                    title="Chatear con el comercio"
                  >
                    <MessageCircle size={22} className="fill-white" />
                  </button>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* SMART BUDGET BUILDER & ACTION LEAD FORM (4 COLS) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* SMART BUDGET BUILDER CARD */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <Percent size={16} className="text-emerald-500" />
              <span>2. Cotizador Inteligente ComercIA</span>
            </h3>

            {/* SITE COMPLEXITY TABS */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Complejidad de Desarrollo</span>
              
              <div className="space-y-2">
                {[
                  { key: "landing", label: "Landing / Ficha", desc: "Monopágina, ideal para lanzamientos.", price: "$150.000" },
                  { key: "pyme", label: "Institucional", desc: "Hasta 5 secciones auto-gestionables.", price: "$280.000" },
                  { key: "ecommerce", label: "E-Commerce", desc: "Carrito, pasarela y catálogo.", price: "$450.000" },
                  { key: "custom", label: "App Web", desc: "Plataforma a medida, bases de datos.", price: "$650.000" }
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => setComplexity(item.key as any)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center text-xs ${complexity === item.key ? "bg-indigo-50/50 dark:bg-slate-900 border-indigo-500 ring-1 ring-indigo-500" : "bg-slate-50 dark:bg-slate-900 hover:bg-slate-100/50 border-slate-200 dark:border-slate-700"}`}
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800 dark:text-slate-100 block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                    </div>
                    <span className="font-extrabold text-indigo-600 dark:text-blue-300 text-xs shrink-0">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ADD-ONS CHECKBOXES */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Módulos de Valor Agregado</span>
              
              <div className="grid grid-cols-1 gap-2 text-xs">
                {[
                  { checked: addonWhatsapp, set: setAddonWhatsapp, label: "Botón Inteligente WhatsApp", price: "$20.000" },
                  { checked: addonDomain, set: setAddonDomain, label: "Registro de Dominio (.com.ar)", price: "$15.000" },
                  { checked: addonHosting, set: setAddonHosting, label: "Alojamiento Cloud Anual + Email", price: "$35.000" },
                  { checked: addonSeo, set: setAddonSeo, label: "SEO Básico + Google Maps", price: "$25.000" },
                  { checked: addonPayment, set: setAddonPayment, label: "Integración de Pagos Online", price: "$30.000" },
                  { checked: addonErp, set: setAddonErp, label: "Sincronización con ERP CeCIP", price: "$40.000" }
                ].map((addon, index) => (
                  <div 
                    key={index}
                    onClick={() => addon.set(!addon.checked)}
                    className={`p-2.5 rounded-lg border flex justify-between items-center cursor-pointer transition-colors ${addon.checked ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700" : "bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${addon.checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"}`}>
                        {addon.checked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="font-medium text-slate-600 dark:text-slate-300">{addon.label}</span>
                    </div>
                    <span className="font-bold text-slate-500 text-[11px] font-mono">+{addon.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CALCULATED VALUE CONTAINER */}
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 text-xs space-y-3 shadow-inner">
              <div className="flex justify-between items-center text-slate-400">
                <span>Subtotal Desarrollo:</span>
                <span className="font-mono text-[11px] font-bold line-through">${subtotal.toLocaleString("es-AR")}</span>
              </div>
              
              <div className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <span className="flex items-center gap-1">
                  🏷️ Beneficio CeCIP Partner:
                </span>
                <span className="font-mono">-25% (-${discountAmount.toLocaleString("es-AR")})</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">TOTAL DESARROLLO</span>
                  <span className="text-white text-[9px]">Soporte y Garantía Incluidos</span>
                </div>
                <span className="text-xl font-black text-white font-mono leading-none">
                  ${finalPrice.toLocaleString("es-AR")}
                </span>
              </div>
            </div>

          </div>

          {/* REQUEST FORM / LEAD TO ERP DATABASE */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <FileText size={16} className="text-indigo-600" />
              <span>3. Solicitar Asesoramiento</span>
            </h3>

            {submitSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl space-y-3.5 text-center text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex justify-center text-emerald-500">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="font-bold text-sm">¡Solicitud Registrada con Éxito!</h4>
                <p className="leading-relaxed">
                  Hemos registrado la solicitud Comercial del socio directamente en el sistema ERP/CRM. 
                  Un especialista en tecnología se comunicará a la brevedad.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Nueva Simulación ComercIA
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestQuote} className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold block">Socio Solicitante *</label>
                  <select
                    required
                    value={selectedSocioId}
                    onChange={(e) => setSelectedSocioId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white font-semibold"
                  >
                    <option value="" disabled>Seleccione el Socio...</option>
                    {socios.filter(s => s.estado === "Activo").map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombreComercial} ({s.razonSocial})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">Email de Contacto</label>
                    <input 
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="ej: contacto@empresa.com"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">WhatsApp / Celular</label>
                    <input 
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="ej: 3434551122"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold block">Comentarios o Idea Especial</label>
                  <textarea 
                    rows={3}
                    value={userComments}
                    onChange={(e) => setUserComments(e.target.value)}
                    placeholder="Cuéntanos más sobre el estilo o requerimientos adicionales que deseas para tu sitio web..."
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-start gap-2 text-[10.5px] text-amber-700 dark:text-amber-400">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>
                    <strong>Impacto en ERP:</strong> Al enviar, se creará un registro de gestión comercial <strong>Pendiente</strong> en la ficha CRM del socio seleccionado, y se agregará al legajo oficial para su seguimiento.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedSocioId}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Registrando solicitud...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} fill="currentColor" />
                      <span>Enviar Solicitud ComercIA</span>
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

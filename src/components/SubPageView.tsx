import React, { useState, useMemo } from "react";
import { 
  Building2, Search, CheckCircle2, ChevronRight, ArrowLeft,
  MapPin, Phone, Mail, ExternalLink, Filter, Layers, Users, Calendar, Award
} from "lucide-react";
import { CECIP_AUTORIDADES } from "../data/autoridadesData";
import { ALL_CECIP_SOCIOS } from "../data/sociosData";
import { ErpSocio } from "../types";

export interface SubPageViewProps {
  pageTitle: string;
  categoryName?: string;
  badge?: string;
  description?: string;
  additionalInfo?: string;
  itemsList?: string[];
  newsItem?: {
    id: string;
    title: string;
    date: string;
    category: string;
    badge: string;
    description: string;
    additionalInfo?: string;
    imageUrl?: string;
    itemsList?: string[];
  } | null;
  onBackToHome: () => void;
  onSelectSocio?: (socio: ErpSocio) => void;
  onOpenAsociateModal?: () => void;
}

export default function SubPageView({
  pageTitle,
  categoryName,
  badge,
  description,
  additionalInfo,
  itemsList,
  newsItem,
  onBackToHome,
  onSelectSocio,
  onOpenAsociateModal
}: SubPageViewProps) {
  // State for Comercios directory when viewed as a tab
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRubro, setSelectedRubro] = useState<string>("Todos");
  const [selectedDetailSocio, setSelectedDetailSocio] = useState<ErpSocio | null>(null);

  const isAutoridades = pageTitle.toLowerCase().includes("autoridad");
  const isComercios = pageTitle.toLowerCase().includes("comercio") && pageTitle.toLowerCase().includes("asociado");
  const isNews = !!newsItem;

  // Rubros calculation for Comercios Asociados
  const rubrosList = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_CECIP_SOCIOS.forEach((s) => {
      const r = s.rubro || "Otros";
      counts[r] = (counts[r] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return [{ name: "Todos", count: ALL_CECIP_SOCIOS.length }, ...sorted.map(([name, count]) => ({ name, count }))];
  }, []);

  const filteredSocios = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return ALL_CECIP_SOCIOS.filter((s) => {
      const matchesSearch = 
        !query ||
        s.nombreComercial?.toLowerCase().includes(query) ||
        s.razonSocial?.toLowerCase().includes(query) ||
        s.rubro?.toLowerCase().includes(query) ||
        s.direccion?.toLowerCase().includes(query) ||
        s.cuit?.toLowerCase().includes(query);

      const matchesRubro = selectedRubro === "Todos" || s.rubro === selectedRubro;
      return matchesSearch && matchesRubro;
    });
  }, [searchTerm, selectedRubro]);

  // Group authorities
  const presidencia = useMemo(() => CECIP_AUTORIDADES.filter(a => a.level === "presidencia"), []);
  const mesa = useMemo(() => CECIP_AUTORIDADES.filter(a => a.level === "mesa"), []);
  const vocales = useMemo(() => CECIP_AUTORIDADES.filter(a => a.level === "vocales"), []);
  const revisores = useMemo(() => CECIP_AUTORIDADES.filter(a => a.level === "revisores"), []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 1. Subheader Bar (Breadcrumbs matching official CeCIP website) */}
      <div className="bg-[#f0f8fc] border-b border-sky-100/70 py-5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Left: | Page Title */}
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#00a3e0] rounded-full inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#00a3e0] tracking-tight">
              {pageTitle}
            </h1>
          </div>

          {/* Right: Home > Page Title */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <button 
              onClick={onBackToHome}
              className="text-[#00a3e0] hover:text-[#0c2356] hover:underline cursor-pointer transition-colors"
            >
              Home
            </button>
            <span className="text-slate-400 font-normal">&gt;</span>
            <span className="text-slate-600 font-medium">{pageTitle}</span>
          </div>

        </div>
      </div>

      {/* 2. Main Tab/Page Content */}
      <main className="flex-1">

        {/* --- CASE A: AUTORIDADES (Matches exact layout from screenshot) --- */}
        {isAutoridades && (
          <div className="max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
            {/* Centered cyan section title */}
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#00a3e0] text-center mb-16 tracking-tight">
              Comisión directiva
            </h2>

            {/* Row 1: Presidencia (Mauricio Benitende & Victor E. Bejar) */}
            <div className="flex flex-wrap justify-center gap-12 sm:gap-24 mb-16">
              {presidencia.map((m) => (
                <div key={m.name} className="text-center min-w-[240px]">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{m.name}</h3>
                  <p className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider mt-1">{m.role}</p>
                  {m.company && (
                    <p className="text-xs text-slate-500 mt-1">({m.company})</p>
                  )}
                </div>
              ))}
            </div>

            {/* Row 2: Mesa Ejecutiva (Secretario, Prosecretario, Tesorero, Protesorero) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16 text-center max-w-5xl mx-auto">
              {mesa.map((m) => (
                <div key={m.name} className="text-center">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{m.name}</h3>
                  <p className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider mt-1">{m.role}</p>
                  {m.company && (
                    <p className="text-xs text-slate-500 mt-1">({m.company})</p>
                  )}
                </div>
              ))}
            </div>

            {/* Row 3: Vocales Titulares y Suplentes (6 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16 text-center">
              {vocales.map((m) => (
                <div key={m.name} className="text-center">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{m.name}</h3>
                  <p className="text-xs font-semibold text-[#00a3e0] mt-1">{m.role}</p>
                  {m.company && (
                    <p className="text-xs text-slate-500 mt-0.5">({m.company})</p>
                  )}
                </div>
              ))}
            </div>

            {/* Row 4: Revisores de Cuentas (David Bresler & Esteban A. Enrique) */}
            <div className="flex flex-wrap justify-center gap-12 sm:gap-24 text-center">
              {revisores.map((m) => (
                <div key={m.name} className="text-center min-w-[220px]">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{m.name}</h3>
                  <p className="text-xs font-semibold text-[#00a3e0] mt-1">{m.role}</p>
                  {m.company && (
                    <p className="text-xs text-slate-500 mt-0.5">({m.company})</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- CASE B: COMERCIOS ASOCIADOS (Full-page interactive tab) --- */}
        {isComercios && (
          <div className="max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full inline-block mb-2">
                  Padrón Oficial CeCIP
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Comercios e Industrias Asociadas
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Guía completa de las {ALL_CECIP_SOCIOS.length} empresas y pymes que impulsan la economía de Paraná.
                </p>
              </div>

              {onOpenAsociateModal && (
                <button
                  onClick={onOpenAsociateModal}
                  className="px-5 py-2.5 bg-[#00a3e0] hover:bg-[#0c2356] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer self-start md:self-auto"
                >
                  Sumar mi Empresa
                </button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar por nombre de fantasía, razón social, rubro, CUIT o calle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3e0] transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Rubros tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {rubrosList.slice(0, 12).map((r) => (
                  <button
                    key={r.name}
                    onClick={() => setSelectedRubro(r.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRubro === r.name
                        ? "bg-[#00a3e0] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {r.name} ({r.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid - responsive 1 col on mobile, 2 on tablet, 3 on desktop, 4 on wide desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pt-4">
              {filteredSocios.map((socio) => (
                <div
                  key={socio.id}
                  onClick={() => setSelectedDetailSocio(socio)}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#00a3e0] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#00a3e0] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        {socio.rubro || "Comercio"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {socio.cuit}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {socio.nombreComercial || socio.razonSocial}
                    </h4>
                    {socio.nombreComercial && socio.razonSocial && socio.nombreComercial !== socio.razonSocial && (
                      <p className="text-xs text-slate-500 font-medium">
                        {socio.razonSocial}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{socio.direccion}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Socio Activo</span>
                    <span className="text-[#00a3e0] font-bold">Ver ficha →</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredSocios.length === 0 && (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-600 font-semibold">No se encontraron comercios con ese criterio</p>
                <button 
                  onClick={() => { setSearchTerm(""); setSelectedRubro("Todos"); }}
                  className="mt-3 text-xs text-[#00a3e0] font-bold hover:underline cursor-pointer"
                >
                  Restablecer filtros
                </button>
              </div>
            )}

            {/* Socio Detail Dialog */}
            {selectedDetailSocio && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded">
                        {selectedDetailSocio.rubro}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-2">
                        {selectedDetailSocio.nombreComercial || selectedDetailSocio.razonSocial}
                      </h3>
                      {selectedDetailSocio.razonSocial && (
                        <p className="text-xs text-slate-500 mt-0.5">{selectedDetailSocio.razonSocial}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => setSelectedDetailSocio(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                      <MapPin size={15} className="text-[#00a3e0]" />
                      <span>{selectedDetailSocio.direccion} &bull; Paraná, Entre Ríos</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                      <Building2 size={15} className="text-[#00a3e0]" />
                      <span>CUIT: {selectedDetailSocio.cuit}</span>
                    </div>
                    {selectedDetailSocio.whatsapp && (
                      <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                        <Phone size={15} className="text-[#00a3e0]" />
                        <span>WhatsApp / Tel: {selectedDetailSocio.whatsapp}</span>
                      </div>
                    )}
                    {selectedDetailSocio.email && (
                      <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                        <Mail size={15} className="text-[#00a3e0]" />
                        <span>Email: {selectedDetailSocio.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedDetailSocio(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Cerrar
                    </button>
                    {selectedDetailSocio.whatsapp && (
                      <a
                        href={`https://wa.me/549${selectedDetailSocio.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                      >
                        Contactar WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* --- CASE C: NOTICIAS DETAIL --- */}
        {isNews && newsItem && (
          <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  {newsItem.badge || "Comunicado Oficial"}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {newsItem.date}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {newsItem.title}
              </h2>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Categoría: {newsItem.category}
              </p>
            </div>

            {newsItem.imageUrl && (
              <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-md bg-slate-100">
                <img 
                  src={newsItem.imageUrl} 
                  alt={newsItem.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="prose prose-slate max-w-none space-y-6 text-slate-700 text-base leading-relaxed font-medium">
              <p>{newsItem.description}</p>
              {newsItem.additionalInfo && (
                <p className="bg-slate-50 p-6 rounded-2xl border-l-4 border-[#00a3e0] text-slate-800 italic">
                  {newsItem.additionalInfo}
                </p>
              )}
            </div>

            {newsItem.itemsList && newsItem.itemsList.length > 0 && (
              <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Puntos Clave y Ejes Principales
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {newsItem.itemsList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                      <span className="text-[#00a3e0] font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Volver al Inicio</span>
              </button>

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-xs text-[#00a3e0] font-bold hover:underline cursor-pointer"
              >
                Subir al inicio ↑
              </button>
            </div>
          </div>
        )}

        {/* --- CASE D: INSTITUTIONAL / CAMARAS / ENTIDADES / BENEFICIOS DETAILS --- */}
        {!isAutoridades && !isComercios && !isNews && (
          <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
            
            <div className="space-y-4">
              {badge && (
                <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-widest bg-blue-50 px-3.5 py-1 rounded-full inline-block">
                  {badge}
                </span>
              )}
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {pageTitle}
              </h2>
              {categoryName && (
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Área: {categoryName} &bull; CeCIP Paraná
                </p>
              )}
            </div>

            {/* Description */}
            <div className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal space-y-6">
              <p className="text-slate-800 leading-relaxed font-medium">
                {description}
              </p>
              {additionalInfo && (
                <div className="bg-sky-50/40 p-6 rounded-2xl border border-sky-100 text-slate-700 text-sm leading-relaxed">
                  {additionalInfo}
                </div>
              )}
            </div>

            {/* Items List */}
            {itemsList && itemsList.length > 0 && (
              <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Ejes de Acción y Servicios Vinculados
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {itemsList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                      <span className="text-[#00a3e0] font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Card */}
            <div className="p-8 bg-gradient-to-r from-[#071738] to-[#152e6b] rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">¿Deseas participar o consultar sobre esta área?</h3>
                <p className="text-xs text-slate-300">
                  Nuestras puertas están abiertas para todos los comerciantes, industriales y profesionales de Paraná.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={onBackToHome}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Volver al Inicio
                </button>
                {onOpenAsociateModal && (
                  <button
                    onClick={onOpenAsociateModal}
                    className="px-5 py-2.5 bg-[#00a3e0] hover:bg-[#0c2356] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Asociarse Hoy
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

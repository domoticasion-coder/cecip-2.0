import React, { useState, useMemo } from "react";
import { 
  Search, Building2, MapPin, Phone, Mail, X, 
  ExternalLink, CheckCircle2, Filter, Layers, Globe, MessageSquare
} from "lucide-react";
import { ALL_CECIP_SOCIOS } from "../data/sociosData";
import { ErpSocio } from "../types";

interface ComerciosAsociadosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSocio?: (socio: ErpSocio) => void;
}

export default function ComerciosAsociadosModal({
  isOpen,
  onClose,
  onSelectSocio
}: ComerciosAsociadosModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRubro, setSelectedRubro] = useState<string>("Todos");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("Todas");
  const [selectedDetailSocio, setSelectedDetailSocio] = useState<ErpSocio | null>(null);

  // Extract unique rubros and count
  const rubrosList = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_CECIP_SOCIOS.forEach((s) => {
      const r = s.rubro || "Otros";
      counts[r] = (counts[r] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return [{ name: "Todos", count: ALL_CECIP_SOCIOS.length }, ...sorted.map(([name, count]) => ({ name, count }))];
  }, []);

  // Filter socios
  const filteredSocios = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return ALL_CECIP_SOCIOS.filter((s) => {
      const matchesSearch = 
        !query ||
        s.nombreComercial?.toLowerCase().includes(query) ||
        s.razonSocial?.toLowerCase().includes(query) ||
        s.rubro?.toLowerCase().includes(query) ||
        s.direccion?.toLowerCase().includes(query) ||
        s.cuit?.toLowerCase().includes(query) ||
        s.observaciones?.toLowerCase().includes(query);

      const matchesRubro = selectedRubro === "Todos" || s.rubro === selectedRubro;
      const matchesCat = selectedCategoria === "Todas" || s.categoria === selectedCategoria;

      return matchesSearch && matchesRubro && matchesCat;
    });
  }, [searchTerm, selectedRubro, selectedCategoria]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-white w-full max-w-6xl h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
      >
        {/* Header Bar */}
        <div className="bg-[#071738] text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a3e0] flex items-center justify-center text-white shadow-md">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">Comercios Asociados a CeCIP</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] text-xs font-bold">
                  {ALL_CECIP_SOCIOS.length} empresas
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Padrón activo oficial del Centro Comercial e Industrial de Paraná, Entre Ríos
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="self-end sm:self-center p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Buscar por nombre comercial, razón social, CUIT, rubro o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00a3e0] focus:ring-2 focus:ring-[#00a3e0]/20 shadow-2xs transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#00a3e0] shadow-2xs cursor-pointer"
              >
                <option value="Todas">Todas las Categorías</option>
                <option value="Pequeño Comercio">Pequeño Comercio</option>
                <option value="Mediana Empresa">Mediana Empresa</option>
                <option value="Gran Industria">Gran Industria</option>
              </select>

              {(searchTerm || selectedRubro !== "Todos" || selectedCategoria !== "Todas") && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRubro("Todos");
                    setSelectedCategoria("Todas");
                  }}
                  className="px-3 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Quick Rubros Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter size={12} /> Rubros:
            </span>
            {rubrosList.slice(0, 10).map((r) => {
              const isSelected = selectedRubro === r.name;
              return (
                <button
                  key={r.name}
                  onClick={() => setSelectedRubro(r.name)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected 
                      ? "bg-[#00a3e0] text-white shadow-xs font-semibold" 
                      : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200"
                  }`}
                >
                  {r.name} <span className={`text-[10px] ml-1 ${isSelected ? "text-white/80" : "text-slate-400"}`}>({r.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Socios Grid View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          <div className="max-w-6xl mx-auto space-y-4">
            
            <div className="flex justify-between items-center text-xs text-slate-500 px-1">
              <span>Mostrando <strong>{filteredSocios.length}</strong> de <strong>{ALL_CECIP_SOCIOS.length}</strong> comercios asociados</span>
              {selectedRubro !== "Todos" && <span className="font-medium text-[#00a3e0]">Filtro: {selectedRubro}</span>}
            </div>

            {filteredSocios.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                <Building2 size={40} className="mx-auto text-slate-300" />
                <h4 className="text-base font-bold text-slate-700">No se encontraron comercios</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Prueba modificando los términos de búsqueda o quitando los filtros de rubro y categoría.
                </p>
                <button 
                  onClick={() => { setSearchTerm(""); setSelectedRubro("Todos"); setSelectedCategoria("Todas"); }}
                  className="px-4 py-2 bg-[#00a3e0] text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Ver todos los comercios
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSocios.map((socio) => (
                  <div 
                    key={socio.id}
                    onClick={() => setSelectedDetailSocio(socio)}
                    className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-[#00a3e0]/50 transition-all flex flex-col justify-between cursor-pointer group text-left relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      
                      {/* Top Bar in Card: Category and Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100 truncate max-w-[170px]">
                          {socio.rubro || "Comercio"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                          <CheckCircle2 size={11} />
                          <span>Socio Activo</span>
                        </div>
                      </div>

                      {/* Main Titles */}
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-[#00a3e0] transition-colors line-clamp-1">
                          {socio.nombreComercial || socio.razonSocial}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {socio.razonSocial}
                        </p>
                      </div>

                      {/* Quick Details */}
                      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        {socio.direccion && (
                          <div className="flex items-start gap-2">
                            <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                            <span className="truncate">{socio.direccion}</span>
                          </div>
                        )}
                        {socio.whatsapp && (
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-slate-400 shrink-0" />
                            <span>{socio.whatsapp}</span>
                          </div>
                        )}
                        {socio.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate">{socio.email}</span>
                          </div>
                        )}
                        {socio.cuit && (
                          <div className="text-[10px] font-mono text-slate-400">
                            CUIT: {socio.cuit}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#00a3e0]">
                      <span>Ver ficha institucional</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 text-xs text-slate-500">
          <span>Comercios, Industrias y Servicios Adheridos al CeCIP Paraná</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Single Socio Detail Modal Overlay */}
        {selectedDetailSocio && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 text-left relative transition-all duration-150"
            >
              <button 
                onClick={() => setSelectedDetailSocio(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X size={18} />
              </button>

              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#00a3e0] flex items-center justify-center font-bold text-lg shrink-0">
                  🏢
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Socio Adherido Oficial
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedDetailSocio.nombreComercial || selectedDetailSocio.razonSocial}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedDetailSocio.razonSocial}</p>
                </div>
              </div>

              <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl text-xs text-slate-700 border border-slate-100">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-500">Rubro:</span>
                  <span className="font-medium text-slate-800">{selectedDetailSocio.rubro}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-500">Categoría:</span>
                  <span className="font-medium text-slate-800">{selectedDetailSocio.categoria || "Comercio"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-500">CUIT:</span>
                  <span className="font-mono text-slate-800">{selectedDetailSocio.cuit}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-500">Dirección:</span>
                  <span className="font-medium text-slate-800 text-right">{selectedDetailSocio.direccion || "Paraná, Entre Ríos"}</span>
                </div>
                {selectedDetailSocio.whatsapp && (
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-500">Teléfono / WSP:</span>
                    <a href={`https://wa.me/549${selectedDetailSocio.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="font-medium text-[#00a3e0] hover:underline">
                      {selectedDetailSocio.whatsapp}
                    </a>
                  </div>
                )}
                {selectedDetailSocio.email && (
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-slate-500">E-mail:</span>
                    <a href={`mailto:${selectedDetailSocio.email}`} className="font-medium text-[#00a3e0] hover:underline">
                      {selectedDetailSocio.email}
                    </a>
                  </div>
                )}
              </div>

              {selectedDetailSocio.observaciones && (
                <p className="text-xs text-slate-600 italic bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                  "{selectedDetailSocio.observaciones}"
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={() => setSelectedDetailSocio(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Volver al listado
                </button>
                {selectedDetailSocio.whatsapp && (
                  <a 
                    href={`https://wa.me/549${selectedDetailSocio.whatsapp.replace(/\D/g, '')}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare size={14} /> Contactar por WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

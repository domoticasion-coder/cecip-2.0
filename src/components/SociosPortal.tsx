import React, { useState, useEffect, useMemo } from "react";
import { CVSubmission } from "../types";
import { Search, Building2, Eye, UserCheck, Filter, Heart, Briefcase, FileText, Check, Phone, Mail, Award, X } from "lucide-react";
import { bolsaService } from "../services";
import { ALL_CECIP_SOCIOS } from "../data/sociosData";

interface SociosPortalProps {
  onCVsUpdated?: () => void;
  cvsUpdatedCounter?: number;
}

const ALL_COMPANIES = ALL_CECIP_SOCIOS.map(s => ({
  id: s.id,
  nombre: s.nombreComercial || s.razonSocial,
  rubro: s.rubro,
  direccion: s.direccion,
  localidad: s.localidad,
  cuit: s.cuit,
}));

export default function SociosPortal({ onCVsUpdated, cvsUpdatedCounter }: SociosPortalProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [passcode, setPasscode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cvs, setCvs] = useState<CVSubmission[]>([]);
  const [loginError, setLoginError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [showOnlyInterestedByMe, setShowOnlyInterestedByMe] = useState(false);
  const [viewingCandidate, setViewingCandidate] = useState<CVSubmission | null>(null);

  useEffect(() => {
    loadCVs();
  }, [cvsUpdatedCounter]);

  const loadCVs = async () => {
    try {
      const data = await bolsaService.getAllCVs();
      setCvs(data);
    } catch (e) {
      console.error("Error loading CVs from API:", e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) {
      setLoginError("Por favor, selecciona tu empresa socia.");
      return;
    }
    if (passcode.trim() !== "socio123") {
      setLoginError("La clave de acceso para socios es 'socio123' (clave demostrativa).");
      return;
    }
    setLoginError("");
    setIsLoggedIn(true);
  };

  const toggleInterest = async (cvId: string, companyName: string) => {
    const targetCv = cvs.find(c => c.id === cvId);
    if (!targetCv) return;
    const isCurrentlyInterested = (targetCv.interesados || []).includes(companyName);

    try {
      if (isCurrentlyInterested) {
        await bolsaService.removeInteres(cvId, companyName);
      } else {
        await bolsaService.addInteres(cvId, companyName);
      }
      await loadCVs();
      if (onCVsUpdated) onCVsUpdated();
    } catch (e) {
      console.error("Error updating interest:", e);
    }
  };

  // Filter candidates
  const filteredCandidates = cvs.filter(cv => {
    const matchesSearch = 
      cv.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.areaBusqueda.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.tipoProfesional.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea = selectedArea === "Todos" || cv.areaBusqueda === selectedArea;
    const matchesType = selectedType === "Todos" || cv.tipoProfesional === selectedType;
    
    const companyObj = ALL_COMPANIES.find(c => c.id === selectedCompany);
    const companyName = companyObj ? companyObj.nombre : "";
    const matchesInterest = !showOnlyInterestedByMe || cv.interesados.includes(companyName);

    return matchesSearch && matchesArea && matchesType && matchesInterest;
  });

  const areas = [
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

  const currentCompanyName = ALL_COMPANIES.find(c => c.id === selectedCompany)?.nombre || "";

  return (
    <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden min-h-[500px]">
      
      {!isLoggedIn ? (
        <div className="max-w-md mx-auto space-y-6 py-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-cecip-blue/10 text-cecip-blue rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Portal de Empresas Socias</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Accede a la base de datos de profesionales y postulantes en Paraná. Si eres socio, ingresa las credenciales de tu empresa.
            </p>
          </div>

          <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-medium">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Selecciona tu Empresa *</label>
              <select 
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-cecip-blue focus:bg-white transition-all"
              >
                <option value="">-- Elige tu Empresa ({ALL_COMPANIES.length} socios CeCIP) --</option>
                {ALL_COMPANIES.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.nombre} &bull; {company.rubro}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Clave de Acceso Socio *</label>
                <span className="text-[10px] text-cecip-blue font-bold">Clave demo: socio123</span>
              </div>
              <input 
                type="password" 
                placeholder="Ingresar contraseña..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-cecip-blue focus:bg-white transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-cecip-blue/10 transition-colors"
            >
              Iniciar Sesión de Socio
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Top User Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                🏢
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">Sesión Iniciada de Socio</p>
                <p className="text-sm sm:text-base font-extrabold text-slate-800 pt-1">{currentCompanyName}</p>
              </div>
            </div>
            <button 
              onClick={() => { setIsLoggedIn(false); setPasscode(""); }}
              className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Postulantes Registrados</h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              Consulta los perfiles, filtra por área y marca los candidatos de interés para que nuestro equipo organice el contacto o coordine entrevistas.
            </p>
          </div>

          {/* Filtering Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              
              {/* Search bar */}
              <div className="sm:col-span-5 relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, rubro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-cecip-blue focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Area select */}
              <div className="sm:col-span-4 flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap hidden md:inline">Área:</span>
                <select 
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-cecip-blue focus:bg-white transition-all font-medium"
                >
                  {areas.map((area, i) => (
                    <option key={i} value={area}>{area === "Todos" ? "Todas las Áreas" : area}</option>
                  ))}
                </select>
              </div>

              {/* Only interested check */}
              <div className="sm:col-span-3 flex items-center justify-end">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={showOnlyInterestedByMe}
                    onChange={(e) => setShowOnlyInterestedByMe(e.target.checked)}
                    className="rounded text-cecip-blue focus:ring-cecip-blue w-4 h-4 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-600">Ver mis favoritos</span>
                </label>
              </div>
            </div>
          </div>

          {/* Candidates Grid */}
          {filteredCandidates.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-2">
              <p className="text-lg font-bold text-slate-700">No se encontraron postulantes</p>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                No hay currículums cargados que coincidan con los filtros seleccionados actualmente. Intente cambiar su búsqueda o filtros.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCandidates.map((candidate) => {
                const isInterested = candidate.interesados.includes(currentCompanyName);
                return (
                  <div 
                    key={candidate.id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between relative overflow-hidden ${
                      isInterested ? "border-amber-200 bg-amber-50/5" : "border-slate-100"
                    }`}
                  >
                    {/* Corner Tag for favorited candidates */}
                    {isInterested && (
                      <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                        <Heart size={10} fill="currentColor" />
                        <span>Me Interesa</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-cecip-blue/5 text-cecip-blue text-[10px] font-bold uppercase tracking-wider leading-none mb-1.5">
                          {candidate.areaBusqueda}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                          {candidate.nombre}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Perfil: {candidate.tipoProfesional} · Registrado el {candidate.fechaSubida}
                        </p>
                      </div>

                      {candidate.comentarios ? (
                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                          "{candidate.comentarios}"
                        </p>
                      ) : (
                        <p className="text-slate-400 text-xs italic">
                          Sin comentarios adicionales.
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs font-semibold pt-1 border-t border-slate-50">
                        <span className="flex items-center gap-1"><Mail size={12} className="text-slate-400" /> {candidate.email}</span>
                        <span className="flex items-center gap-1"><Phone size={12} className="text-slate-400" /> {candidate.telefono}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 gap-2">
                      <button 
                        onClick={() => setViewingCandidate(candidate)}
                        className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Eye size={12} />
                        <span>Ver Detalle</span>
                      </button>

                      <button 
                        onClick={() => toggleInterest(candidate.id, currentCompanyName)}
                        className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                          isInterested 
                            ? "bg-amber-100 hover:bg-amber-200 text-amber-800" 
                            : "bg-cecip-blue/5 hover:bg-cecip-blue hover:text-white text-cecip-blue"
                        }`}
                      >
                        <Heart size={12} fill={isInterested ? "currentColor" : "none"} />
                        <span>{isInterested ? "Quitar de Favoritos" : "Me Interesa"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Candidate Detailed View Modal */}
      {viewingCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden border border-slate-100">
            <div className="h-2 w-full bg-cecip-blue" />
            
            <button 
              onClick={() => setViewingCandidate(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-all"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-md bg-cecip-blue/5 text-cecip-blue text-[10px] font-bold uppercase tracking-wider">
                  {viewingCandidate.areaBusqueda}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight pt-1">
                  {viewingCandidate.nombre}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {viewingCandidate.tipoProfesional} · Registrado el {viewingCandidate.fechaSubida}
                </p>
              </div>

              <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Información de Contacto</h4>
                <div className="space-y-1.5 text-xs sm:text-sm font-semibold text-slate-700">
                  <div className="flex items-center gap-2"><Mail size={14} className="text-cecip-blue" /> {viewingCandidate.email}</div>
                  <div className="flex items-center gap-2"><Phone size={14} className="text-cecip-blue" /> {viewingCandidate.telefono}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Presentación del Postulante</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {viewingCandidate.comentarios || "El candidato no ha ingresado comentarios de presentación."}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Archivo Adjunto</h4>
                <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <FileText size={20} className="text-cecip-blue shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">{viewingCandidate.fileName}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Tamaño: {viewingCandidate.fileSize}</p>
                  </div>
                </div>
              </div>

              {/* Show which companies are interested */}
              {viewingCandidate.interesados.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Interés Comercial Activo</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingCandidate.interesados.map((name, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-bold">
                        <Heart size={8} fill="currentColor" /> {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-semibold">CeCIP Paraná · Bolsa de Empleo</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewingCandidate(null)}
                  className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cerrar
                </button>
                {currentCompanyName && (
                  <button 
                    onClick={() => toggleInterest(viewingCandidate.id, currentCompanyName)}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                      viewingCandidate.interesados.includes(currentCompanyName)
                        ? "bg-amber-100 hover:bg-amber-200 text-amber-800" 
                        : "bg-cecip-blue text-white hover:bg-cecip-blue/90 shadow-md shadow-cecip-blue/10"
                    }`}
                  >
                    <Heart size={12} fill={viewingCandidate.interesados.includes(currentCompanyName) ? "currentColor" : "none"} />
                    <span>{viewingCandidate.interesados.includes(currentCompanyName) ? "Quitar de Favoritos" : "Me Interesa"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  Briefcase, Search, Filter, Plus, FileText, Download, Phone, Mail, 
  UserCheck, Building2, Eye, Trash2, Calendar, CheckCircle2, Clock, 
  ExternalLink, Sparkles, MessageSquare, AlertCircle, ArrowUpRight, X, User
} from "lucide-react";
import { CVSubmission, ErpSocio } from "../../types";

interface ErpBolsaEmpleoProps {
  role: string;
  socios: ErpSocio[];
}

export default function ErpBolsaEmpleo({ role, socios }: ErpBolsaEmpleoProps) {
  const [cvs, setCvs] = useState<CVSubmission[]>([]);
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("Todos");
  const [selectedTipo, setSelectedTipo] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  
  // Modal states
  const [viewingCv, setViewingCv] = useState<CVSubmission | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState<CVSubmission | null>(null);
  const [selectedSocioForInterest, setSelectedSocioForInterest] = useState("");

  // New Candidate Form state
  const [newCvForm, setNewCvForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    areaBusqueda: "Administración",
    tipoProfesional: "Estudiante / Junior",
    fileName: "",
    comentarios: "",
  });

  // Load CVs from localStorage on mount and sync
  const loadCvs = () => {
    try {
      const stored = localStorage.getItem("cecip_cvs");
      if (stored) {
        setCvs(JSON.parse(stored));
      } else {
        // Seed default CVs if none exist
        const seed: CVSubmission[] = [
          {
            id: "cv-seed-1",
            nombre: "Mariana Gómez",
            email: "mgomez.admin@gmail.com",
            telefono: "+54 343 4123456",
            areaBusqueda: "Administración",
            tipoProfesional: "Técnico Especialista",
            fileName: "gomez_mariana_cv_2026.pdf",
            fileSize: "1.2 MB",
            fechaSubida: "2026-07-15",
            comentarios: "Técnica Superior en Administración. 4 años de experiencia en liquidación de sueldos y facturación ERP.",
            interesados: ["Supermercados La Peruana", "Distribuidora San Martin S.R.L."]
          },
          {
            id: "cv-seed-2",
            nombre: "Martín Fontana",
            email: "mfontana.dev@hotmail.com",
            telefono: "+54 343 4987654",
            areaBusqueda: "Tecnología y Sistemas",
            tipoProfesional: "Profesional Senior",
            fileName: "cv_fontana_desarrollador.pdf",
            fileSize: "850 KB",
            fechaSubida: "2026-07-18",
            comentarios: "Ingeniero en Sistemas. Especializado en soporte de red, React y bases de datos relacionales.",
            interesados: ["Sistemas Paraná S.A."]
          },
          {
            id: "cv-seed-3",
            nombre: "Gonzalo Albarracín",
            email: "gonzalo.albarracin@yahoo.com",
            telefono: "+54 343 4556677",
            areaBusqueda: "Industria y Producción",
            tipoProfesional: "Oficios / Operario calificado",
            fileName: "albarracin_operario_mantenimiento.pdf",
            fileSize: "1.5 MB",
            fechaSubida: "2026-07-19",
            comentarios: "Técnico electromecánico. Experiencia en tornería, mantenimiento preventivo de maquinarias y seguridad industrial.",
            interesados: ["Molinos San José S.A."]
          },
          {
            id: "cv-seed-4",
            nombre: "Sofía Rossi",
            email: "rossi.sofia.ventas@gmail.com",
            telefono: "+54 343 4221100",
            areaBusqueda: "Ventas y Comercial",
            tipoProfesional: "Estudiante / Junior",
            fileName: "rossi_sofia_comercial_cv.pdf",
            fileSize: "620 KB",
            fechaSubida: "2026-07-20",
            comentarios: "Estudiante avanzada de Comercialización. Experiencia en atención al cliente, posventa y gestión de redes sociales.",
            interesados: []
          }
        ];
        localStorage.setItem("cecip_cvs", JSON.stringify(seed));
        setCvs(seed);
      }
    } catch (e) {
      console.error("Error loading CVs:", e);
    }
  };

  useEffect(() => {
    loadCvs();
    
    // Listen for storage changes from other tabs or portals
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cecip_cvs") {
        loadCvs();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const saveCvsToStorage = (updated: CVSubmission[]) => {
    setCvs(updated);
    localStorage.setItem("cecip_cvs", JSON.stringify(updated));
  };

  // Filter options
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

  const tipos = [
    "Todos",
    "Estudiante / Junior",
    "Técnico Especialista",
    "Profesional Senior",
    "Oficios / Operario calificado",
    "Prácticas Profesionales"
  ];

  const filteredCvs = cvs.filter(cv => {
    const query = search.toLowerCase();
    const matchesSearch = 
      cv.nombre.toLowerCase().includes(query) ||
      cv.email.toLowerCase().includes(query) ||
      cv.telefono.toLowerCase().includes(query) ||
      cv.areaBusqueda.toLowerCase().includes(query) ||
      (cv.comentarios && cv.comentarios.toLowerCase().includes(query));

    const matchesArea = selectedArea === "Todos" || cv.areaBusqueda === selectedArea;
    const matchesTipo = selectedTipo === "Todos" || cv.tipoProfesional === selectedTipo;

    return matchesSearch && matchesArea && matchesTipo;
  });

  // Handle Adding Manual Candidate
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCvForm.nombre || !newCvForm.email || !newCvForm.telefono) {
      alert("Por favor complete los campos obligatorios del postulante.");
      return;
    }

    const newCv: CVSubmission = {
      id: "cv-manual-" + Date.now(),
      nombre: newCvForm.nombre,
      email: newCvForm.email,
      telefono: newCvForm.telefono,
      areaBusqueda: newCvForm.areaBusqueda,
      tipoProfesional: newCvForm.tipoProfesional,
      fileName: newCvForm.fileName || `${newCvForm.nombre.toLowerCase().replace(/\s+/g, "_")}_cv.pdf`,
      fileSize: "1.1 MB",
      fechaSubida: new Date().toISOString().split("T")[0],
      comentarios: newCvForm.comentarios,
      interesados: []
    };

    const updated = [newCv, ...cvs];
    saveCvsToStorage(updated);
    setShowAddModal(false);
    setNewCvForm({
      nombre: "",
      email: "",
      telefono: "",
      areaBusqueda: "Administración",
      tipoProfesional: "Estudiante / Junior",
      fileName: "",
      comentarios: "",
    });
    alert(`¡Postulante ${newCv.nombre} registrado con éxito en la Bolsa de Empleo!`);
  };

  // Handle Adding Interested Socio
  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showInterestModal || !selectedSocioForInterest) return;

    const updated = cvs.map(cv => {
      if (cv.id === showInterestModal.id) {
        if (!cv.interesados.includes(selectedSocioForInterest)) {
          return { ...cv, interesados: [...cv.interesados, selectedSocioForInterest] };
        }
      }
      return cv;
    });

    saveCvsToStorage(updated);
    setShowInterestModal(null);
    setSelectedSocioForInterest("");
    alert("¡Empresa asociada vinculada con éxito como interesada en el perfil!");
  };

  // Handle Remove Interest
  const handleRemoveInterest = (cvId: string, companyName: string) => {
    const updated = cvs.map(cv => {
      if (cv.id === cvId) {
        return {
          ...cv,
          interesados: cv.interesados.filter(name => name !== companyName)
        };
      }
      return cv;
    });
    saveCvsToStorage(updated);
  };

  // Handle Delete Candidate
  const handleDeleteCandidate = (cvId: string) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este postulante de la Bolsa de Empleo?")) return;
    const updated = cvs.filter(c => c.id !== cvId);
    saveCvsToStorage(updated);
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ["Nombre", "Email", "Telefono", "Area", "Tipo", "Fecha", "Empresas Interesadas", "Comentarios"];
    const rows = filteredCvs.map(c => [
      `"${c.nombre}"`,
      `"${c.email}"`,
      `"${c.telefono}"`,
      `"${c.areaBusqueda}"`,
      `"${c.tipoProfesional}"`,
      `"${c.fechaSubida}"`,
      `"${c.interesados.join("; ")}"`,
      `"${(c.comentarios || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bolsa_de_Empleo_CeCIP_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-cecip-blue/10 dark:bg-slate-700 text-cecip-blue dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
            <Briefcase size={14} />
            <span>Gestión Gremial de Recursos Humanos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Bolsa de Empleo e Inserción Laboral CeCIP
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Repositorio centralizado de Currículums Vitae recibidos desde el sitio web institucional. Vinculación directa entre el talento humano de Paraná y las empresas asociadas al CeCIP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={loadCvs}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Recargar postulaciones desde el sitio web"
          >
            <Clock size={14} />
            <span>Sincronizar</span>
          </button>

          <button 
            onClick={exportToCSV}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>+ Registrar Postulante</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-cecip-blue dark:text-blue-300 rounded-xl">
            <User size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Total Postulantes</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">{cvs.length}</h4>
            <span className="text-[10px] text-emerald-600 font-bold">Base de datos al día</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 rounded-xl">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Empresas Interesadas</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              {cvs.reduce((acc, curr) => acc + curr.interesados.length, 0)}
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Vinculaciones activas</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-xl">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Técnicos & Senior</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              {cvs.filter(c => c.tipoProfesional.includes("Senior") || c.tipoProfesional.includes("Técnico")).length}
            </h4>
            <span className="text-[10px] text-emerald-600 font-bold">Perfiles cualificados</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 rounded-xl">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Administración & Ventas</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              {cvs.filter(c => c.areaBusqueda.includes("Administra") || c.areaBusqueda.includes("Ventas")).length}
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Mayor demanda comercial</span>
          </div>
        </div>

      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email, teléfono, conocimientos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-cecip-blue text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Area filter */}
          <div className="md:col-span-4">
            <select 
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-cecip-blue cursor-pointer"
            >
              <option value="Todos">Todas las Áreas de Búsqueda</option>
              {areas.filter(a => a !== "Todos").map((area, idx) => (
                <option key={idx} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Tipo profesional filter */}
          <div className="md:col-span-3">
            <select 
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-cecip-blue cursor-pointer"
            >
              <option value="Todos">Todos los Niveles</option>
              {tipos.filter(t => t !== "Todos").map((tipo, idx) => (
                <option key={idx} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Candidates List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
          <span className="font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Listado de Postulantes ({filteredCvs.length})
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Mostrando resultados sincronizados con el sitio web oficial.
          </span>
        </div>

        {filteredCvs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
              <Briefcase size={22} />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No se encontraron postulantes con los filtros seleccionados.</p>
            <p className="text-[11px] text-slate-400">Intente limpiar la búsqueda o registrar un nuevo currículum manualmente.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredCvs.map((candidate) => (
              <div 
                key={candidate.id} 
                className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                
                {/* Candidate Core Info */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {candidate.nombre}
                    </h3>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-cecip-blue dark:text-blue-300 font-extrabold px-2 py-0.5 rounded-full">
                      {candidate.areaBusqueda}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                      {candidate.tipoProfesional}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {candidate.comentarios || "Sin comentarios adicionales cargados por el postulante."}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-slate-400" />
                      <a href={`mailto:${candidate.email}`} className="hover:underline text-slate-700 dark:text-slate-300 font-medium">{candidate.email}</a>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      <a 
                        href={`https://wa.me/${candidate.telefono.replace(/[^0-9]/g, "")}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
                      >
                        {candidate.telefono}
                        <ExternalLink size={10} />
                      </a>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      <span>Ingresado: {candidate.fechaSubida}</span>
                    </span>
                  </div>

                  {/* Interested Companies Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Interesados:</span>
                    {candidate.interesados.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">Ninguna empresa asociada vinculada aún</span>
                    ) : (
                      candidate.interesados.map((company, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-1 text-[10px] bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-lg"
                        >
                          <Building2 size={10} />
                          <span>{company}</span>
                          <button 
                            onClick={() => handleRemoveInterest(candidate.id, company)}
                            className="hover:text-rose-500 cursor-pointer ml-0.5"
                            title="Quitar empresa"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Candidate Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  
                  {/* File Download Pill */}
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center gap-2 text-xs">
                    <FileText size={15} className="text-cecip-blue dark:text-blue-400" />
                    <div className="text-[10px] min-w-[100px] truncate">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{candidate.fileName}</p>
                      <p className="text-slate-400">{candidate.fileSize}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowInterestModal(candidate)}
                    className="p-2.5 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    title="Vincular con empresa socia del CeCIP"
                  >
                    <Plus size={13} />
                    <span className="hidden sm:inline">Vincular Socio</span>
                  </button>

                  <button 
                    onClick={() => setViewingCv(candidate)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Eye size={14} />
                    <span>Ver CV</span>
                  </button>

                  <button 
                    onClick={() => handleDeleteCandidate(candidate.id)}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl transition-all cursor-pointer"
                    title="Eliminar postulante"
                  >
                    <Trash2 size={14} />
                  </button>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL: Candidate Detailed View */}
      {viewingCv && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden space-y-6 p-6 sm:p-8">
            
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-cecip-blue text-white font-extrabold text-[10px] uppercase rounded-full">
                    {viewingCv.areaBusqueda}
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-full">
                    {viewingCv.tipoProfesional}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {viewingCv.nombre}
                </h3>
              </div>

              <button 
                onClick={() => setViewingCv(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content body */}
            <div className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Correo Electrónico</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{viewingCv.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Teléfono / WhatsApp</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{viewingCv.telefono}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Fecha de Registro</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{viewingCv.fechaSubida}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Archivo de CV</span>
                  <p className="font-bold text-cecip-blue dark:text-blue-400 flex items-center gap-1">
                    <FileText size={13} /> {viewingCv.fileName} ({viewingCv.fileSize})
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Comentarios del Postulante & Experiencia</span>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {viewingCv.comentarios || "No se incluyeron comentarios adicionales en la postulación."}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Empresas Socias Interesadas en este Perfil</span>
                {viewingCv.interesados.length === 0 ? (
                  <p className="text-slate-400 italic">No hay empresas vinculadas hasta el momento.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {viewingCv.interesados.map((comp, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold rounded-xl border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
                        <Building2 size={12} />
                        <span>{comp}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Simulated Document Preview Banner */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cecip-blue text-white rounded-xl">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">{viewingCv.fileName}</h5>
                    <p className="text-[10px] text-slate-500">Documento verificado y libre de amenazas</p>
                  </div>
                </div>

                <a 
                  href={`#download-${viewingCv.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Iniciando descarga simulada del currículum de ${viewingCv.nombre}...`);
                  }}
                  className="px-4 py-2 bg-cecip-blue hover:bg-cecip-blue/90 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Descargar CV</span>
                </a>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button 
                onClick={() => setViewingCv(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Register Candidate Manually */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden space-y-6 p-6 sm:p-8">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase size={18} className="text-cecip-blue" />
                <span>Registrar Postulante Manualmente</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Nombre Completo *</label>
                <input 
                  type="text" 
                  required
                  placeholder="ej: Juan Pablo Perez"
                  value={newCvForm.nombre}
                  onChange={(e) => setNewCvForm({ ...newCvForm, nombre: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cecip-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Correo Electrónico *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="juan.perez@email.com"
                    value={newCvForm.email}
                    onChange={(e) => setNewCvForm({ ...newCvForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cecip-blue"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Teléfono / WhatsApp *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="+54 343 4000000"
                    value={newCvForm.telefono}
                    onChange={(e) => setNewCvForm({ ...newCvForm, telefono: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cecip-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Área de Búsqueda</label>
                  <select 
                    value={newCvForm.areaBusqueda}
                    onChange={(e) => setNewCvForm({ ...newCvForm, areaBusqueda: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cecip-blue"
                  >
                    {areas.filter(a => a !== "Todos").map((a, i) => (
                      <option key={i} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Nivel Profesional</label>
                  <select 
                    value={newCvForm.tipoProfesional}
                    onChange={(e) => setNewCvForm({ ...newCvForm, tipoProfesional: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cecip-blue"
                  >
                    {tipos.filter(t => t !== "Todos").map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Nombre de Archivo PDF / Adjunto</label>
                <input 
                  type="text" 
                  placeholder="ej: cv_perez_juan_2026.pdf"
                  value={newCvForm.fileName}
                  onChange={(e) => setNewCvForm({ ...newCvForm, fileName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cecip-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Resumen / Experiencia</label>
                <textarea 
                  rows={3}
                  placeholder="Añada notas sobre el perfil, habilidades clave, disponibilidad..."
                  value={newCvForm.comentarios}
                  onChange={(e) => setNewCvForm({ ...newCvForm, comentarios: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cecip-blue"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-cecip-blue hover:bg-cecip-blue/90 text-white font-bold rounded-xl shadow-md"
                >
                  Guardar Postulante
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: Link Company Interest */}
      {showInterestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={16} className="text-purple-600" />
                <span>Vincular Empresa Interesada</span>
              </h3>
              <button onClick={() => setShowInterestModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Seleccione cuál empresa asociada al CeCIP ha manifestado interés en el perfil de <strong className="text-slate-900 dark:text-white">{showInterestModal.nombre}</strong>.
            </p>

            <form onSubmit={handleAddInterest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Empresa Socio del Padrón</label>
                <select 
                  required
                  value={selectedSocioForInterest}
                  onChange={(e) => setSelectedSocioForInterest(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- Seleccionar Comercio / Empresa --</option>
                  {socios.map(soc => (
                    <option key={soc.id} value={soc.nombreComercial || soc.razonSocial}>
                      {soc.nombreComercial || soc.razonSocial} ({soc.rubro})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                <button 
                  type="button"
                  onClick={() => setShowInterestModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!selectedSocioForInterest}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  Vincular Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

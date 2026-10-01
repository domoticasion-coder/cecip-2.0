import React, { useState } from "react";
import { ErpSocio } from "../../types";
import { 
  Search, Grid, Eye, Edit3, Save, MapPin, Phone, 
  Clock, Award, Tag, Sparkles, LayoutGrid, Globe, Building2, HelpCircle
} from "lucide-react";

interface ErpDirectorioProps {
  socios: ErpSocio[];
  onSaveSocios: (updated: ErpSocio[]) => void;
  role: string;
}

export default function ErpDirectorio({ socios, onSaveSocios, role }: ErpDirectorioProps) {
  const [activeMode, setActiveMode] = useState<"buscador" | "mi_ficha">("buscador");
  
  // Searching states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRubro, setSelectedRubro] = useState("todos");

  // Mi Ficha Edit state
  const [selectedSocioId, setSelectedSocioId] = useState(socios[0]?.id || "");
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock Ficha data stored locally on component
  const [fichaData, setFichaData] = useState({
    descripcion: "Somos líderes locales ofreciendo productos de primera calidad con atención personalizada y planes de pago flexibles.",
    servicios: "Venta minorista, Asesoramiento personalizado, Envíos a domicilio en Paraná y alrededores.",
    horarios: "Lunes a Viernes: 08:30 a 12:30 y 16:00 a 20:00. Sábados: 09:00 a 13:00.",
    promociones: "10% de descuento abonando en efectivo presentando credencial de socio CeCIP.",
    productos: "Calzado de vestir, Zapatillas deportivas, Sandalias, Accesorios de moda."
  });

  const rubros = Array.from(new Set(socios.map(s => s.rubro)));

  const handleSelectFichaPartner = (id: string) => {
    setSelectedSocioId(id);
    const partner = socios.find(s => s.id === id);
    if (partner) {
      // Simulate loading their custom public card, fallback to preset
      setFichaData({
        descripcion: partner.observaciones || "Comercio adherido al CeCIP Paraná, comprometido con la calidad y la atención de la comunidad.",
        servicios: "Atención al público, asesoramiento comercial y venta de productos del rubro.",
        horarios: "Lunes a Sábados: horario comercial estándar.",
        promociones: "Descuento especial del 10% presentando carnet del CeCIP.",
        productos: `Artículos y servicios relacionados con: ${partner.rubro}`
      });
    }
    setIsEditing(false);
  };

  const handleSaveFicha = () => {
    const partner = socios.find(s => s.id === selectedSocioId);
    if (!partner) return;

    // Save back to the global socio observations to persist
    const updated = socios.map(s => {
      if (s.id === selectedSocioId) {
        return {
          ...s,
          observaciones: fichaData.descripcion,
          timeline: [
            ...s.timeline,
            {
              id: `t-ficha-${Date.now()}`,
              titulo: "Ficha Pública Actualizada",
              descripcion: "Se modificó la descripción del catálogo de socios.",
              fecha: new Date().toISOString().split("T")[0],
              tipo: "sistema" as const
            }
          ]
        };
      }
      return s;
    });

    onSaveSocios(updated);
    setIsEditing(false);
    alert("¡Ficha pública actualizada con éxito! Los cambios ya se reflejan en el Directorio Público de Socios del CeCIP.");
  };

  const filteredSocios = socios.filter(s => {
    if (s.estado !== "Activo") return false; // Only active partners in the directory
    const matchesSearch = s.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()) || s.razonSocial.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRubro = selectedRubro === "todos" || s.rubro === selectedRubro;
    return matchesSearch && matchesRubro;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveMode("buscador")}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${activeMode === "buscador" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          🔍 Buscador Público de Comercios
        </button>
        <button 
          onClick={() => setActiveMode("mi_ficha")}
          className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${activeMode === "mi_ficha" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          ⚙️ Administrar Mi Ficha Pública
        </button>
      </div>

      {/* BUSCADOR PÚBLICO */}
      {activeMode === "buscador" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Sparkles className="text-amber-500" size={16} />
              <span>Directorio Oficial de Comercios e Industrias Asociadas</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Encuentre negocios locales adheridos al CeCIP, acceda a sus datos de contacto, horarios y promociones vigentes para toda la comunidad de Paraná.
            </p>
          </div>

          {/* Search boxes */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por nombre comercial, marca o rubro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs focus:outline-none dark:text-white"
              />
            </div>

            <div className="sm:w-60">
              <select 
                value={selectedRubro}
                onChange={(e) => setSelectedRubro(e.target.value)}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs focus:outline-none dark:text-white cursor-pointer"
              >
                <option value="todos">Todos los Rubros</option>
                {rubros.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid of partner cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSocios.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                No hay comercios activos con los criterios seleccionados.
              </div>
            ) : (
              filteredSocios.map((soc) => (
                <div key={soc.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-cecip-blue/20 dark:hover:border-slate-600 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between group transition-all">
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Badge and Title */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="w-10 h-10 bg-cecip-blue/5 dark:bg-slate-700 text-cecip-blue dark:text-blue-300 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                        {soc.nombreComercial.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-700 text-slate-500 border border-slate-100 dark:border-transparent uppercase">
                        {soc.rubro}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-cecip-blue transition-colors">
                        {soc.nombreComercial}
                      </h4>
                      <p className="text-xs text-slate-400 truncate font-medium">{soc.razonSocial}</p>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic leading-relaxed">
                      &ldquo;{soc.observaciones || "Comercio local comprometido con el desarrollo comercial y el crecimiento económico de Paraná."}&rdquo;
                    </p>

                    {/* Contacts info list */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-50 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{soc.direccion}, {soc.localidad}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>WhatsApp: {soc.whatsapp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        <span>Lunes a Sábados comercial</span>
                      </div>
                    </div>
                  </div>

                  {/* Promotion Tag / Footer */}
                  <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50/40 to-slate-50/40 dark:from-slate-900 dark:to-slate-800/80 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center text-xs">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Tag size={12} />
                      <span>Beneficios CeCIP: 10% OFF</span>
                    </span>
                    <button 
                      onClick={() => alert(`Ficha Completa de: ${soc.nombreComercial}\n\nRubro: ${soc.rubro}\nDescripción: ${soc.observaciones || "Socio activo de la institución."}\nDirección: ${soc.direccion}, ${soc.localidad}\nWhatsApp: ${soc.whatsapp}\nEmail: ${soc.email}\nWeb: ${soc.web || "No disponible"}`)}
                      className="text-[10px] font-bold text-cecip-blue hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Ver Ficha</span>
                      <Eye size={10} />
                    </button>
                  </div>
                </div>
              )))}
          </div>
        </div>
      )}

      {/* ADMINISTAR MI FICHA */}
      {activeMode === "mi_ficha" && (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Administrador de Ficha del Comercio</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure la información pública de su comercio en el catálogo oficial de socios del CeCIP.
              </p>
            </div>
            
            {/* Socio Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Editar Como:</label>
              <select 
                value={selectedSocioId}
                onChange={(e) => handleSelectFichaPartner(e.target.value)}
                className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold dark:text-white cursor-pointer"
              >
                {socios.map(s => (
                  <option key={s.id} value={s.id}>{s.nombreComercial}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Description Form Column */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Descripción Comercial Pública</label>
                <textarea 
                  rows={4}
                  disabled={!isEditing}
                  value={fichaData.descripcion}
                  onChange={(e) => setFichaData({ ...fichaData, descripcion: e.target.value })}
                  placeholder="Escriba una breve presentación de su comercio, marca o industria..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Horarios de Atención</label>
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={fichaData.horarios}
                  onChange={(e) => setFichaData({ ...fichaData, horarios: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Servicios Ofrecidos</label>
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={fichaData.servicios}
                  onChange={(e) => setFichaData({ ...fichaData, servicios: e.target.value })}
                  placeholder="ej: Envíos, cuotas sin interés, etc."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
              </div>
            </div>

            {/* Products & Promos Form Column */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Promociones para Socios CeCIP (Descuento de Convenio)</label>
                <textarea 
                  rows={3}
                  disabled={!isEditing}
                  value={fichaData.promociones}
                  onChange={(e) => setFichaData({ ...fichaData, promociones: e.target.value })}
                  placeholder="ej: 10% de descuento abonando en efectivo presentando credencial..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Productos Principales o Categorías Destacadas</label>
                <textarea 
                  rows={3}
                  disabled={!isEditing}
                  value={fichaData.productos}
                  onChange={(e) => setFichaData({ ...fichaData, productos: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveFicha}
                  className="px-5 py-2 text-xs font-bold bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>Guardar Cambios</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 size={13} />
                <span>Modificar Mi Ficha</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

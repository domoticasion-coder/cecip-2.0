import React, { useState, useEffect } from "react";
import { 
  Zap, Check, Clock, User, Sparkles, Filter, 
  Search, Plus, CheckCircle2, AlertCircle, RefreshCw,
  XCircle, ChevronRight
} from "lucide-react";
import { intelligenceService } from "../../../services/intelligence.service";
import { AccionOperativa, AccionEstado, AlertaPrioridad } from "../../../types";

interface Props {
  onOpenSocioDetail?: (socioId: string) => void;
}

export const ErpAccionesOperativas: React.FC<Props> = ({ onOpenSocioDetail }) => {
  const [acciones, setAcciones] = useState<AccionOperativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<string>("Pendientes");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitulo, setNewTitulo] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSocioNombre, setNewSocioNombre] = useState("");
  const [newPrioridad, setNewPrioridad] = useState<AlertaPrioridad>("Media");
  const [newResp, setNewResp] = useState("Lic. Esteban Peralta");

  const loadAcciones = async () => {
    try {
      setLoading(true);
      const res = await intelligenceService.getAcciones();
      setAcciones(res);
    } catch (e) {
      console.error("Error al cargar acciones:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcciones();
  }, []);

  const handleUpdateEstado = async (id: string, nuevoEstado: AccionEstado) => {
    try {
      await intelligenceService.updateAccion(id, { estado: nuevoEstado });
      await loadAcciones();
    } catch (e) {
      console.error("Error al actualizar acción:", e);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitulo.trim() || !newDesc.trim()) return;

    try {
      await intelligenceService.createAccion({
        titulo: newTitulo,
        descripcion: newDesc,
        socioNombre: newSocioNombre || undefined,
        prioridad: newPrioridad,
        responsableNombre: newResp,
        origenTipo: "manual",
        sugeridaPorIa: false,
      });
      setShowNewModal(false);
      setNewTitulo("");
      setNewDesc("");
      setNewSocioNombre("");
      await loadAcciones();
    } catch (err) {
      console.error("Error al crear acción:", err);
    }
  };

  const filtered = acciones.filter((a) => {
    const matchEstado =
      filterEstado === "Todas"
        ? true
        : filterEstado === "Pendientes"
        ? a.estado === "Pendiente" || a.estado === "En curso"
        : a.estado === filterEstado;
    const matchSearch =
      searchTerm === "" ||
      a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.socioNombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  const getPriorityBadge = (p: AlertaPrioridad) => {
    switch (p) {
      case "Crítica":
        return "bg-rose-100 text-rose-800 border-rose-300 font-extrabold";
      case "Alta":
        return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
      case "Media":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Baja":
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Bandeja de Acciones Operativas CeCIP
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Gestión priorizada de tareas operativas, contactos directos y rescate de socios sugeridas por reglas e IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Nueva Acción
          </button>
          <button
            onClick={loadAcciones}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar acción o socio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {["Pendientes", "Todas", "En curso", "Completada"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterEstado(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterEstado === st
                  ? "bg-slate-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Acciones */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-gray-200 text-gray-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">No hay acciones en esta vista.</p>
          </div>
        ) : (
          filtered.map((accion) => {
            const isDone = accion.estado === "Completada";
            return (
              <div
                key={accion.id}
                className={`bg-white p-5 rounded-xl border transition shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isDone ? "border-emerald-200 bg-emerald-50/20 opacity-80" : "border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => handleUpdateEstado(accion.id, isDone ? "Pendiente" : "Completada")}
                    className={`w-6 h-6 mt-0.5 rounded-full border flex items-center justify-center transition shrink-0 ${
                      isDone
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-gray-300 hover:border-blue-500 bg-white"
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getPriorityBadge(accion.prioridad)}`}>
                        {accion.prioridad}
                      </span>
                      {accion.sugeridaPorIa && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1 border border-purple-200">
                          <Sparkles className="w-3 h-3" /> Sugerida por Motor IO
                        </span>
                      )}
                      {accion.socioNombre && (
                        <span 
                          onClick={() => accion.socioId && onOpenSocioDetail?.(accion.socioId)}
                          className="text-xs font-semibold text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded cursor-pointer"
                        >
                          {accion.socioNombre}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-bold text-base mt-1 ${isDone ? "line-through text-gray-500" : "text-gray-900"}`}>
                      {accion.titulo}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">{accion.descripcion}</p>

                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>Responsable: <strong className="text-gray-700">{accion.responsableNombre || "Sin asignar"}</strong></span>
                      <span>•</span>
                      <span>Origen: {accion.origenTipo}</span>
                      {accion.fechaLimite && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 font-medium">Límite: {new Date(accion.fechaLimite).toLocaleDateString("es-AR")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {accion.estado !== "Completada" && (
                    <button
                      onClick={() => handleUpdateEstado(accion.id, accion.estado === "En curso" ? "Pendiente" : "En curso")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        accion.estado === "En curso"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {accion.estado === "En curso" ? "En Gestión" : "Iniciar"}
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateEstado(accion.id, isDone ? "Pendiente" : "Completada")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isDone
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    }`}
                  >
                    {isDone ? "Reabrir" : "Completar"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nueva Acción */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nueva Acción Operativa</h3>
            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Título de la acción</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Llamada de retención cuota vencida"
                  value={newTitulo}
                  onChange={(e) => setNewTitulo(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción detallada</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detalle de lo acordado o acción requerida..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Socio (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Nombre del socio"
                    value={newSocioNombre}
                    onChange={(e) => setNewSocioNombre(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Prioridad</label>
                  <select
                    value={newPrioridad}
                    onChange={(e) => setNewPrioridad(e.target.value as AlertaPrioridad)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Crítica">Crítica</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Responsable</label>
                <input
                  type="text"
                  value={newResp}
                  onChange={(e) => setNewResp(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Crear Acción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

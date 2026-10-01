import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, AlertCircle, CheckCircle2, Clock, 
  Filter, Search, UserCheck, Check, Trash2, ArrowRight,
  ShieldAlert, Sparkles, RefreshCw, XCircle
} from "lucide-react";
import { intelligenceService } from "../../../services/intelligence.service";
import { AlertaOperativa, AlertaPrioridad, AlertaEstado } from "../../../types";

interface Props {
  onOpenSocioDetail?: (socioId: string) => void;
}

export const ErpAlertasOperativas: React.FC<Props> = ({ onOpenSocioDetail }) => {
  const [alertas, setAlertas] = useState<AlertaOperativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPrioridad, setFilterPrioridad] = useState<string>("Todas");
  const [filterEstado, setFilterEstado] = useState<string>("Activas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlerta, setSelectedAlerta] = useState<AlertaOperativa | null>(null);

  const loadAlertas = async () => {
    try {
      setLoading(true);
      const res = await intelligenceService.getAlertas();
      setAlertas(res);
    } catch (e) {
      console.error("Error al cargar alertas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertas();
  }, []);

  const handleUpdateEstado = async (id: string, nuevoEstado: AlertaEstado) => {
    try {
      await intelligenceService.updateAlerta(id, { estado: nuevoEstado });
      await loadAlertas();
      if (selectedAlerta?.id === id) {
        setSelectedAlerta(prev => prev ? { ...prev, estado: nuevoEstado } : null);
      }
    } catch (e) {
      console.error("Error al actualizar alerta:", e);
    }
  };

  const handleCrearAccionDesdeAlerta = async (alerta: AlertaOperativa) => {
    try {
      await intelligenceService.createAccion({
        titulo: `Gestión: ${alerta.titulo}`,
        descripcion: alerta.descripcion,
        socioId: alerta.socioId,
        socioNombre: alerta.socioNombre,
        origenTipo: "alerta",
        origenId: alerta.id,
        prioridad: alerta.prioridad,
        sugeridaPorIa: alerta.detectadaPor === "ia",
      });
      await handleUpdateEstado(alerta.id, "En revisión");
      alert("Acción operativa agregada a la bandeja de trabajo.");
    } catch (e) {
      console.error("Error al crear acción:", e);
    }
  };

  const filtered = alertas.filter((a) => {
    const matchPrioridad = filterPrioridad === "Todas" || a.prioridad === filterPrioridad;
    const matchEstado =
      filterEstado === "Todas"
        ? true
        : filterEstado === "Activas"
        ? a.estado !== "Resuelta" && a.estado !== "Descartada"
        : a.estado === filterEstado;
    const matchSearch =
      searchTerm === "" ||
      a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.socioNombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchPrioridad && matchEstado && matchSearch;
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

  const getEstadoBadge = (e: AlertaEstado) => {
    switch (e) {
      case "Nueva":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "En revisión":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "En gestión":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Resuelta":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Descartada":
        return "bg-gray-50 text-gray-500 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Centro de Alertas Operativas CeCIP
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Monitoreo continuo de mora, inactividad de socios, demoras en tickets y ocupación de capacitaciones.
          </p>
        </div>

        <button
          onClick={loadAlertas}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-lg border border-gray-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refrescar Alertas
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por título, socio o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="Activas">Estado: Activas</option>
            <option value="Todas">Estado: Todas</option>
            <option value="Nueva">Nuevas</option>
            <option value="En revisión">En revisión</option>
            <option value="En gestión">En gestión</option>
            <option value="Resuelta">Resueltas</option>
          </select>

          {["Todas", "Crítica", "Alta", "Media"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPrioridad(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterPrioridad === p
                  ? "bg-slate-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">No hay alertas que coincidan con los filtros seleccionados.</p>
            <p className="text-xs text-gray-400 mt-1">El estado general del sistema se encuentra bajo control.</p>
          </div>
        ) : (
          filtered.map((alerta) => (
            <div
              key={alerta.id}
              className={`p-5 hover:bg-gray-50/80 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                alerta.prioridad === "Crítica" ? "border-l-4 border-l-rose-600" : alerta.prioridad === "Alta" ? "border-l-4 border-l-amber-500" : ""
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className={`p-2.5 rounded-xl mt-0.5 ${
                  alerta.prioridad === "Crítica" ? "bg-rose-50 text-rose-600" : alerta.prioridad === "Alta" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                }`}>
                  <AlertCircle className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getPriorityBadge(alerta.prioridad)}`}>
                      {alerta.prioridad}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getEstadoBadge(alerta.estado)}`}>
                      {alerta.estado}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      Tipo: {alerta.tipo}
                    </span>
                    {alerta.socioNombre && (
                      <button
                        onClick={() => alerta.socioId && onOpenSocioDetail?.(alerta.socioId)}
                        className="text-xs font-semibold text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded"
                      >
                        {alerta.socioNombre}
                      </button>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-base mt-1">{alerta.titulo}</h3>
                  <p className="text-xs text-gray-600 mt-1 max-w-3xl leading-relaxed">{alerta.descripcion}</p>

                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                    <span>Detectada: {new Date(alerta.fechaDeteccion).toLocaleString("es-AR")}</span>
                    <span>•</span>
                    <span>Origen: <strong className="text-gray-600">{alerta.detectadaPor}</strong></span>
                    {alerta.responsableNombre && (
                      <>
                        <span>•</span>
                        <span className="text-blue-700 font-medium">Asignado: {alerta.responsableNombre}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {alerta.estado !== "Resuelta" && (
                  <>
                    <button
                      onClick={() => handleCrearAccionDesdeAlerta(alerta)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Crear Acción
                    </button>
                    <button
                      onClick={() => handleUpdateEstado(alerta.id, "Resuelta")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Resolver
                    </button>
                    <button
                      onClick={() => handleUpdateEstado(alerta.id, "Descartada")}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-xs font-medium transition"
                      title="Descartar alerta"
                    >
                      Descartar
                    </button>
                  </>
                )}

                {alerta.estado === "Resuelta" && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> Resuelta
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { 
  Activity, ShieldCheck, AlertTriangle, ArrowUpRight, 
  ArrowDownRight, Minus, Search, Filter, RefreshCw, 
  ChevronRight, Sparkles, CheckCircle2, XCircle, Info,
  Phone, Mail, Calendar, ExternalLink
} from "lucide-react";
import { intelligenceService } from "../../../services/intelligence.service";
import { SocioSaludHistorial, SaludCategoria } from "../../../types";

interface Props {
  onOpenSocioDetail?: (socioId: string) => void;
}

export const ErpSaludSocios: React.FC<Props> = ({ onOpenSocioDetail }) => {
  const [saludList, setSaludList] = useState<SocioSaludHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [filterCategoria, setFilterCategoria] = useState<string>("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSalud, setSelectedSalud] = useState<SocioSaludHistorial | null>(null);

  const loadSalud = async () => {
    try {
      setLoading(true);
      const res = await intelligenceService.getSaludSocios();
      setSaludList(res);
    } catch (e) {
      console.error("Error al cargar salud de socios:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalud();
  }, []);

  const handleRecalcular = async () => {
    try {
      setRecalculating(true);
      await intelligenceService.recalcularSalud();
      await loadSalud();
    } catch (e) {
      console.error("Error al recalcular salud:", e);
    } finally {
      setRecalculating(false);
    }
  };

  const filtered = saludList.filter((s) => {
    const matchCat = filterCategoria === "Todas" || s.categoria === filterCategoria;
    const matchSearch = searchTerm === "" || s.socioNombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const getBadgeColor = (cat: SaludCategoria) => {
    switch (cat) {
      case "Excelente":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Saludable":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Atención":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Riesgo":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Crítico":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    if (score >= 20) return "text-orange-600";
    return "text-rose-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Índice de Salud del Socio CeCIP (0-100 pts)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Cálculo determinístico y explicable de la fidelidad, cumplimiento y riesgo de cada socio de la matrícula.
          </p>
        </div>

        <button
          onClick={handleRecalcular}
          disabled={recalculating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm rounded-lg border border-blue-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${recalculating ? "animate-spin" : ""}`} />
          {recalculating ? "Recalculando..." : "Recalcular Salud"}
        </button>
      </div>

      {/* Controles y Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar socio por nombre comercial o razón social..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["Todas", "Excelente", "Saludable", "Atención", "Riesgo", "Crítico"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategoria(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterCategoria === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla / Tarjetas de Socios con Salud */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-gray-200 text-gray-400">
            <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No se encontraron socios en la categoría seleccionada.</p>
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSalud(s)}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeColor(s.categoria)}`}>
                      {s.categoria}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mt-2 line-clamp-1">{s.socioNombre}</h3>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-extrabold ${getScoreColor(s.score)}`}>
                      {s.score}
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Puntaje</span>
                  </div>
                </div>

                {/* Desglose de 5 dimensiones */}
                <div className="mt-4 space-y-2 bg-gray-50/70 p-3 rounded-lg border border-gray-100 text-xs">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Financiero (max 35)</span>
                    <span className="font-semibold text-gray-900">{s.scoreFinanciero} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Relación CRM (max 25)</span>
                    <span className="font-semibold text-gray-900">{s.scoreRelacion} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Participación Eventos (max 15)</span>
                    <span className="font-semibold text-gray-900">{s.scoreParticipacion} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Mesa de Ayuda (max 15)</span>
                    <span className="font-semibold text-gray-900">{s.scoreAtencion} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Antigüedad (max 10)</span>
                    <span className="font-semibold text-gray-900">{s.scoreAntiguedad} pts</span>
                  </div>
                </div>

                {/* Factores Críticos */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Factores Clave:</span>
                  <ul className="mt-1 space-y-1">
                    {s.factores.slice(0, 2).map((f, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5 line-clamp-1">
                        <span className="text-blue-500 font-bold">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                <span>Ver diagnóstico completo</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalle y Explicabilidad de Salud del Socio */}
      {selectedSalud && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeColor(selectedSalud.categoria)}`}>
                    {selectedSalud.categoria}
                  </span>
                  <span className="text-xs text-gray-400">Evaluado el {selectedSalud.fecha}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedSalud.socioNombre}</h2>
              </div>
              <button
                onClick={() => setSelectedSalud(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Score Central */}
            <div className="my-6 p-5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Índice Total de Salud</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-4xl font-extrabold ${getScoreColor(selectedSalud.score)}`}>
                    {selectedSalud.score}
                  </span>
                  <span className="text-sm font-semibold text-gray-500">/100 Puntos</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Tendencia actual: <strong className="capitalize">{selectedSalud.tendencia}</strong>
                </p>
              </div>

              {selectedSalud.socioId && (
                <button
                  onClick={() => {
                    const id = selectedSalud.socioId;
                    setSelectedSalud(null);
                    onOpenSocioDetail?.(id);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ir a Ficha del Socio
                </button>
              )}
            </div>

            {/* 5 Dimensiones Detalladas */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">Desglose Ponderado por Dimensión</h3>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Cumplimiento Financiero y Cuotas (35%)</span>
                    <span>{selectedSalud.scoreFinanciero} / 35 pts</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(selectedSalud.scoreFinanciero / 35) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Contacto y Relación Institucional CRM (25%)</span>
                    <span>{selectedSalud.scoreRelacion} / 25 pts</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(selectedSalud.scoreRelacion / 25) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Participación en Capacitaciones y Eventos (15%)</span>
                    <span>{selectedSalud.scoreParticipacion} / 15 pts</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(selectedSalud.scoreParticipacion / 15) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Atención de Mesa de Ayuda y Reclamos (15%)</span>
                    <span>{selectedSalud.scoreAtencion} / 15 pts</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(selectedSalud.scoreAtencion / 15) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Antigüedad y Trayectoria en CeCIP (10%)</span>
                    <span>{selectedSalud.scoreAntiguedad} / 10 pts</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(selectedSalud.scoreAntiguedad / 10) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Factores Detectados */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Factores Determinantes:</h4>
                <div className="space-y-1.5">
                  {selectedSalud.factores.map((factor, idx) => (
                    <div key={idx} className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recomendaciones Operativas */}
              <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                <h4 className="font-bold text-blue-950 text-xs flex items-center gap-1.5 uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Recomendaciones Operativas Sugeridas:
                </h4>
                <div className="space-y-1.5">
                  {selectedSalud.recomendaciones.map((rec, idx) => (
                    <div key={idx} className="text-xs text-blue-900 flex items-start gap-2">
                      <span className="font-bold text-blue-600">→</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedSalud(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition"
              >
                Cerrar Diagnóstico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

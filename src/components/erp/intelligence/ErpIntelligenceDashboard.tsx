import React, { useState, useEffect } from "react";
import { 
  Activity, AlertTriangle, ShieldCheck, Zap, Sparkles, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, 
  ChevronRight, RefreshCw, AlertCircle, TrendingUp, Users,
  Check, ArrowRight, Lightbulb, BellRing
} from "lucide-react";
import { intelligenceService } from "../../../services/intelligence.service";
import { InteligenciaDashboardResumen, AlertaOperativa, AccionOperativa } from "../../../types";

interface Props {
  onNavigateToTab?: (tabId: string) => void;
  onOpenSocioDetail?: (socioId: string) => void;
}

export const ErpIntelligenceDashboard: React.FC<Props> = ({ onNavigateToTab, onOpenSocioDetail }) => {
  const [data, setData] = useState<InteligenciaDashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTabUrgencias, setActiveTabUrgencias] = useState<"criticas" | "altas" | "medias">("criticas");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await intelligenceService.getDashboard();
      setData(res);
    } catch (e) {
      console.error("Error cargando dashboard de inteligencia:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAnalysis = async () => {
    try {
      setRefreshing(true);
      await intelligenceService.runFullAnalysis();
      await loadData();
    } catch (e) {
      console.error("Error al ejecutar análisis:", e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarcarAccionCompletada = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await intelligenceService.updateAccion(id, { estado: "Completada" });
      await loadData();
    } catch (err) {
      console.error("Error al completar acción:", err);
    }
  };

  const handleResolverAlerta = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await intelligenceService.updateAlerta(id, { estado: "Resuelta" });
      await loadData();
    } catch (err) {
      console.error("Error al resolver alerta:", err);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="font-medium text-gray-700">Analizando indicadores de inteligencia operativa CeCIP...</p>
      </div>
    );
  }

  const kpis = data?.kpis;
  const urgencias = data?.bandejaUrgencias;
  const currentList = urgencias ? urgencias[activeTabUrgencias] : [];

  return (
    <div className="space-y-6">
      {/* Top Banner Operativo */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              CeCIP Intelligence V2
            </span>
            <span className="text-xs text-slate-400">Motor de Operaciones Autónomas</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Centro de Inteligencia Operativa</h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Detección preventiva de riesgos de socios, priorización de cobranzas, saturación de cupos y oportunidades comerciales basadas en datos reales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAnalysis}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-blue-900/30"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Analizando Sistema..." : "Ejecutar Análisis Ahora"}
          </button>
        </div>
      </div>

      {/* Grid de KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Salud General */}
        <div 
          onClick={() => onNavigateToTab?.("salud")}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Salud General Socios</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{kpis?.saludPromedio ?? 75}</span>
            <span className="text-sm font-semibold text-gray-500">/100 pts</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-gray-600">
            <span>{kpis?.sociosSaludablesCount ?? 0} socios estables</span>
            <span className="text-rose-600 font-bold">{kpis?.sociosRiesgoCount ?? 0} en riesgo</span>
          </div>
        </div>

        {/* Alertas Críticas */}
        <div 
          onClick={() => onNavigateToTab?.("alertas")}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Alertas Activas</span>
            <div className={`p-2 rounded-lg ${(kpis?.alertasCriticasCount || 0) > 0 ? "bg-rose-50 text-rose-600 animate-bounce" : "bg-amber-50 text-amber-600"}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{kpis?.alertasActivasCount ?? 0}</span>
            {(kpis?.alertasCriticasCount || 0) > 0 && (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700">
                {kpis?.alertasCriticasCount} Críticas
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Requieren atención del equipo operativo
          </div>
        </div>

        {/* Acciones Pendientes */}
        <div 
          onClick={() => onNavigateToTab?.("acciones")}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Bandeja de Acciones</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{kpis?.accionesPendientesCount ?? 0}</span>
            <span className="text-xs text-blue-600 font-medium">tareas pendientes</span>
          </div>
          <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Sugerencias priorizadas por IA y reglas
          </div>
        </div>

        {/* Oportunidades Detectadas */}
        <div 
          onClick={() => onNavigateToTab?.("oportunidades")}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Oportunidades</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-110 transition">
              <Lightbulb className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{kpis?.oportunidadesDetectadasCount ?? 0}</span>
            <span className="text-xs text-purple-600 font-medium">detectadas</span>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Convenios, capacitaciones y bolsa
          </div>
        </div>
      </div>

      {/* Sección Central: Bandeja de Urgencias ("Qué requiere atención hoy") */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bandeja de Urgencias (2 columnas) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <BellRing className="w-5 h-5 text-blue-600" />
                Qué requiere atención hoy
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Situaciones detectadas automáticamente que necesitan intervención del equipo
              </p>
            </div>

            {/* Pestañas de Criticidad */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTabUrgencias("criticas")}
                className={`px-3 py-1.5 rounded-md transition ${activeTabUrgencias === "criticas" ? "bg-white text-rose-700 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"}`}
              >
                Críticas ({urgencias?.criticas.length || 0})
              </button>
              <button
                onClick={() => setActiveTabUrgencias("altas")}
                className={`px-3 py-1.5 rounded-md transition ${activeTabUrgencias === "altas" ? "bg-white text-amber-700 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"}`}
              >
                Altas ({urgencias?.altas.length || 0})
              </button>
              <button
                onClick={() => setActiveTabUrgencias("medias")}
                className={`px-3 py-1.5 rounded-md transition ${activeTabUrgencias === "medias" ? "bg-white text-blue-700 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"}`}
              >
                Medias ({urgencias?.medias.length || 0})
              </button>
            </div>
          </div>

          {/* Lista de Urgencias */}
          <div className="p-5 divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[420px]">
            {currentList.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-gray-600">No hay situaciones pendientes en este nivel de urgencia.</p>
                <p className="text-xs text-gray-400 mt-1">El motor operativo está monitoreando en segundo plano.</p>
              </div>
            ) : (
              currentList.map((item: any) => {
                const isAlerta = "tipo" in item && !("origenTipo" in item);
                const isCritica = item.prioridad === "Crítica";
                const isAlta = item.prioridad === "Alta";

                return (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 hover:bg-gray-50/80 p-2 rounded-lg transition">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${isCritica ? "bg-rose-50 text-rose-600" : isAlta ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                        {isAlerta ? <AlertCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isCritica ? "bg-rose-100 text-rose-800" : isAlta ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                            {item.prioridad}
                          </span>
                          <span className="text-xs font-semibold text-gray-500 uppercase">
                            {isAlerta ? `Alerta: ${item.tipo}` : `Acción: ${item.origenTipo}`}
                          </span>
                          {item.socioNombre && (
                            <span 
                              onClick={() => item.socioId && onOpenSocioDetail?.(item.socioId)}
                              className="text-xs font-medium text-blue-600 hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded"
                            >
                              {item.socioNombre}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mt-1">{item.titulo}</h4>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.descripcion}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isAlerta ? (
                        <button
                          onClick={(e) => handleResolverAlerta(item.id, e)}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                          title="Marcar como resuelta"
                        >
                          Resolver
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleMarcarAccionCompletada(item.id, e)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition flex items-center gap-1"
                          title="Marcar completada"
                        >
                          <Check className="w-3 h-3" /> Hecho
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Actualizado en tiempo real por CeCIP Scheduler</span>
            <button 
              onClick={() => onNavigateToTab?.("acciones")}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              Ver bandeja completa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Distribución de Salud de la Matrícula */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Matriz de Salud CeCIP
              </h3>
              <button 
                onClick={() => onNavigateToTab?.("salud")}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Ver todos
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Distribución de socios por categoría de salud basada en 5 dimensiones (Financiera 35%, Relación 25%, Eventos 15%, Reclamos 15%, Antigüedad 10%).
            </p>

            {/* Barras de distribución */}
            <div className="space-y-3">
              {(data?.distribucionSalud || []).map((cat) => (
                <div key={cat.categoria}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{cat.categoria}</span>
                    <span className="text-gray-500 font-semibold">{cat.cantidad} socios ({cat.porcentaje}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(4, cat.porcentaje)}%`, 
                        backgroundColor: cat.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900">
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Sugerencia de Inteligencia Operativa
            </div>
            <p className="text-blue-800 leading-relaxed">
              Hay <strong className="text-rose-700">{kpis?.sociosRiesgoCount || 0} socio(s) en zona de riesgo</strong>. Asignar llamadas personalizadas antes del cierre de mes evitará la pérdida de cuotas sociales y reactivará el vínculo.
            </p>
          </div>
        </div>
      </div>

      {/* Oportunidades Destacadas & Bitácora IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Oportunidades */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-gray-900 text-base">Oportunidades de Impacto Comercial</h3>
            </div>
            <button 
              onClick={() => onNavigateToTab?.("oportunidades")}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {(data?.oportunidadesDestacadas || []).slice(0, 3).map((opo) => (
              <div key={opo.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    Score: {opo.score} pts
                  </span>
                  <span className="text-[11px] text-gray-400">{opo.fecha}</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">{opo.titulo}</h4>
                <p className="text-xs text-gray-600 mt-1">{opo.descripcion}</p>
                {opo.socioNombre && (
                  <div className="mt-2 text-xs font-medium text-blue-700">
                    Socio: {opo.socioNombre}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bitácora de Decisiones & Actividad IA */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-base">Bitácora de IA y Decisiones del Sistema</h3>
            </div>
            <button 
              onClick={() => onNavigateToTab?.("auditoria")}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              Ver trazabilidad
            </button>
          </div>

          <div className="space-y-3">
            {(data?.actividadRecienteIa || []).slice(0, 4).map((act) => (
              <div key={act.id} className="p-3 rounded-lg border border-gray-100 bg-white flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800 truncate">{act.accion}</span>
                    <span className="text-[10px] text-gray-400">{new Date(act.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{act.outputResumen}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                    <span>Modelo: {act.modelo || "gemini-3.7-flash"}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">{act.resultado}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

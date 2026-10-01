import React, { useState, useEffect } from "react";
import { 
  Bot, Play, CheckCircle2, AlertCircle, Clock, 
  RotateCcw, Power, Zap, RefreshCw, ShieldAlert, Sparkles,
  ChevronRight, ArrowRight
} from "lucide-react";
import { intelligenceService } from "../../../services/intelligence.service";
import { Automatizacion, AutomatizacionEjecucion } from "../../../types";

export const ErpAutomatizaciones: React.FC = () => {
  const [automatizaciones, setAutomatizaciones] = useState<Automatizacion[]>([]);
  const [ejecuciones, setEjecuciones] = useState<AutomatizacionEjecucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [autos, execs] = await Promise.all([
        intelligenceService.getAutomatizaciones(),
        intelligenceService.getAutomatizacionesEjecuciones(),
      ]);
      setAutomatizaciones(autos);
      setEjecuciones(execs);
    } catch (e) {
      console.error("Error al cargar automatizaciones:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await intelligenceService.toggleAutomatizacion(id);
      await loadData();
    } catch (e) {
      console.error("Error al alternar automatización:", e);
    }
  };

  const handleEjecutar = async (id: string) => {
    try {
      setExecutingId(id);
      await intelligenceService.ejecutarAutomatizacion(id);
      await loadData();
      alert("Automatización ejecutada exitosamente.");
    } catch (e) {
      console.error("Error al ejecutar automatización:", e);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" />
            Automatizaciones y Reglas Autónomas CeCIP
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Motor de ejecución periódica que detecta eventos críticos y dispara acciones, avisos y tareas de retención.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-lg border border-gray-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refrescar Estado
        </button>
      </div>

      {/* Grid de Automatizaciones Configuradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automatizaciones.map((auto) => {
          const isRunningThis = executingId === auto.id;
          return (
            <div
              key={auto.id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition flex flex-col justify-between ${
                auto.activa ? "border-blue-200" : "border-gray-200 opacity-75 bg-gray-50/50"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${auto.activa ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                    <h3 className="font-bold text-gray-900 text-base">{auto.nombre}</h3>
                  </div>

                  {/* Switch On/Off */}
                  <button
                    onClick={() => handleToggle(auto.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      auto.activa
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {auto.activa ? "Activa" : "Pausada"}
                  </button>
                </div>

                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{auto.descripcion}</p>

                {/* Parámetros & Triggers */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Disparador (Trigger):</span>
                    <span className="font-semibold text-gray-800 font-mono">{auto.triggerTipo}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Ejecuciones realizadas:</span>
                    <span className="font-semibold text-blue-700">{auto.ejecucionesCount || 0} veces</span>
                  </div>
                  {auto.ultimaEjecucion && (
                    <div className="flex items-center justify-between text-gray-500">
                      <span>Última corrida:</span>
                      <span className="text-gray-700">{new Date(auto.ultimaEjecucion).toLocaleString("es-AR")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Card */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Idempotente y auditable</span>
                <button
                  onClick={() => handleEjecutar(auto.id)}
                  disabled={isRunningThis}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunningThis ? "animate-spin" : ""}`} />
                  {isRunningThis ? "Ejecutando..." : "Ejecutar Ahora"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historial de Ejecuciones Recientes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          Registro de Ejecuciones Recientes
        </h3>

        <div className="divide-y divide-gray-100">
          {ejecuciones.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              No hay historial de ejecuciones registrado aún.
            </div>
          ) : (
            ejecuciones.map((ejec) => (
              <div key={ejec.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{ejec.automatizacionNombre}</h4>
                    <p className="text-gray-500 text-[11px]">
                      {ejec.socioNombre ? `Socio: ${ejec.socioNombre}` : `Entidad: ${ejec.entidadTipo}`} • Resultado: {JSON.stringify(ejec.resultado)}
                    </p>
                  </div>
                </div>

                <div className="text-right text-gray-400 text-[11px] shrink-0">
                  {new Date(ejec.inicio).toLocaleTimeString("es-AR")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { 
  Lightbulb, Sparkles, CheckCircle2, UserCheck, 
  ArrowRight, Briefcase, Award, GraduationCap, 
  RefreshCw, Check, X
} from "lucide-react";
import { intelligenceService } from "../../../services/intelligence.service";
import { OportunidadOperativa } from "../../../types";

interface Props {
  onOpenSocioDetail?: (socioId: string) => void;
}

export const ErpOportunidades: React.FC<Props> = ({ onOpenSocioDetail }) => {
  const [oportunidades, setOportunidades] = useState<OportunidadOperativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<string>("Todas");

  const loadOportunidades = async () => {
    try {
      setLoading(true);
      const res = await intelligenceService.getOportunidades();
      setOportunidades(res);
    } catch (e) {
      console.error("Error al cargar oportunidades:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOportunidades();
  }, []);

  const handleUpdateEstado = async (id: string, nuevoEstado: "Detectada" | "En contacto" | "Concretada" | "Descartada") => {
    try {
      await intelligenceService.updateOportunidad(id, { estado: nuevoEstado });
      await loadOportunidades();
    } catch (e) {
      console.error("Error al actualizar oportunidad:", e);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "convenio_no_utilizado":
        return <Award className="w-5 h-5 text-amber-600" />;
      case "perfil_laboral_busqueda":
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case "demanda_capacitacion":
        return <GraduationCap className="w-5 h-5 text-purple-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-emerald-600" />;
    }
  };

  const filtered = oportunidades.filter((o) => {
    if (filterEstado === "Todas") return true;
    return o.estado === filterEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            Oportunidades Operativas y Comerciales
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Detección proactiva de valor: convenios institucionales aplicables, perfiles de la Bolsa afines y demandas formativas.
          </p>
        </div>

        <button
          onClick={loadOportunidades}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-lg border border-gray-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refrescar Oportunidades
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        {["Todas", "Detectada", "En contacto", "Concretada", "Descartada"].map((st) => (
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

      {/* Grid de Oportunidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200 text-gray-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">No hay oportunidades en este estado.</p>
          </div>
        ) : (
          filtered.map((opo) => (
            <div
              key={opo.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                    {getTipoIcon(opo.tipo)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
                      Score: {opo.score}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      opo.estado === "Concretada" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                      opo.estado === "En contacto" ? "bg-blue-100 text-blue-800 border-blue-300" :
                      "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {opo.estado}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-base mt-3">{opo.titulo}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{opo.descripcion}</p>

                {opo.socioNombre && (
                  <div className="mt-3 text-xs bg-blue-50 text-blue-900 p-2 rounded-lg border border-blue-100 flex items-center justify-between">
                    <span>Socio destinatario:</span>
                    <strong 
                      onClick={() => opo.socioId && onOpenSocioDetail?.(opo.socioId)}
                      className="text-blue-700 hover:underline cursor-pointer"
                    >
                      {opo.socioNombre}
                    </strong>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                {opo.estado !== "Concretada" && (
                  <>
                    <button
                      onClick={() => handleUpdateEstado(opo.id, opo.estado === "En contacto" ? "Concretada" : "En contacto")}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      {opo.estado === "En contacto" ? "Marcar Concretada" : "Iniciar Gestión"}
                    </button>
                    <button
                      onClick={() => handleUpdateEstado(opo.id, "Descartada")}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Descartar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                {opo.estado === "Concretada" && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mx-auto">
                    <CheckCircle2 className="w-4 h-4" /> Oportunidad concretada con éxito
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

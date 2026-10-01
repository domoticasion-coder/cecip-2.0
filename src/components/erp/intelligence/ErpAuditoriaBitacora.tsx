import React, { useState, useEffect } from "react";
import { 
  FileText, Activity, ShieldCheck, Sparkles, 
  Search, Filter, RefreshCw, Clock, User, CheckCircle2
} from "lucide-react";
import { intelligenceService } from "../../../services/intelligence.service";
import { AuditoriaEntry, IaActividad } from "../../../types";

export const ErpAuditoriaBitacora: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"auditoria" | "ia">("auditoria");
  const [auditoria, setAuditoria] = useState<AuditoriaEntry[]>([]);
  const [iaActividad, setIaActividad] = useState<IaActividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [auds, ias] = await Promise.all([
        intelligenceService.getAuditoria(),
        intelligenceService.getIaActividad(),
      ]);
      setAuditoria(auds);
      setIaActividad(ias);
    } catch (e) {
      console.error("Error al cargar auditoría:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAuditoria = auditoria.filter(
    (a) =>
      searchTerm === "" ||
      a.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.entidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIa = iaActividad.filter(
    (i) =>
      searchTerm === "" ||
      i.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.inputResumen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.outputResumen?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Trazabilidad, Auditoría y Bitácora IA
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Registro inmutable de acciones del sistema, cambios de estado en socios, ejecución de reglas e interacciones con CeCIP Copilot.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-lg border border-gray-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refrescar Bitácora
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("auditoria")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "auditoria"
                ? "bg-white text-gray-900 shadow-sm font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            Auditoría General ({auditoria.length})
          </button>
          <button
            onClick={() => setActiveTab("ia")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "ia"
                ? "bg-white text-blue-900 shadow-sm font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Bitácora de IA y Copilot ({iaActividad.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar en registros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vista de Auditoría General */}
      {activeTab === "auditoria" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {filteredAuditoria.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No se encontraron registros de auditoría.
            </div>
          ) : (
            filteredAuditoria.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50/80 transition flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 uppercase font-mono px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                      {item.accion}
                    </span>
                    <span className="text-gray-500 font-semibold">Entidad: {item.entidad}</span>
                    {item.entidadId && <span className="text-gray-400 font-mono">({item.entidadId})</span>}
                  </div>
                  <div className="text-gray-600 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Operador: <strong>{item.usuarioNombre}</strong></span>
                  </div>
                  {item.despues && (
                    <div className="mt-1 p-2 rounded bg-gray-50 border border-gray-100 font-mono text-[11px] text-gray-700 max-w-2xl overflow-x-auto">
                      {JSON.stringify(item.despues)}
                    </div>
                  )}
                </div>

                <div className="text-right text-gray-400 font-mono text-[11px] shrink-0">
                  {new Date(item.fecha).toLocaleString("es-AR")}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vista de Bitácora IA */}
      {activeTab === "ia" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {filteredIa.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No se encontraron registros de actividad de IA.
            </div>
          ) : (
            filteredIa.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50/80 transition flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-900 uppercase font-mono px-2 py-0.5 bg-purple-50 border border-purple-200 rounded text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      {item.tipo}
                    </span>
                    <span className="font-bold text-gray-900">{item.accion}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                      {item.resultado}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Operador: <strong className="text-gray-700">{item.usuarioNombre}</strong> • Modelo: <span className="font-mono">{item.modelo || "gemini-3.7-flash"}</span>
                  </div>
                  {item.inputResumen && (
                    <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                      <strong className="text-gray-500">Entrada:</strong> {item.inputResumen}
                    </p>
                  )}
                  {item.outputResumen && (
                    <p className="text-blue-950 bg-blue-50/50 p-2 rounded border border-blue-100 mt-1">
                      <strong className="text-blue-700">Respuesta / Acción:</strong> {item.outputResumen}
                    </p>
                  )}
                </div>

                <div className="text-right text-gray-400 font-mono text-[11px] shrink-0">
                  {new Date(item.fecha).toLocaleString("es-AR")}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

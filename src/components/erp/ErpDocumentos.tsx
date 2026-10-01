import React, { useState } from "react";
import { ErpDoc, ErpTicket, ErpSocio } from "../../types";
import { 
  Folder, FileText, Download, Plus, Upload, Trash2, Shield, Search, 
  CheckCircle, MessageSquare, AlertCircle, Play, Send, Bot, Sparkles, 
  FileCheck, HelpCircle, FileSpreadsheet, ArrowRight, ClipboardList
} from "lucide-react";

interface ErpDocumentosProps {
  docs: ErpDoc[];
  tickets: ErpTicket[];
  socios: ErpSocio[];
  onSaveDocs: (updated: ErpDoc[]) => void;
  onSaveTickets: (updated: ErpTicket[]) => void;
  role: string;
}

export default function ErpDocumentos({ 
  docs, tickets, socios, onSaveDocs, onSaveTickets, role 
}: ErpDocumentosProps) {
  const [activeTab, setActiveTab] = useState<"documentos" | "tickets" | "ai">("documentos");
  
  // Document section states
  const [selectedFolder, setSelectedFolder] = useState<string>("todos");
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formDoc, setFormDoc] = useState({
    nombre: "",
    carpeta: "Actas" as any,
    descripcion: ""
  });

  // Ticket states
  const [selectedTicket, setSelectedTicket] = useState<ErpTicket | null>(tickets[0] || null);
  const [newCommentText, setNewCommentText] = useState("");
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [formTicket, setFormTicket] = useState({
    asunto: "",
    prioridad: "Media" as "Alta" | "Media" | "Baja",
    descripcion: "",
    categoria: "Facturación" as any
  });

  // AI Assistant states
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{ sender: "user" | "bot"; text: string; date: string }>>([
    {
      sender: "bot",
      text: "¡Hola! Soy **CeCIP Inteligente**, su asistente con IA para el Área de Gestión. Puedo ayudarlo a redactar comunicados oficiales, analizar indicadores de morosidad, sugerir respuestas a tickets de soporte o resumir actas institucionales. ¿En qué puedo colaborar hoy?",
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const canEdit = ["Administrador General", "Gerencia", "Prensa", "Atención al Socio", "Administración"].includes(role);

  // File drag & drop simulator
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Create new document entry
      const newDoc: ErpDoc = {
        id: `doc-drop-${Date.now()}`,
        nombre: file.name,
        carpeta: "Reglamentos",
        version: "1.0",
        fechaSubida: new Date().toISOString().split("T")[0],
        tamanio: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        permisos: ["Administrador General", "Gerencia"],
        descargasCount: 0
      };
      onSaveDocs([newDoc, ...docs]);
      alert(`¡Archivo "${file.name}" cargado con éxito en la sección "Reglamentos"!`);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc: ErpDoc = {
        id: `doc-man-${Date.now()}`,
        nombre: file.name,
        carpeta: "Reglamentos",
        version: "1.0",
        fechaSubida: new Date().toISOString().split("T")[0],
        tamanio: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        permisos: ["Administrador General", "Gerencia"],
        descargasCount: 0
      };
      onSaveDocs([newDoc, ...docs]);
      alert(`¡Archivo "${file.name}" cargado con éxito!`);
    }
  };

  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const newDoc: ErpDoc = {
      id: `doc-form-${Date.now()}`,
      nombre: formDoc.nombre.endsWith(".pdf") ? formDoc.nombre : `${formDoc.nombre}.pdf`,
      carpeta: formDoc.carpeta,
      version: "1.0",
      fechaSubida: new Date().toISOString().split("T")[0],
      tamanio: "1.4 MB",
      permisos: ["Administrador General", "Gerencia"],
      descargasCount: 0
    };

    onSaveDocs([newDoc, ...docs]);
    setShowAddDocModal(false);
    setFormDoc({ nombre: "", carpeta: "Actas", descripcion: "" });
  };

  const handleDeleteDoc = (id: string) => {
    if (!canEdit) return;
    if (!window.confirm("¿Está seguro de que desea eliminar permanentemente este documento del repositorio oficial?")) return;
    onSaveDocs(docs.filter(d => d.id !== id));
  };

  // TICKETS LOGIC
  const handleAddComment = () => {
    if (!newCommentText.trim() || !selectedTicket) return;

    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          mensajes: [
            ...t.mensajes,
            {
              id: `comm-${Date.now()}`,
              remitente: role,
              rol: "staff" as const,
              texto: newCommentText,
              fecha: `${new Date().toISOString().split("T")[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            }
          ]
        };
      }
      return t;
    });

    onSaveTickets(updated);
    const updatedTicket = updated.find(t => t.id === selectedTicket.id);
    if (updatedTicket) setSelectedTicket(updatedTicket);
    setNewCommentText("");
  };

  const handleUpdateTicketStatus = (status: "Pendiente" | "En proceso" | "Resuelto" | "Cerrado") => {
    if (!selectedTicket) return;
    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          estado: status,
          mensajes: [
            ...t.mensajes,
            {
              id: `stat-${Date.now()}`,
              remitente: "Sistema CeCIP",
              rol: "staff" as const,
              texto: `El estado del ticket cambió a: **${status}**`,
              fecha: `${new Date().toISOString().split("T")[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            }
          ]
        };
      }
      return t;
    });
    onSaveTickets(updated);
    const updatedTicket = updated.find(t => t.id === selectedTicket.id);
    if (updatedTicket) setSelectedTicket(updatedTicket);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newT: ErpTicket = {
      id: `tick-${Date.now()}`,
      socioId: "soc-1",
      socioNombre: "Fiambrería El Ombú",
      titulo: formTicket.asunto,
      categoria: formTicket.categoria,
      estado: "Pendiente",
      fechaCreacion: new Date().toISOString().split("T")[0],
      ultimaActualizacion: new Date().toISOString().split("T")[0],
      mensajes: [
        {
          id: `t-init-${Date.now()}`,
          remitente: "Fiambrería El Ombú",
          rol: "socio",
          texto: formTicket.descripcion,
          fecha: `${new Date().toISOString().split("T")[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        }
      ]
    };

    onSaveTickets([newT, ...tickets]);
    setSelectedTicket(newT);
    setShowAddTicketModal(false);
  };

  // AI SUGGESTED REPLY FOR TICKETS
  const handleAiSuggestReply = async () => {
    if (!selectedTicket) return;
    setIsAiThinking(true);
    
    try {
      const prompt = `Genera una respuesta institucional cordial y ejecutiva para el siguiente ticket de soporte de un socio del CeCIP:\n- Socio: ${selectedTicket.socioNombre}\n- Categoría: ${selectedTicket.categoria}\n- Asunto: ${selectedTicket.titulo}\n- Mensajes previos:\n${selectedTicket.mensajes.map((m: any) => `${m.remitente}: ${m.texto}`).join("\n")}\n\nEscribe directamente el borrador de respuesta firmado por el área correspondiente del CeCIP Paraná.`;
      
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          erpContext: { docs, tickets, socios },
          userRole: role,
        }),
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      const data = await response.json();
      const suggestion = data.reply || "No se pudo generar la sugerencia.";

      setNewCommentText(`✨ [Sugerencia de CeCIP IA]:\n\n${suggestion}`);
    } catch (err: any) {
      console.error("Error generating ticket reply:", err);
      // Fallback
      const fallback = `Estimado socio de **${selectedTicket.socioNombre}**,\n\nHemos recibido y verificado su consulta referente a: "${selectedTicket.titulo}". Nuestro equipo administrativo se encuentra gestionando su solicitud para brindarle una resolución prioritaria.\n\nQuedamos a su entera disposición.\n\nAtentamente,\n**Atención al Socio - CeCIP Paraná**`;
      setNewCommentText(`✨ [Sugerencia de CeCIP IA]:\n\n${fallback}`);
    } finally {
      setIsAiThinking(false);
    }
  };

  // CHATBOT INTERACTION
  const handleSendAiMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiChatInput.trim() || isAiThinking) return;

    const userMsg = {
      sender: "user" as const,
      text: aiChatInput,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    const prompt = aiChatInput;
    setAiChatInput("");
    setIsAiThinking(true);

    try {
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          history: aiMessages.map(m => ({ sender: m.sender, text: m.text })),
          erpContext: { docs, tickets, socios },
          userRole: role,
        }),
      });

      if (!response.ok) throw new Error("Error en la conexión con la IA");
      const data = await response.json();
      const replyText = data.reply || "No se pudo obtener una respuesta.";

      setAiMessages(prev => [...prev, {
        sender: "bot",
        text: replyText,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      console.error("Error en CeCIP IA Documentos:", err);
      setAiMessages(prev => [...prev, {
        sender: "bot",
        text: `⚠️ **Error al consultar la IA:** ${err.message || "Verifique la conexión al servidor."}`,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Quick Action AI prompt triggers
  const triggerQuickAiPrompt = (prompt: string) => {
    setAiChatInput(prompt);
    // Submit in next frame
    setTimeout(() => {
      const btn = document.getElementById("send-ai-btn");
      if (btn) btn.click();
    }, 50);
  };

  // Filters
  const filteredDocs = docs.filter(d => selectedFolder === "todos" || d.carpeta === selectedFolder);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub tabs header */}
      <div className="border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center pb-2">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("documentos")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === "documentos" ? "bg-cecip-blue text-white shadow" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
          >
            Repositorio Documental
          </button>
          <button 
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === "tickets" ? "bg-cecip-blue text-white shadow" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
          >
            Mesa de Ayuda (Tickets)
          </button>
          <button 
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "ai" ? "bg-indigo-600 text-white shadow" : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"}`}
          >
            <Sparkles size={13} />
            <span>Asistente IA CeCIP</span>
          </button>
        </div>

        {activeTab === "documentos" && canEdit && (
          <button 
            onClick={() => setShowAddDocModal(true)}
            className="px-3.5 py-1.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={13} />
            <span>Subir Documento</span>
          </button>
        )}

        {activeTab === "tickets" && (
          <button 
            onClick={() => setShowAddTicketModal(true)}
            className="px-3.5 py-1.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={13} />
            <span>Crear Ticket Interno</span>
          </button>
        )}
      </div>

      {/* VIEW 1: REPOSITORIO DOCUMENTAL */}
      {activeTab === "documentos" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left folders panel */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carpetas Institucionales</h3>
            
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
              <button 
                onClick={() => setSelectedFolder("todos")}
                className={`w-full p-2.5 rounded-xl text-xs text-left font-bold flex items-center gap-2 transition-all cursor-pointer ${selectedFolder === "todos" ? "bg-slate-100 dark:bg-slate-700 text-slate-950 dark:text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Folder size={15} className="text-amber-500 shrink-0" />
                <span>Todos los Documentos</span>
              </button>
              <button 
                onClick={() => setSelectedFolder("Actas de Comisión")}
                className={`w-full p-2.5 rounded-xl text-xs text-left font-bold flex items-center gap-2 transition-all cursor-pointer ${selectedFolder === "Actas de Comisión" ? "bg-slate-100 dark:bg-slate-700 text-slate-950 dark:text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Folder size={15} className="text-amber-500 shrink-0" />
                <span>Actas de Comisión</span>
              </button>
              <button 
                onClick={() => setSelectedFolder("Balances Contables")}
                className={`w-full p-2.5 rounded-xl text-xs text-left font-bold flex items-center gap-2 transition-all cursor-pointer ${selectedFolder === "Balances Contables" ? "bg-slate-100 dark:bg-slate-700 text-slate-950 dark:text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Folder size={15} className="text-amber-500 shrink-0" />
                <span>Balances Contables</span>
              </button>
              <button 
                onClick={() => setSelectedFolder("Estatutos y Convenios")}
                className={`w-full p-2.5 rounded-xl text-xs text-left font-bold flex items-center gap-2 transition-all cursor-pointer ${selectedFolder === "Estatutos y Convenios" ? "bg-slate-100 dark:bg-slate-700 text-slate-950 dark:text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Folder size={15} className="text-amber-500 shrink-0" />
                <span>Estatutos y Convenios</span>
              </button>
            </div>

            {/* Drag and Drop Box */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${dragActive ? "border-cecip-blue bg-blue-50/20" : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900"}`}
            >
              <input type="file" onChange={handleManualUpload} className="hidden" id="file-uploader" />
              <label htmlFor="file-uploader" className="cursor-pointer space-y-2 block">
                <Upload size={22} className="text-slate-400 mx-auto" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Arrastre archivos aquí o haga clic para subir desde disco
                </p>
              </label>
            </div>
          </div>

          {/* Right file list */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Archivos en Repositorio</h3>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Nombre del Documento</th>
                      <th className="p-4">Carpeta</th>
                      <th className="p-4">Fecha de Subida</th>
                      <th className="p-4">Versión</th>
                      <th className="p-4">Tamaño</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No hay archivos registrados en esta carpeta.
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <FileText size={15} className="text-slate-400 shrink-0" />
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">{doc.nombre}</span>
                                <span className="text-[10px] text-slate-400 font-medium block">Permisos: {doc.permisos?.join(", ") || "Todos"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[9px]">
                              {doc.carpeta}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 font-mono">{doc.fechaSubida}</td>
                          <td className="p-4 font-mono">v{doc.version}</td>
                          <td className="p-4 text-slate-400 font-mono">{doc.tamanio}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => alert(`Simulando descarga oficial de archivo: ${doc.nombre}\nTamaño: ${doc.tamanio}\nEstado: Seguro (Auditado digitalmente por CeCIP Cloud)`)}
                                className="p-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-cecip-blue hover:bg-slate-50 rounded cursor-pointer"
                                title="Descargar copia del documento"
                              >
                                <Download size={13} />
                              </button>
                              {canEdit && (
                                <button 
                                  onClick={() => handleDeleteDoc(doc.id)}
                                  className="p-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded cursor-pointer"
                                  title="Eliminar documento"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MESA DE AYUDA (TICKETS) */}
      {activeTab === "tickets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tickets List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tickets de Soporte Activos</h3>

            <div className="space-y-3">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full p-4 rounded-2xl border text-left space-y-2.5 transition-all cursor-pointer ${selectedTicket?.id === t.id ? "bg-cecip-blue/5 dark:bg-slate-700/60 border-cecip-blue shadow-sm" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                      {t.categoria}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      t.estado === "Pendiente" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                      t.estado === "En proceso" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" :
                      "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                    }`}>
                      {t.estado.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{t.titulo}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Socio: {t.socioNombre}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ticket detail thread */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTicket ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between min-h-[460px]">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900 flex flex-wrap gap-4 justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase">Detalles del Caso / Ticket</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{selectedTicket.titulo}</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Estado:</label>
                    <select 
                      value={selectedTicket.estado}
                      onChange={(e) => handleUpdateTicketStatus(e.target.value as any)}
                      className="p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold cursor-pointer dark:text-white"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En proceso">En proceso</option>
                      <option value="Resuelto">Resuelto</option>
                      <option value="Cerrado">Cerrado</option>
                    </select>
                  </div>
                </div>

                {/* Comment log thread */}
                <div className="p-5 flex-1 space-y-4 max-h-[300px] overflow-y-auto">
                  {selectedTicket.mensajes.map((msg) => (
                    <div key={msg.id} className={`p-4 rounded-2xl text-xs space-y-1.5 ${
                      msg.rol === "staff" || msg.remitente === role ? "bg-blue-50/60 dark:bg-slate-700/40 border border-blue-100/40 ml-8" : "bg-slate-50 dark:bg-slate-900/60 mr-8"
                    }`}>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{msg.remitente}</span>
                        <span className="text-slate-400 font-mono">{msg.fecha}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{msg.texto}</p>
                    </div>
                  ))}
                </div>

                {/* Footer Reply area */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-700/60 space-y-3 bg-slate-50/50 dark:bg-slate-900">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Responder Reclamo / Inquietud</p>
                    
                    {/* IA helper button */}
                    <button
                      type="button"
                      onClick={handleAiSuggestReply}
                      disabled={isAiThinking}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Bot size={13} />
                      <span>{isAiThinking ? "Sugiriendo..." : "Sugerir Respuesta con IA"}</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <textarea 
                      rows={3}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Escriba un comentario o respuesta para el asociado..."
                      className="flex-1 p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs focus:outline-none dark:text-white"
                    />
                    <button 
                      onClick={handleAddComment}
                      className="px-4 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm self-end py-3"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center text-xs text-slate-400 bg-white dark:bg-slate-800">
                Seleccione un ticket de soporte de la lista izquierda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: INTEGRATED AI ASSISTANT CONSOLE */}
      {activeTab === "ai" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Preset trigger prompts */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Herramientas Especiales de IA</h3>

            <div className="space-y-3">
              <button 
                onClick={() => triggerQuickAiPrompt("Analizar riesgo de morosidad en el padrón de socios del CeCIP.")}
                className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-100 rounded-2xl text-left transition-all cursor-pointer space-y-1.5 block group"
              >
                <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-cecip-blue dark:text-blue-300 rounded-lg inline-block group-hover:scale-110 transition-transform">
                  <ClipboardList size={14} />
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Análisis de Morosidad</h4>
                <p className="text-[10px] text-slate-400">Detecta socios a riesgo de deserción o mora.</p>
              </button>

              <button 
                onClick={() => triggerQuickAiPrompt("Redactar un comunicado oficial para aumento de cuota social del mes que viene.")}
                className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-100 rounded-2xl text-left transition-all cursor-pointer space-y-1.5 block group"
              >
                <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 rounded-lg inline-block group-hover:scale-110 transition-transform">
                  <FileCheck size={14} />
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Redactar Comunicado</h4>
                <p className="text-[10px] text-slate-400">Genera correspondencia oficial o avisos.</p>
              </button>

              <button 
                onClick={() => triggerQuickAiPrompt("Resumir y sintetizar el Acta de Comisión Directiva Nº 112.")}
                className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-100 rounded-2xl text-left transition-all cursor-pointer space-y-1.5 block group"
              >
                <span className="p-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded-lg inline-block group-hover:scale-110 transition-transform">
                  <MessageSquare size={14} />
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Sintetizar Actas</h4>
                <p className="text-[10px] text-slate-400">Extrae las resoluciones tomadas por la comisión.</p>
              </button>
            </div>
          </div>

          {/* Active chat window */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-[450px]">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/20 dark:from-slate-900 dark:to-slate-800 flex items-center gap-3">
                <span className="p-2.5 bg-cecip-blue text-white rounded-xl">
                  <Bot size={18} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>CeCIP Inteligente</span>
                    <Sparkles size={11} className="text-amber-500" />
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Asistente administrativo de autogestión | Gemini AI</p>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="p-5 flex-1 space-y-4 overflow-y-auto">
                {aiMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "bot" && (
                      <span className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center justify-center shrink-0">
                        <Bot size={14} />
                      </span>
                    )}

                    <div className={`p-4 rounded-2xl text-xs max-w-md ${
                      msg.sender === "user" 
                        ? "bg-cecip-blue text-white font-medium" 
                        : "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed font-medium"
                    }`}>
                      <p>{msg.text}</p>
                      <span className={`text-[8px] font-mono block mt-1.5 text-right ${msg.sender === "user" ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                        {msg.date}
                      </span>
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="flex gap-3 justify-start">
                    <span className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center justify-center shrink-0 animate-bounce">
                      <Bot size={14} />
                    </span>
                    <div className="p-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                      <span>CeCIP IA está procesando los indicadores del ERP...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Chat form */}
              <form onSubmit={handleSendAiMessage} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex gap-2">
                <input 
                  type="text"
                  placeholder="Consulte a la IA sobre morosidad, comunicados o actas..."
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  className="flex-1 p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs focus:outline-none dark:text-white"
                />
                <button 
                  id="send-ai-btn"
                  type="submit"
                  className="px-4 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADD DOC MODAL */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-slate-100 dark:border-slate-700">
            <div className="bg-cecip-blue text-white px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm">Cargar Nuevo Documento Institucional</h4>
              <button onClick={() => setShowAddDocModal(false)} className="text-white hover:text-white/80 cursor-pointer">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddDocSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Nombre del Archivo</label>
                <input 
                  type="text"
                  required
                  placeholder="ej: Acta de Asamblea General 2026"
                  value={formDoc.nombre}
                  onChange={(e) => setFormDoc({ ...formDoc, nombre: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Carpeta Destino</label>
                <select 
                  value={formDoc.carpeta}
                  onChange={(e) => setFormDoc({ ...formDoc, carpeta: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                >
                  <option value="Actas de Comisión">Actas de Comisión</option>
                  <option value="Balances Contables">Balances Contables</option>
                  <option value="Estatutos y Convenios">Estatutos y Convenios</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Descripción / Notas</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Describa el contenido principal del documento para búsquedas internas..."
                  value={formDoc.descripcion}
                  onChange={(e) => setFormDoc({ ...formDoc, descripcion: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Subir Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TICKET MODAL */}
      {showAddTicketModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-slate-100 dark:border-slate-700">
            <div className="bg-cecip-blue text-white px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm">Abrir Caso / Ticket Interno</h4>
              <button onClick={() => setShowAddTicketModal(false)} className="text-white hover:text-white/80 cursor-pointer">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Asunto / Tema del Reclamo</label>
                <input 
                  type="text"
                  required
                  placeholder="ej: Problema de cobro por Mercado Pago / Error catálogo"
                  value={formTicket.asunto}
                  onChange={(e) => setFormTicket({ ...formTicket, asunto: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Prioridad</label>
                  <select 
                    value={formTicket.prioridad}
                    onChange={(e) => setFormTicket({ ...formTicket, prioridad: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Categoría</label>
                  <select 
                    value={formTicket.categoria}
                    onChange={(e) => setFormTicket({ ...formTicket, categoria: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    <option value="Facturación">Facturación</option>
                    <option value="Soporte Web">Soporte Web</option>
                    <option value="Capacitaciones">Capacitaciones</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Descripción del Inconveniente</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Describa de forma detallada el inconveniente reportado..."
                  value={formTicket.descripcion}
                  onChange={(e) => setFormTicket({ ...formTicket, descripcion: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowAddTicketModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Abrir Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  X, 
  RotateCcw, 
  Building2, 
  User, 
  HelpCircle, 
  ExternalLink,
  ChevronDown,
  Minimize2,
  Maximize2,
  Bot
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
}

const DEFAULT_SUGGESTIONS = [
  "¿Cómo asociar mi empresa a CeCIP?",
  "¿Dónde queda la sede y cuáles son los horarios?",
  "¿Qué beneficios y servicios ofrece CeCIP?",
  "¿Cuáles son las próximas capacitaciones?",
  "¿Cómo funciona la Bolsa de Empleo?",
  "¿Qué comercios e industrias están asociados?"
];

export default function CecipCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "copilot",
      text: "¡Hola! 👋 Soy **CeCIP Copilot**, el asistente de inteligencia institucional del **Centro Comercial e Industrial de Paraná** (fundado en 1898).\n\nPuedo responder todas tus dudas sobre:\n* **Padrón de Comercios**: Consultar comercios, industrias y servicios asociados.\n* **Asociarse**: Requisitos, cuotas y asesoramiento técnico/legal.\n* **Capacitaciones y Eventos**: Cursos CAME/CAC, talleres y fechas clave.\n* **Bolsa de Empleo**: Carga de CVs y selección de personal para pymes.\n* **Sede Central**: 25 de Mayo 28, 1° Piso (Paraná) · Tel: (0343) 4312785.\n\n¿En qué puedo ayudarte hoy?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Build lightweight conversation history
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          userRole: "Visitante Web Pública"
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || "Disculpa, no pude procesar la respuesta en este momento. Por favor comunicate al 0343 4312785 o intenta nuevamente.";

      const copilotMsg: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: "copilot",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, copilotMsg]);
    } catch (err) {
      console.error("Error connecting to CeCIP Copilot:", err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "copilot",
        text: "Hubo una intermitencia de conexión con nuestro servidor. Puedes comunicarte directamente con CeCIP Paraná al **0343 4312785** o enviar un correo a **info@centrocomercialparana.com.ar**.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "copilot",
        text: "¡Conversación reiniciada! ¿En qué otra consulta institucional o comercial sobre CeCIP Paraná puedo colaborar?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      
      {/* 1. CHAT WINDOW DIALOG */}
      {isOpen && (
        <div 
          className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-200 mb-3 origin-bottom-right ${
            isMinimized 
              ? "w-80 h-14" 
              : "w-[94vw] sm:w-[410px] md:w-[430px] h-[580px] max-h-[82vh]"
          }`}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#0c2356] via-[#09357a] to-[#00a3e0] text-white px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-black shadow-inner">
                  <Sparkles size={18} className="text-[#38bdf8]" />
                </div>
                {/* Active green status dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0c2356] rounded-full" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight text-white">CeCIP Copilot</h3>
                  <span className="text-[10px] font-semibold bg-white/20 text-sky-100 px-1.5 py-0.2 rounded uppercase tracking-wider">
                    IA
                  </span>
                </div>
                <span className="text-[11px] text-sky-200/90 font-medium">
                  Centro Comercial e Industrial de Paraná
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <button
                  onClick={handleResetChat}
                  title="Reiniciar chat"
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw size={15} />
                </button>
              )}

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Maximizar" : "Minimizar"}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Cerrar asistente"
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Body Content (Hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-4.5 space-y-4 bg-slate-50/70 text-left text-xs sm:text-[13px] leading-relaxed">
                
                {/* Institutional Info Ribbon */}
                <div className="p-2.5 bg-sky-50/80 border border-sky-100 rounded-xl text-slate-600 text-[11px] flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-[#00a3e0] shrink-0" />
                    <span>Sede: 25 de Mayo 28, 1º piso · Paraná</span>
                  </span>
                  <a href="tel:03434312785" className="text-[#00a3e0] font-bold hover:underline shrink-0">
                    0343 4312785
                  </a>
                </div>

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                        m.sender === "user"
                          ? "bg-[#00a3e0] text-white rounded-br-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                      }`}
                    >
                      {m.sender === "copilot" ? (
                        <div className="prose prose-xs max-w-none text-slate-800 [&_ul]:my-1.5 [&_ul]:pl-4 [&_li]:my-0.5 [&_p]:my-1 font-normal">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200/80 w-fit shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-blue-50 text-[#00a3e0] flex items-center justify-center animate-spin">
                      <Sparkles size={12} />
                    </div>
                    <span className="text-slate-500 text-xs font-medium animate-pulse">
                      CeCIP Copilot consultando información...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions Pills */}
              <div className="px-3.5 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <HelpCircle size={11} /> Preguntas frecuentes:
                </span>
                {DEFAULT_SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sug)}
                    className="text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-[#00a3e0] hover:border-blue-200 border border-slate-200 rounded-lg px-2.5 py-1 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Escribe tu consulta sobre CeCIP..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#00a3e0] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="w-9 h-9 rounded-xl bg-[#00a3e0] hover:bg-[#0c2356] disabled:opacity-40 disabled:hover:bg-[#00a3e0] text-white flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer"
                    title="Enviar pregunta"
                  >
                    <Send size={15} />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
                  <span>CeCIP Paraná · Base Oficial 2026</span>
                  <span>Respuestas automáticas inteligentes</span>
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* 2. FLOATING LAUNCHER BUBBLE BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#0c2356] via-[#09357a] to-[#00a3e0] text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
          title="Abrir CeCIP Copilot (Asistente IA)"
        >
          {/* Pulsing indicator ring */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
          </span>

          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Sparkles size={16} className="text-[#38bdf8] group-hover:rotate-12 transition-transform" />
          </div>

          <div className="flex flex-col text-left pr-1">
            <span className="text-xs font-extrabold tracking-tight leading-none text-white flex items-center gap-1">
              CeCIP Copilot
              <span className="text-[9px] bg-white/25 px-1 py-0.2 rounded font-bold uppercase text-sky-200">
                IA
              </span>
            </span>
            <span className="text-[10px] text-sky-200 font-medium leading-tight mt-0.5">
              ¿Consultas? Preguntame aquí
            </span>
          </div>
        </button>
      )}

    </div>
  );
}

import React, { useState } from "react";
import { ErpEvent, ErpEnrollment, ErpConvenio } from "../../types";
import { 
  Plus, Calendar, Award, User, Clock, MapPin, ShieldCheck, 
  Search, QrCode, Mail, Download, ArrowRight, CheckCircle, Tag, Sparkles
} from "lucide-react";

interface ErpEventosProps {
  events: ErpEvent[];
  enrollments: ErpEnrollment[];
  convenios: ErpConvenio[];
  onSaveEvents: (updated: ErpEvent[]) => void;
  onSaveEnrollments: (updated: ErpEnrollment[]) => void;
  onSaveConvenios: (updated: ErpConvenio[]) => void;
  role: string;
}

export default function ErpEventos({ 
  events, enrollments, convenios, onSaveEvents, onSaveEnrollments, onSaveConvenios, role 
}: ErpEventosProps) {
  const [activeTab, setActiveTab] = useState<"eventos" | "convenios">("eventos");
  const [selectedEvent, setSelectedEvent] = useState<ErpEvent | null>(events[0] || null);
  
  // Event Form State
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [formEvent, setFormEvent] = useState({
    titulo: "",
    fecha: "",
    hora: "19:00",
    lugar: "Salón Auditorio CeCIP, Paraná",
    cuposMax: 50,
    descripcion: "",
    orador: "",
    categoria: "Curso" as any
  });

  // Convenio Form State
  const [showAddConvenioModal, setShowAddConvenioModal] = useState(false);
  const [formConvenio, setFormConvenio] = useState({
    titulo: "",
    descripcion: "",
    descuento: "15% OFF",
    vigencia: "Hasta 31/12/2026",
    categoria: "Comercios" as any
  });

  // Certificate Modal State
  const [certificateWinner, setCertificateWinner] = useState<ErpEnrollment | null>(null);

  const canEdit = ["Administrador General", "Gerencia", "Prensa", "Atención al Socio"].includes(role);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const newEv: ErpEvent = {
      id: `ev-${Date.now()}`,
      titulo: formEvent.titulo,
      fecha: formEvent.fecha,
      hora: formEvent.hora,
      lugar: formEvent.lugar,
      cuposMax: formEvent.cuposMax,
      cuposInscriptos: 0,
      asistentesCount: 0,
      descripcion: formEvent.descripcion,
      orador: formEvent.orador,
      categoria: formEvent.categoria
    };

    onSaveEvents([newEv, ...events]);
    setSelectedEvent(newEv);
    setShowAddEventModal(false);
    
    // Reset form
    setFormEvent({
      titulo: "",
      fecha: "",
      hora: "19:00",
      lugar: "Salón Auditorio CeCIP, Paraná",
      cuposMax: 50,
      descripcion: "",
      orador: "",
      categoria: "Curso"
    });
  };

  const handleAddConvenio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const newConv: ErpConvenio = {
      id: `conv-${Date.now()}`,
      titulo: formConvenio.titulo,
      descripcion: formConvenio.descripcion,
      descuento: formConvenio.descuento,
      adheridos: [],
      vigencia: formConvenio.vigencia,
      categoria: formConvenio.categoria
    };

    onSaveConvenios([newConv, ...convenios]);
    setShowAddConvenioModal(false);

    // Reset form
    setFormConvenio({
      titulo: "",
      descripcion: "",
      descuento: "15% OFF",
      vigencia: "Hasta 31/12/2026",
      categoria: "Comercios"
    });
  };

  // Toggle Attendance
  const toggleAttendance = (enrolId: string) => {
    const updated = enrollments.map(en => {
      if (en.id === enrolId) return { ...en, asistio: !en.asistio };
      return en;
    });
    onSaveEnrollments(updated);

    // Recalculate event attendeesCount
    if (selectedEvent) {
      const activeAttendeeCount = updated.filter(en => en.eventoId === selectedEvent.id && en.asistio).length;
      const updatedEvents = events.map(ev => {
        if (ev.id === selectedEvent.id) return { ...ev, asistentesCount: activeAttendeeCount };
        return ev;
      });
      onSaveEvents(updatedEvents);
      const updatedEv = updatedEvents.find(ev => ev.id === selectedEvent.id);
      if (updatedEv) setSelectedEvent(updatedEv);
    }
  };

  // Certificate Sender Simulation
  const handleSendCertificateEmail = (enrol: ErpEnrollment) => {
    const updated = enrollments.map(en => {
      if (en.id === enrol.id) return { ...en, certificadoEnviado: true };
      return en;
    });
    onSaveEnrollments(updated);
    alert(`Generando Certificado de Asistencia...\n\nSocio: ${enrol.nombreSocio}\nCurso: ${enrol.eventoTitulo}\n\nSe ha enviado por correo electrónico un certificado en PDF con firma digital institucional y código QR de validación.`);
  };

  const eventEnrollments = enrollments.filter(en => en.eventoId === selectedEvent?.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub tabs header */}
      <div className="border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center pb-2">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("eventos")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === "eventos" ? "bg-cecip-blue text-white shadow" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
          >
            Capacitaciones y Eventos
          </button>
          <button 
            onClick={() => setActiveTab("convenios")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === "convenios" ? "bg-cecip-blue text-white shadow" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
          >
            Convenios y Descuentos
          </button>
        </div>

        {activeTab === "eventos" && canEdit && (
          <button 
            onClick={() => setShowAddEventModal(true)}
            className="px-3.5 py-1.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={13} />
            <span>Crear Evento</span>
          </button>
        )}

        {activeTab === "convenios" && canEdit && (
          <button 
            onClick={() => setShowAddConvenioModal(true)}
            className="px-3.5 py-1.5 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={13} />
            <span>Nuevo Convenio</span>
          </button>
        )}
      </div>

      {/* TAB 1: CAPACITACIONES Y EVENTOS */}
      {activeTab === "eventos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List panel */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cronograma Institucional</h3>
            
            <div className="space-y-3">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${selectedEvent?.id === ev.id ? "bg-cecip-blue/5 dark:bg-slate-700/60 border-cecip-blue shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                >
                  <div className={`p-2.5 rounded-xl font-bold text-xs uppercase shrink-0 text-center min-w-[44px] ${selectedEvent?.id === ev.id ? "bg-cecip-blue text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"}`}>
                    <Calendar size={16} className="mx-auto mb-1" />
                    <span className="text-[10px]">{ev.fecha.substring(5, 10)}</span>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                      {ev.categoria}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate pr-1">
                      {ev.titulo}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Capacidad: {ev.cuposInscriptos}/{ev.cuposMax}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details & Accreditation */}
          <div className="lg:col-span-2 space-y-6">
            {selectedEvent ? (
              <div className="space-y-6">
                {/* Event core card */}
                <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-cecip-blue dark:bg-blue-950/40 dark:text-blue-300 rounded-full uppercase">
                      {selectedEvent.categoria}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedEvent.titulo}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium italic">
                      Disertante: {selectedEvent.orador}
                    </p>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {selectedEvent.descripcion}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-slate-500 dark:text-slate-400" />
                      <span>{selectedEvent.fecha} a las {selectedEvent.hora} hs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-slate-500 dark:text-slate-400" />
                      <span>{selectedEvent.lugar}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                      <ShieldCheck size={13} />
                      <span>Cupos Libres: {selectedEvent.cuposMax - selectedEvent.cuposInscriptos}</span>
                    </div>
                  </div>
                </div>

                {/* Accreditation list */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase">Roster de Inscriptos y Control de Asistencia</h4>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-2 py-0.5 rounded">
                      {selectedEvent.asistentesCount} Presentes
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {eventEnrollments.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                        No hay asociados registrados para esta capacitación.
                      </div>
                    ) : (
                      eventEnrollments.map((enrol) => (
                        <div key={enrol.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                          <div className="space-y-0.5">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{enrol.nombreSocio}</h5>
                            <p className="text-[10px] text-slate-400">Mail: {enrol.email} | Tel: {enrol.telefono}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {/* Attendance switcher */}
                            <button 
                              onClick={() => toggleAttendance(enrol.id)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${enrol.asistio ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200"}`}
                            >
                              {enrol.asistio ? "✅ Presente" : "❌ Ausente"}
                            </button>

                            {/* Certificates triggers */}
                            {enrol.asistio && (
                              <>
                                <button 
                                  onClick={() => setCertificateWinner(enrol)}
                                  className="p-1.5 border border-slate-200 dark:border-slate-700 rounded text-slate-400 hover:text-cecip-blue hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                                  title="Ver Certificado de finalización"
                                >
                                  <Award size={13} />
                                </button>
                                <button 
                                  onClick={() => handleSendCertificateEmail(enrol)}
                                  className={`p-1.5 border rounded cursor-pointer ${enrol.certificadoEnviado ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 border-blue-100" : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 hover:bg-slate-50"}`}
                                  title="Enviar por Correo"
                                >
                                  <Mail size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center text-xs text-slate-400 bg-white dark:bg-slate-800">
                Seleccione un evento del panel izquierdo.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONVENIOS Y DESCUENTOS */}
      {activeTab === "convenios" && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Sparkles className="text-amber-500" size={16} />
              <span>Gestión de Convenios y Alianzas Institucionales</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Administre las alianzas estratégicas de salud, capacitación y publicidad que brindan beneficios exclusivos a todas las pymes socias de CeCIP Paraná.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {convenios.map((conv) => (
              <div key={conv.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between p-5 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 rounded-xl inline-block">
                      <Tag size={18} />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-sans">
                      {conv.descuento}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{conv.titulo}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{conv.descripcion}</p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-50 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider">Vigencia: {conv.vigencia}</p>
                  <p className="text-slate-400">Categoría: <span className="font-bold text-slate-600 dark:text-slate-200">{conv.categoria}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-slate-100 dark:border-slate-700">
            <div className="bg-cecip-blue text-white px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm">Crear Nueva Capacitación / Evento</h4>
              <button onClick={() => setShowAddEventModal(false)} className="text-white hover:text-white/80 cursor-pointer">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Título del Evento</label>
                <input 
                  type="text"
                  required
                  placeholder="ej: Taller de Impuestos para Pymes"
                  value={formEvent.titulo}
                  onChange={(e) => setFormEvent({ ...formEvent, titulo: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Disertante / Orador</label>
                <input 
                  type="text"
                  required
                  placeholder="ej: Lic. Carlos Gómez"
                  value={formEvent.orador}
                  onChange={(e) => setFormEvent({ ...formEvent, orador: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Fecha</label>
                  <input 
                    type="date"
                    required
                    value={formEvent.fecha}
                    onChange={(e) => setFormEvent({ ...formEvent, fecha: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Hora</label>
                  <input 
                    type="text"
                    required
                    value={formEvent.hora}
                    onChange={(e) => setFormEvent({ ...formEvent, hora: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Lugar / Plataforma</label>
                  <input 
                    type="text"
                    required
                    value={formEvent.lugar}
                    onChange={(e) => setFormEvent({ ...formEvent, lugar: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Cupos Máximos</label>
                  <input 
                    type="number"
                    required
                    value={formEvent.cuposMax}
                    onChange={(e) => setFormEvent({ ...formEvent, cuposMax: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Descripción del Evento</label>
                <textarea 
                  rows={3}
                  required
                  value={formEvent.descripcion}
                  onChange={(e) => setFormEvent({ ...formEvent, descripcion: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Registrar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CONVENIO MODAL */}
      {showAddConvenioModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-slate-100 dark:border-slate-700">
            <div className="bg-cecip-blue text-white px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm">Registrar Nuevo Convenio</h4>
              <button onClick={() => setShowAddConvenioModal(false)} className="text-white hover:text-white/80 cursor-pointer">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddConvenio} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Título del Convenio / Empresa</label>
                <input 
                  type="text"
                  required
                  placeholder="ej: Descuento en Hotelería Colón"
                  value={formConvenio.titulo}
                  onChange={(e) => setFormConvenio({ ...formConvenio, titulo: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Beneficio / Descuento</label>
                <input 
                  type="text"
                  required
                  placeholder="ej: 25% de descuento / Tarifas Corporativas"
                  value={formConvenio.descuento}
                  onChange={(e) => setFormConvenio({ ...formConvenio, descuento: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Vigencia</label>
                  <input 
                    type="text"
                    required
                    value={formConvenio.vigencia}
                    onChange={(e) => setFormConvenio({ ...formConvenio, vigencia: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Categoría</label>
                  <select 
                    value={formConvenio.categoria}
                    onChange={(e) => setFormConvenio({ ...formConvenio, categoria: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    <option value="Comercios">Comercios</option>
                    <option value="Salud">Salud</option>
                    <option value="Educación">Educación</option>
                    <option value="Gastronomía">Gastronomía</option>
                    <option value="Turismo">Turismo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Descripción Corta</label>
                <textarea 
                  rows={3}
                  required
                  value={formConvenio.descripcion}
                  onChange={(e) => setFormConvenio({ ...formConvenio, descripcion: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowAddConvenioModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Registrar Convenio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC CERTIFICATE WINNER VISUALIZER */}
      {certificateWinner && selectedEvent && (
        <div className="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-12 w-full max-w-2xl rounded-3xl shadow-2xl border-8 border-double border-amber-200 text-center space-y-6 relative overflow-hidden flex flex-col justify-between select-none">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-60"></div>

            <div className="flex justify-between items-center pb-2">
              <span className="text-xl">🎓</span>
              <button 
                onClick={() => setCertificateWinner(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 cursor-pointer"
              >
                <Plus size={22} className="rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center text-amber-500">
                <Award size={48} className="animate-pulse" />
              </div>

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Centro de Comercio, Industria y Actores Económicos (CeCIP) Paraná
              </span>

              <h3 className="font-serif text-3xl font-bold text-slate-800 tracking-tight">
                Certificado de Asistencia
              </h3>

              <p className="text-xs text-slate-500">Otorgado formalmente a:</p>
              
              <h4 className="text-xl font-extrabold text-slate-950 font-sans tracking-wide">
                {certificateWinner.nombreSocio}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Por su participación activa y cumplimiento del taller presencial de capacitación institucional denominado: 
                <span className="font-bold text-slate-800 block mt-1">
                  &ldquo;{selectedEvent.titulo}&rdquo;
                </span>
                Dictado el día {selectedEvent.fecha} en el Salón Auditorio CeCIP, con una carga horaria de 4 horas cátedra.
              </p>
            </div>

            <div className="flex justify-between items-end pt-8 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              <div className="text-left space-y-1">
                <div className="w-24 h-0.5 bg-slate-300"></div>
                <p>Ing. Carlos Rossi</p>
                <p className="text-[9px]">Presidente - CeCIP Paraná</p>
              </div>

              <div className="flex flex-col items-center">
                <QrCode size={40} className="text-slate-700" />
                <span className="text-[8px] text-slate-400 mt-1 font-mono">ID Validar: CERT-{certificateWinner.id}</span>
              </div>

              <div className="text-right space-y-1">
                <div className="w-24 h-0.5 bg-slate-300"></div>
                <p>Esteban Peralta</p>
                <p className="text-[9px]">Director Académico</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-6">
              <button 
                onClick={() => alert("Imprimiendo copia del certificado...")}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Imprimir Copia
              </button>
              <button 
                onClick={() => {
                  alert("Descargando archivo PDF oficial firmado digitalmente...");
                  setCertificateWinner(null);
                }}
                className="px-5 py-2 bg-cecip-blue hover:bg-cecip-blue/90 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <Download size={12} />
                <span>Descargar PDF Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

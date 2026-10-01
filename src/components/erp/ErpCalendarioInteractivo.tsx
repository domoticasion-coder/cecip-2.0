import React, { useState } from "react";
import { Calendar, Clock, MapPin, Award, User, Check, Sparkles, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface ErpEvent {
  id: string;
  day: number;
  titulo: string;
  fecha: string;
  hora: string;
  lugar: string;
  orador: string;
  reseña: string;
  imagen: string;
  color: string;
  borderColor: string;
  textAccent: string;
  badge: string;
}

interface ErpCalendarioInteractivoProps {
  enrolledEvents?: string[];
  onEnrollToggle?: (eventId: string) => void;
  role?: string;
}

export default function ErpCalendarioInteractivo({ 
  enrolledEvents = [], 
  onEnrollToggle, 
  role = "Socio" 
}: ErpCalendarioInteractivoProps) {
  const [currentMonth, setCurrentMonth] = useState<"junio" | "julio" | "agosto">("julio");
  const [hoveredEvent, setHoveredEvent] = useState<ErpEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ErpEvent | null>(null);
  const [localEnrolled, setLocalEnrolled] = useState<string[]>(enrolledEvents);

  // Hardcoded highlighted events for July 2026
  const eventsList: ErpEvent[] = [
    {
      id: "ev-1",
      day: 8,
      titulo: "Reunión Extraordinaria CD",
      fecha: "08/07/2026",
      hora: "20:00 h",
      lugar: "Oficinas de Presidencia CeCIP",
      orador: "Comisión Directiva CeCIP",
      reseña: "Sesión especial de la Comisión Directiva de CeCIP Paraná para debatir el impacto de las tasas de interés y articular nuevas líneas de financiamiento subsidiadas para comercios minoristas locales.",
      imagen: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=80",
      color: "bg-blue-500",
      borderColor: "border-blue-500 dark:border-blue-400",
      textAccent: "text-blue-600 dark:text-blue-400",
      badge: "Institucional"
    },
    {
      id: "ev-special",
      day: 10,
      titulo: "Cena Anual y Networking CeCIP",
      fecha: "10/07/2026",
      hora: "21:30 h",
      lugar: "Salón de Convenciones El Litoral",
      orador: "Invitados de Honor del Sector Comercial",
      reseña: "El evento más importante de camaradería del año. Reuniremos a más de 120 empresarios, dueños de negocios y autoridades provinciales para potenciar alianzas y celebrar la resiliencia mercantil.",
      imagen: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=500&q=80",
      color: "bg-amber-500",
      borderColor: "border-amber-500 dark:border-amber-400",
      textAccent: "text-amber-600 dark:text-amber-400",
      badge: "Celebración"
    },
    {
      id: "ev-2",
      day: 15,
      titulo: "Transformación Digital Pymes",
      fecha: "15/07/2026",
      hora: "19:30 h",
      lugar: "Salón Auditorio Principal CeCIP",
      orador: "Lic. Horacio Cavazza (Consultor E-commerce)",
      reseña: "Un taller intensivo sumamente práctico diseñado para dueños de comercios. Aprende a digitalizar tu inventario, conectar pasarelas de pago virtuales y usar Inteligencia Artificial para captar clientes en redes sociales.",
      imagen: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80",
      color: "bg-indigo-500",
      borderColor: "border-indigo-500 dark:border-indigo-400",
      textAccent: "text-indigo-600 dark:text-indigo-400",
      badge: "Capacitación"
    },
    {
      id: "ev-muestra-1",
      day: 18,
      titulo: "Expo-Muestra PyME de Entre Ríos 2026",
      fecha: "18/07/2026",
      hora: "10:00 h",
      lugar: "Pabellón de Exposiciones CeCIP Paraná",
      orador: "Coordinadora de Emprendimientos Locales",
      reseña: "Una gran exposición abierta donde más de 45 empresas de nuestra red exhiben sus productos, innovaciones y servicios al público general. Excelente oportunidad de vinculación, stands interactivos y rondas comerciales directas.",
      imagen: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=80",
      color: "bg-emerald-500",
      borderColor: "border-emerald-500 dark:border-emerald-400",
      textAccent: "text-emerald-600 dark:text-emerald-400",
      badge: "Muestra"
    },
    {
      id: "ev-cap-1",
      day: 22,
      titulo: "Capacitación: Inteligencia Artificial para Comercios",
      fecha: "22/07/2026",
      hora: "19:00 h",
      lugar: "Salón de Usos Múltiples CeCIP",
      orador: "Mg. Esteban Garmendia (Especialista en IA)",
      reseña: "Taller teórico-práctico de nivel inicial a intermedio sobre el uso de herramientas de IA generativa para la automatización de atención al cliente, redacción de textos publicitarios y optimización de flujos de inventario en comercios de cercanía.",
      imagen: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=500&q=80",
      color: "bg-rose-500",
      borderColor: "border-rose-500 dark:border-rose-400",
      textAccent: "text-rose-600 dark:text-rose-400",
      badge: "Capacitación"
    },
    {
      id: "ev-3",
      day: 28,
      titulo: "Seminario Liderazgo de Ventas",
      fecha: "28/07/2026",
      hora: "18:00 h",
      lugar: "Plataforma Zoom CeCIP (Virtual)",
      orador: "Dra. Laura De Giusti (Especialista en Equipos de Alto Rendimiento)",
      reseña: "Estrategias ágiles de retail y ventas mayoristas. Descubre cómo motivar a tu equipo comercial presencial y digital, resolver objeciones difíciles de clientes y estandarizar procesos de atención.",
      imagen: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=500&q=80",
      color: "bg-purple-500",
      borderColor: "border-purple-500 dark:border-purple-400",
      textAccent: "text-purple-600 dark:text-purple-400",
      badge: "Seminario"
    }
  ];

  // Helper for actual enrollment handling (supports both parent prop and local fallback state)
  const isEnrolled = (eventId: string) => {
    if (onEnrollToggle) {
      return enrolledEvents.includes(eventId);
    }
    return localEnrolled.includes(eventId);
  };

  const handleEnrollClick = (ev: ErpEvent) => {
    if (onEnrollToggle) {
      onEnrollToggle(ev.id);
    } else {
      if (localEnrolled.includes(ev.id)) {
        setLocalEnrolled(localEnrolled.filter(id => id !== ev.id));
        alert(`Cancelaste tu inscripción al curso: ${ev.titulo}`);
      } else {
        setLocalEnrolled([...localEnrolled, ev.id]);
        alert(`¡Inscripción Exitosa!\nTe has inscripto al evento "${ev.titulo}". Se ha enviado un correo de confirmación y el código QR de acceso al e-mail de tu empresa.`);
      }
    }
  };

  // Calendar render constants for July 2026 (Wednesday July 1st, 31 Days total)
  // 3 blank spaces for Sunday, Monday, Tuesday of June
  const junePlaceholderDays = [
    { day: 28, isCurrentMonth: false },
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false }
  ];

  const julyDays = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    isCurrentMonth: true
  }));

  // 1 blank space at the end for August 1st (Saturday) to complete 5 full rows (35 total cells)
  const augustPlaceholderDays = [
    { day: 1, isCurrentMonth: false }
  ];

  const allCalendarCells = [...junePlaceholderDays, ...julyDays, ...augustPlaceholderDays];
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Handle month click transitions
  const handleMonthChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === "julio") setCurrentMonth("junio");
      else if (currentMonth === "agosto") setCurrentMonth("julio");
    } else {
      if (currentMonth === "junio") setCurrentMonth("julio");
      else if (currentMonth === "julio") setCurrentMonth("agosto");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-6 relative overflow-visible">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-500" size={18} />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Agenda de Actividades CeCIP</span>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold animate-pulse">
                Interactivo ✨
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pasa el mouse sobre los días destacados para ver reseñas con imágenes, o haz clic para inscribirte.
          </p>
        </div>

        {/* Month Selector Widget */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <button 
            onClick={() => handleMonthChange("prev")}
            disabled={currentMonth === "junio"}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[100px] text-center capitalize">
            {currentMonth} 2026
          </span>

          <button 
            onClick={() => handleMonthChange("next")}
            disabled={currentMonth === "agosto"}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {currentMonth !== "julio" ? (
        /* Empty/Inactive Months Placeholder */
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/30">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full">
            <Info size={20} />
          </div>
          <div className="space-y-1 max-w-xs">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">No hay compromisos este mes</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Actualmente todas nuestras capacitaciones y asambleas oficiales se concentran en Julio de 2026.
            </p>
          </div>
          <button 
            onClick={() => setCurrentMonth("julio")}
            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-bold uppercase rounded-lg cursor-pointer"
          >
            Volver a Julio 2026
          </button>
        </div>
      ) : (
        /* Calendar layout + Side Info Panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative overflow-visible">
          
          {/* Calendar Grid - spans 7 columns */}
          <div className="lg:col-span-7 space-y-3 relative overflow-visible">
            {/* Weekdays indicator */}
            <div className="grid grid-cols-7 text-center">
              {weekDays.map((wd, i) => (
                <span 
                  key={i} 
                  className={`text-[10px] font-extrabold uppercase tracking-wider pb-1 ${
                    wd === "Dom" || wd === "Sáb" 
                      ? "text-rose-400 dark:text-rose-500" 
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {wd}
                </span>
              ))}
            </div>

            {/* Calendar grid cells */}
            <div className="grid grid-cols-7 gap-1.5 relative overflow-visible">
              {allCalendarCells.map((cell, idx) => {
                const isCurrentMonth = cell.isCurrentMonth;
                const event = isCurrentMonth ? eventsList.find(e => e.day === cell.day) : null;
                const isToday = cell.day === 7 && isCurrentMonth; // Let's mark July 7th as "today" matching additional metadata
                
                return (
                  <div 
                    key={idx}
                    onMouseEnter={() => event && setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    onClick={() => event && setSelectedEvent(event)}
                    className={`h-11 sm:h-12 relative flex flex-col justify-between p-1.5 rounded-xl border transition-all select-none group cursor-pointer ${
                      event 
                        ? `${event.borderColor} bg-indigo-50/40 dark:bg-slate-800 hover:bg-indigo-100/60 dark:hover:bg-slate-700 shadow-md border-l-4 ring-2 ring-indigo-500/15` 
                        : isToday
                        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-extrabold"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                    } ${!isCurrentMonth ? "opacity-30 pointer-events-none" : ""}`}
                  >
                    {/* Day number */}
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold leading-none transition-all ${
                        isToday 
                          ? "bg-indigo-600 text-white rounded px-1.5 py-0.5 text-[10px] font-extrabold" 
                          : event 
                          ? `${event.color} text-white rounded-md px-1.5 py-0.5 text-[11px] font-extrabold shadow-sm`
                          : ""
                      }`}>
                        {cell.day}
                      </span>
                      {isToday && (
                        <span className="text-[7px] text-indigo-500 font-extrabold uppercase tracking-widest hidden sm:inline">Hoy</span>
                      )}
                    </div>

                    {/* Indicator dots or small badge for event */}
                    {event && (
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${event.color} animate-ping absolute bottom-2 right-2`} />
                        <span className={`w-1.5 h-1.5 rounded-full ${event.color} absolute bottom-2 right-2`} />
                        <span className="text-[7.5px] font-extrabold truncate max-w-full text-slate-500 dark:text-slate-400 leading-tight block pr-2">
                          {event.badge}
                        </span>
                      </div>
                    )}

                    {/* HOVER POPOVER FOR EVENTS (The user explicitly requested: "cuando se pase el mouse por encima se abra una breve reseña con imagen") */}
                    {event && hoveredEvent && hoveredEvent.id === event.id && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 z-[100] w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-none animate-fade-in scale-100 transition-all duration-150">
                        {/* Event Image header with fallback */}
                        <div className="h-32 w-full relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <img 
                            src={event.imagen} 
                            alt={event.titulo} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-950/20 to-transparent" />
                          <span className="absolute bottom-2 left-3 text-[8.5px] font-extrabold uppercase bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white tracking-wider">
                            {event.badge}
                          </span>
                          <span className="absolute bottom-2 right-3 text-[10px] font-extrabold text-amber-300 flex items-center gap-1">
                            <Sparkles size={11} fill="currentColor" /> CeCIP Oficial
                          </span>
                        </div>

                        {/* Event details inside Popover */}
                        <div className="p-4 space-y-2.5">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                              {event.titulo}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-medium mt-1">
                              <span className="font-extrabold text-indigo-500">{event.fecha}</span>
                              <span>•</span>
                              <span>{event.hora}</span>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-600 dark:text-slate-200 leading-relaxed font-medium">
                            {event.reseña}
                          </p>

                          <div className="space-y-1 pt-1.5 border-t border-slate-50 dark:border-slate-800 text-[8.5px] text-slate-400 font-medium">
                            <div className="flex items-center gap-1">
                              <MapPin size={9} className="text-indigo-500" />
                              <span className="truncate">{event.lugar}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User size={9} className="text-indigo-500" />
                              <span className="truncate">Orador: {event.orador}</span>
                            </div>
                          </div>

                          {/* Quick instruction */}
                          <div className="pt-1.5 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <span className="text-[8px] text-slate-400 font-semibold italic">Haz clic para inscribirte</span>
                            {isEnrolled(event.id) && (
                              <span className="text-[8px] text-emerald-500 font-extrabold flex items-center gap-0.5">
                                <Check size={8} strokeWidth={3} /> Inscripto
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive event details panel - spans 5 columns */}
          <div className="lg:col-span-5 bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100/80 dark:border-slate-700/40 flex flex-col justify-between min-h-[300px] lg:min-h-0 space-y-4">
            {selectedEvent ? (
              /* Selected Event Details Panel */
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={selectedEvent.imagen} 
                      alt={selectedEvent.titulo} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="absolute top-2 right-2 bg-slate-900/60 backdrop-blur-sm text-white hover:bg-slate-900 p-1.5 rounded-full transition-all text-[9px] font-extrabold"
                    >
                      Cerrar ×
                    </button>
                    <span className="absolute bottom-2 left-3 text-[9px] font-extrabold uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                      {selectedEvent.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {selectedEvent.titulo}
                    </h4>
                    <p className="text-[10px] text-indigo-500 font-extrabold flex items-center gap-1.5">
                      <Clock size={11} /> {selectedEvent.fecha} · {selectedEvent.hora}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {selectedEvent.reseña}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-indigo-400 shrink-0" />
                      <span className="truncate">{selectedEvent.lugar}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-indigo-400 shrink-0" />
                      <span className="truncate">Expositor: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedEvent.orador}</span></span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={() => handleEnrollClick(selectedEvent)}
                    className={`w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isEnrolled(selectedEvent.id)
                        ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10"
                    }`}
                  >
                    {isEnrolled(selectedEvent.id) ? (
                      <>
                        <Check size={14} strokeWidth={2.5} />
                        <span>✓ Ya estás inscripto</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} fill="currentColor" />
                        <span>Inscribirme Gratis</span>
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-slate-400 text-center font-semibold">
                    * Beneficio exclusivo bonificado al 100% para empresas de la red CeCIP.
                  </p>
                </div>
              </div>
            ) : (
              /* No Selected Event Placeholder */
              <div className="flex-1 flex flex-col justify-center items-center text-center p-4 space-y-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
                  <Award size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Selecciona un evento</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[200px]">
                    Haz clic sobre cualquier fecha destacada con indicador para ver su ficha completa, inscripción y código QR.
                  </p>
                </div>

                <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-300 font-extrabold block text-left">
                    Eventos de Julio:
                  </span>
                  <div className="space-y-2 text-left text-xs">
                    {eventsList.map((ev, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedEvent(ev)}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center transition-all shadow-sm"
                      >
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 truncate pr-2">{ev.titulo}</span>
                        <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 whitespace-nowrap bg-indigo-100 dark:bg-indigo-900/80 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                          Día {ev.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Floating alert/legend if user hover is not possible on mobile */}
      <div className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 justify-center sm:justify-start bg-slate-50/50 dark:bg-slate-900/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/30">
        <Info size={12} className="text-indigo-500" />
        <span>En dispositivos táctiles, puedes tocar las fechas destacadas para abrir la ficha de inscripción directamente.</span>
      </div>

    </div>
  );
}

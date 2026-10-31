import { useEffect, useState } from "react";
import {
  ArrowRight, BadgePercent, Bot, CalendarClock, Clock, MapPin, MessageCircle, Search, ShoppingBag, Sparkles, Store, Wrench,
  Zap, Smartphone, Users, TrendingUp, CheckCircle2,
} from "lucide-react";
import { ERP_URL } from "../lib/erp";

/**
 * Página "Conocé ComercIA": qué es la web app ComercIA Paraná y el convenio CeCIP + Instituto IEC + La FactorIA.
 * Corta, para quien no sabe nada; a los vecinos los invita a buscar comercios y a los comercios a sumarse.
 * Datos tomados de la app y del material del convenio. La dirección pública de la app se configura con
 * VITE_COMERCIA_APP_URL (si no está, el botón de los vecinos lleva al buscador de comercios de esta web).
 */

const IMG = "/images/comercia";
const URL_ADHESION = "https://iec-ia.com.ar/formulariofactoria.html";
const APP_URL: string = ((import.meta as any).env?.VITE_COMERCIA_APP_URL || "").trim();

// Ejemplos de búsqueda con IA (como responde la app)
const BUSQUEDAS = [
  { q: "Regalo para un nene de 5 años", r: "Te recomiendo Juguetería El Osito: juguetes para todas las edades, cotillón y regalos. ¡Hoy con descuento exclusivo ComercIA!", icono: ShoppingBag },
  { q: "¿Farmacias abiertas ahora?", r: "Estas farmacias están abiertas en este momento. Te muestro su horario, cómo llegar y su WhatsApp.", icono: Clock },
  { q: "Necesito un electricista urgente", r: "IEC Services tiene electricistas matriculados con turnos de urgencia. Elegí el horario y te confirmamos por WhatsApp.", icono: Wrench },
];

const VECINOS = [
  { icono: Search, titulo: "Preguntá como hablás", texto: "La IA entiende lo que necesitás y te dice qué comercio lo tiene." },
  { icono: MapPin, titulo: "Todo en el mapa", texto: "Ubicación, horarios y quién está abierto ahora." },
  { icono: BadgePercent, titulo: "Promos exclusivas", texto: "Descuentos que solo encontrás en ComercIA." },
  { icono: MessageCircle, titulo: "Contacto directo", texto: "Escribile al comercio por WhatsApp en un toque." },
  { icono: CalendarClock, titulo: "Turnos con técnicos", texto: "Electricistas, gasistas, cámaras y más, de IEC Services." },
];
const COMERCIOS = [
  { icono: Sparkles, titulo: "Te recomiendan", texto: "Cuando un vecino busca lo que vendés, la IA te sugiere a vos." },
  { icono: Store, titulo: "Tu vidriera digital", texto: "Ficha con horarios, WhatsApp, web, ubicación y promos." },
  { icono: Smartphone, titulo: "Sucursal Virtual", texto: "Tienda online con tu stock real, hecha por La FactorIA." },
  { icono: BadgePercent, titulo: "50% OFF para socios", texto: "Los asociados al CeCIP tienen la mitad de precio." },
  { icono: Bot, titulo: "IA para tu negocio", texto: "Atención por WhatsApp, marketing y capacitación en IA." },
];

export default function ConoceComercia({ onBuscarComercios }: { onBuscarComercios: () => void }) {
  const [publico, setPublico] = useState<"vecinos" | "comercios">("vecinos");
  const [b, setB] = useState(0);
  const [escrito, setEscrito] = useState("");
  const [respuesta, setRespuesta] = useState(false);

  // búsqueda de ejemplo que se escribe sola
  useEffect(() => {
    const q = BUSQUEDAS[b].q;
    let i = 0;
    setEscrito(""); setRespuesta(false);
    const tipeo = setInterval(() => {
      i++;
      setEscrito(q.slice(0, i));
      if (i >= q.length) { clearInterval(tipeo); setTimeout(() => setRespuesta(true), 350); }
    }, 55);
    const siguiente = setTimeout(() => setB((x) => (x + 1) % BUSQUEDAS.length), q.length * 55 + 4200);
    return () => { clearInterval(tipeo); clearTimeout(siguiente); };
  }, [b]);

  const buscar = () => (APP_URL ? window.open(APP_URL, "_blank", "noopener") : onBuscarComercios());
  const lista = publico === "vecinos" ? VECINOS : COMERCIOS;
  const Ejemplo = BUSQUEDAS[b].icono;

  return (
    // "tema-fijo": la página ya es oscura y no la toca el modo oscuro de la web
    <div className="cc tema-fijo bg-[#050d22] text-white">
      <style>{CSS}</style>

      {/* ------------------------------------------------ portada */}
      <section className="relative overflow-hidden px-3 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#00a3e0]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="cc-grilla pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <img src={`${IMG}/logo-comercia.webp`} alt="ComercIA Inteligente Paraná" className="cc-logo h-20 w-auto sm:h-24" />
            <h1 className="font-display mt-6 text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
              Todo Paraná,<br /><span className="cc-degradado">en un solo lugar.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              ComercIA es la guía inteligente del comercio de Paraná: le preguntás lo que necesitás y la inteligencia artificial te dice <b className="text-white">qué comercio de la ciudad lo tiene</b>, dónde queda, si está abierto y cómo escribirle.
            </p>

            {/* búsqueda de ejemplo */}
            <div className="mt-7 max-w-xl">
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[.07] p-2 pl-4 backdrop-blur">
                <Sparkles size={18} className="shrink-0 text-[#7dd3fc]" />
                <span className="min-w-0 flex-1 truncate text-sm text-white sm:text-base">{escrito}<span className="cc-cursor">|</span></span>
                <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#00a3e0] px-3 py-2 text-xs font-bold"><Search size={14} /> Buscar con IA</span>
              </div>
              <div className={`mt-3 flex items-start gap-3 rounded-2xl border border-[#00a3e0]/30 bg-[#0b1d44]/80 p-4 transition-all duration-500 ${respuesta ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#00a3e0] to-violet-500"><Ejemplo size={17} /></span>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#7dd3fc]">Respuesta inteligente · ejemplo</div>
                  <p className="mt-0.5 text-sm text-slate-200">{BUSQUEDAS[b].r}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={buscar} className="cc-cta group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#00a3e0] px-6 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-[#0393c9]">
                <Search size={17} /> Buscar comercios <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </button>
              <a href="#cc-comercios" onClick={() => setPublico("comercios")} className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                <Store size={17} /> Tengo un comercio
              </a>
            </div>
          </div>

          {/* celulares con la app real */}
          <div className="relative mx-auto h-[30rem] w-full max-w-[34rem] sm:h-[36rem]">
            <Telefono src={`${IMG}/mapa.webp`} className="cc-tel-a left-[2%] top-[12%] w-[38%] -rotate-6" />
            <Telefono src={`${IMG}/inicio.webp`} className="cc-tel-b left-1/2 top-0 z-10 w-[46%] -translate-x-1/2" desplazar />
            <Telefono src={`${IMG}/ofertas.webp`} className="cc-tel-c right-[2%] top-[14%] w-[38%] rotate-6" />
            <span className="cc-flota absolute bottom-[8%] left-[4%] z-20 flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#0c2356] shadow-xl"><MapPin size={14} className="text-[#00a3e0]" /> Comercios de Paraná</span>
            <span className="cc-flota absolute bottom-[16%] right-[2%] z-20 flex items-center gap-2 rounded-full bg-violet-500 px-3 py-2 text-xs font-bold shadow-xl" style={{ animationDelay: "-1.5s" }}><Bot size={14} /> Asistente con IA</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ qué es y quiénes */}
      <section className="px-3 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icono: Zap, t: "¿Qué es?", d: "Una web app con todos los comercios, profesionales, promos y eventos de Paraná, y un asistente con IA que te ayuda a encontrar lo que buscás." },
              { icono: TrendingUp, t: "¿Por qué?", d: "Hoy todos buscan primero en el celular. ComercIA hace que esa búsqueda termine en un comercio de Paraná, y no en una plataforma de afuera." },
              { icono: Users, t: "¿Quién la hace?", d: "Es un convenio entre el CeCIP, el Instituto IEC y La FactorIA para que el comercio local dé el salto a la tecnología y la IA." },
            ].map(({ icono: Icono, t, d }) => (
              <div key={t} className="rounded-3xl border border-white/10 bg-white/[.04] p-6 transition hover:border-[#00a3e0]/40 hover:bg-white/[.06]">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#00a3e0] to-violet-500"><Icono size={20} /></span>
                <h2 className="font-display mt-4 text-xl font-bold">{t}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ beneficios por público */}
      <section id="cc-comercios" className="scroll-mt-24 px-3 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px] rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b1d44] to-[#120b3a] p-6 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold sm:text-4xl">¿Qué gano con ComercIA?</h2>
            <div className="flex rounded-full bg-white/10 p-1">
              {(["vecinos", "comercios"] as const).map((p) => (
                <button key={p} type="button" onClick={() => setPublico(p)}
                  className={`cursor-pointer rounded-full px-5 py-2 text-sm font-bold transition ${publico === p ? "bg-white text-[#0c2356] shadow" : "text-white/70 hover:text-white"}`}>
                  {p === "vecinos" ? "Soy vecino" : "Tengo un comercio"}
                </button>
              ))}
            </div>
          </div>
          <ul key={publico} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {lista.map(({ icono: Icono, titulo, texto }, i) => (
              <li key={titulo} className="cc-beneficio rounded-2xl border border-white/10 bg-white/[.05] p-5" style={{ animationDelay: `${i * 70}ms` }}>
                <Icono size={22} className="text-[#7dd3fc]" />
                <div className="mt-3 font-bold">{titulo}</div>
                <div className="mt-1 text-sm text-slate-300">{texto}</div>
              </li>
            ))}
          </ul>

          {publico === "vecinos" ? (
            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-white/[.06] p-6 sm:flex-row sm:items-center">
              <div>
                <div className="font-display text-xl font-bold">¿Qué necesitás hoy?</div>
                <div className="text-sm text-slate-300">Encontralo en un comercio de tu ciudad, cerca tuyo y abierto ahora.</div>
              </div>
              <button type="button" onClick={buscar} className="cc-cta inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#00a3e0] px-6 py-3.5 text-sm font-bold transition hover:bg-[#0393c9]">
                <Search size={17} /> Buscar comercios
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <ol className="grid gap-3 sm:grid-cols-3">
                {["Nos escribís desde el formulario", "Armamos la ficha de tu comercio", "Empezás a aparecer en las búsquedas"].map((t, i) => (
                  <li key={t} className="flex items-center gap-3 rounded-2xl bg-white/[.06] p-4 text-sm font-semibold">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#00a3e0] font-display text-sm font-bold">{i + 1}</span>{t}
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-3">
                <a href={URL_ADHESION} target="_blank" rel="noopener noreferrer" className="cc-cta inline-flex items-center gap-2 rounded-xl bg-[#00a3e0] px-6 py-3.5 text-sm font-bold transition hover:bg-[#0393c9]">
                  Sumar mi comercio <ArrowRight size={16} />
                </a>
                <a href={`${ERP_URL}/portal/comercia`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3.5 text-sm font-semibold transition hover:bg-white/10">
                  Soy socio del CeCIP
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ cierre */}
      <section className="px-3 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-5 text-center">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-300">
            {["Comercios de Paraná", "Búsqueda con IA", "Promos exclusivas", "Turnos con técnicos"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" />{t}</li>
            ))}
          </ul>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[.05] py-1.5 pl-4 pr-1.5 text-xs text-slate-300">
            Un convenio de
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1">
              <img src={`${IMG}/logo-cecip.webp`} alt="CeCIP" className="h-5 w-auto" />
              <span className="font-bold text-slate-400">×</span>
              <img src={`${IMG}/logo-iec.webp`} alt="Instituto IEC" className="h-6 w-6" />
            </span>
            y La FactorIA
          </div>
        </div>
      </section>
    </div>
  );
}

/** Celular con una captura real de la app ComercIA */
function Telefono({ src, className, desplazar }: { src: string; className: string; desplazar?: boolean }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="overflow-hidden rounded-[1.6rem] border-[5px] border-[#0b1020] bg-[#050c1f] shadow-[0_30px_60px_-20px_rgba(0,0,0,.85),0_0_0_1px_rgba(255,255,255,.2),0_0_50px_rgba(0,163,224,.3)]" style={{ aspectRatio: "9 / 19.5" }}>
        <img src={src} alt="" className={`w-full select-none ${desplazar ? "cc-scroll" : ""}`} draggable={false} />
      </div>
    </div>
  );
}

const CSS = `
.cc-grilla { background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 52px 52px; mask-image: radial-gradient(circle at 60% 40%, #000, transparent 70%); }
.cc-logo { filter: drop-shadow(0 8px 30px rgba(0,163,224,.5)); animation: cc-entra .8s cubic-bezier(.2,.9,.3,1) both; }
.cc-degradado { background: linear-gradient(90deg, #7dd3fc, #00a3e0 40%, #a78bfa 80%, #7dd3fc); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: cc-brillo 6s linear infinite; }
@keyframes cc-brillo { to { background-position: -200% center; } }
@keyframes cc-entra { from { opacity: 0; transform: translateY(16px); } }
.cc-cursor { animation: cc-titila .9s steps(1) infinite; color: #7dd3fc; margin-left: 1px; }
@keyframes cc-titila { 50% { opacity: 0; } }
.cc-cta { box-shadow: 0 14px 34px -12px rgba(0,163,224,.9); }
.cc-tel-a, .cc-tel-b, .cc-tel-c { animation: cc-flotar 6s ease-in-out infinite; }
.cc-tel-a { animation-delay: -2s; } .cc-tel-c { animation-delay: -4s; }
@keyframes cc-flotar { 50% { translate: 0 -12px; } }
.cc-scroll { animation: cc-scroll 14s ease-in-out infinite alternate; }
@keyframes cc-scroll { 0%, 12% { transform: translateY(0); } 100% { transform: translateY(-48%); } }
.cc-flota { animation: cc-flotar 4s ease-in-out infinite; }
.cc-beneficio { animation: cc-entra .5s cubic-bezier(.2,.9,.3,1) both; }
@media (prefers-reduced-motion: reduce) { .cc *, .cc *::before { animation: none !important; } }
`;

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, BadgePercent, Bot, Briefcase, CalendarCheck, CreditCard, FileText, Lightbulb, Lock, Megaphone,
  Radio, Smartphone, Sparkles, TrainFront, Tv, Wifi,
} from "lucide-react";
import { ERP_URL } from "../lib/erp";

/**
 * Publicidad del nuevo Portal de Socios (va arriba de la Agenda de Actividades).
 * Cuenta las gestiones que se hacen desde ahí e invita a registrarse (solo socios), junto con una
 * cronología que cruza la evolución de la tecnología con los 128 años del CeCIP.
 */

const FUNDACION = 1898;
const ANIOS = new Date().getFullYear() - FUNDACION;

const GESTIONES = [
  { icono: CreditCard, titulo: "Cuotas y pago online", texto: "Estado de cuenta y pago con Mercado Pago" },
  { icono: FileText, titulo: "Recibos y facturas", texto: "Todos tus comprobantes, cuando los necesites" },
  { icono: CalendarCheck, titulo: "Eventos y cursos", texto: "Inscripción en un clic a capacitaciones" },
  { icono: BadgePercent, titulo: "Convenios y promos", texto: "Beneficios vigentes para tu empresa" },
  { icono: Briefcase, titulo: "Bolsa de Empleo", texto: "CV de postulantes para tus búsquedas" },
  { icono: Megaphone, titulo: "Comunicados", texto: "Novedades oficiales del CeCIP" },
  { icono: Sparkles, titulo: "ComercIA", texto: "Tecnología e IA para vender más" },
  { icono: Bot, titulo: "Copiloto con IA", texto: "Respuestas al instante, las 24 horas" },
  { icono: Lightbulb, titulo: "Sugerencias", texto: "Tu voz llega directo al CeCIP" },
];

// La tecnología acelera; el CeCIP la acompañó en cada etapa (hitos del CeCIP: Municipalidad de Paraná y El Diario)
const ERAS = [
  { anio: "1898", ritmo: "Cambios cada 100 años", tec: "Ferrocarril y teléfono", icono: TrainFront, cecip: "Nace el Centro Comercial de Paraná" },
  { anio: "1930", ritmo: "Cambios cada década", tec: "La radio llega a los hogares", icono: Radio, cecip: "Inaugura su sede propia" },
  { anio: "1952", ritmo: "Cambios cada año", tec: "Llega la televisión", icono: Tv, cecip: "Fusión con la Asociación Industrial: nace el CeCIP" },
  { anio: "2000", ritmo: "Cambios cada mes", tec: "Internet, celulares y redes", icono: Wifi, cecip: "El comercio se vuelve digital" },
  { anio: "Hoy", ritmo: "Cambios en tiempo real", tec: "Inteligencia artificial", icono: Smartphone, cecip: "Portal de Socios y ComercIA con IA", hoy: true },
];

const USUARIOS = [
  { que: "Teléfono", cuanto: "75 años" },
  { que: "Instagram", cuanto: "2,5 años" },
  { que: "ChatGPT", cuanto: "2 meses" },
];

export default function BannerPortalSocios() {
  const ref = useRef<HTMLDivElement>(null);
  const [visto, setVisto] = useState(false);
  const [anios, setAnios] = useState(0);

  // la línea de tiempo se dibuja y el contador corre cuando el banner aparece en pantalla
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisto(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visto) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setAnios(ANIOS); return; }
    let raf = 0;
    const inicio = performance.now();
    const paso = (t: number) => {
      const k = Math.min(1, (t - inicio) / 1800);
      setAnios(Math.round(ANIOS * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [visto]);

  return (
    <section id="portal-socios-banner" className="px-3 pt-16 sm:px-6 lg:px-8" aria-label="Nuevo Portal de Socios del CeCIP">
      <style>{CSS}</style>
      <div ref={ref} className={`ps-caja relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] px-6 py-10 text-white sm:px-12 sm:py-14 ${visto ? "ps-visto" : ""}`}>
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#00a3e0]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[.06]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

        {/* Encabezado */}
        <div className="relative grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">
              <Sparkles size={13} /> Nuevo · Portal de Socios
            </span>
            <h2 className="font-display mt-4 text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              {ANIOS} años acompañando cada salto.
              <span className="ps-degradado mt-1 block">Ahora, el CeCIP en tu celular.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Conocé el nuevo Portal de Socios: toda la gestión con el Centro Comercial en un solo lugar, desde la computadora o el celular, a cualquier hora.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a href={`${ERP_URL}/portal`} target="_blank" rel="noopener noreferrer"
                className="ps-cta group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a3e0] to-violet-500 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5">
                Registrate en el Portal <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </a>
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><Lock size={13} /> Exclusivo para socios · te registrás con el CUIT de tu empresa</span>
            </div>
          </div>

          {/* contador de años y velocidad de adopción */}
          <div className="grid gap-3 sm:grid-cols-[auto_1fr] lg:grid-cols-1 xl:grid-cols-[auto_1fr]">
            <div className="rounded-2xl border border-white/15 bg-white/[.06] p-5 backdrop-blur">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">Desde {FUNDACION}</div>
              <div className="font-display ps-numero mt-1 text-6xl font-bold leading-none tabular-nums sm:text-7xl">{anios}</div>
              <div className="mt-1 text-sm text-slate-300">años de historia</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/[.06] p-5 backdrop-blur">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">Tiempo para llegar a 100 M de usuarios</div>
              <ul className="mt-3 space-y-2">
                {USUARIOS.map((u, i) => (
                  <li key={u.que} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-300">{u.que}</span>
                    <span className={`font-bold tabular-nums ${i === USUARIOS.length - 1 ? "text-[#7dd3fc]" : ""}`}>{u.cuanto}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-slate-400">La tecnología ya no cambia por siglos: cambia en tiempo real.</p>
            </div>
          </div>
        </div>

        {/* Cronología: tecnología + CeCIP */}
        <div className="relative mt-12">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-bold sm:text-xl">La tecnología se acelera. <span className="text-sky-300">El CeCIP estuvo en cada etapa.</span></h3>
            <span className="text-xs text-slate-400">{FUNDACION} → hoy</span>
          </div>
          <div className="relative">
            {/* línea que se ilumina */}
            <div className="absolute left-0 right-0 top-[1.15rem] hidden h-[2px] bg-white/10 md:block" />
            <div className="ps-linea absolute left-0 top-[1.15rem] hidden h-[2px] md:block" />
            <ol className="relative grid gap-4 md:grid-cols-5">
              {ERAS.map((e, i) => (
                <li key={e.anio} className="ps-era relative md:pt-10" style={{ transitionDelay: `${0.25 + i * 0.22}s` }}>
                  <span className={`ps-nodo absolute left-0 top-[0.65rem] hidden h-5 w-5 rounded-full border-2 md:block ${e.hoy ? "ps-nodo-hoy border-white bg-violet-500" : "border-[#00a3e0] bg-[#071738]"}`} />
                  <div className={`h-full rounded-2xl border p-4 ${e.hoy ? "border-violet-400/60 bg-gradient-to-br from-[#00a3e0]/25 to-violet-600/30" : "border-white/10 bg-white/[.05]"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl font-bold">{e.anio}</span>
                      <e.icono size={20} className={e.hoy ? "text-white" : "text-[#7dd3fc]"} />
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">{e.ritmo}</div>
                    <div className="mt-2 text-sm text-slate-300">{e.tec}</div>
                    <div className="mt-3 border-t border-white/10 pt-3 text-sm font-semibold">
                      <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-violet-300">CeCIP</span>{e.cecip}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Gestiones del Portal */}
        <div className="relative mt-12">
          <h3 className="font-display mb-4 text-lg font-bold sm:text-xl">Todo lo que gestionás desde el Portal</h3>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
            {GESTIONES.map(({ icono: Icono, titulo, texto }) => (
              <li key={titulo} className="ps-gestion group rounded-2xl border border-white/10 bg-white/[.05] p-4 transition hover:-translate-y-1 hover:border-sky-300/50 hover:bg-white/[.09]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#00a3e0] to-violet-500 text-white shadow-lg"><Icono size={18} /></span>
                <div className="mt-3 text-sm font-bold">{titulo}</div>
                <div className="mt-0.5 text-xs leading-snug text-slate-400">{texto}</div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-slate-300">
            Una institución de {ANIOS} años, con las herramientas del futuro. <a href={`${ERP_URL}/portal`} target="_blank" rel="noopener noreferrer" className="font-bold text-[#7dd3fc] hover:underline">Registrate y empezá a usarlo →</a>
          </p>
        </div>
      </div>
    </section>
  );
}

const CSS = `
.ps-caja { background: radial-gradient(120% 120% at 0% 0%, #0c2f6b 0%, #071738 45%, #120b3a 100%); box-shadow: 0 30px 80px -30px rgba(12,35,86,.75); }
.ps-degradado { background: linear-gradient(90deg, #7dd3fc, #00a3e0 40%, #a78bfa 75%, #7dd3fc); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: ps-brillo 6s linear infinite; }
@keyframes ps-brillo { to { background-position: -200% center; } }
.ps-numero { background: linear-gradient(180deg, #fff, #7dd3fc); -webkit-background-clip: text; background-clip: text; color: transparent; }
.ps-cta { box-shadow: 0 14px 34px -12px rgba(124,58,237,.8); animation: ps-pulso 2.6s ease-out infinite; }
@keyframes ps-pulso { 0% { box-shadow: 0 0 0 0 rgba(0,163,224,.5), 0 14px 34px -12px rgba(124,58,237,.8); } 100% { box-shadow: 0 0 0 16px rgba(0,163,224,0), 0 14px 34px -12px rgba(124,58,237,.8); } }
.ps-linea { width: 0; background: linear-gradient(90deg, #00a3e0, #a78bfa); box-shadow: 0 0 14px rgba(0,163,224,.8); transition: width 2s cubic-bezier(.2,.8,.2,1) .2s; }
.ps-visto .ps-linea { width: 100%; }
.ps-era { opacity: 0; transform: translateY(18px); transition: opacity .6s ease, transform .6s ease; }
.ps-visto .ps-era { opacity: 1; transform: none; }
.ps-nodo-hoy { animation: ps-latido 1.8s ease-in-out infinite; }
@keyframes ps-latido { 0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,.7); } 50% { box-shadow: 0 0 0 10px rgba(167,139,250,0); } }
@media (prefers-reduced-motion: reduce) {
  .ps-degradado, .ps-cta, .ps-nodo-hoy { animation: none; }
  .ps-linea, .ps-era { transition: none; }
}
`;

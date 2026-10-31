import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, BadgePercent, Bell, Bot, Briefcase, CalendarCheck, CheckCircle2, CreditCard, FileText, Globe, Lightbulb, Lock,
  Megaphone, Pause, Phone, Play, Radio, Sparkles,
} from "lucide-react";
import { ERP_URL } from "../lib/erp";

/**
 * Publicidad animada del nuevo Portal de Socios (va arriba de la Agenda de Actividades).
 * Un "video" que viaja de 1898 a hoy: cada época tiene su escena (tren y teléfono, radio y la sede de
 * 1930, televisión y la fusión de 1952, internet, e IA) y termina en un celular con el Portal funcionando.
 * Las épocas duran cada vez menos: la tecnología se acelera. Se pausa fuera de pantalla.
 * Hitos del CeCIP: Municipalidad de Paraná (Ciudad y Memoria) y El Diario de Paraná.
 */

const FUNDACION = 1898;
const HOY = new Date().getFullYear();
const ANIOS = HOY - FUNDACION;
const PORTAL = `${ERP_URL}/portal`;

const ERAS = [
  { anio: FUNDACION, ritmo: "Cambios cada 100 años", tec: "Ferrocarril, telégrafo y teléfono", cecip: "Nace el Centro Comercial de Paraná", dur: 4200, fondo: ["#3a2614", "#140c06"], acento: "#f59e0b" },
  { anio: 1930, ritmo: "Cambios cada década", tec: "La radio llega a los hogares", cecip: "Inaugura su sede propia frente a la plaza", dur: 3600, fondo: ["#3b2f12", "#121008"], acento: "#fbbf24" },
  { anio: 1952, ritmo: "Cambios cada año", tec: "Llega la televisión", cecip: "Se fusiona con la Asociación Industrial: nace el CeCIP", dur: 3200, fondo: ["#0f3b3a", "#06141a"], acento: "#2dd4bf" },
  { anio: 2000, ritmo: "Cambios cada mes", tec: "Internet, celulares y redes", cecip: "El comercio de Paraná se conecta", dur: 2700, fondo: ["#0b2d63", "#050f26"], acento: "#38bdf8" },
  { anio: HOY, ritmo: "Cambios en tiempo real", tec: "Inteligencia artificial", cecip: "Lanza el Portal de Socios y ComercIA con IA", dur: 9000, fondo: ["#2a0f5e", "#0a0626"], acento: "#a78bfa" },
];
const INICIOS = ERAS.reduce<number[]>((a, e, i) => [...a, i ? a[i - 1] + ERAS[i - 1].dur : 0], []);
const TOTAL = INICIOS[INICIOS.length - 1] + ERAS[ERAS.length - 1].dur;

const GESTIONES = [
  { icono: CreditCard, txt: "Pagar cuotas" }, { icono: FileText, txt: "Recibos y facturas" }, { icono: CalendarCheck, txt: "Eventos y cursos" },
  { icono: BadgePercent, txt: "Convenios" }, { icono: Briefcase, txt: "Bolsa de Empleo" }, { icono: Megaphone, txt: "Comunicados" },
  { icono: Sparkles, txt: "ComercIA" }, { icono: Bot, txt: "Copiloto IA" }, { icono: Lightbulb, txt: "Sugerencias" },
];
const AVISOS = ["Cuota de noviembre pagada ✓", "Nuevo convenio: 20% en seguros", "Inscripción confirmada al curso de IA"];

function eraDe(t: number) {
  let k = 0;
  while (k < ERAS.length - 1 && t >= INICIOS[k + 1]) k++;
  return k;
}

export default function BannerPortalSocios() {
  const ref = useRef<HTMLDivElement>(null);
  const reducido = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [t, setT] = useState(reducido ? INICIOS[ERAS.length - 1] + 6000 : 0);
  const tRef = useRef(t);
  const [visible, setVisible] = useState(false);
  const [pausa, setPausa] = useState(!!reducido);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || pausa) return;
    let raf = 0, antes = performance.now();
    const paso = (ahora: number) => {
      tRef.current = (tRef.current + Math.min(ahora - antes, 1000)) % TOTAL;
      antes = ahora;
      setT(tRef.current);
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [visible, pausa]);

  // al saltar con los puntos el año ya aparece completo (sin la cuenta)
  const irA = (k: number) => { tRef.current = INICIOS[k] + 900; setT(INICIOS[k] + 900); setPausa(false); };
  const k = eraDe(t);
  const era = ERAS[k];
  const local = t - INICIOS[k];
  // el año corre desde la época anterior hasta esta en el primer segundo
  const desde = k ? ERAS[k - 1].anio : FUNDACION - 0;
  const f = Math.min(1, local / 900);
  const anio = Math.round(desde + (era.anio - desde) * (1 - Math.pow(1 - f, 3)));
  const avance = t / TOTAL;

  return (
    <section id="portal-socios-banner" className="px-3 pt-16 sm:px-6 lg:px-8" aria-label="Nuevo Portal de Socios del CeCIP">
      <style>{CSS}</style>
      <div ref={ref} className="ps-caja relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] text-white"
        style={{ background: `radial-gradient(120% 110% at 75% 30%, ${era.fondo[0]} 0%, ${era.fondo[1]} 70%)`, ["--acento" as string]: era.acento }}>
        <div className="ps-grano pointer-events-none absolute inset-0" />
        <div className="relative grid gap-8 px-6 pb-24 pt-10 sm:px-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pb-28 lg:pt-14">
          {/* Texto */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]">
              <Sparkles size={13} style={{ color: era.acento }} /> Nuevo · Portal de Socios
            </span>
            <div className="mt-5 flex items-end gap-4">
              <div className="ps-anio font-display tabular-nums" style={{ backgroundImage: `linear-gradient(180deg,#fff 20%, ${era.acento})` }}>{anio}</div>
            </div>
            <div key={`r${k}`} className="ps-entra">
              <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ background: `${era.acento}26`, color: era.acento }}>
                <span className="ps-velocidad" style={{ animationDuration: `${0.25 + (ERAS.length - 1 - k) * 0.35}s` }} /> {era.ritmo}
              </div>
              <p className="mt-3 text-lg text-slate-300">{era.tec}</p>
              <p className="font-display mt-1 text-2xl font-bold leading-snug sm:text-3xl">
                <span className="mr-2 text-sm font-bold uppercase tracking-widest" style={{ color: era.acento }}>CeCIP</span>{era.cecip}
              </p>
            </div>
            <div className={`mt-8 transition-all duration-700 ${k === ERAS.length - 1 ? "opacity-100" : "opacity-80"}`}>
              <p className="max-w-md text-sm text-slate-300">
                {ANIOS} años acompañando cada salto. Ahora toda tu gestión con el CeCIP en un solo lugar, desde el celular o la computadora.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <a href={PORTAL} target="_blank" rel="noopener noreferrer"
                  className="ps-cta group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(90deg, #00a3e0, ${era.acento})` }}>
                  Registrate en el Portal <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </a>
                <span className="flex items-center gap-1.5 text-xs text-slate-400"><Lock size={13} /> Exclusivo para socios · con el CUIT de tu empresa</span>
              </div>
            </div>
          </div>

          {/* Escena de la época */}
          <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px]">
            {k === 0 && <Escena1898 key={`e${k}`} />}
            {k === 1 && <Escena1930 key={`e${k}`} />}
            {k === 2 && <Escena1952 key={`e${k}`} />}
            {k === 3 && <Escena2000 key={`e${k}`} />}
            {k === 4 && <EscenaHoy key={`e${k}`} local={local} />}
          </div>
        </div>

        {/* Línea de tiempo */}
        <div className="absolute inset-x-6 bottom-6 sm:inset-x-12">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setPausa(!pausa)} aria-label={pausa ? "Reproducir" : "Pausar"}
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border border-white/25 text-white hover:bg-white/10">
              {pausa ? <Play size={13} /> : <Pause size={13} />}
            </button>
            <div className="relative h-8 flex-1">
              <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/15" />
              <div className="ps-progreso absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full" style={{ width: `${avance * 100}%`, background: `linear-gradient(90deg, #f59e0b, #2dd4bf, #38bdf8, ${era.acento})` }} />
              {ERAS.map((e, i) => {
                const x = (INICIOS[i] / TOTAL) * 100;
                const activo = i <= k;
                return (
                  <button key={e.anio} type="button" onClick={() => irA(i)} className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" style={{ left: `${x}%` }} aria-label={`Ir a ${e.anio}`}>
                    <span className={`block h-3.5 w-3.5 rounded-full border-2 transition ${activo ? "border-white" : "border-white/40 bg-transparent"}`} style={activo ? { background: e.acento, boxShadow: `0 0 12px ${e.acento}` } : undefined} />
                    <span className={`absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold ${i === k ? "text-white" : "text-white/45 group-hover:text-white/80"}`}>{i === ERAS.length - 1 ? "Hoy" : e.anio}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------- escenas

function Marco({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`ps-escena absolute inset-0 overflow-hidden rounded-3xl border border-white/10 bg-black/20 ${className}`}>{children}</div>;
}

/** 1898: el tren cruza con humo y suena el teléfono */
function Escena1898() {
  return (
    <Marco className="ps-sepia">
      <div className="absolute inset-x-0 bottom-[30%] h-px bg-amber-200/40" />
      <div className="absolute inset-x-0 bottom-[27%] h-[3px] bg-amber-900/70" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(120,72,30,.9) 0 10px, transparent 10px 26px)" }} />
      {/* postes de telégrafo */}
      {[12, 42, 72].map((x) => (
        <div key={x} className="absolute bottom-[30%] h-[42%] w-[3px] bg-amber-900/80" style={{ left: `${x}%` }}>
          <div className="absolute -left-3 top-2 h-[3px] w-7 bg-amber-900/80" />
        </div>
      ))}
      <svg className="absolute inset-x-0 top-[30%] h-6 w-full" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 4 Q15 8 30 4 T60 4 T90 4 T120 4" fill="none" stroke="rgba(253,230,138,.35)" strokeWidth=".4" /></svg>
      <div className="ps-tren absolute bottom-[28%] w-[46%]">
        <svg viewBox="0 0 200 90" className="w-full drop-shadow-[0_8px_16px_rgba(0,0,0,.6)]" style={{ transform: "scaleX(-1)" }}>
          <rect x="30" y="34" width="110" height="34" rx="6" fill="#1f1308" stroke="#f59e0b" strokeWidth="2" />
          <rect x="120" y="16" width="44" height="52" rx="5" fill="#2b1a0b" stroke="#f59e0b" strokeWidth="2" />
          <rect x="128" y="24" width="28" height="16" rx="2" fill="#fde68a" opacity=".85" />
          <rect x="44" y="18" width="14" height="18" fill="#2b1a0b" stroke="#f59e0b" strokeWidth="2" />
          <path d="M16 68 L30 52 L30 68 Z" fill="#f59e0b" />
          {[52, 92, 138].map((cx) => (
            <g key={cx} className="ps-rueda" style={{ transformOrigin: `${cx}px 72px` }}>
              <circle cx={cx} cy="72" r="13" fill="#140c06" stroke="#f59e0b" strokeWidth="2.5" />
              <path d={`M${cx - 12} 72 H${cx + 12} M${cx} 60 V84`} stroke="#f59e0b" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
        {[0, 1, 2, 3].map((i) => <span key={i} className="ps-humo" style={{ animationDelay: `${i * 0.35}s` }} />)}
      </div>
      <div className="ps-telefono absolute right-[8%] top-[10%] grid h-16 w-16 place-items-center rounded-2xl border border-amber-300/40 bg-amber-950/60 text-amber-200">
        <Phone size={30} />
        <span className="ps-ring" /><span className="ps-ring" style={{ animationDelay: ".6s" }} />
      </div>
      <Etiqueta>1898 · un centenar de comerciantes fundan el Centro Comercial</Etiqueta>
    </Marco>
  );
}

/** 1930: la radio emite y aparece la sede propia */
function Escena1930() {
  return (
    <Marco>
      <div className="ps-foto absolute left-[6%] top-[10%] h-[62%] w-[52%] overflow-hidden rounded-2xl border-4 border-amber-100/80 shadow-2xl">
        <img src="/images/cecip_facade_1782854712610.jpg" alt="Sede del CeCIP" className="h-full w-full object-cover" style={{ filter: "sepia(.85) contrast(1.1) brightness(.9)" }} />
        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-center text-[11px] font-bold tracking-wider text-amber-100">SEDE PROPIA · 1930</div>
      </div>
      <div className="absolute bottom-[14%] right-[10%]">
        {[0, 1, 2].map((i) => <span key={i} className="ps-onda-radio" style={{ animationDelay: `${i * 0.5}s` }} />)}
        <div className="relative grid h-24 w-28 place-items-center rounded-2xl border-2 border-amber-300/70 bg-gradient-to-b from-amber-700 to-amber-950 shadow-2xl">
          <Radio size={40} className="text-amber-100" />
          <div className="absolute bottom-2 flex gap-1">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="ps-ecualizador" style={{ animationDelay: `${i * 0.12}s` }} />)}</div>
        </div>
      </div>
      <Etiqueta>1930 · inaugura su edificio frente a la plaza 1° de Mayo</Etiqueta>
    </Marco>
  );
}

/** 1952: la televisión y la fusión que da nacimiento al CeCIP */
function Escena1952() {
  return (
    <Marco>
      <div className="absolute left-1/2 top-[5%] w-[54%] -translate-x-1/2">
        <div className="rounded-[1.6rem] border-4 border-teal-200/70 bg-gradient-to-b from-[#3a2a1f] to-[#1d140e] p-3 shadow-2xl">
          <div className="ps-tv relative aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-[#0b1f1e]">
            <div className="ps-estatica absolute inset-0" />
            <div className="ps-tv-logo absolute inset-0 grid place-items-center">
              <span className="font-display text-5xl font-bold tracking-tight text-teal-100" style={{ textShadow: "0 0 18px rgba(45,212,191,.9)" }}>CeCIP</span>
            </div>
            <div className="ps-scan absolute inset-0" />
          </div>
        </div>
        <div className="mx-auto mt-1 flex w-1/2 justify-between"><span className="h-6 w-1.5 -rotate-12 rounded bg-teal-200/50" /><span className="h-6 w-1.5 rotate-12 rounded bg-teal-200/50" /></div>
      </div>
      <div className="absolute inset-x-[6%] bottom-[20%] flex items-center justify-center">
        <span className="ps-fusion-a rounded-full border border-teal-300/50 bg-teal-950/80 px-3 py-1.5 text-xs font-bold">Centro Comercial</span>
        <span className="ps-fusion-mas mx-2 text-xl font-bold text-teal-300">+</span>
        <span className="ps-fusion-b rounded-full border border-teal-300/50 bg-teal-950/80 px-3 py-1.5 text-xs font-bold">Asociación Industrial</span>
      </div>
      <Etiqueta>1952 · nace el Centro Comercial e Industrial de Paraná</Etiqueta>
    </Marco>
  );
}

/** 2000: internet conecta todo: el mundo gira y llegan mensajes */
function Escena2000() {
  return (
    <Marco>
      <div className="absolute left-[8%] top-[12%] h-[56%] aspect-square">
        <div className="ps-orbita absolute inset-0 rounded-full border border-sky-300/30" />
        <div className="ps-orbita-2 absolute inset-[12%] rounded-full border border-sky-300/20" />
        <div className="absolute inset-[22%] grid place-items-center rounded-full bg-gradient-to-br from-sky-500 to-blue-900 shadow-[0_0_60px_rgba(56,189,248,.5)]">
          <Globe size={56} className="ps-gira text-white" />
        </div>
        {[0, 1, 2, 3].map((i) => <span key={i} className="ps-satelite" style={{ animationDelay: `${-i * 1.1}s` }} />)}
      </div>
      <div className="absolute bottom-[12%] right-[10%] w-[30%]">
        <div className="rounded-[1.3rem] border-2 border-sky-200/60 bg-[#06122b] p-2 shadow-2xl">
          <div className="grid grid-cols-3 gap-1.5 p-1">
            {["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7", "#ec4899"].map((c, i) => (
              <span key={c} className="ps-app aspect-square rounded-lg" style={{ background: c, animationDelay: `${0.2 + i * 0.12}s` }} />
            ))}
          </div>
        </div>
      </div>
      {["@", "www", "❤", "✉"].map((s, i) => (
        <span key={s} className="ps-burbuja absolute rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-blue-900" style={{ left: `${48 + (i % 2) * 14}%`, top: `${10 + i * 14}%`, animationDelay: `${i * 0.35}s` }}>{s}</span>
      ))}
      <Etiqueta>2000 · el comercio de Paraná se conecta</Etiqueta>
    </Marco>
  );
}

/** Hoy: el Portal de Socios en el celular, con avisos que llegan */
function EscenaHoy({ local }: { local: number }) {
  const avisos = AVISOS.filter((_, i) => local > 2200 + i * 1700);
  return (
    <Marco className="ps-hoy">
      <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden>
        {[[8, 12, 30, 40], [30, 40, 12, 70], [30, 40, 60, 20], [60, 20, 92, 34], [92, 34, 80, 72], [60, 20, 80, 72], [12, 70, 50, 76]].map(([a, b, c, d], i) => (
          <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="#a78bfa" strokeWidth=".25" className="ps-sinapsis" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
        {[[8, 12], [30, 40], [12, 70], [60, 20], [92, 34], [80, 72], [50, 76]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.1" fill="#c4b5fd" className="ps-neurona" style={{ animationDelay: `${i * 0.25}s` }} />
        ))}
      </svg>
      <div className="ps-celu absolute left-1/2 top-[5%] h-[90%] -translate-x-1/2" style={{ aspectRatio: "9 / 18" }}>
        <div className="flex h-full flex-col overflow-hidden rounded-[1.8rem] border-[3px] border-white/70 bg-[#0b1230] shadow-[0_30px_60px_-20px_rgba(0,0,0,.8),0_0_50px_rgba(167,139,250,.45)]">
          <div className="mx-auto mt-1.5 h-3 w-1/3 rounded-full bg-black" />
          <div className="bg-gradient-to-r from-[#0c2356] to-violet-700 px-3 py-2">
            <div className="text-[9px] font-bold uppercase tracking-wider text-sky-200">Portal de Socios</div>
            <div className="text-[11px] font-bold">CeCIP Paraná</div>
          </div>
          <div className="grid flex-1 grid-cols-3 content-start gap-1.5 p-2">
            {GESTIONES.map(({ icono: Icono, txt }, i) => (
              <div key={txt} className="ps-tile flex flex-col items-center gap-1 rounded-lg bg-white/[.08] px-1 py-1.5 text-center" style={{ animationDelay: `${0.3 + i * 0.13}s` }}>
                <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-[#00a3e0] to-violet-500"><Icono size={12} /></span>
                <span className="text-[7.5px] font-semibold leading-tight text-slate-200">{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute right-[3%] top-[8%] flex w-[44%] flex-col items-end gap-2">
        {avisos.map((a) => (
          <div key={a} className="ps-aviso flex items-center gap-2 rounded-xl border border-white/15 bg-white/95 px-3 py-2 text-[11px] font-semibold text-slate-800 shadow-xl">
            {a.endsWith("✓") ? <CheckCircle2 size={14} className="shrink-0 text-emerald-600" /> : <Bell size={14} className="shrink-0 text-violet-600" />}
            <span>{a.replace(" ✓", "")}</span>
          </div>
        ))}
      </div>
      <div className="ps-chip-ia absolute bottom-[8%] right-[4%] flex items-center gap-1.5 rounded-full bg-violet-500 px-3 py-1.5 text-xs font-bold shadow-[0_0_24px_rgba(167,139,250,.8)]">
        <Bot size={14} /> Copiloto con IA · 24 h
      </div>
    </Marco>
  );
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return <div className="ps-etiqueta absolute inset-x-3 bottom-3 rounded-xl bg-black/55 px-3 py-2 text-center text-xs font-semibold text-white/90 backdrop-blur">{children}</div>;
}

const CSS = `
.ps-caja { transition: background .9s ease; box-shadow: 0 30px 80px -30px rgba(0,0,0,.8); }
.ps-grano { background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 48px 48px; mask-image: radial-gradient(circle at 70% 40%, #000, transparent 75%); }
.ps-anio { font-size: clamp(4.5rem, 12vw, 8.5rem); font-weight: 800; line-height: .9; letter-spacing: -.05em; -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 10px 30px rgba(0,0,0,.4)); }
.ps-entra > * { animation: ps-sube .7s cubic-bezier(.2,.9,.3,1) both; }
.ps-entra > *:nth-child(2) { animation-delay: .12s; } .ps-entra > *:nth-child(3) { animation-delay: .24s; }
@keyframes ps-sube { from { opacity: 0; transform: translateY(16px); filter: blur(4px); } }
.ps-velocidad { width: 8px; height: 8px; border-radius: 999px; background: currentColor; animation: ps-titila infinite ease-in-out; }
@keyframes ps-titila { 50% { opacity: .2; transform: scale(.6); } }
.ps-cta { box-shadow: 0 14px 34px -12px rgba(0,0,0,.6); animation: ps-pulso 2.4s ease-out infinite; }
@keyframes ps-pulso { 0% { box-shadow: 0 0 0 0 var(--acento); } 100% { box-shadow: 0 0 0 16px transparent; } }
.ps-progreso { box-shadow: 0 0 12px var(--acento); }
.ps-escena { animation: ps-escena .8s cubic-bezier(.2,.9,.3,1) both; }
@keyframes ps-escena { from { opacity: 0; transform: scale(.94) translateY(10px); filter: blur(6px); } }
.ps-etiqueta { animation: ps-sube .6s .5s both; }
.ps-sepia { background: radial-gradient(circle at 70% 20%, rgba(251,191,36,.18), transparent 60%); }
.ps-tren { animation: ps-tren 4.2s linear both; }
@keyframes ps-tren { from { left: -50%; } to { left: 105%; } }
.ps-rueda { animation: ps-girar .6s linear infinite; }
@keyframes ps-girar { to { transform: rotate(360deg); } }
.ps-humo { position: absolute; left: 70%; top: -6%; width: 18px; height: 18px; border-radius: 999px; background: rgba(253,230,138,.35); animation: ps-humo 1.4s ease-out infinite; }
@keyframes ps-humo { from { transform: translate(0,0) scale(.6); opacity: .8; } to { transform: translate(-40px,-60px) scale(2.4); opacity: 0; } }
.ps-telefono { animation: ps-vibra .5s ease-in-out infinite; }
@keyframes ps-vibra { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
.ps-ring { position: absolute; inset: -6px; border-radius: 1.2rem; border: 2px solid rgba(253,230,138,.6); animation: ps-ring 1.2s ease-out infinite; }
@keyframes ps-ring { to { transform: scale(1.6); opacity: 0; } }
.ps-foto { animation: ps-foto 1s .2s cubic-bezier(.2,.9,.3,1.2) both; }
@keyframes ps-foto { from { opacity: 0; transform: rotate(-12deg) scale(.6); } to { transform: rotate(-3deg); } }
.ps-onda-radio { position: absolute; left: 50%; top: 50%; width: 110px; height: 110px; margin: -55px 0 0 -55px; border-radius: 999px; border: 2px solid rgba(251,191,36,.6); animation: ps-onda 1.6s ease-out infinite; }
@keyframes ps-onda { from { transform: scale(.8); opacity: .9; } to { transform: scale(2.4); opacity: 0; } }
.ps-ecualizador { width: 4px; height: 12px; border-radius: 2px; background: #fde68a; animation: ps-ecu .5s ease-in-out infinite alternate; }
@keyframes ps-ecu { from { transform: scaleY(.3); } to { transform: scaleY(1); } }
.ps-estatica { background: repeating-radial-gradient(circle at 30% 40%, rgba(255,255,255,.25) 0 1px, transparent 1px 3px); animation: ps-estatica .15s steps(2) infinite, ps-apaga 1.4s forwards; }
@keyframes ps-estatica { 50% { transform: translate(2px, -2px); } }
@keyframes ps-apaga { to { opacity: 0; } }
.ps-tv-logo { opacity: 0; animation: ps-prende .8s 1.1s forwards; }
@keyframes ps-prende { from { opacity: 0; transform: scaleY(.05); } 60% { opacity: 1; transform: scaleY(1.05); } to { opacity: 1; transform: none; } }
.ps-scan { background: repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 2px, transparent 2px 4px); }
.ps-fusion-a { animation: ps-fa 2.6s .3s cubic-bezier(.6,0,.2,1) both; }
.ps-fusion-b { animation: ps-fb 2.6s .3s cubic-bezier(.6,0,.2,1) both; }
.ps-fusion-mas { animation: ps-fm 2.6s .3s both; }
@keyframes ps-fa { from { transform: translateX(-60%); opacity: 0; } 30% { opacity: 1; } 70% { transform: none; } to { transform: translateX(40%); } }
@keyframes ps-fb { from { transform: translateX(60%); opacity: 0; } 30% { opacity: 1; } 70% { transform: none; } to { transform: translateX(-40%); } }
@keyframes ps-fm { 70% { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(2.5) rotate(90deg); } }
.ps-orbita { animation: ps-girar 8s linear infinite; border-style: dashed; }
.ps-orbita-2 { animation: ps-girar 5s linear infinite reverse; border-style: dashed; }
.ps-gira { animation: ps-girar 6s linear infinite; }
.ps-satelite { position: absolute; left: 50%; top: 50%; width: 10px; height: 10px; margin: -5px; border-radius: 999px; background: #7dd3fc; box-shadow: 0 0 10px #38bdf8; animation: ps-orbitar 4.4s linear infinite; }
@keyframes ps-orbitar { from { transform: rotate(0) translateX(clamp(70px, 14vw, 120px)) rotate(0); } to { transform: rotate(360deg) translateX(clamp(70px, 14vw, 120px)) rotate(-360deg); } }
.ps-app { animation: ps-pop .45s cubic-bezier(.2,.9,.3,1.5) both; }
@keyframes ps-pop { from { transform: scale(0); } }
.ps-burbuja { animation: ps-pop .5s cubic-bezier(.2,.9,.3,1.5) both, ps-flota 2.4s ease-in-out infinite; }
@keyframes ps-flota { 50% { translate: 0 -8px; } }
.ps-celu { animation: ps-celu 1s cubic-bezier(.2,.9,.3,1.2) both; }
@keyframes ps-celu { from { opacity: 0; transform: translate(-50%, 30px) rotate(-8deg) scale(.85); } to { transform: translate(-50%, 0); } }
.ps-tile { animation: ps-pop .4s cubic-bezier(.2,.9,.3,1.5) both; }
.ps-aviso { animation: ps-aviso .55s cubic-bezier(.2,.9,.3,1.3) both; }
@keyframes ps-aviso { from { opacity: 0; transform: translateX(30px) scale(.9); } }
.ps-sinapsis { stroke-dasharray: 4 3; animation: ps-flujo 1.6s linear infinite; }
@keyframes ps-flujo { to { stroke-dashoffset: -14; } }
.ps-neurona { animation: ps-latido 1.6s ease-in-out infinite; }
@keyframes ps-latido { 50% { r: 1.9; opacity: .5; } }
.ps-chip-ia { animation: ps-pop .5s 1.6s cubic-bezier(.2,.9,.3,1.5) both, ps-flota 2.6s 2s ease-in-out infinite; }
@media (max-width: 640px) { .ps-aviso { font-size: 9.5px; padding: .35rem .5rem; } }
@media (prefers-reduced-motion: reduce) { .ps-caja *, .ps-caja *::before { animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }
`;

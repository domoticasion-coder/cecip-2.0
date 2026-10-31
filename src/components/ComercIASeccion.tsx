import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Bot, Cctv, Flame, Hammer, MapPin, Megaphone, MessageCircle, Pause, Play, Search, Smartphone, Volume2, VolumeX, Wrench, Zap } from "lucide-react";
import { ERP_URL } from "../lib/erp";
import { clamp, lerp, movimientoReducido, suave, tramo } from "../lib/animacion";
import { useNarracion } from "../lib/narracion";

/**
 * ComercIA Inteligente: una animación tipo video (4 capítulos) que se reproduce sola al verla.
 * Se muestra la web app real de ComercIA en celulares (capturas en /public/images/comercia), una pantalla por capítulo.
 * Se puede pausar y saltar a cada capítulo, y activar la voz (narración grabada con ElevenLabs en /public/audio).
 * Con "reducir movimiento" del sistema se muestra una versión estática.
 */

const URL_ADHESION = "https://iec-ia.com.ar/formulariofactoria.html";

const CAPITULOS: { eyebrow: string; titulo: string; destacado?: string; texto: string }[] = [
  {
    eyebrow: "Comerciante, una pregunta",
    titulo: "Tus clientes ya están en el celular.",
    destacado: "¿Y tu comercio?",
    texto: "ComercIA Inteligente: el programa del CeCIP, el Instituto IEC y FactorIA para que tu negocio venda más con tecnología e IA.",
  },
  {
    eyebrow: "Desarrollo digital",
    titulo: "Tu negocio, abierto las 24 horas.",
    texto: "Página web, tienda online y e-commerce con medios de pago, adaptados a tu rubro. Desarrollo ágil y de bajo costo para vender también mientras dormís.",
  },
  {
    eyebrow: "Inteligencia artificial",
    titulo: "La IA atiende, responde y vende con vos.",
    texto: "Automatizá la atención por WhatsApp, el marketing y la administración. Y formá a tu equipo como Experto en IA para Pymes en el Instituto IEC.",
  },
  {
    eyebrow: "IEC Services",
    titulo: "El comercio del futuro empieza en Paraná.",
    texto: "Y cuando tu comercio necesita una mano, pedís desde la app técnicos avalados por el Instituto IEC:",
  },
];

const SERVICIOS = [
  { icono: Zap, texto: "Electricistas" },
  { icono: Cctv, texto: "Cámaras y alarmas" },
  { icono: Hammer, texto: "Construcción en seco" },
  { icono: Flame, texto: "Gasistas" },
  { icono: Smartphone, texto: "Reparación de celulares" },
  { icono: Megaphone, texto: "Marketing digital" },
];

// Capturas de la web app (ancho 480 px; alto / ancho = proporción). Las largas se recorren como si se hiciera scroll.
const IMG = "/images/comercia";
const PANTALLAS = {
  inicio: { src: `${IMG}/inicio.webp`, prop: 3345 / 480 },
  busqueda: { src: `${IMG}/busqueda-ia.webp`, prop: 1040 / 480 },
  mapa: { src: `${IMG}/mapa.webp`, prop: 1299 / 600 },
  ofertas: { src: `${IMG}/ofertas.webp`, prop: 2481 / 480 },
  ficha: { src: `${IMG}/ficha.webp`, prop: 3033 / 480 },
  asistente: { src: `${IMG}/asistente.webp`, prop: 1040 / 480 },
  profesionales: { src: `${IMG}/profesionales.webp`, prop: 1335 / 480 },
  iec: { src: `${IMG}/iec-services.webp`, prop: 1382 / 480 },
  turnos: { src: `${IMG}/turnos.webp`, prop: 1447 / 480 },
  pedido: { src: `${IMG}/pedido-turno.webp`, prop: 1186 / 480 },
};
type Pantalla = keyof typeof PANTALLAS;
const PROP_PANTALLA = 19.5 / 9;

// Qué muestra cada celular en cada capítulo: [izquierda, centro, derecha]
const ESCENAS: { telefonos: [Pantalla, Pantalla, Pantalla]; etiqueta: { icono: typeof Search; texto: string } }[] = [
  { telefonos: ["mapa", "inicio", "ofertas"], etiqueta: { icono: Search, texto: "Te encuentran en ComercIA" } },
  { telefonos: ["mapa", "ficha", "profesionales"], etiqueta: { icono: MessageCircle, texto: "WhatsApp y web en un toque" } },
  { telefonos: ["busqueda", "asistente", "pedido"], etiqueta: { icono: Bot, texto: "Asistente con IA, 24 h" } },
  { telefonos: ["turnos", "iec", "ofertas"], etiqueta: { icono: Wrench, texto: "IEC Services y promos" } },
];

function fondo(p: number) {
  const g = Math.round(lerp(0, 40, Math.sin(p * Math.PI)));
  return `radial-gradient(120% 90% at 70% 40%, rgb(${14 + g / 4},${42 + g / 2},${98 + g}) 0%, #071738 55%, #040d24 100%)`;
}

// Guion del "video": en cada parada avanza despacito (para leer) y después pasa rápido a la siguiente
const PARADAS = [0.02, 0.36, 0.63, 0.97];
const QUIETO = 1900, MOVIMIENTO = 950, QUIETO_FINAL = 3200, REBOBINADO = 800;
const DERIVA = 0.03; // cuánto sigue moviéndose la escena mientras se lee
const TRAMOS = PARADAS.map((desde, k) => ({
  desde,
  hasta: k < PARADAS.length - 1 ? PARADAS[k + 1] : PARADAS[0],
  quieto: k < PARADAS.length - 1 ? QUIETO : QUIETO_FINAL,
  mov: k < PARADAS.length - 1 ? MOVIMIENTO : REBOBINADO,
}));
const INICIOS = TRAMOS.reduce<number[]>((acc, _, k) => [...acc, k ? acc[k - 1] + TRAMOS[k - 1].quieto + TRAMOS[k - 1].mov : 0], []);
const TOTAL = INICIOS[INICIOS.length - 1] + TRAMOS[TRAMOS.length - 1].quieto + TRAMOS[TRAMOS.length - 1].mov;

function avanceEn(t: number) {
  for (let k = TRAMOS.length - 1; k >= 0; k--) {
    if (t < INICIOS[k]) continue;
    const { desde, hasta, quieto, mov } = TRAMOS[k];
    const r = t - INICIOS[k];
    const leido = Math.min(1, desde + DERIVA);
    if (r < quieto) return lerp(desde, leido, r / quieto);
    return lerp(leido, hasta, suave(clamp((r - quieto) / mov)));
  }
  return PARADAS[0];
}

const MUSICA_ALTA = 0.32, MUSICA_BAJA = 0.1;

function tramoDe(t: number) {
  let k = 0;
  while (k < INICIOS.length - 1 && t >= INICIOS[k + 1]) k++;
  return k;
}

/**
 * Reloj del video: corre solo mientras la sección se ve en pantalla y no está en pausa.
 * Con el sonido activado suena música de fondo y, al empezar cada capítulo, su frase (la música baja mientras habla);
 * el video no pasa al siguiente capítulo hasta que termina la frase.
 */
function useVideo(ref: React.RefObject<HTMLElement | null>) {
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const [pausa, setPausa] = useState(false);
  const [visible, setVisible] = useState(false);
  // voz y música: arrancan solas al ver la sección (ver lib/narracion)
  const sonido = useNarracion({ clip: (k) => `/audio/comercia-${k + 1}.mp3`, musica: "/audio/comercia-musica.mp3", alta: MUSICA_ALTA, baja: MUSICA_BAJA });
  const { vozRef, sonando, hablar } = sonido;
  const mover = (nuevo: number) => { tRef.current = nuevo; setT(nuevo); };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    sonido.setActivo(visible && !pausa);
    if (!visible || pausa) return;
    hablar(tramoDe(tRef.current));
    let raf = 0, antes = performance.now();
    const paso = (ahora: number) => {
      const v = tRef.current;
      let nv = (v + Math.min(ahora - antes, 1000)) % TOTAL;
      antes = ahora;
      const k = tramoDe(v);
      const limite = INICIOS[k] + TRAMOS[k].quieto;
      if (vozRef.current && sonando.current[k] && v <= limite && nv > limite) nv = limite; // espera a la voz
      const k2 = tramoDe(nv);
      if (k2 !== k || nv < v) hablar(k2);
      mover(nv);
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [visible, pausa]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    p: avanceEn(t), tiempo: t / TOTAL, pausa, setPausa, voz: sonido.voz, bloqueado: sonido.bloqueado,
    irA: (k: number) => { mover(INICIOS[k]); setPausa(false); hablar(k); },
    alternarVoz: () => {
      const k = tramoDe(tRef.current);
      if (!vozRef.current) { mover(INICIOS[k]); setPausa(false); }
      sonido.alternar(k);
    },
  };
}

export default function ComercIASeccion() {
  if (movimientoReducido()) return <ComercIAEstatica />;
  return <ComercIAVideo />;
}

function ComercIAVideo() {
  const ref = useRef<HTMLElement>(null);
  const { p, tiempo, pausa, setPausa, irA, voz, bloqueado, alternarVoz } = useVideo(ref);
  const n = CAPITULOS.length;
  const activo = Math.min(n - 1, Math.floor(p * n + 0.0001));
  const oscuro = true;
  const giro = lerp(-10, 10, p); // giro suave en 3D

  return (
    <section id="comercia-section" ref={ref} className="relative" aria-label="ComercIA Inteligente">
      <style>{CSS}</style>
      <div className="relative h-[100svh] min-h-[640px] max-h-[960px] overflow-hidden" style={{ background: fondo(p) }}>
        {/* halo de luz que sigue al objeto */}
        <div className="cia-halo" style={{ opacity: lerp(0.5, 0.9, p), background: oscuro ? "radial-gradient(circle, rgba(0,163,224,.35), transparent 60%)" : "radial-gradient(circle, rgba(0,163,224,.22), transparent 60%)" }} />

        <div className="relative z-10 mx-auto grid h-full max-w-[1440px] grid-rows-[auto_1fr] items-center gap-2 px-5 pt-20 sm:px-8 lg:grid-cols-12 lg:grid-rows-1 lg:gap-8 lg:px-12 lg:pt-0">
          {/* Textos por capítulo */}
          <div className="relative z-20 min-h-[17.5rem] sm:min-h-[20rem] lg:col-span-5 lg:min-h-[36rem]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <img src={`${IMG}/logo-comercia.webp`} alt="ComercIA Inteligente Paraná" className="cia-logo h-14 w-auto sm:h-20" />
              <Firma />
            </div>
            {CAPITULOS.map((c, i) => {
              let d = p * n - i - 0.5; // distancia al centro del capítulo
              if (i === 0) d = Math.max(0, d); // el primero se ve entero al llegar
              if (i === n - 1) d = Math.min(0, d); // y el último queda al final
              const visible = clamp(1 - Math.abs(d) * 1.9);
              return (
                <div key={i} className="absolute inset-x-0 top-[4.5rem] sm:top-24" style={{ opacity: visible, transform: `translateY(${d * -38}px)`, pointerEvents: i === activo ? "auto" : "none" }} aria-hidden={i !== activo}>
                  <div className={`font-display text-sm font-semibold ${oscuro ? "text-sky-300" : "text-[#00a3e0]"}`}>
                    0{i + 1} <span className="mx-1 opacity-50">—</span> {c.eyebrow}
                  </div>
                  <h2 className={`font-display mt-2 font-bold leading-[1.05] tracking-tight ${i === n - 1 ? "text-[1.7rem] sm:text-4xl lg:text-5xl" : "text-[1.9rem] sm:text-5xl lg:text-6xl"} ${oscuro ? "text-white" : "text-[#0c2356]"}`}>
                    {c.titulo}
                    {c.destacado && <span className="cia-destacado mt-1 block text-[#00a3e0]">{c.destacado}</span>}
                  </h2>
                  <p className={`mt-4 max-w-md text-sm leading-relaxed sm:text-base ${oscuro ? "text-slate-300" : "text-slate-600"}`}>{c.texto}</p>
                  {i === n - 1 && (
                    <>
                      <ul className="mt-4 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                        {SERVICIOS.map(({ icono: Icono, texto }, k) => (
                          <li key={texto} className="cia-chip" style={{ transitionDelay: `${k * 70}ms`, opacity: tramo(p, 0.78 + k * 0.02, 0.84 + k * 0.02), transform: `translateY(${(1 - tramo(p, 0.78 + k * 0.02, 0.84 + k * 0.02)) * 14}px)` }}>
                            <Icono size={14} className="shrink-0 text-[#00a3e0]" /> <span>{texto}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <a href={URL_ADHESION} target="_blank" rel="noopener noreferrer" className="cia-cta">Quiero sumarme <ArrowRight size={16} /></a>
                        <a href={`${ERP_URL}/portal/comercia`} target="_blank" rel="noopener noreferrer" className="cia-cta-sec">Soy socio del CeCIP</a>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* La app en tres celulares */}
          <div className="cia-objeto relative flex h-full items-center justify-center lg:col-span-7 lg:col-start-6" style={{ ["--fin" as string]: tramo(p, 0.76, 0.84) } as CSSProperties}>
            <Vitrina p={p} activo={activo} giro={giro} sonido={voz} />
          </div>
        </div>

        {/* Capítulos (se pueden tocar para saltar) */}
        <div className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex lg:right-6">
          {CAPITULOS.map((c, i) => (
            <button key={i} type="button" onClick={() => irA(i)} title={c.eyebrow}
              className={`flex cursor-pointer items-center gap-2 text-[11px] font-bold transition-all ${i === activo ? (oscuro ? "text-white" : "text-[#0c2356]") : oscuro ? "text-white/30 hover:text-white/70" : "text-slate-300 hover:text-slate-500"}`}>
              <span>0{i + 1}</span>
              <span className={`h-1.5 rounded-full transition-all ${i === activo ? "w-5 bg-[#00a3e0]" : "w-1.5 bg-current"}`} />
            </button>
          ))}
        </div>
        {/* Controles del video */}
        <div className="absolute bottom-4 left-5 z-20 flex items-center gap-3 sm:left-8 lg:left-12">
          <button type="button" onClick={() => setPausa(!pausa)} aria-label={pausa ? "Reproducir" : "Pausar"}
            className={`grid h-9 w-9 cursor-pointer place-items-center rounded-full border transition-colors ${oscuro ? "border-white/25 text-white hover:bg-white/10" : "border-slate-300 text-[#0c2356] hover:bg-white"}`}>
            {pausa ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button type="button" data-sonido onClick={alternarVoz} aria-pressed={voz}
            className={`flex h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 text-xs font-bold transition-colors ${voz && bloqueado ? "cia-escuchar bg-[#00a3e0] text-white" : voz ? "bg-[#00a3e0] text-white" : oscuro ? "border border-white/25 text-white hover:bg-white/10" : "cia-escuchar border border-[#00a3e0] bg-white text-[#0c2356]"}`}>
            {voz && !bloqueado ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {!voz ? "Activar sonido" : bloqueado ? "Activar sonido" : "Sonido activado"}
          </button>
          <div className="flex gap-1.5 sm:hidden">
            {CAPITULOS.map((_, i) => (
              <button key={i} type="button" onClick={() => irA(i)} aria-label={`Capítulo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === activo ? "w-5 bg-[#00a3e0]" : oscuro ? "w-1.5 bg-white/40" : "w-1.5 bg-slate-300"}`} />
            ))}
          </div>
        </div>
        {/* Barra de avance */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/5"><div className="h-full bg-[#00a3e0]" style={{ width: `${tiempo * 100}%` }} /></div>
      </div>
    </section>
  );
}

/** "Una iniciativa de CeCIP × IEC" con los dos logos */
function Firma({ claro = false }: { claro?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-full py-1 pl-3 pr-1.5 ${claro ? "bg-white shadow-sm" : "border border-white/15 bg-white/[.06] backdrop-blur"}`}>
      <span className={`text-[10px] font-semibold uppercase leading-tight tracking-wider ${claro ? "text-slate-500" : "text-sky-100/70"}`}>Hecho en conjunto<br />por</span>
      <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1">
        <img src={`${IMG}/logo-cecip.webp`} alt="CeCIP" className="h-5 w-auto" />
        <span className="text-xs font-bold text-slate-400">×</span>
        <img src={`${IMG}/logo-iec.webp`} alt="Instituto IEC" className="h-6 w-6" />
      </span>
    </div>
  );
}

/** Tres celulares con capturas reales de la web app; cambian de pantalla en cada capítulo */
/** "Whoosh" de giro hecho con Web Audio (ruido filtrado que barre de grave a agudo), sin archivos */
let audioCtx: AudioContext | null = null;
function sonarGiro() {
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx, ahora = ctx.currentTime, dur = 0.55;
    const ruido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const datos = ruido.getChannelData(0);
    for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
    const fuente = ctx.createBufferSource();
    fuente.buffer = ruido;
    const filtro = ctx.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.Q.value = 1.4;
    filtro.frequency.setValueAtTime(320, ahora);
    filtro.frequency.exponentialRampToValueAtTime(2800, ahora + dur * 0.55);
    filtro.frequency.exponentialRampToValueAtTime(900, ahora + dur);
    const vol = ctx.createGain();
    vol.gain.setValueAtTime(0.0001, ahora);
    vol.gain.exponentialRampToValueAtTime(0.32, ahora + dur * 0.45);
    vol.gain.exponentialRampToValueAtTime(0.0001, ahora + dur);
    fuente.connect(filtro).connect(vol).connect(ctx.destination);
    fuente.start(ahora);
  } catch {
    /* sin Web Audio: sin sonido */
  }
}

// Posición de los tres celulares en el carrusel: 0 = centro, -1 = izquierda, 1 = derecha
const LADO_DE_HUECO: Record<number, 0 | 1 | 2> = { [-1]: 0, 0: 1, 1: 2 };

function Vitrina({ p, activo, giro, sonido }: { p: number; activo: number; giro: number; sonido: boolean }) {
  const n = ESCENAS.length;
  const local = clamp(p * n - activo); // avance dentro del capítulo (para el scroll de la pantalla)
  const { icono: Icono, texto } = ESCENAS[activo].etiqueta;
  // el carrusel gira un lugar en cada cambio de capítulo (suave alrededor del cambio)
  let vueltas = 0;
  for (let i = 1; i < n; i++) vueltas += suave(tramo(p, i / n - 0.035, i / n + 0.035));

  const anterior = useRef(activo);
  useEffect(() => {
    if (anterior.current !== activo && sonido) sonarGiro();
    anterior.current = activo;
  }, [activo, sonido]);
  return (
    <div className="cia-vitrina relative w-full max-w-[640px]" style={{ perspective: "1400px" }}>
      <div className="cia-flota relative mx-auto aspect-[1.18] w-full" style={{ transformStyle: "preserve-3d", transform: `rotateY(${giro}deg)` }}>
        {[0, 1, 2].map((k) => {
          // ángulo del celular en el círculo del carrusel (0° = adelante)
          let ang = ((k - vueltas) * 120) % 360;
          if (ang > 180) ang -= 360;
          if (ang <= -180) ang += 360;
          const rad = (ang * Math.PI) / 180;
          const frente = (Math.cos(rad) + 1) / 2; // 1 adelante, 0 atrás
          const hueco = Math.round(ang / 120) as -1 | 0 | 1;
          const lado = LADO_DE_HUECO[hueco] ?? 1;
          const centro = hueco === 0;
          return (
            <div key={k} className="cia-tel absolute left-1/2 top-1/2 w-[38%]"
              style={{
                zIndex: Math.round(frente * 10),
                transform: `translate(-50%, -50%) translate3d(${Math.sin(rad) * 82}%, 0, ${lerp(-260, 60, frente)}px) rotateY(${-Math.sin(rad) * 28}deg) scale(${lerp(0.72, 1, frente)})`,
                filter: `brightness(${lerp(0.55, 1, frente)})`,
                transition: "transform .5s cubic-bezier(.2,.8,.2,1), filter .5s", // suaviza también los saltos de capítulo
              }}>
              <div className="cia-tel-pantalla">
                <div className="cia-tel-barra"><span>9:41</span><span className="cia-tel-iconos" /></div>
                <div className="absolute inset-x-0 bottom-0 top-[5.5%] overflow-hidden">
                {ESCENAS.map((e, i) => {
                  const pant = PANTALLAS[e.telefonos[lado]];
                  const sobra = Math.max(0, 1 - PROP_PANTALLA / pant.prop); // cuánto de la captura queda fuera de la pantalla
                  const recorrido = i === activo ? suave(local) * Math.min(sobra, centro ? 0.55 : 0.3) : 0;
                  return (
                    <img key={i} src={pant.src} alt="" loading="lazy" draggable={false}
                      className="absolute inset-x-0 top-0 w-full select-none"
                      style={{ opacity: i === activo ? 1 : 0, transform: `translateY(${-recorrido * 100}%) scale(${i === activo ? 1 : 1.04})`, transition: "opacity .7s ease, transform .7s ease" }} />
                  );
                })}
                </div>
                <div className="cia-tel-isla" />
                <div className="cia-tel-reflejo" />
              </div>
            </div>
          );
        })}
        {/* etiqueta de vidrio que cambia con el capítulo */}
        <div key={activo} className="cia-etiqueta absolute bottom-[4%] left-1/2 z-20 flex items-center gap-2 whitespace-nowrap" style={{ transform: "translateZ(140px)" }}>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#00a3e0] text-white"><Icono size={14} /></span>
          {texto}
        </div>
        <div className="cia-etiqueta-sec absolute right-[2%] top-[8%] z-20 hidden items-center gap-1.5 sm:flex" style={{ transform: "translateZ(120px)" }}>
          <MapPin size={12} className="text-[#7dd3fc]" /> Comercios de Paraná
        </div>
      </div>
    </div>
  );
}

/** Versión sin movimiento (para quien lo tiene desactivado en el sistema) */
function ComercIAEstatica() {
  return (
    <section id="comercia-section" className="bg-gradient-to-b from-[#f0f8fd] to-[#0c2356] px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <img src={`${IMG}/logo-comercia.webp`} alt="ComercIA Inteligente Paraná" className="h-16 w-auto" />
          <Firma claro />
        </div>
        <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
          {(["inicio", "asistente", "mapa", "iec"] as Pantalla[]).map((k) => (
            <img key={k} src={PANTALLAS[k].src} alt="" className="aspect-[9/19.5] w-40 shrink-0 rounded-2xl object-cover object-top shadow-lg" />
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {CAPITULOS.map((c, i) => (
            <div key={i} className="rounded-2xl bg-white/90 p-6 shadow-sm">
              <div className="text-sm font-semibold text-[#00a3e0]">0{i + 1} — {c.eyebrow}</div>
              <h3 className="font-display mt-1 text-2xl font-bold text-[#0c2356]">{c.titulo} {c.destacado && <span className="text-[#00a3e0]">{c.destacado}</span>}</h3>
              <p className="mt-2 text-sm text-slate-600">{c.texto}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={URL_ADHESION} target="_blank" rel="noopener noreferrer" className="cia-cta">Quiero sumarme <ArrowRight size={16} /></a>
          <a href={`${ERP_URL}/portal/comercia`} target="_blank" rel="noopener noreferrer" className="cia-cta-sec">Soy socio del CeCIP</a>
        </div>
      </div>
      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.cia-halo { position: absolute; left: 62%; top: 50%; width: 900px; height: 900px; transform: translate(-50%, -50%); pointer-events: none; filter: blur(10px); }
@media (max-width: 1023px) { .cia-halo { left: 50%; top: 66%; width: 620px; height: 620px; } }
/* en celular el texto del último capítulo ocupa más: el gráfico queda de fondo */
@media (max-width: 1023px) { .cia-objeto { opacity: calc(1 - var(--fin) * .8); } }
.cia-destacado { animation: cia-latido 2.4s ease-in-out infinite; }
@keyframes cia-latido { 0%, 100% { text-shadow: 0 0 0 rgba(0,163,224,0); } 50% { text-shadow: 0 0 28px rgba(0,163,224,.45); } }
.cia-logo { filter: drop-shadow(0 6px 24px rgba(0,163,224,.45)); }
.cia-tel { aspect-ratio: 9 / 19.5; padding: 2.2%; border-radius: 14% / 6.5%; background: linear-gradient(145deg, #2b3a55, #0b1220 40%, #1c2940);
  box-shadow: 0 0 0 1px rgba(255,255,255,.14), 0 40px 80px -30px rgba(0,0,0,.8), 0 0 60px -10px rgba(0,163,224,.35); }
.cia-tel-pantalla { position: relative; height: 100%; overflow: hidden; border-radius: 12% / 5.6%; background: #050c1f; }
.cia-tel-barra { position: absolute; inset: 0 0 auto; height: 5.5%; display: flex; align-items: center; justify-content: space-between; padding: 0 9% ; font: 700 9px Inter, sans-serif; color: #fff; z-index: 2; }
.cia-tel-iconos { width: 18px; height: 7px; border-radius: 2px; border: 1px solid rgba(255,255,255,.8); box-shadow: inset -6px 0 0 rgba(255,255,255,.8); }
.cia-tel-isla { position: absolute; left: 50%; top: 1.2%; width: 30%; height: 3.2%; z-index: 3; translate: -50% 0; border-radius: 999px; background: #000; }
.cia-tel-reflejo { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(115deg, rgba(255,255,255,.14) 0%, transparent 28%, transparent 70%, rgba(255,255,255,.05) 100%); }
.cia-etiqueta { translate: -50% 0; padding: .35rem .9rem .35rem .35rem; border-radius: 999px; font-size: 13px; font-weight: 700; color: #fff;
  background: rgba(7,23,56,.78); border: 1px solid rgba(125,211,252,.35); backdrop-filter: blur(14px); box-shadow: 0 18px 40px -16px rgba(0,0,0,.6);
  animation: cia-entra .6s cubic-bezier(.2,.9,.3,1.3); }
@keyframes cia-entra { from { opacity: 0; transform: translateY(14px) scale(.9); } }
.cia-etiqueta-sec { padding: .3rem .7rem; border-radius: 999px; font-size: 11px; font-weight: 600; color: #e0f2fe;
  background: rgba(7,23,56,.6); border: 1px solid rgba(125,211,252,.3); backdrop-filter: blur(10px); animation: cia-vaiven 3.6s ease-in-out infinite; }
@keyframes cia-vaiven { 0%, 100% { translate: 0 0; } 50% { translate: 0 -7px; } }
@media (max-width: 640px) { .cia-etiqueta { font-size: 11px; } .cia-chip { white-space: normal; line-height: 1.15; } }
.cia-escuchar { animation: cia-pulso 2s ease-out infinite; }
@keyframes cia-pulso { 0% { box-shadow: 0 0 0 0 rgba(0,163,224,.55); } 100% { box-shadow: 0 0 0 12px rgba(0,163,224,0); } }
@media (max-width: 640px) { .cia-cliente { font-size: 10.5px; padding: .35rem .6rem; } }
.cia-flota { animation: cia-flota 6s ease-in-out infinite; }
@keyframes cia-flota { 0%, 100% { translate: 0 -6px; } 50% { translate: 0 8px; } }
.cia-chip { display: flex; align-items: center; gap: .45rem; white-space: nowrap; border-radius: .75rem; padding: .45rem .65rem; font-size: .74rem; font-weight: 600;
  color: #e0f2fe; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); transition: opacity .3s, transform .3s; }
.cia-cta { display: inline-flex; align-items: center; gap: .5rem; border-radius: .75rem; padding: .7rem 1.1rem; font-size: .84rem; font-weight: 700;
  color: #fff; background: #00a3e0; box-shadow: 0 10px 30px -10px rgba(0,163,224,.8); transition: transform .2s, background .2s; }
.cia-cta:hover { background: #0284c7; transform: translateY(-2px); }
.cia-cta-sec { display: inline-flex; align-items: center; border-radius: .75rem; padding: .7rem 1rem; font-size: .84rem; font-weight: 600;
  color: #e0f2fe; border: 1px solid rgba(255,255,255,.25); transition: background .2s; }
.cia-cta-sec:hover { background: rgba(255,255,255,.08); }
`;

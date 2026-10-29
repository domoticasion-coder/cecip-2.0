import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Camera, Pause, Play, Rocket, Sparkles, Users, Volume2, VolumeX, Zap } from "lucide-react";
import { ERP_URL } from "../lib/erp";
import { clamp, lerp, movimientoReducido, suave, tramo } from "../lib/animacion";

/**
 * ComercIA Inteligente: una animación tipo video (4 capítulos) que se reproduce sola al verla.
 * Un comercio del CeCIP se transforma: vidriera → tienda online → IA que atiende → ventas que crecen.
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
    eyebrow: "Lo que se viene",
    titulo: "El comercio del futuro empieza en Paraná.",
    texto: "Una sola adhesión te conecta con todo el ecosistema de transformación tecnológica.",
  },
];

const PROXIMOS = [
  { icono: Camera, texto: "Streaming ComercIA Inteligente" },
  { icono: Users, texto: "Simposios tecnológicos mensuales" },
  { icono: Rocket, texto: "IEC Tech Experience" },
  { icono: Zap, texto: "Sistemas smart y ahorro de energía" },
];

// Lo que hacen los clientes desde el celular (aparece alrededor del local en el capítulo 1)
const CLIENTES = [
  { texto: "🔎 «zapatillas en Paraná»", x: "-4%", y: "8%" },
  { texto: "🛒 Compró online", x: "62%", y: "2%" },
  { texto: "💬 «¿Tenés stock?»", x: "66%", y: "78%" },
];

const CHATS = [
  { de: "cliente", texto: "¿Tienen talle M?" },
  { de: "ia", texto: "¡Sí! Te lo reservo 🛍️" },
  { de: "cliente", texto: "¿Hacen envíos?" },
  { de: "ia", texto: "Hoy mismo, en Paraná 🚀" },
];

// Colores de fondo por capítulo (de la web clara al azul marino del CeCIP)
const FONDOS = [[240, 248, 253], [226, 244, 252], [12, 35, 86], [7, 23, 56]];
function fondo(p: number) {
  const x = clamp(p) * (FONDOS.length - 1);
  const i = Math.min(FONDOS.length - 2, Math.floor(x));
  const t = suave(x - i);
  const c = FONDOS[i].map((v, k) => Math.round(lerp(v, FONDOS[i + 1][k], t)));
  return `rgb(${c.join(",")})`;
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

function tramoDe(t: number) {
  let k = 0;
  while (k < INICIOS.length - 1 && t >= INICIOS[k + 1]) k++;
  return k;
}

/**
 * Reloj del video: corre solo mientras la sección se ve en pantalla y no está en pausa.
 * Con la voz activada, al empezar cada capítulo suena su frase y el video no pasa al siguiente hasta que termina.
 */
function useVideo(ref: React.RefObject<HTMLElement | null>) {
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const [pausa, setPausa] = useState(false);
  const [visible, setVisible] = useState(false);
  const [voz, setVoz] = useState(false);
  const vozRef = useRef(false);
  const audios = useRef<HTMLAudioElement[]>([]);
  const sonando = useRef<boolean[]>([]);

  const callar = () => audios.current.forEach((a, k) => { a.pause(); sonando.current[k] = false; });
  const hablar = (k: number) => {
    if (!vozRef.current) return;
    callar();
    if (!audios.current[k]) {
      const a = new Audio(`/audio/comercia-${k + 1}.mp3`);
      const fin = () => { sonando.current[k] = false; };
      a.addEventListener("ended", fin);
      a.addEventListener("error", fin);
      audios.current[k] = a;
    }
    const a = audios.current[k];
    a.currentTime = 0;
    sonando.current[k] = true;
    a.play().catch(() => { sonando.current[k] = false; });
  };
  const mover = (nuevo: number) => { tRef.current = nuevo; setT(nuevo); };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!visible || pausa) { callar(); return; }
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
  }, [visible, pausa]);

  useEffect(() => () => callar(), []);

  return {
    p: avanceEn(t), tiempo: t / TOTAL, pausa, setPausa, voz,
    irA: (k: number) => { mover(INICIOS[k]); setPausa(false); hablar(k); },
    alternarVoz: () => {
      const nueva = !vozRef.current;
      vozRef.current = nueva;
      setVoz(nueva);
      if (!nueva) return callar();
      // al activarla, el capítulo actual arranca de nuevo con su frase
      const k = tramoDe(tRef.current);
      mover(INICIOS[k]);
      setPausa(false);
      hablar(k);
    },
  };
}

export default function ComercIASeccion() {
  if (movimientoReducido()) return <ComercIAEstatica />;
  return <ComercIAVideo />;
}

function ComercIAVideo() {
  const ref = useRef<HTMLElement>(null);
  const { p, tiempo, pausa, setPausa, irA, voz, alternarVoz } = useVideo(ref);
  const n = CAPITULOS.length;
  const activo = Math.min(n - 1, Math.floor(p * n + 0.0001));
  const oscuro = p > 0.42;

  // Tramos de la transformación del objeto central
  const aDigital = suave(tramo(p, 0.18, 0.34));   // el local entra en el celular
  const aIA = suave(tramo(p, 0.45, 0.62));        // espiral de mensajes
  const aVentas = suave(tramo(p, 0.72, 0.88));    // barras que suben
  const giro = lerp(-14, 14, p);                   // giro suave en 3D, como el grano del video

  const carrito = Math.round(tramo(p, 0.26, 0.5) * 12);

  return (
    <section id="comercia-section" ref={ref} className="relative" aria-label="ComercIA Inteligente">
      <style>{CSS}</style>
      <div className="relative h-[100svh] min-h-[640px] max-h-[960px] overflow-hidden" style={{ background: fondo(p) }}>
        {/* halo de luz que sigue al objeto */}
        <div className="cia-halo" style={{ opacity: lerp(0.5, 0.9, p), background: oscuro ? "radial-gradient(circle, rgba(0,163,224,.35), transparent 60%)" : "radial-gradient(circle, rgba(0,163,224,.22), transparent 60%)" }} />

        <div className="relative z-10 mx-auto grid h-full max-w-[1440px] grid-rows-[auto_1fr] items-center gap-2 px-5 pt-20 sm:px-8 lg:grid-cols-12 lg:grid-rows-1 lg:gap-8 lg:px-12 lg:pt-0">
          {/* Textos por capítulo */}
          <div className="relative z-20 min-h-[15.5rem] sm:min-h-[17rem] lg:col-span-5 lg:min-h-[26rem]">
            <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${oscuro ? "border-white/20 bg-white/5 text-sky-200" : "border-sky-200 bg-white/70 text-[#0c2356]"}`}>
              <Sparkles size={13} className="text-[#00a3e0]" /> ComercIA Inteligente
            </div>
            {CAPITULOS.map((c, i) => {
              let d = p * n - i - 0.5; // distancia al centro del capítulo
              if (i === 0) d = Math.max(0, d); // el primero se ve entero al llegar
              if (i === n - 1) d = Math.min(0, d); // y el último queda al final
              const visible = clamp(1 - Math.abs(d) * 1.9);
              return (
                <div key={i} className="absolute inset-x-0 top-10" style={{ opacity: visible, transform: `translateY(${d * -38}px)`, pointerEvents: i === activo ? "auto" : "none" }} aria-hidden={i !== activo}>
                  <div className={`font-display text-sm font-semibold ${oscuro ? "text-sky-300" : "text-[#00a3e0]"}`}>
                    0{i + 1} <span className="mx-1 opacity-50">—</span> {c.eyebrow}
                  </div>
                  <h2 className={`font-display mt-2 text-[1.9rem] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${oscuro ? "text-white" : "text-[#0c2356]"}`}>
                    {c.titulo}
                    {c.destacado && <span className="cia-destacado mt-1 block text-[#00a3e0]">{c.destacado}</span>}
                  </h2>
                  <p className={`mt-4 max-w-md text-sm leading-relaxed sm:text-base ${oscuro ? "text-slate-300" : "text-slate-600"}`}>{c.texto}</p>
                  {i === n - 1 && (
                    <>
                      <ul className="mt-5 grid max-w-md grid-cols-2 gap-2">
                        {PROXIMOS.map(({ icono: Icono, texto }, k) => (
                          <li key={texto} className="cia-chip" style={{ transitionDelay: `${k * 70}ms`, opacity: tramo(p, 0.78 + k * 0.025, 0.84 + k * 0.025), transform: `translateY(${(1 - tramo(p, 0.78 + k * 0.025, 0.84 + k * 0.025)) * 14}px)` }}>
                            <Icono size={14} className="shrink-0 text-[#00a3e0]" /> <span>{texto}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <a href={URL_ADHESION} target="_blank" rel="noopener noreferrer" className="cia-cta">Quiero sumarme <ArrowRight size={16} /></a>
                        <a href={`${ERP_URL}/portal/comercia`} target="_blank" rel="noopener noreferrer" className="cia-cta-sec">Soy socio del CeCIP</a>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Objeto central */}
          <div className="cia-objeto relative flex h-full items-center justify-center lg:col-span-6 lg:col-start-7" style={{ ["--fin" as string]: tramo(p, 0.76, 0.84) } as CSSProperties}>
            <div className="cia-flota relative w-full max-w-[min(520px,46svh)] lg:max-w-[560px]" style={{ perspective: "1100px" }}>
              <svg viewBox="0 0 520 520" className="w-full overflow-visible" style={{ transform: `rotateY(${giro}deg) rotateZ(${giro * 0.15}deg)` }} role="img" aria-label="Un comercio que se vuelve digital">
                <defs>
                  <linearGradient id="ciaPhone" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#123170" /><stop offset="1" stopColor="#071738" /></linearGradient>
                  <linearGradient id="ciaCinta" x1="0" x2="1"><stop offset="0" stopColor="#00a3e0" /><stop offset="1" stopColor="#7dd3fc" /></linearGradient>
                  <filter id="ciaBrillo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
                </defs>

                {/* sombra */}
                <ellipse cx="260" cy="482" rx={lerp(150, 120, aDigital)} ry="14" fill={oscuro ? "rgba(0,0,0,.35)" : "rgba(12,35,86,.12)"} />

                {/* Capítulo 4: barras de ventas detrás del celular */}
                <g opacity={aVentas}>
                  {[0.35, 0.55, 0.75, 1].map((h, i) => {
                    const alto = 190 * h * aVentas;
                    return <rect key={i} x={36 + i * 40} y={440 - alto} width="26" height={alto} rx="6" fill={i === 3 ? "#00a3e0" : "rgba(125,211,252,.55)"} />;
                  })}
                  <path d={`M30 ${420} L70 ${380} L110 ${395} L150 ${330} L190 ${250}`} fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="280" strokeDashoffset={280 * (1 - aVentas)} />
                  <path d="M176 246 L192 248 L190 264" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" opacity={tramo(p, 0.84, 0.88)} />
                  <text x="40" y="230" fill="#fbbf24" fontSize="26" fontWeight="800" fontFamily="Outfit, sans-serif" opacity={tramo(p, 0.84, 0.9)}>+ ventas</text>
                </g>

                {/* Capítulo 2: el celular con la tienda online */}
                <g style={{ opacity: aDigital, transform: `translate(${lerp(0, 0, aDigital)}px, ${lerp(30, 0, aDigital)}px) scale(${lerp(0.82, 1, aDigital)})`, transformOrigin: "260px 260px" }}>
                  <rect x="168" y="70" width="184" height="380" rx="34" fill="url(#ciaPhone)" stroke={oscuro ? "#00a3e0" : "#0c2356"} strokeWidth="3" />
                  <rect x="180" y="88" width="160" height="344" rx="24" fill="#ffffff" />
                  <rect x="236" y="78" width="48" height="8" rx="4" fill="#0c2356" />
                  {/* productos */}
                  {[0, 1, 2, 3].map((k) => {
                    const t = tramo(p, 0.24 + k * 0.03, 0.3 + k * 0.03);
                    const x = 190 + (k % 2) * 76, y = 210 + Math.floor(k / 2) * 92;
                    return (
                      <g key={k} style={{ opacity: t, transform: `translateY(${(1 - t) * 18}px)` }}>
                        <rect x={x} y={y} width="66" height="82" rx="10" fill="#f0f8fd" stroke="#d6eaf5" />
                        <rect x={x + 10} y={y + 10} width="46" height="36" rx="8" fill={["#00a3e0", "#0c2356", "#7dd3fc", "#38bdf8"][k]} opacity=".85" />
                        <rect x={x + 10} y={y + 54} width="34" height="6" rx="3" fill="#94a3b8" />
                        <rect x={x + 10} y={y + 66} width="22" height="6" rx="3" fill="#0c2356" />
                      </g>
                    );
                  })}
                  <rect x="190" y="400" width="140" height="22" rx="11" fill="#00a3e0" />
                  <text x="260" y="415" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">Comprar ahora</text>
                  {/* carrito */}
                  <g transform="translate(318 104)">
                    <circle r="11" fill="#0c2356" />
                    <path d="M-5 -3 h10 l-2 6 h-7 z" fill="#fff" />
                    {carrito > 0 && <><circle cx="9" cy="-9" r="8" fill="#ef4444" /><text x="9" y="-6" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">{carrito}</text></>}
                  </g>
                </g>

                {/* Capítulo 1: el local (se achica y entra en la pantalla del celular) */}
                <g style={{ transform: `translate(${lerp(0, 0, aDigital)}px, ${lerp(0, -112, aDigital)}px) scale(${lerp(1, 0.5, aDigital)})`, transformOrigin: "260px 300px" }}>
                  <Local />
                </g>

                {/* Capítulo 3: espiral de mensajes con la IA (el "remolino") */}
                <g opacity={aIA * (1 - aVentas)}>
                  <path d={ESPIRAL} fill="none" stroke="url(#ciaCinta)" strokeWidth="10" strokeLinecap="round" opacity=".85"
                    strokeDasharray={LARGO_ESPIRAL} strokeDashoffset={LARGO_ESPIRAL * (1 - aIA)} />
                  <path d={ESPIRAL} fill="none" stroke="#7dd3fc" strokeWidth="16" opacity=".25" filter="url(#ciaBrillo)"
                    strokeDasharray={LARGO_ESPIRAL} strokeDashoffset={LARGO_ESPIRAL * (1 - aIA)} />
                  {CHATS.map((c, k) => {
                    const t = tramo(p, 0.5 + k * 0.035, 0.56 + k * 0.035);
                    const ang = (k * 95 + p * 220) * (Math.PI / 180);
                    const radio = 200 - k * 8;
                    const x = 260 + Math.cos(ang) * radio * 0.95, y = 260 + Math.sin(ang) * radio * 0.55;
                    const ancho = c.texto.length * 7.2 + 26;
                    return (
                      <g key={k} style={{ opacity: t, transform: `translate(${x - ancho / 2}px, ${y - 18}px) scale(${lerp(0.6, 1, t)})` }}>
                        <rect width={ancho} height="34" rx="17" fill={c.de === "ia" ? "#00a3e0" : "#ffffff"} stroke={c.de === "ia" ? "none" : "#bae6fd"} />
                        <text x={ancho / 2} y="22" textAnchor="middle" fontSize="13" fontWeight="600" fill={c.de === "ia" ? "#ffffff" : "#0c2356"} fontFamily="Inter, sans-serif">{c.texto}</text>
                      </g>
                    );
                  })}
                  {[0, 1, 2, 3, 4].map((k) => {
                    const ang = (k * 72 + p * 540) * (Math.PI / 180);
                    return <path key={k} d={ESTRELLA} fill="#fde68a" style={{ transform: `translate(${260 + Math.cos(ang) * 235}px, ${260 + Math.sin(ang) * 150}px) scale(${0.6 + (k % 3) * 0.25})` }} />;
                  })}
                  <g style={{ opacity: aIA, transform: `translate(232px, 40px)` }}>
                    <rect width="56" height="26" rx="13" fill="#0c2356" stroke="#00a3e0" />
                    <text x="28" y="18" textAnchor="middle" fontSize="12" fontWeight="800" fill="#7dd3fc" fontFamily="Outfit, sans-serif">IA</text>
                  </g>
                </g>
              </svg>
              {CLIENTES.map((c, k) => (
                <div key={c.texto} className="cia-cliente" style={{ left: c.x, top: c.y, opacity: 1 - aDigital, animationDelay: `${0.4 + k * 0.45}s, ${k * 0.8}s` }}>
                  <span className="cia-cliente-cel" />{c.texto}
                </div>
              ))}
            </div>
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
          <button type="button" onClick={alternarVoz} aria-pressed={voz}
            className={`flex h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 text-xs font-bold transition-colors ${voz ? "bg-[#00a3e0] text-white" : oscuro ? "border border-white/25 text-white hover:bg-white/10" : "cia-escuchar border border-[#00a3e0] bg-white text-[#0c2356]"}`}>
            {voz ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {voz ? "Voz activada" : "Escuchar"}
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

/** El local del CeCIP: fachada con toldo a rayas, cartel, vidriera y puerta */
function Local() {
  const franjas = 8, ancho = 260 / franjas;
  return (
    <g>
      <rect x="130" y="150" width="260" height="230" rx="14" fill="#ffffff" stroke="#0c2356" strokeWidth="3" />
      <rect x="148" y="164" width="224" height="34" rx="8" fill="#0c2356" />
      <text x="260" y="187" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="800" letterSpacing="3" fontFamily="Outfit, sans-serif">TU COMERCIO</text>
      {Array.from({ length: franjas }, (_, k) => (
        <path key={k} d={`M${130 + k * ancho} 206 h${ancho} v26 a${ancho / 2} 8 0 0 1 -${ancho} 0 z`} fill={k % 2 ? "#ffffff" : "#00a3e0"} stroke="#0c2356" strokeWidth="1.5" />
      ))}
      <rect x="150" y="252" width="132" height="96" rx="8" fill="#e0f4fc" stroke="#0c2356" strokeWidth="2" />
      <rect x="164" y="300" width="28" height="34" rx="4" fill="#00a3e0" />
      <rect x="200" y="288" width="28" height="46" rx="4" fill="#0c2356" />
      <circle cx="252" cy="318" r="16" fill="#7dd3fc" />
      <rect x="298" y="252" width="72" height="128" rx="8" fill="#00a3e0" stroke="#0c2356" strokeWidth="2" />
      <circle cx="356" cy="320" r="4" fill="#ffffff" />
      <rect x="306" y="262" width="56" height="22" rx="4" fill="#ffffff" opacity=".9" />
      <text x="334" y="277" textAnchor="middle" fill="#0c2356" fontSize="10" fontWeight="800" fontFamily="Inter, sans-serif">ABIERTO</text>
      <rect x="116" y="378" width="288" height="10" rx="5" fill="#0c2356" />
    </g>
  );
}

// Espiral alrededor del celular (elipse que se abre), y estrella de 4 puntas
const ESPIRAL = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 140; i++) {
    const a = (i / 140) * Math.PI * 3.2 - Math.PI / 2;
    const r = 120 + i * 0.75;
    pts.push(`${(260 + Math.cos(a) * r).toFixed(1)} ${(250 + Math.sin(a) * r * 0.42 + i * 0.6).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
})();
const LARGO_ESPIRAL = 2200;
const ESTRELLA = "M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5 Z";

/** Versión sin movimiento (para quien lo tiene desactivado en el sistema) */
function ComercIAEstatica() {
  return (
    <section id="comercia-section" className="bg-gradient-to-b from-[#f0f8fd] to-[#0c2356] px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#0c2356]">
          <Sparkles size={13} className="text-[#00a3e0]" /> ComercIA Inteligente
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
.cia-cliente { position: absolute; z-index: 5; display: flex; align-items: center; gap: .4rem; white-space: nowrap; pointer-events: none;
  padding: .45rem .75rem; border-radius: 999px; font-size: 12px; font-weight: 600; color: #0c2356; background: #fff;
  border: 1px solid #bae6fd; box-shadow: 0 12px 28px -12px rgba(12,35,86,.45);
  transform: scale(0); animation: cia-aparece .5s cubic-bezier(.2,.9,.3,1.4) forwards, cia-vaiven 3.2s ease-in-out infinite; }
.cia-cliente-cel { width: 9px; height: 14px; border-radius: 3px; border: 2px solid #00a3e0; }
@keyframes cia-aparece { to { transform: scale(1); } }
@keyframes cia-vaiven { 0%, 100% { translate: 0 0; } 50% { translate: 0 -7px; } }
.cia-escuchar { animation: cia-pulso 2s ease-out infinite; }
@keyframes cia-pulso { 0% { box-shadow: 0 0 0 0 rgba(0,163,224,.55); } 100% { box-shadow: 0 0 0 12px rgba(0,163,224,0); } }
@media (max-width: 640px) { .cia-cliente { font-size: 10.5px; padding: .35rem .6rem; } }
.cia-flota { animation: cia-flota 6s ease-in-out infinite; }
@keyframes cia-flota { 0%, 100% { translate: 0 -6px; } 50% { translate: 0 8px; } }
.cia-chip { display: flex; align-items: center; gap: .45rem; border-radius: .75rem; padding: .5rem .7rem; font-size: .75rem; font-weight: 600;
  color: #e0f2fe; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); transition: opacity .3s, transform .3s; }
.cia-cta { display: inline-flex; align-items: center; gap: .5rem; border-radius: .75rem; padding: .8rem 1.3rem; font-size: .875rem; font-weight: 700;
  color: #fff; background: #00a3e0; box-shadow: 0 10px 30px -10px rgba(0,163,224,.8); transition: transform .2s, background .2s; }
.cia-cta:hover { background: #0284c7; transform: translateY(-2px); }
.cia-cta-sec { display: inline-flex; align-items: center; border-radius: .75rem; padding: .8rem 1.2rem; font-size: .875rem; font-weight: 600;
  color: #e0f2fe; border: 1px solid rgba(255,255,255,.25); transition: background .2s; }
.cia-cta-sec:hover { background: rgba(255,255,255,.08); }
`;

import { useRef } from "react";
import { ArrowRight, Briefcase, Factory, MapPin, ShoppingBag } from "lucide-react";
import { clamp, lerp, movimientoReducido, suave, tramo, useAvance } from "../lib/animacion";

/**
 * Banner principal con historia en scroll (4 capítulos), al estilo de las webs "scrollytelling":
 * la pantalla queda fija y, a medida que se baja, la fachada histórica del CeCIP toma el azul institucional, los años corren desde 1898, aparecen comercio/industria/servicios y una red de socios se conecta.
 * Con "reducir movimiento" se muestra solo el primer capítulo, sin fijar la pantalla.
 */

export interface HeroInfo {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
}

interface Props {
  info: HeroInfo;
  socios: number;
  entidades: string[];
  onSumate: () => void;
  onObjetivos: () => void;
  onBeneficios: () => void;
}

const FUNDACION = 1898;
const HOY = new Date().getFullYear();

const HITOS = [
  { anio: "1898", texto: "Nace la Sociedad de Comerciantes, hoy CeCIP." },
  { anio: "1920", texto: "Sede propia en pleno centro de la ciudad." },
  { anio: "1970", texto: "Protagonistas del Parque Industrial Paraná." },
  { anio: "Hoy", texto: "Capacitación, beneficios e innovación con IA." },
];

const SECTORES = [
  { icono: ShoppingBag, titulo: "Comercio", x: 4, y: 14 },
  { icono: Factory, titulo: "Industria", x: 70, y: 6 },
  { icono: Briefcase, titulo: "Servicios", x: 66, y: 80 },
];

// Comercios asociados como pines alrededor de la fachada (en % del recuadro)
const PINES = [[12, 46], [24, 84], [44, 92], [86, 58], [92, 34], [50, 4], [30, 6], [6, 70], [80, 92]];

export default function HeroScroll(props: Props) {
  const reducido = movimientoReducido();
  const ref = useRef<HTMLElement>(null);
  const avance = useAvance(ref);
  const p = reducido ? 0 : avance;
  const n = 4;
  const activo = Math.min(n - 1, Math.floor(p * n + 0.0001));

  const aColor = suave(tramo(p, 0.16, 0.42));   // la fachada toma el azul CeCIP
  const anio = Math.round(lerp(FUNDACION, HOY, suave(tramo(p, 0.2, 0.44))));
  const aRed = suave(tramo(p, 0.46, 0.62));     // la foto se achica y aparecen los sectores
  const aUnion = suave(tramo(p, 0.74, 0.9));     // los pines se conectan con la sede
  const sociosVistos = Math.round(props.socios * tramo(p, 0.5, 0.66));

  return (
    <section ref={ref} id="hero-section" className="relative" style={{ height: reducido ? undefined : "340vh" }} aria-label="Bienvenidos al CeCIP">
      <style>{CSS}</style>
      <div className={`${reducido ? "relative py-12" : "sticky top-0 h-[100svh]"} overflow-hidden bg-gradient-to-b from-[#eef7ff] via-white to-white`}>
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#d9e6ff]/40 blur-3xl" />
        {/* luz que crece en el último capítulo */}
        <div className="pointer-events-none absolute left-[70%] top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,163,224,.16), transparent 62%)", opacity: aUnion, transform: `translate(-50%,-50%) scale(${lerp(0.6, 1.1, aUnion)})` }} />

        <div className="relative z-10 mx-auto grid h-full max-w-[1440px] grid-rows-[auto_1fr] items-center gap-3 px-4 pt-[76px] sm:px-6 lg:grid-cols-12 lg:grid-rows-1 lg:gap-12 lg:px-8 lg:pt-16">
          {/* Textos por capítulo */}
          <div className="relative z-20 min-h-[19rem] sm:min-h-[20rem] lg:col-span-6 lg:min-h-[30rem]">
            {[0, 1, 2, 3].map((i) => {
              let d = p * n - i - 0.5;
              if (i === 0) d = Math.max(0, d);
              if (i === n - 1) d = Math.min(0, d);
              const visible = reducido ? (i === 0 ? 1 : 0) : clamp(1 - Math.abs(d) * 1.9);
              if (visible <= 0.001) return null;
              return (
                <div key={i} className="absolute inset-x-0 top-0 lg:top-1/2 lg:-translate-y-1/2" aria-hidden={i !== activo}
                  style={{ opacity: visible, pointerEvents: i === activo ? "auto" : "none" }}>
                  <div style={{ transform: `translateY(${d * -40}px)` }}>
                    <Capitulo i={i} p={p} anio={anio} sociosVistos={sociosVistos} {...props} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fachada + red de comercios */}
          <div className="relative flex h-full items-center justify-center lg:col-span-6">
            <div className="relative aspect-square w-full max-w-[min(520px,42svh)] lg:max-w-[min(560px,68svh)]">
              {/* año gigante detrás */}
              {/* mancha celeste */}
              <div className="absolute -left-[4%] -top-[4%] h-[62%] w-[62%] bg-[#bae6fd]/55"
                style={{ borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%", transform: `translate(${lerp(0, 18, aRed)}%, ${lerp(0, 16, aRed)}%) scale(${lerp(1, 1.25, aUnion)})` }} />

              {/* líneas de la red: de cada pin a la sede */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                {PINES.map(([x, y], k) => {
                  const largo = Math.hypot(x - 50, y - 50);
                  const t = tramo(aUnion, k * 0.06, 0.5 + k * 0.06);
                  return <line key={k} x1="50" y1="50" x2={x} y2={y} stroke="#00a3e0" strokeWidth=".45" strokeLinecap="round" strokeDasharray={largo} strokeDashoffset={largo * (1 - t)} opacity={0.8} />;
                })}
              </svg>

              {/* fachada histórica */}
              <div className="absolute left-1/2 top-1/2 z-10 h-[86%] w-[78%] overflow-hidden bg-slate-100 shadow-2xl"
                style={{
                  borderRadius: aRed > 0.5 ? "50%" : "50% 50% 45% 55% / 55% 45% 55% 45%",
                  transform: `translate(-50%, -50%) scale(${lerp(1, 0.5, aRed)})`,
                  transition: "border-radius .5s ease",
                  boxShadow: aUnion > 0 ? `0 0 0 ${lerp(0, 8, aUnion)}px rgba(0,163,224,.25), 0 25px 50px -12px rgba(0,0,0,.25)` : undefined,
                }}>
                <img src={props.info.imageUrl} alt="Fachada histórica del CeCIP" referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                  style={{ filter: `grayscale(1) contrast(1.1) brightness(.95)`, transform: `scale(${lerp(1.05, 1.18, tramo(p, 0, 0.5))})` }} />
                <div className="absolute inset-0 mix-blend-multiply" style={{ background: "linear-gradient(160deg, #7dd3fc, #00a3e0 55%, #0c2356)", opacity: aColor * 0.55 }} />
              </div>

              {/* año que corre desde la fundación */}
              <div className="hs-anio font-display pointer-events-none absolute -left-[6%] bottom-[2%] z-30 select-none tabular-nums"
                style={{ opacity: tramo(p, 0.12, 0.2) * (1 - tramo(p, 0.46, 0.54)), transform: `translateY(${(1 - tramo(p, 0.12, 0.2)) * 30}px) scale(${lerp(0.92, 1, tramo(p, 0.16, 0.44))})`, transformOrigin: "left bottom" }}>
                {anio}
              </div>

              {/* pastilla azul marino */}
              <div className="pointer-events-none absolute z-20 h-[38%] w-[28%] bg-[#0c2356]/85 mix-blend-multiply"
                style={{ right: "-1%", bottom: "-2%", borderRadius: "40% 60% 60% 40% / 50% 50% 50% 50%", transform: `translate(${lerp(0, 30, aRed)}%, ${lerp(0, 20, aRed)}%) scale(${lerp(1, 0.55, aRed)})`, opacity: 1 - aRed }} />

              {/* pines de comercios asociados */}
              {PINES.map(([x, y], k) => {
                const t = suave(tramo(p, 0.52 + k * 0.018, 0.58 + k * 0.018));
                return (
                  <div key={k} className="absolute z-20 -translate-x-1/2 -translate-y-full" style={{ left: `${x}%`, top: `${y}%`, opacity: t, transform: `translate(-50%, calc(-100% - ${(1 - t) * 40}px))` }}>
                    <div className={`grid h-7 w-7 place-items-center rounded-full shadow-md ${k % 3 === 0 ? "bg-[#0c2356] text-white" : "bg-white text-[#00a3e0]"}`} style={{ boxShadow: aUnion > 0.6 ? "0 0 0 4px rgba(0,163,224,.2)" : undefined }}>
                      <MapPin size={14} />
                    </div>
                  </div>
                );
              })}

              {/* sectores */}
              {SECTORES.map(({ icono: Icono, titulo, x, y }, k) => {
                const t = suave(tramo(p, 0.5 + k * 0.03, 0.58 + k * 0.03));
                return (
                  <div key={titulo} className="hs-tarjeta absolute z-30" style={{ left: `${x}%`, top: `${y}%`, opacity: t, transform: `translate(${(50 - x) * (1 - t) * 0.6}%, ${(50 - y) * (1 - t) * 0.6}%) scale(${lerp(0.6, 1, t)})` }}>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#00a3e0]/10 text-[#00a3e0]"><Icono size={17} /></span>
                    <span className="font-display text-sm font-bold text-[#0c2356]">{titulo}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {!reducido && (
          <>
            <div className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex lg:right-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`flex items-center gap-2 text-[11px] font-bold transition-colors ${i === activo ? "text-[#0c2356]" : "text-slate-300"}`}>
                  <span>0{i + 1}</span>
                  <span className={`h-1.5 rounded-full transition-all ${i === activo ? "w-5 bg-[#00a3e0]" : "w-1.5 bg-current"}`} />
                </div>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-100"><div className="h-full bg-[#00a3e0]" style={{ width: `${p * 100}%` }} /></div>
            {p < 0.03 && <div className="hs-baja absolute bottom-5 left-1/2 text-xs font-semibold text-slate-400">Deslizá para conocernos ↓</div>}
          </>
        )}
      </div>
    </section>
  );
}

function Capitulo({ i, p, anio, sociosVistos, info, entidades, onSumate, onObjetivos, onBeneficios }: Props & { i: number; p: number; anio: number; sociosVistos: number }) {
  const ceja = "mb-3 text-lg font-bold tracking-tight text-[#00a3e0] sm:text-2xl";
  const titulo = "font-display text-[1.75rem] font-bold leading-[1.12] text-[#1e293b] sm:text-4xl lg:text-[46px]";
  const texto = "mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base";
  const boton = "inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#00a3e0] px-7 py-3 text-sm font-semibold text-white shadow-md shadow-[#00a3e0]/20 transition-all hover:bg-[#0c2356]";

  if (i === 0)
    return (
      <>
        <p className={ceja}>{info.subtitle}</p>
        <h1 className={titulo}>{info.title}</h1>
        <p className={`${texto} line-clamp-4 sm:line-clamp-none`}>{info.description}</p>
        <div className="mt-7 flex items-center">
          <button type="button" onClick={onSumate} className={boton}>Súmate</button>
          <button type="button" onClick={onObjetivos} className="ml-6 cursor-pointer text-sm font-semibold text-[#0c2356] hover:text-[#00a3e0] hover:underline">Nuestros objetivos</button>
        </div>
      </>
    );

  if (i === 1)
    return (
      <>
        <p className={ceja}>Desde {FUNDACION}</p>
        <h2 className={titulo}>Más de {Math.floor((HOY - FUNDACION) / 5) * 5} años junto al comercio de Paraná.</h2>
        <ol className="mt-6 max-w-lg space-y-2.5">
          {HITOS.map((h, k) => {
            const t = tramo(p, 0.24 + k * 0.035, 0.29 + k * 0.035);
            const encendido = h.anio === "Hoy" ? anio >= HOY : anio >= Number(h.anio);
            return (
              <li key={h.anio} className="flex items-start gap-3" style={{ opacity: t, transform: `translateX(${(1 - t) * -16}px)` }}>
                <span className={`mt-0.5 w-12 shrink-0 font-display text-sm font-bold transition-colors ${encendido ? "text-[#00a3e0]" : "text-slate-300"}`}>{h.anio}</span>
                <span className="text-sm text-slate-600 sm:text-[15px]">{h.texto}</span>
              </li>
            );
          })}
        </ol>
      </>
    );

  if (i === 2)
    return (
      <>
        <p className={ceja}>Comercio · Industria · Servicios</p>
        <h2 className={titulo}>Una red de <span className="text-[#00a3e0]">{sociosVistos}</span> socios que mueve a la ciudad.</h2>
        <p className={texto}>
          Representamos y acompañamos a comercios, industrias y prestadores de servicios de Paraná y su zona: capacitación, asesoramiento,
          beneficios y gestión ante el Estado.
        </p>
      </>
    );

  return (
    <>
      <p className={ceja}>Sumate</p>
      <h2 className={titulo}>Juntos hacemos crecer Paraná.</h2>
      <p className={texto}>Formá parte de la institución que defiende al sector productivo de la ciudad desde hace más de un siglo.</p>
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button type="button" onClick={onSumate} className={boton}>Súmate <ArrowRight size={16} /></button>
        <button type="button" onClick={onBeneficios} className="cursor-pointer text-sm font-semibold text-[#0c2356] hover:text-[#00a3e0] hover:underline">Ver beneficios</button>
      </div>
      {entidades.length > 0 && (
        <div className="mt-7 hidden sm:block">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Integramos</div>
          <div className="flex flex-wrap gap-2">
            {entidades.map((e) => <span key={e} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-[#0c2356]">{e}</span>)}
          </div>
        </div>
      )}
    </>
  );
}

const CSS = `
.hs-anio { font-size: clamp(3.5rem, 11vw, 7.5rem); font-weight: 900; line-height: 1; letter-spacing: -.04em;
  color: #0c2356; -webkit-text-stroke: 6px #fff; paint-order: stroke fill; text-shadow: 0 18px 40px rgba(12,35,86,.25); }
.hs-tarjeta { display: flex; align-items: center; gap: .5rem; padding: .45rem .8rem .45rem .45rem; border-radius: .9rem;
  background: rgba(255,255,255,.92); border: 1px solid #e2e8f0; box-shadow: 0 12px 30px -12px rgba(12,35,86,.35); backdrop-filter: blur(6px); }
.hs-baja { transform: translateX(-50%); animation: hs-baja 1.6s ease-in-out infinite; }
@keyframes hs-baja { 0%, 100% { transform: translate(-50%, 0); opacity: .6; } 50% { transform: translate(-50%, 6px); opacity: 1; } }
`;

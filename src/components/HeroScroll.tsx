import { useRef } from "react";
import { ArrowRight, Coffee, Cpu, Factory, Hammer, Laptop, Pill, Shirt, Store, Truck, Wheat, Wrench } from "lucide-react";
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

// La red es una línea de tiempo: cada época es una "capa" de rubros (como en una red neuronal),
// conectada con todos los de la época siguiente. Coordenadas en unidades del recuadro 0..100.
const ORIGEN = { x: 10, y: 46 };
const EPOCAS = [
  { anio: "1920", titulo: "Comercio", x: 34, rubros: [
    { icono: Store, nombre: "Almacenes", y: 24 },
    { icono: Shirt, nombre: "Tiendas", y: 46 },
    { icono: Wrench, nombre: "Ferreterías", y: 68 },
  ] },
  { anio: "1970", titulo: "Industria", x: 61, rubros: [
    { icono: Factory, nombre: "Fábricas", y: 16 },
    { icono: Wheat, nombre: "Agro", y: 36 },
    { icono: Truck, nombre: "Logística", y: 56 },
    { icono: Hammer, nombre: "Construcción", y: 76 },
  ] },
  { anio: "Hoy", titulo: "Servicios", x: 88, rubros: [
    { icono: Coffee, nombre: "Gastronomía", y: 20 },
    { icono: Pill, nombre: "Salud", y: 38 },
    { icono: Laptop, nombre: "Tecnología", y: 56 },
    { icono: Cpu, nombre: "IA", y: 74 },
  ] },
];
const EJE_Y = 92;

// conexiones: del origen a la primera época y de cada rubro a todos los de la época siguiente
const curva = (x1: number, y1: number, x2: number, y2: number) => {
  const m = (x1 + x2) / 2;
  return `M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}`;
};
const CONEXIONES = EPOCAS.flatMap((e, i) => {
  const previos = i === 0 ? [{ x: ORIGEN.x, y: ORIGEN.y }] : EPOCAS[i - 1].rubros.map((r) => ({ x: EPOCAS[i - 1].x, y: r.y }));
  return previos.flatMap((a) => e.rubros.map((b) => ({ capa: i, d: curva(a.x, a.y, e.x, b.y) })));
});

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
  const capa = (i: number) => suave(tramo(p, 0.47 + i * 0.05, 0.55 + i * 0.05)); // las épocas aparecen de a una

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
              {/* mancha celeste */}
              <div className="absolute -left-[4%] -top-[4%] h-[62%] w-[62%] bg-[#bae6fd]/55"
                style={{ borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%", opacity: 1 - aRed, transform: `scale(${lerp(1, 0.7, aRed)})` }} />

              {/* red neuronal en el tiempo */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                <defs>
                  <linearGradient id="hs-tiempo" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#0c2356" />
                    <stop offset="1" stopColor="#00a3e0" />
                  </linearGradient>
                </defs>
                {/* eje de la línea de tiempo */}
                <line x1={ORIGEN.x} y1={EJE_Y} x2={EPOCAS[2].x} y2={EJE_Y} stroke="#cbd5e1" strokeWidth=".5" strokeLinecap="round" opacity={aRed} />
                <line x1={ORIGEN.x} y1={EJE_Y} x2={lerp(ORIGEN.x, EPOCAS[2].x, capa(2))} y2={EJE_Y} stroke="url(#hs-tiempo)" strokeWidth=".9" strokeLinecap="round" opacity={aRed} />
                {[ORIGEN.x, ...EPOCAS.map((e) => e.x)].map((x, i) => (
                  <line key={x} x1={x} y1={i === 0 ? ORIGEN.y + 9 : 82} x2={x} y2={EJE_Y} stroke="#00a3e0" strokeWidth=".3" strokeDasharray="1 1.2" opacity={(i === 0 ? aRed : capa(i - 1)) * 0.6} />
                ))}
                {CONEXIONES.map((c, k) => {
                  const t = tramo(capa(c.capa), 0, 1);
                  return <path key={k} d={c.d} fill="none" stroke="url(#hs-tiempo)" strokeWidth={lerp(0.25, 0.4, aUnion)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} opacity={lerp(0.35, 0.65, aUnion)} />;
                })}
                {/* impulsos que viajan a través del tiempo */}
                {aUnion > 0.2 && CONEXIONES.filter((_, k) => k % 2 === 0).map((c, k) => (
                  <circle key={k} r=".75" fill="#00a3e0" className="hs-chispa">
                    <animateMotion dur={`${1.6 + (k % 4) * 0.35}s`} begin={`${(k * 0.37) % 3}s`} repeatCount="indefinite" path={c.d} />
                  </circle>
                ))}
              </svg>

              {/* años del eje */}
              {[{ x: ORIGEN.x, anio: "1898", t: aRed }, ...EPOCAS.map((e, i) => ({ x: e.x, anio: e.anio, t: capa(i) }))].map(({ x, anio: a, t }) => (
                <div key={a} className="hs-hito absolute z-20" style={{ left: `${x}%`, top: `${EJE_Y}%`, opacity: t, transform: `translate(-50%, -50%) scale(${lerp(0.5, 1, t)})` }}>{a}</div>
              ))}

              {/* nombre de cada época */}
              {EPOCAS.map((e, i) => (
                <div key={e.titulo} className="hs-epoca absolute z-20" style={{ left: `${e.x}%`, top: "3%", opacity: capa(i), transform: `translate(-50%, ${(1 - capa(i)) * 12}px)` }}>{e.titulo}</div>
              ))}

              {/* rubros (neuronas) */}
              {EPOCAS.flatMap((e, i) => e.rubros.map(({ icono: Icono, nombre, y }, k) => {
                const t = suave(tramo(capa(i), k * 0.12, 0.55 + k * 0.12));
                return (
                  <div key={nombre} className="absolute z-20 flex flex-col items-center" style={{ left: `${e.x}%`, top: `${y}%`, opacity: t, transform: `translate(-50%, -50%) scale(${lerp(0.3, 1, t)})` }}>
                    <div className={`hs-neurona ${aUnion > 0.3 ? "hs-late" : ""} ${i === 2 ? "hs-neurona-hoy" : ""}`} style={{ animationDelay: `${i * 0.35 + k * 0.15}s` }}>
                      <Icono size={15} />
                    </div>
                    <span className="hs-rubro">{nombre}</span>
                  </div>
                );
              }))}

              {/* fachada histórica: al llegar la red se achica y queda como origen de la línea de tiempo */}
              <div className="absolute z-10 h-[86%] w-[78%] overflow-hidden bg-slate-100 shadow-2xl"
                style={{
                  left: `${lerp(50, ORIGEN.x, aRed)}%`, top: `${lerp(50, ORIGEN.y, aRed)}%`,
                  borderRadius: aRed > 0.5 ? "50%" : "50% 50% 45% 55% / 55% 45% 55% 45%",
                  transform: `translate(-50%, -50%) scale(${lerp(1, 0.22, aRed)})`,
                  transition: "border-radius .5s ease",
                  boxShadow: `0 0 0 ${lerp(0, 18, aRed)}px rgba(0,163,224,.18), 0 25px 50px -12px rgba(0,0,0,.25)`,
                }}>
                <img src={props.info.imageUrl} alt="Fachada histórica del CeCIP" referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                  style={{ filter: `grayscale(1) contrast(1.1) brightness(.95)`, transform: `scale(${lerp(1.05, 1.18, tramo(p, 0, 0.5))})` }} />
                <div className="absolute inset-0 mix-blend-multiply" style={{ background: "linear-gradient(160deg, #7dd3fc, #00a3e0 55%, #0c2356)", opacity: aColor * 0.55 }} />
              </div>
              <div className="hs-epoca absolute z-20" style={{ left: `${ORIGEN.x}%`, top: `${ORIGEN.y + 12}%`, opacity: tramo(aRed, 0.6, 1), transform: "translate(-50%, 0)" }}>CeCIP</div>

              {/* año que corre desde la fundación */}
              <div className="hs-anio font-display pointer-events-none absolute -left-[6%] bottom-[2%] z-30 select-none tabular-nums"
                style={{ opacity: tramo(p, 0.12, 0.2) * (1 - tramo(p, 0.46, 0.54)), transform: `translateY(${(1 - tramo(p, 0.12, 0.2)) * 30}px) scale(${lerp(0.92, 1, tramo(p, 0.16, 0.44))})`, transformOrigin: "left bottom" }}>
                {anio}
              </div>

              {/* pastilla azul marino */}
              <div className="pointer-events-none absolute z-20 h-[38%] w-[28%] bg-[#0c2356]/85 mix-blend-multiply"
                style={{ right: "-1%", bottom: "-2%", borderRadius: "40% 60% 60% 40% / 50% 50% 50% 50%", transform: `translate(${lerp(0, 30, aRed)}%, ${lerp(0, 20, aRed)}%) scale(${lerp(1, 0.55, aRed)})`, opacity: 1 - aRed }} />
            </div>
          </div>
        </div>

        {!reducido && (
          <>
            <div className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 xl:flex">
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
.hs-neurona { display: grid; place-items: center; width: 2.2rem; height: 2.2rem; border-radius: 999px; color: #0c2356;
  background: #fff; border: 1.5px solid #7dd3fc; box-shadow: 0 8px 20px -10px rgba(12,35,86,.5); }
.hs-neurona-hoy { background: #00a3e0; color: #fff; border-color: #00a3e0; }
.hs-late { animation: hs-late 2.2s ease-in-out infinite; }
@keyframes hs-late { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,163,224,0), 0 8px 20px -10px rgba(12,35,86,.5); }
  40% { box-shadow: 0 0 0 7px rgba(0,163,224,.18), 0 0 18px 2px rgba(0,163,224,.35); } }
.hs-rubro { margin-top: .2rem; font-size: 10px; font-weight: 600; color: #475569; white-space: nowrap; }
.hs-epoca { font-family: Outfit, sans-serif; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #0c2356; white-space: nowrap; }
.hs-hito { font-family: Outfit, sans-serif; font-size: 11px; font-weight: 800; color: #fff; background: #0c2356; padding: .15rem .5rem; border-radius: 999px; white-space: nowrap; }
.hs-chispa { filter: drop-shadow(0 0 1.2px #00a3e0); }
@media (max-width: 640px) { .hs-neurona { width: 1.7rem; height: 1.7rem; } .hs-neurona svg { width: 12px; height: 12px; }
  .hs-rubro { display: none; } .hs-epoca { font-size: 10px; } .hs-hito { font-size: 9.5px; } }
.hs-baja { transform: translateX(-50%); animation: hs-baja 1.6s ease-in-out infinite; }
@keyframes hs-baja { 0%, 100% { transform: translate(-50%, 0); opacity: .6; } 50% { transform: translate(-50%, 6px); opacity: 1; } }
`;

import { ArrowRight, Briefcase, FileText, Sparkles, Upload } from "lucide-react";

/**
 * Banner comercial de la Bolsa de Empleo (va arriba de Beneficios en la home).
 * Lleva directo al formulario para subir el CV.
 */
export default function BannerBolsaEmpleo({ onSubirCv, empresas }: { onSubirCv: () => void; empresas: number }) {
  return (
    <section id="bolsa-banner" className="px-3 pt-16 sm:px-6 lg:px-8" aria-label="Bolsa de Empleo del CeCIP">
      <style>{CSS}</style>
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#071738] via-[#0c2356] to-[#0a4a8a] px-6 py-10 text-white shadow-[0_30px_80px_-30px_rgba(12,35,86,.7)] sm:px-12 sm:py-14">
        {/* luces de fondo */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#00a3e0]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">
              <Briefcase size={13} /> Bolsa de Empleo CeCIP
            </span>
            <h2 className="font-display mt-4 text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              ¿Buscás trabajo en Paraná?
              <span className="bb-brillo mt-1 block bg-gradient-to-r from-[#7dd3fc] via-white to-[#7dd3fc] bg-clip-text text-transparent">Tu CV, en las empresas que contratan.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Subí tu currículum gratis. Las más de {Math.floor(empresas / 10) * 10} empresas socias del CeCIP —comercios, industrias y servicios de la ciudad— buscan talento en la Bolsa de Empleo.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button type="button" onClick={onSubirCv}
                className="bb-cta group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#00a3e0] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(0,163,224,.9)] transition hover:-translate-y-0.5 hover:bg-[#0393c9]">
                <Upload size={17} /> Subí tu CV ahora <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </button>
              <span className="text-xs text-slate-400">Gratis · PDF o Word · 2 minutos</span>
            </div>
          </div>

          {/* tarjetas de CV que flotan */}
          <div className="relative mx-auto h-64 w-full max-w-md sm:h-72" aria-hidden>
            <div className="bb-tarjeta bb-t1 left-[4%] top-[18%] -rotate-6">
              <Perfil inicial="M" nombre="María, 27" puesto="Ventas y atención al cliente" color="from-fuchsia-400 to-pink-500" />
            </div>
            <div className="bb-tarjeta bb-t2 right-[2%] top-[2%] rotate-3">
              <Perfil inicial="J" nombre="Julián, 31" puesto="Técnico en sistemas" color="from-sky-400 to-blue-600" />
            </div>
            <div className="bb-tarjeta bb-t3 bottom-[2%] left-[22%] rotate-2">
              <Perfil inicial="R" nombre="Rocío, 35" puesto="Administración contable" color="from-amber-300 to-orange-500" />
            </div>
            <div className="bb-match absolute left-[6%] top-[2%] flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-bold text-emerald-950 shadow-lg">
              <Sparkles size={13} /> ¡Una empresa vio tu CV!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Perfil({ inicial, nombre, puesto, color }: { inicial: string; nombre: string; puesto: string; color: string }) {
  return (
    <div className="flex w-56 items-center gap-3 rounded-2xl border border-white/15 bg-white/95 p-3 text-slate-800 shadow-2xl">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${color} font-display text-lg font-bold text-white`}>{inicial}</span>
      <div className="min-w-0">
        <div className="text-sm font-bold text-[#0c2356]">{nombre}</div>
        <div className="truncate text-[11px] text-slate-500">{puesto}</div>
        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#00a3e0]"><FileText size={11} /> CV.pdf</div>
      </div>
    </div>
  );
}

const CSS = `
.bb-tarjeta { position: absolute; animation: bb-flota 6s ease-in-out infinite; }
.bb-t2 { animation-delay: -2s; }
.bb-t3 { animation-delay: -4s; }
@keyframes bb-flota { 0%, 100% { translate: 0 0; } 50% { translate: 0 -12px; } }
.bb-match { animation: bb-pop 4s ease-in-out infinite; }
@keyframes bb-pop { 0%, 55%, 100% { transform: scale(1); } 62% { transform: scale(1.12); } 70% { transform: scale(1); } }
.bb-brillo { background-size: 200% auto; animation: bb-brillo 5s linear infinite; }
@keyframes bb-brillo { to { background-position: -200% center; } }
.bb-cta { animation: bb-pulso 2.4s ease-out infinite; }
@keyframes bb-pulso { 0% { box-shadow: 0 0 0 0 rgba(0,163,224,.55), 0 12px 30px -10px rgba(0,163,224,.9); } 100% { box-shadow: 0 0 0 16px rgba(0,163,224,0), 0 12px 30px -10px rgba(0,163,224,.9); } }
@media (prefers-reduced-motion: reduce) { .bb-tarjeta, .bb-match, .bb-brillo, .bb-cta { animation: none; } }
@media (max-width: 640px) { .bb-tarjeta > div { width: 12.5rem; } }
`;

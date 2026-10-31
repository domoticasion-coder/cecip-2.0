import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";

/** Lanzamiento de ComercIA: 1° de diciembre de 2026, 00:00 hora de Argentina */
export const LANZAMIENTO_COMERCIA = new Date("2026-12-01T00:00:00-03:00");

function restante() {
  const ms = Math.max(0, LANZAMIENTO_COMERCIA.getTime() - Date.now());
  return { ms, dias: Math.floor(ms / 86400000), horas: Math.floor(ms / 3600000) % 24, min: Math.floor(ms / 60000) % 60, seg: Math.floor(ms / 1000) % 60 };
}

/** Cuenta regresiva grande, con los números que cambian cada segundo */
export function CuentaRegresiva({ compacta = false }: { compacta?: boolean }) {
  const [r, setR] = useState(restante);
  useEffect(() => {
    const t = setInterval(() => setR(restante()), 1000);
    return () => clearInterval(t);
  }, []);

  if (r.ms === 0) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white">
        <Rocket size={16} /> ¡ComercIA ya está en marcha!
      </span>
    );
  }

  if (compacta) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-300/40 bg-amber-400/15 px-3 py-1.5 text-[11px] font-bold text-amber-100 tabular-nums">
        <Rocket size={12} className="shrink-0 text-amber-300" /> Lanza el 1/12 · {r.dias}d {String(r.horas).padStart(2, "0")}h {String(r.min).padStart(2, "0")}m
      </span>
    );
  }

  const piezas = [[r.dias, "días"], [r.horas, "horas"], [r.min, "min"], [r.seg, "seg"]] as const;
  return (
    <div className="flex items-stretch gap-2 sm:gap-3">
      {piezas.map(([n, label]) => (
        <div key={label} className="flex w-[4.2rem] flex-col items-center rounded-2xl border border-white/15 bg-white/[.07] px-2 py-2.5 backdrop-blur sm:w-20">
          <span key={n} className="cr-num font-display text-3xl font-bold tabular-nums leading-none sm:text-4xl">{String(n).padStart(2, "0")}</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        </div>
      ))}
      <style>{`.cr-num { animation: cr-cae .35s cubic-bezier(.2,.9,.3,1.3); } @keyframes cr-cae { from { opacity: .2; transform: translateY(-6px); } }
        @media (prefers-reduced-motion: reduce) { .cr-num { animation: none; } }`}</style>
    </div>
  );
}

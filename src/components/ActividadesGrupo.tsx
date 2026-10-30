import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import type { GrupoErp } from "../lib/erp";

/**
 * Eventos, actividades y capacitaciones de Mujeres Empresarias o Jóvenes Empresarios
 * (se cargan en el ERP → Comunicación → Mujeres y Jóvenes).
 */
const TIPOS: Record<GrupoErp["tipo"], { label: string; clase: string }> = {
  evento: { label: "Evento", clase: "bg-sky-100 text-sky-800" },
  actividad: { label: "Actividad", clase: "bg-emerald-100 text-emerald-800" },
  capacitacion: { label: "Capacitación", clase: "bg-violet-100 text-violet-800" },
  novedad: { label: "Novedad", clase: "bg-amber-100 text-amber-800" },
};
const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

export default function ActividadesGrupo({ items, grupo }: { items: GrupoErp[]; grupo: "mujeres" | "jovenes" }) {
  const acento = grupo === "mujeres" ? "from-fuchsia-500 to-pink-500" : "from-[#00a3e0] to-[#0c2356]";
  const ahora = Date.now();
  const proximas = items.filter((p) => p.fecha && new Date(p.fecha_fin || p.fecha).getTime() >= ahora);
  const pasadas = items.filter((p) => !proximas.includes(p));

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
        Pronto vamos a publicar acá los próximos eventos, actividades y capacitaciones.
      </div>
    );
  }

  const Tarjeta = ({ p }: { p: GrupoErp }) => {
    const d = p.fecha ? new Date(p.fecha) : null;
    return (
      <article className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
        <div className={`flex w-20 shrink-0 flex-col items-center justify-center bg-gradient-to-b ${acento} text-white`}>
          {d ? <><span className="font-display text-2xl font-bold leading-none">{d.getDate()}</span><span className="text-[11px] font-bold tracking-wider">{MESES[d.getMonth()]}</span></> : <CalendarDays size={22} />}
        </div>
        <div className="min-w-0 flex-1 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TIPOS[p.tipo].clase}`}>{TIPOS[p.tipo].label}</span>
            {d && <span className="text-xs text-slate-500">{d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })} · {d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })} h</span>}
          </div>
          <h4 className="mt-1.5 font-bold text-slate-900">{p.titulo}</h4>
          {p.descripcion && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{p.descripcion}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
            {p.lugar && <span className="flex items-center gap-1 text-slate-500"><MapPin size={13} />{p.lugar}</span>}
            {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-bold text-[#00a3e0] hover:underline">Más información <ExternalLink size={12} /></a>}
          </div>
        </div>
        {p.imagen_url && <img src={p.imagen_url} alt="" className="hidden w-36 shrink-0 object-cover sm:block" />}
      </article>
    );
  };

  return (
    <div className="space-y-8">
      {proximas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Próximos eventos, actividades y capacitaciones</h3>
          {proximas.map((p) => <Tarjeta key={p.id} p={p} />)}
        </div>
      )}
      {pasadas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{proximas.length ? "Lo que hicimos" : "Actividades y novedades"}</h3>
          {pasadas.slice(0, 12).map((p) => <Tarjeta key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}

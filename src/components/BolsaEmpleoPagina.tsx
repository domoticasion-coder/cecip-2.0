import { useEffect } from "react";
import { Building2, CheckCircle2, FileText, Search, Upload, Users } from "lucide-react";
import ResumePortal from "./ResumePortal";

/**
 * Página de la Bolsa de Empleo: explica cómo funciona y tiene el formulario para subir el CV.
 * Los CV llegan al ERP del CeCIP (Bolsa de empleo) y, una vez revisados, los ven las empresas socias.
 */
export default function BolsaEmpleoPagina({ empresas, onAsociarse }: { empresas: number; onAsociarse?: () => void }) {
  // Si se llegó desde el banner "Subí tu CV", se baja directo al formulario
  useEffect(() => {
    let ir = false;
    try { ir = sessionStorage.getItem("cecip-ir-a-cv") === "1"; sessionStorage.removeItem("cecip-ir-a-cv"); } catch { /* sin storage */ }
    if (!ir) return;
    const t = setTimeout(() => document.getElementById("cargar-cv")?.scrollIntoView({ block: "start" }), 700);
    return () => clearTimeout(t);
  }, []);
  const pasos = [
    { icono: Upload, titulo: "Subí tu CV", texto: "Completá tus datos y adjuntá tu currículum en PDF o Word. Es gratis." },
    { icono: Search, titulo: "Lo revisa el CeCIP", texto: "El equipo del Centro Comercial verifica tu postulación." },
    { icono: Building2, titulo: "Te ven las empresas", texto: `Las empresas socias lo ven en su Portal y te contactan si buscan tu perfil.` },
  ];
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071738] via-[#0c2356] to-[#0a4a8a] px-3 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#00a3e0]/25 blur-3xl" />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">
            <FileText size={13} /> Bolsa de Empleo CeCIP
          </span>
          <h1 className="font-display mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Tu próximo trabajo puede estar en Paraná</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
            Cargá tu currículum en la Bolsa de Empleo del Centro Comercial e Industrial de Paraná y llegá a más de {Math.floor(empresas / 10) * 10} comercios, industrias y empresas de servicios de la ciudad.
          </p>
          <a href="#cargar-cv" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#00a3e0] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0393c9]">
            <Upload size={17} /> Cargar mi CV
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-3 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {pasos.map(({ icono: Icono, titulo, texto }, i) => (
            <div key={titulo} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="absolute right-5 top-4 font-display text-4xl font-bold text-slate-100">{i + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#00a3e0]/10 text-[#00a3e0]"><Icono size={20} /></span>
              <h3 className="mt-4 font-bold text-slate-900">{titulo}</h3>
              <p className="mt-1 text-sm text-slate-600">{texto}</p>
            </div>
          ))}
        </div>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
          {["Sin costo para postulantes", "Tus datos solo los ven el CeCIP y sus empresas socias", "Podés volver a enviarlo cuando lo actualices"].map((t) => (
            <li key={t} className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" />{t}</li>
          ))}
        </ul>
      </section>

      <section id="cargar-cv" className="scroll-mt-28 bg-slate-50 px-3 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ResumePortal />
        </div>
      </section>

      {onAsociarse && (
        <section className="mx-auto max-w-5xl px-3 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-gradient-to-r from-[#071738] to-[#152e6b] p-8 text-white sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10"><Users size={22} /></span>
              <div>
                <h3 className="text-lg font-bold">¿Tenés una empresa y buscás personal?</h3>
                <p className="text-sm text-slate-300">Los socios del CeCIP acceden a los CV de la Bolsa de Empleo desde su Portal.</p>
              </div>
            </div>
            <button type="button" onClick={onAsociarse} className="shrink-0 cursor-pointer rounded-xl bg-[#00a3e0] px-5 py-3 text-sm font-bold transition hover:bg-[#0393c9]">Asociate al CeCIP</button>
          </div>
        </section>
      )}
    </div>
  );
}

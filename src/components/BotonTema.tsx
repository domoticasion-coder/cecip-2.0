import { useState } from "react";
import { Moon, Sun } from "lucide-react";

/** Cambia la web entre modo claro y oscuro (se recuerda en el navegador; ver tema-oscuro.css) */
export default function BotonTema({ className = "" }: { className?: string }) {
  const [oscuro, setOscuro] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

  function cambiar() {
    const nuevo = !oscuro;
    const raiz = document.documentElement;
    raiz.classList.add("cambiando-tema");
    raiz.classList.toggle("dark", nuevo);
    setTimeout(() => raiz.classList.remove("cambiando-tema"), 400);
    try { localStorage.setItem("cecip-tema", nuevo ? "oscuro" : "claro"); } catch { /* sin almacenamiento: dura hasta recargar */ }
    setOscuro(nuevo);
  }

  return (
    <button type="button" onClick={cambiar} aria-pressed={oscuro} title={oscuro ? "Pasar a modo claro" : "Pasar a modo oscuro"}
      className={`grid h-7 w-7 cursor-pointer place-items-center rounded-lg border border-slate-200/90 bg-slate-50/90 text-slate-600 transition-all hover:border-[#0c2356] hover:bg-[#0c2356] hover:text-white ${className}`}>
      {oscuro ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

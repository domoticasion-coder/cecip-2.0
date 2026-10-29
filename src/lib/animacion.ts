import { useEffect, useState } from "react";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Avance 0→1 de un tramo [desde, hasta] del progreso total */
export const tramo = (p: number, desde: number, hasta: number) => clamp((p - desde) / (hasta - desde));
export const suave = (t: number) => t * t * (3 - 2 * t);

export function movimientoReducido() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Avance 0→1 del scroll a lo largo de una sección alta con contenido "sticky" */
export function useAvance(ref: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const medir = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const recorrido = r.height - window.innerHeight;
      setP(recorrido > 0 ? clamp(-r.top / recorrido) : 0);
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(medir); };
    medir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", pedir); window.removeEventListener("resize", pedir); };
  }, [ref]);
  return p;
}

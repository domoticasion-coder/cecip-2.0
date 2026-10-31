import { useEffect, useRef, useState } from "react";

/**
 * Voz y música de fondo para las secciones tipo "video" de la web (ComercIA, Portal de Socios).
 * El sonido viene activado: arranca apenas la sección se ve. Los navegadores no dejan reproducir
 * audio hasta que la persona interactúa con la página, así que si lo bloquean queda "en espera"
 * y empieza solo con el primer clic, toque o tecla en cualquier lugar de la página.
 */

const GESTOS = ["pointerdown", "keydown", "touchstart"] as const;
const esperando = new Set<() => void>();
let escuchando = false;

/** Corre la función con el primer gesto de la persona en la página */
function alPrimerGesto(fn: () => void) {
  esperando.add(fn);
  if (escuchando) return;
  escuchando = true;
  const disparar = () => {
    GESTOS.forEach((g) => window.removeEventListener(g, disparar, true));
    escuchando = false;
    const lista = [...esperando];
    esperando.clear();
    lista.forEach((f) => f());
  };
  GESTOS.forEach((g) => window.addEventListener(g, disparar, { capture: true, passive: true }));
}

export function useNarracion({ clip, musica, alta = 0.3, baja = 0.09, posicion }: {
  clip: (k: number) => string; musica: string; alta?: number; baja?: number;
  /** segundo desde el que retomar la voz si el navegador la había bloqueado (narración continua) */
  posicion?: () => number;
}) {
  const [voz, setVoz] = useState(true);
  const vozRef = useRef(true);
  const [bloqueado, setBloqueado] = useState(false);
  const audios = useRef<HTMLAudioElement[]>([]);
  const sonando = useRef<boolean[]>([]);
  const fondo = useRef<HTMLAudioElement | null>(null);
  const fundido = useRef(0);
  const activo = useRef(false);   // la sección se ve y no está en pausa
  const ultimo = useRef(0);       // último capítulo que habló

  const volumen = (destino: number) => {
    const m = fondo.current;
    if (!m) return;
    clearInterval(fundido.current);
    fundido.current = window.setInterval(() => {
      const d = destino - m.volume;
      if (Math.abs(d) < 0.02) { m.volume = destino; clearInterval(fundido.current); }
      else m.volume = Math.min(1, Math.max(0, m.volume + Math.sign(d) * 0.02));
    }, 40);
  };

  // si el navegador bloqueó el audio, se reintenta con el primer gesto de la persona
  const bloquear = () => {
    setBloqueado(true);
    alPrimerGesto(() => {
      setBloqueado(false);
      if (vozRef.current && activo.current) { sonarMusica(); hablar(ultimo.current, posicion?.() ?? 0); }
    });
  };

  const sonarMusica = () => {
    if (!vozRef.current) return;
    if (!fondo.current) {
      fondo.current = new Audio(musica);
      fondo.current.loop = true;
      fondo.current.volume = 0;
    }
    fondo.current.play().then(
      () => volumen(sonando.current.some(Boolean) ? baja : alta),
      (e: DOMException) => { if (e?.name === "NotAllowedError") bloquear(); },
    );
  };
  const callar = () => audios.current.forEach((a, k) => { a.pause(); sonando.current[k] = false; });
  const apagar = () => { callar(); clearInterval(fundido.current); fondo.current?.pause(); };
  const hablar = (k: number, desde = 0) => {
    ultimo.current = k;
    if (!vozRef.current) return;
    callar();
    volumen(baja);
    if (!audios.current[k]) {
      const a = new Audio(clip(k));
      a.preload = "auto";
      const fin = () => { sonando.current[k] = false; volumen(alta); };
      a.addEventListener("ended", fin);
      a.addEventListener("error", fin);
      audios.current[k] = a;
    }
    const a = audios.current[k];
    a.currentTime = desde;
    sonando.current[k] = true;
    a.play().catch((e: DOMException) => {
      sonando.current[k] = false;
      if (e?.name === "NotAllowedError") bloquear();
    });
  };

  /** Avisa si la sección está a la vista y reproduciéndose (para arrancar o cortar el sonido) */
  const setActivo = (v: boolean) => { activo.current = v; if (v) sonarMusica(); else apagar(); };

  const alternar = (k: number, desde = 0) => {
    const nueva = !vozRef.current;
    vozRef.current = nueva;
    setVoz(nueva);
    if (!nueva) return apagar();
    setBloqueado(false);
    sonarMusica();
    hablar(k, desde);
  };

  useEffect(() => () => apagar(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return { voz, vozRef, bloqueado, sonando, hablar, apagar, setActivo, alternar, audioDe: (k: number) => audios.current[k] as HTMLAudioElement | undefined };
}

import { useEffect, useRef, useState } from "react";

/**
 * Voz y música de fondo para las secciones tipo "video" de la web (ComercIA, Portal de Socios).
 * El sonido viene activado: arranca apenas la sección se ve. Los navegadores no dejan reproducir
 * audio hasta que la persona interactúa con la página (es una regla del navegador, no de la web), así que
 * si lo bloquean se reintenta con cualquier movimiento: scroll, mouse, toque, clic o tecla. Donde el
 * navegador lo permite (por ejemplo Chrome con quien ya visitó la web) suena solo; si no, con el primer clic.
 */

// clic, toque y tecla habilitan el audio; scroll y mouse no siempre, pero se reintenta igual
const GESTOS = ["pointerdown", "pointerup", "click", "keydown", "touchstart", "touchend", "wheel", "scroll", "mousemove"] as const;
const esperando = new Set<() => void>();
let escuchando = false;
let ultimoIntento = 0;

/** Corre la función con la próxima interacción de la persona en la página (si vuelve a fallar, se reintenta después) */
function alPrimerGesto(fn: () => void) {
  esperando.add(fn);
  if (escuchando) return;
  escuchando = true;
  const disparar = (e: Event) => {
    // los botones de sonido de los videos se manejan solos (si no, el mismo clic activaría y apagaría el sonido)
    if ((e.target as Element | null)?.closest?.("[data-sonido]")) return;
    // los eventos que se repiten mucho (scroll, mouse) reintentan como máximo cada 0,8 s
    const continuo = e.type === "scroll" || e.type === "mousemove" || e.type === "wheel";
    if (continuo && performance.now() - ultimoIntento < 800) return;
    ultimoIntento = performance.now();
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
  const [bloqueado, setBloqueadoEstado] = useState(false);
  const bloqueadoRef = useRef(false);
  const setBloqueado = (v: boolean) => { bloqueadoRef.current = v; setBloqueadoEstado(v); };
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
    if (!vozRef.current || document.hidden) return;
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
    if (!vozRef.current || document.hidden) return;
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
    // si el navegador había bloqueado el sonido, el botón lo activa (no lo apaga)
    if (vozRef.current && bloqueadoRef.current) {
      setBloqueado(false);
      sonarMusica();
      hablar(k, desde);
      return;
    }
    const nueva = !vozRef.current;
    vozRef.current = nueva;
    setVoz(nueva);
    if (!nueva) return apagar();
    setBloqueado(false);
    sonarMusica();
    hablar(k, desde);
  };

  // si se cambia de pestaña, se minimiza la ventana o se sale de la página, se corta todo el sonido;
  // al volver (y si la sección sigue a la vista) retoma donde estaba
  useEffect(() => {
    const cambio = () => {
      if (document.hidden) apagar();
      else if (vozRef.current && activo.current) { sonarMusica(); hablar(ultimo.current, posicion?.() ?? 0); }
    };
    const salir = () => apagar();
    document.addEventListener("visibilitychange", cambio);
    window.addEventListener("pagehide", salir);
    return () => { document.removeEventListener("visibilitychange", cambio); window.removeEventListener("pagehide", salir); apagar(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { voz, vozRef, bloqueado, sonando, hablar, apagar, setActivo, alternar, audioDe: (k: number) => audios.current[k] as HTMLAudioElement | undefined };
}

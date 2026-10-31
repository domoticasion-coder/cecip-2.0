import { useEffect, useState } from "react";

/**
 * Animación de inicio de la web: los íconos del comercio (bolsa, local, carrito, etiqueta)
 * orbitan y se juntan en el logo CeCIP; después la cortina se abre hacia arriba.
 * Se muestra una vez por sesión del navegador; se saltea con un click o con cualquier tecla.
 */

const DURACION = 2600;
const CLAVE = "cecip-intro-vista";

const ICONOS = [
  // bolsa de compras
  "M6 8h12l-1 12H7L6 8zm3 0V6a3 3 0 0 1 6 0v2",
  // local con toldo
  "M3 9l2-5h14l2 5M4 9v11h16V9M3 9h18M9 20v-6h6v6",
  // carrito
  "M3 4h2l2.5 11h10L20 7H7M9 20a1 1 0 1 0 0-.01M17 20a1 1 0 1 0 0-.01",
  // etiqueta de precio
  "M3 12V4h8l10 10-8 8L3 12zm4-4h.01",
  // gráfico de ventas
  "M4 20V10M10 20V4M16 20v-7M22 20H2",
  // chispa de IA
  "M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z",
];

function yaVista() {
  try { return sessionStorage.getItem(CLAVE) === "1"; } catch { return false; }
}

export default function IntroWeb() {
  const [estado, setEstado] = useState<"oculta" | "activa" | "saliendo">(() => {
    if (typeof window === "undefined" || yaVista()) return "oculta";
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "oculta";
    return "activa";
  });

  useEffect(() => {
    if (estado !== "activa") return;
    try { sessionStorage.setItem(CLAVE, "1"); } catch { /* sin almacenamiento: se muestra igual */ }
    document.documentElement.style.overflow = "hidden";
    const salir = () => setEstado((e) => (e === "activa" ? "saliendo" : e));
    const t = setTimeout(salir, DURACION);
    window.addEventListener("keydown", salir);
    return () => { clearTimeout(t); window.removeEventListener("keydown", salir); };
  }, [estado]);

  useEffect(() => {
    if (estado !== "saliendo") return;
    document.documentElement.style.overflow = "";
    const t = setTimeout(() => setEstado("oculta"), 900);
    return () => clearTimeout(t);
  }, [estado]);

  if (estado === "oculta") return null;

  return (
    <div className={`iw-raiz ${estado === "saliendo" ? "iw-sale" : ""}`} onClick={() => setEstado("saliendo")} role="presentation">
      <style>{CSS}</style>
      <div className="iw-grilla" />
      <div className="iw-centro">
        <div className="iw-orbita">
          {ICONOS.map((d, i) => (
            <span key={i} className="iw-icono" style={{ ["--a" as string]: `${i * 60}deg`, ["--d" as string]: `${i * 70}ms` }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
            </span>
          ))}
        </div>
        <div className="iw-anillo" />
        <div className="iw-logo">
          <div className="iw-letras font-display">
            <span style={{ color: "#00a3e0", ["--d" as string]: "1150ms" }}>Ce</span>
            <span style={{ color: "#ffffff", ["--d" as string]: "1250ms" }}>CI</span>
            <span style={{ color: "#00a3e0", ["--d" as string]: "1350ms" }}>P</span>
          </div>
          <div className="iw-linea" />
          <div className="iw-sub">Centro Comercial e Industrial de Paraná</div>
        </div>
      </div>
      <div className="iw-saltar">Tocá para entrar</div>
    </div>
  );
}

const CSS = `
.iw-raiz { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; overflow: hidden; cursor: pointer;
  background: radial-gradient(ellipse at 50% 45%, #123170 0%, #0c2356 45%, #071738 100%);
  transition: transform .85s cubic-bezier(.76,0,.24,1), opacity .85s ease; }
.iw-sale { transform: translateY(-100%); opacity: .6; }
.iw-grilla { position: absolute; inset: -50%; opacity: .12;
  background-image: linear-gradient(rgba(125,211,252,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,.5) 1px, transparent 1px);
  background-size: 48px 48px; transform: perspective(600px) rotateX(60deg) translateY(-10%); animation: iw-grilla 3s linear infinite; }
@keyframes iw-grilla { to { background-position: 0 48px; } }
.iw-centro { position: relative; width: 320px; height: 320px; display: grid; place-items: center; }
.iw-orbita { position: absolute; inset: 0; animation: iw-gira 2.4s cubic-bezier(.5,0,.2,1) forwards; }
@keyframes iw-gira { from { transform: rotate(-120deg); } to { transform: rotate(0deg); } }
.iw-icono { position: absolute; left: 50%; top: 50%; width: 52px; height: 52px; margin: -26px; display: grid; place-items: center;
  border-radius: 16px; color: #7dd3fc; background: rgba(255,255,255,.06); border: 1px solid rgba(125,211,252,.25); backdrop-filter: blur(4px);
  opacity: 0; animation: iw-icono 2.2s cubic-bezier(.5,0,.2,1) var(--d) forwards; }
@keyframes iw-icono {
  0% { opacity: 0; transform: rotate(var(--a)) translateY(-260px) rotate(calc(-1 * var(--a))) scale(.4); }
  30% { opacity: 1; transform: rotate(var(--a)) translateY(-140px) rotate(calc(-1 * var(--a))) scale(1); }
  62% { opacity: 1; transform: rotate(var(--a)) translateY(-130px) rotate(calc(-1 * var(--a))) scale(1); }
  100% { opacity: 0; transform: rotate(var(--a)) translateY(0) rotate(calc(-1 * var(--a))) scale(.2); } }
.iw-anillo { position: absolute; width: 180px; height: 180px; border-radius: 50%; border: 2px solid #00a3e0; opacity: 0;
  animation: iw-anillo 1.1s ease-out 1.25s forwards; }
@keyframes iw-anillo { 0% { opacity: .9; transform: scale(.4); } 100% { opacity: 0; transform: scale(2.4); } }
.iw-logo { position: relative; text-align: center; }
.iw-letras { display: flex; justify-content: center; font-size: 76px; font-weight: 900; letter-spacing: -.02em; line-height: 1; }
.iw-letras span { display: inline-block; opacity: 0; transform: translateY(24px) scale(.8); filter: blur(8px);
  animation: iw-letra .6s cubic-bezier(.2,.8,.2,1.2) var(--d) forwards; }
@keyframes iw-letra { to { opacity: 1; transform: none; filter: none; } }
.iw-linea { height: 3px; width: 0; margin: 12px auto 10px; border-radius: 3px; background: linear-gradient(90deg, transparent, #00a3e0, transparent);
  animation: iw-linea .7s ease-out 1.5s forwards; }
@keyframes iw-linea { to { width: 240px; } }
.iw-sub { color: #bae6fd; font-size: 13px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; opacity: 0;
  animation: iw-sub .6s ease-out 1.7s forwards; }
@keyframes iw-sub { from { opacity: 0; transform: translateY(6px); } to { opacity: .9; transform: none; } }
.iw-saltar { position: absolute; bottom: 28px; left: 0; right: 0; text-align: center; color: rgba(255,255,255,.4); font-size: 12px; }
@media (max-width: 480px) { .iw-letras { font-size: 60px; } .iw-sub { font-size: 10px; padding: 0 16px; } .iw-centro { width: 280px; height: 280px; } }
`;

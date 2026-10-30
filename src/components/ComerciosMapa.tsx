import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { ErpSocio } from "../types";
import { UBICACIONES_SOCIOS } from "../data/sociosUbicaciones";

/**
 * Mapa de Paraná con cada socio en la ubicación de su dirección (coordenadas en sociosUbicaciones.ts).
 * Muestra solo los socios que recibe (ya filtrados por el buscador) y, al tocar un pin, su ficha resumida
 * con un botón para abrir la ficha completa.
 */

const CENTRO_PARANA: L.LatLngTuple = [-31.7413, -60.5115];

const escapar = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function icono(aprox: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="cm-pin${aprox ? " cm-pin-aprox" : ""}"><span></span></div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -30],
  });
}

interface Props {
  socios: ErpSocio[];
  onVerFicha: (socio: ErpSocio) => void;
  /** socio a destacar (abre su globo y centra el mapa) */
  enfocado?: ErpSocio | null;
}

export default function ComerciosMapa({ socios, onVerFicha, enfocado }: Props) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const grupo = useRef<L.MarkerClusterGroup | null>(null);
  const marcadores = useRef(new Map<string, L.Marker>());
  const verFicha = useRef(onVerFicha);
  verFicha.current = onVerFicha;
  const porId = useRef(new Map<string, ErpSocio>());

  // Crear el mapa una sola vez
  useEffect(() => {
    if (!caja.current || mapa.current) return;
    const m = L.map(caja.current, { center: CENTRO_PARANA, zoom: 14, scrollWheelZoom: false, zoomControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(m);
    // la rueda del mouse hace zoom solo después de hacer clic en el mapa (para no trabar el scroll de la página)
    m.on("click", () => m.scrollWheelZoom.enable());
    m.on("mouseout", () => m.scrollWheelZoom.disable());
    // botón "Ver ficha" dentro del globo
    m.on("popupopen", (e) => {
      const boton = e.popup.getElement()?.querySelector<HTMLButtonElement>("[data-ficha]");
      if (boton) boton.onclick = () => { const s = porId.current.get(boton.dataset.ficha!); if (s) verFicha.current(s); };
    });
    const g = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 42, spiderfyOnMaxZoom: true });
    m.addLayer(g);
    mapa.current = m;
    grupo.current = g;
    return () => { m.remove(); mapa.current = null; grupo.current = null; };
  }, []);

  // Pines de los socios filtrados
  useEffect(() => {
    const m = mapa.current, g = grupo.current;
    if (!m || !g) return;
    g.clearLayers();
    marcadores.current.clear();
    porId.current.clear();
    const puntos: L.LatLngTuple[] = [];
    socios.forEach((s) => {
      const u = UBICACIONES_SOCIOS[s.id];
      if (!u) return;
      const [lat, lng, precision] = u;
      const aprox = precision !== "altura";
      const nombre = escapar(s.nombreComercial || s.razonSocial);
      const mk = L.marker([lat, lng], { icon: icono(aprox), title: s.nombreComercial || s.razonSocial });
      mk.bindPopup(
        `<div class="cm-globo">
          <div class="cm-rubro">${escapar(s.rubro || "Comercio")}</div>
          <div class="cm-nombre">${nombre}</div>
          <div class="cm-dir">${escapar(s.direccion)}${aprox ? '<br><em>Ubicación aproximada sobre la calle</em>' : ""}</div>
          <button type="button" class="cm-boton" data-ficha="${s.id}">Ver ficha</button>
        </div>`,
        { maxWidth: 260 },
      );
      g.addLayer(mk);
      marcadores.current.set(s.id, mk);
      porId.current.set(s.id, s);
      puntos.push([lat, lng]);
    });
    if (puntos.length) m.fitBounds(L.latLngBounds(puntos), { padding: [40, 40], maxZoom: 16 });
    else m.setView(CENTRO_PARANA, 14);
  }, [socios]);

  // Centrar en un socio
  useEffect(() => {
    if (!enfocado) return;
    const mk = marcadores.current.get(enfocado.id);
    if (mk && grupo.current) grupo.current.zoomToShowLayer(mk, () => mk.openPopup());
  }, [enfocado]);

  const sinUbicar = socios.filter((s) => !UBICACIONES_SOCIOS[s.id]).length;

  return (
    <div className="relative isolate z-0 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <style>{CSS}</style>
      <div ref={caja} className="h-[360px] w-full sm:h-[460px]" aria-label="Mapa de comercios asociados en Paraná" />
      <div className="pointer-events-none absolute right-3 top-3 z-[500] rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md">
        <span className="text-[#00a3e0]">{socios.length - sinUbicar}</span> comercios en el mapa
        {sinUbicar > 0 && <span className="block text-[10px] font-medium text-slate-400">{sinUbicar} sin ubicación cargada</span>}
      </div>
    </div>
  );
}

const CSS = `
.cm-pin { position: relative; width: 28px; height: 36px; }
.cm-pin::before { content: ""; position: absolute; left: 3px; top: 0; width: 22px; height: 22px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
  background: #00a3e0; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(12,35,86,.35); }
.cm-pin span { position: absolute; left: 10px; top: 7px; width: 8px; height: 8px; border-radius: 50%; background: #fff; }
.cm-pin-aprox::before { background: #7dd3fc; }
.cm-globo { font-family: Inter, sans-serif; min-width: 190px; }
.cm-rubro { font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #00a3e0; }
.cm-nombre { margin-top: 2px; font-size: 14px; font-weight: 800; color: #0c2356; line-height: 1.2; }
.cm-dir { margin-top: 4px; font-size: 12px; color: #475569; }
.cm-dir em { font-size: 10.5px; color: #94a3b8; }
.cm-boton { margin-top: 8px; width: 100%; border-radius: 8px; padding: 6px 10px; font-size: 12px; font-weight: 700; color: #fff; background: #00a3e0; cursor: pointer; }
.cm-boton:hover { background: #0c2356; }
.marker-cluster-small, .marker-cluster-medium, .marker-cluster-large { background: rgba(0,163,224,.25); }
.marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div { background: #00a3e0; color: #fff; font-weight: 800; }
`;

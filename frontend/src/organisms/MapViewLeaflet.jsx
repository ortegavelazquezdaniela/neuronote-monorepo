import { useEffect, useEffectEvent, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePreferences } from '../hooks/usePreferences';
import { HAVEN_TYPES } from '../services/overpass';
import styles from './MapViewLeaflet.module.css';

/**
 * Mapa Leaflet + teselas de OpenStreetMap.
 * - La instancia de Leaflet vive en un useRef: React no la re-renderiza.
 * - Se inicializa solo cuando el mapa entra en pantalla (menos peticiones de teselas).
 * - Respeta la política de uso de tile.openstreetmap.org: atribución visible,
 *   sin descargas masivas ni precarga.
 * - Con movimiento reducido no hay animaciones de zoom ni desplazamiento.
 */

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores de OpenStreetMap</a>';

const havenIcon = (type, selected) =>
  L.divIcon({
    className: '',
    html: `<span class="${styles.haven} ${selected ? styles.havenSelected : ''}" data-type="${type}"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

const pinIcon = (letter) =>
  L.divIcon({
    className: '',
    html: `<span class="${styles.pin} ${letter === 'B' ? styles.pinB : ''}">${letter}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const userIcon = L.divIcon({
  className: '',
  html: `<span class="${styles.user}"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export function MapViewLeaflet({
  center,
  zoom = 15,
  havens = [],
  selectedHavenId = null,
  onSelectHaven,
  routes = [],
  selectedRouteId = null,
  onSelectRoute,
  origin = null,
  destination = null,
  user = null,
  onMapClick,
  label = 'Mapa interactivo',
  className = '',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const { reducedMotion } = usePreferences();

  const handleClick = useEffectEvent((e) => onMapClick?.({ lat: e.latlng.lat, lon: e.latlng.lng }));
  const handleHaven = useEffectEvent((id) => onSelectHaven?.(id));
  const handleRoute = useEffectEvent((id) => onSelectRoute?.(id));

  // 1. Esperar a que el contenedor sea visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), {
      rootMargin: '200px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 2. Crear el mapa una sola vez
  useEffect(() => {
    if (!visible || mapRef.current) return undefined;
    const map = L.map(containerRef.current, {
      center: [center.lat, center.lon],
      zoom,
      zoomAnimation: !reducedMotion,
      fadeAnimation: !reducedMotion,
      markerZoomAnimation: !reducedMotion,
      scrollWheelZoom: false, // evita que el mapa "atrape" el scroll de la página
      keyboard: true,
    });
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTRIBUTION, crossOrigin: true }).addTo(map);
    map.attributionControl.setPrefix(false);
    map.on('click', (e) => handleClick(e));
    map.on('focus', () => map.scrollWheelZoom.enable());
    map.on('blur', () => map.scrollWheelZoom.disable());
    layersRef.current = {
      routes: L.layerGroup().addTo(map),
      havens: L.layerGroup().addTo(map),
      pins: L.layerGroup().addTo(map),
    };
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // 3. Recentrar cuando cambia el centro
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([center.lat, center.lon], map.getZoom(), { animate: !reducedMotion });
  }, [center.lat, center.lon, reducedMotion, visible]);

  // 4. Oasis candidatos
  useEffect(() => {
    const group = layersRef.current?.havens;
    if (!group) return;
    group.clearLayers();
    havens.forEach((h) => {
      const marker = L.marker([h.lat, h.lon], {
        icon: havenIcon(h.type, h.id === selectedHavenId),
        title: `${h.name} (${HAVEN_TYPES[h.type]?.label ?? 'Lugar'}, sin verificar)`,
        alt: h.name,
        keyboard: true,
        riseOnHover: true,
      });
      marker.on('click', () => handleHaven(h.id));
      marker.on('keypress', (e) => e.originalEvent.key === 'Enter' && handleHaven(h.id));
      group.addLayer(marker);
    });
  }, [havens, selectedHavenId, visible]);

  // 5. Rutas: la seleccionada encima y destacada
  useEffect(() => {
    const group = layersRef.current?.routes;
    if (!group) return;
    group.clearLayers();
    const ordered = [...routes].sort((a) => (a.id === selectedRouteId ? 1 : -1));
    ordered.forEach((r) => {
      const selected = r.id === selectedRouteId;
      if (selected) {
        group.addLayer(L.polyline(r.path, { className: styles.routeHalo, weight: 11, interactive: false }));
      }
      // Los colores van en CSS (clases) para seguir los tokens de cada modo
      const line = L.polyline(r.path, {
        className: selected ? styles.routeSelected : styles.routeAlt,
        weight: selected ? 6 : 4,
        dashArray: selected ? null : '2 9',
        lineCap: 'round',
      });
      line.on('click', () => handleRoute(r.id));
      group.addLayer(line);
    });
    const selectedRoute = routes.find((r) => r.id === selectedRouteId);
    if (selectedRoute && mapRef.current) {
      mapRef.current.fitBounds(L.latLngBounds(selectedRoute.path), { padding: [40, 40], animate: !reducedMotion });
    }
  }, [routes, selectedRouteId, reducedMotion, visible]);

  // 6. Origen, destino y ubicación propia
  useEffect(() => {
    const group = layersRef.current?.pins;
    if (!group) return;
    group.clearLayers();
    if (user) group.addLayer(L.marker([user.lat, user.lon], { icon: userIcon, title: 'Tu ubicación', keyboard: false }));
    if (origin) group.addLayer(L.marker([origin.lat, origin.lon], { icon: pinIcon('A'), title: 'Origen' }));
    if (destination)
      group.addLayer(L.marker([destination.lat, destination.lon], { icon: pinIcon('B'), title: 'Destino' }));
  }, [user, origin, destination, visible]);

  return (
    <div
      ref={containerRef}
      className={`${styles.map} ${className}`}
      role="region"
      aria-label={label}
      data-loaded={visible}
    >
      {!visible && <p className={styles.placeholder}>Cargando el mapa…</p>}
    </div>
  );
}

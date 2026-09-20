import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const SEVERITY_COLORS = {
  global: '#ff2d2d',
  regional: '#ff8c00',
  local: '#ffd700',
};

function ConflictMap({ conflicts, selectedSlug, onSelect, year }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [cursor, setCursor] = useState(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-bg',
            type: 'background',
            paint: { 'background-color': '#0d1117' },
          },
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            paint: {
              'raster-opacity': 0.45,
              'raster-saturation': -1,
            },
          },
        ],
      },
      center: [45, 30],
      zoom: 1.8,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('mousemove', (e) => {
      setCursor({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });
    map.on('mouseout', () => setCursor(null));

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const yearNum = year ? Number(year) : null;

    conflicts.forEach((c) => {
      const startY = Number(String(c.start_date).slice(0, 4));
      const endY = c.end_date ? Number(String(c.end_date).slice(0, 4)) : null;

      if (yearNum && (startY > yearNum || (endY !== null && endY < yearNum))) {
        return;
      }

      const color = SEVERITY_COLORS[c.severity] || '#ffd700';
      const el = document.createElement('div');
      el.className = `conflict-marker conflict-marker-${c.severity}`;
      el.style.backgroundColor = color;
      if (c.slug === selectedSlug) {
        el.classList.add('conflict-marker-selected');
      }
      el.addEventListener('click', () => onSelect(c.slug));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([c.lon, c.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [conflicts, selectedSlug, onSelect, year]);

  const formatCoord = (value, dir) =>
    `${Math.abs(Number(value)).toFixed(4)}°${dir}`;

  return (
    <div className="conflict-map-wrap">
      <div ref={mapContainer} className="conflict-map" id="map" />
      <div className="coord-readout" aria-live="polite">
        {cursor
          ? `${formatCoord(cursor.lat, cursor.lat >= 0 ? ' с.ш.' : ' ю.ш.')} · ${formatCoord(cursor.lng, cursor.lng >= 0 ? ' в.д.' : ' з.д.')}`
          : '\u00a0'}
      </div>
    </div>
  );
}

export default ConflictMap;
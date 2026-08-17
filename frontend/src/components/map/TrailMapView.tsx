'use client';

import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { MapTrail, TrailCategory, Waypoint } from '@/lib/types';
import {
  ALL_DIFFICULTIES,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_MAP_COLOR,
  REGION_LABELS,
  formatDistance,
  formatDuration,
} from '@/lib/format';

/**
 * A small glyph drawn inside the pin so markers read by *kind of place*, not
 * just by difficulty colour — a waterfall and a summit at the same
 * difficulty used to be visually identical dots.
 */
const CATEGORY_GLYPH: Record<TrailCategory, string> = {
  SUMMIT: '<path d="M2 11 L6 5 L8.5 8 L12 3 L16 11 Z" fill="#fff"/>',
  WATERFALL:
    '<path d="M6 2v5M9 2v6M12 2v4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M4 11c1 2 2 2 3 0M8 11c1 2 2 2 3 0M6 13c1 2 2 2 3 0" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/>',
  LAKE: '<path d="M2 8c1.5-1.5 2.5-1.5 4 0s2.5 1.5 4 0 2.5-1.5 4 0" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M2 11.5c1.5-1.5 2.5-1.5 4 0s2.5 1.5 4 0 2.5-1.5 4 0" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  FOREST:
    '<path d="M9 2 4 8h2.2L3 12h4.3v3h3.4v-3H15l-3.2-4H14z" fill="#fff"/>',
  WILDLIFE:
    '<ellipse cx="9" cy="10.5" rx="3.2" ry="2.6" fill="#fff"/><circle cx="5" cy="6" r="1.3" fill="#fff"/><circle cx="8" cy="4.3" r="1.3" fill="#fff"/><circle cx="11.3" cy="5.3" r="1.3" fill="#fff"/>',
  COASTAL:
    '<circle cx="9" cy="4.5" r="1.8" fill="#fff"/><path d="M2 10c1.5-1.4 2.5-1.4 4 0s2.5 1.4 4 0 2.5-1.4 4 0" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M2 13c1.5-1.4 2.5-1.4 4 0s2.5 1.4 4 0 2.5-1.4 4 0" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  CULTURAL:
    '<path d="M9 2 3 6.5V7h12v-.5z" fill="#fff"/><rect x="4" y="7.5" width="2.4" height="5.5" fill="#fff"/><rect x="7.8" y="7.5" width="2.4" height="5.5" fill="#fff"/><rect x="11.6" y="7.5" width="2.4" height="5.5" fill="#fff"/><rect x="3" y="13.2" width="12" height="1.3" fill="#fff"/>',
};

/**
 * Leaflet's default marker images resolve to broken URLs under a bundler, so
 * every marker here is a divIcon we style ourselves. It also lets the pin
 * colour carry the difficulty rating.
 */
const pinIcon = (color: string, opts: { label?: string; glyph?: string } = {}) => {
  const inner = opts.glyph
    ? `<svg width="18" height="18" viewBox="0 0 18 18" style="transform:rotate(45deg)">${opts.glyph}</svg>`
    : `<span style="transform:rotate(45deg)">${opts.label ?? ''}</span>`;
  return L.divIcon({
    className: '',
    html: `
      <span style="
        display:grid;place-items:center;
        width:26px;height:26px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${color};
        border:2px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,.35);
        font:600 11px/1 Inter,sans-serif;color:#fff;">
        ${inner}
      </span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
};

/**
 * Leaflet's `alt` marker option only ever lands as the `.alt` DOM property,
 * which is meaningless on the `<div>` a divIcon renders (only `<img>` reads
 * it) — so a divIcon marker's `role="button"` wrapper has no accessible
 * name no matter what `alt` is set to. Setting `aria-label` directly on the
 * real element once Leaflet creates it is the one path that actually works.
 */
const markerA11y = (label: string) => ({
  add: (e: L.LeafletEvent) => {
    (e.target as L.Marker).getElement()?.setAttribute('aria-label', label);
  },
});

/** Zooms the map to fit whatever was passed in, once, after mount. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 13 });
  }, [map, points]);

  return null;
}

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const STREET_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

/** Esri World Imagery — free, no API key, decent resolution over Cameroon. */
const SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
const ESRI_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';

/** Street vs. satellite base layer, switchable without remounting the map. */
function MapLayers({ satellite }: { satellite: boolean }) {
  if (satellite) {
    return (
      <>
        <TileLayer attribution={ESRI_ATTRIBUTION} url={SATELLITE_URL} maxZoom={19} />
        <TileLayer url={SATELLITE_LABELS_URL} maxZoom={19} />
      </>
    );
  }
  return <TileLayer attribution={OSM_ATTRIBUTION} url={STREET_URL} maxZoom={19} />;
}

function LayerToggle({
  satellite,
  onChange,
  className = 'absolute right-3 top-3 z-[1000]',
}: {
  satellite: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}) {
  return (
    <div className={`map-layer-toggle ${className}`}>
      <button type="button" className={satellite ? '' : 'is-active'} onClick={() => onChange(false)}>
        Streets
      </button>
      <button type="button" className={satellite ? 'is-active' : ''} onClick={() => onChange(true)}>
        Satellite
      </button>
    </div>
  );
}

/** Finds the hiker's current position, zooms in close, and switches to satellite. */
function LocateControl({
  onLocate,
  className = 'absolute right-3 top-14 z-[1000]',
}: {
  onLocate?: () => void;
  className?: string;
}) {
  const map = useMap();
  const [status, setStatus] = useState<'idle' | 'locating' | 'found' | 'error'>('idle');

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        onLocate?.();
        map.flyTo([latitude, longitude], 17, { duration: 1.4 });

        const icon = L.divIcon({
          className: '',
          html: '<span class="user-location-marker" style="width:16px;height:16px;display:block"><span class="pulse"></span><span class="dot"></span></span>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const youAreHereMarker = L.marker([latitude, longitude], { icon, zIndexOffset: 1000, alt: 'Your location' })
          .addTo(map)
          .bindPopup(`You are here${accuracy ? ` &plusmn; ${Math.round(accuracy)} m` : ''}`);
        youAreHereMarker.getElement()?.setAttribute('aria-label', 'Your location');
        setStatus('found');
      },
      () => setStatus('error'),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  return (
    <button
      type="button"
      onClick={handleLocate}
      disabled={status === 'locating'}
      className={`locate-btn ${className} ${status === 'found' ? 'is-active' : ''}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
        <circle cx="12" cy="12" r="3" />
        <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
      {status === 'locating'
        ? 'Locating…'
        : status === 'error'
          ? 'Location unavailable'
          : status === 'found'
            ? 'Zoomed to you'
            : 'Zoom to my location'}
    </button>
  );
}

/** Floating on-map key: which colour dot means Easy / Moderate / Hard / Expert. */
function DifficultyLegend({ className = 'absolute bottom-3 left-3 z-[1000]' }: { className?: string }) {
  return (
    <div className={`map-legend ${className}`}>
      {ALL_DIFFICULTIES.map((level) => (
        <span key={level} className="map-legend-item">
          <span className="map-legend-dot" style={{ background: DIFFICULTY_MAP_COLOR[level] }} aria-hidden />
          {DIFFICULTY_LABELS[level]}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- overview map

export function TrailsOverviewMap({
  trails,
  height = '600px',
  activeSlug,
}: {
  trails: MapTrail[];
  height?: string;
  activeSlug?: string;
}) {
  const points = trails.map((t) => [t.startLat, t.startLng] as [number, number]);
  const [satellite, setSatellite] = useState(true);

  return (
    <MapContainer
      // Roughly the geographic centre of Cameroon; FitBounds overrides it.
      center={[5.6, 11.5]}
      zoom={6}
      scrollWheelZoom
      style={{ height, width: '100%' }}
      className="relative rounded-xl"
    >
      <MapLayers satellite={satellite} />
      <FitBounds points={points} />
      <LayerToggle satellite={satellite} onChange={setSatellite} />
      <LocateControl onLocate={() => setSatellite(true)} />
      <DifficultyLegend />

      {trails.map(
        (trail) =>
          trail.routeGeoJson && (
            <Polyline
              key={trail.id}
              // GeoJSON is [lng, lat]; Leaflet wants [lat, lng].
              positions={trail.routeGeoJson.coordinates.map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                color: DIFFICULTY_MAP_COLOR[trail.difficulty],
                weight: trail.slug === activeSlug ? 5 : 3,
                opacity: activeSlug && trail.slug !== activeSlug ? 0.4 : 0.85,
              }}
            />
          )
      )}

      <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={50}>
        {trails.map((trail) => (
          <Marker
            key={trail.id}
            position={[trail.startLat, trail.startLng]}
            icon={pinIcon(DIFFICULTY_MAP_COLOR[trail.difficulty], { glyph: CATEGORY_GLYPH[trail.category] })}
            alt={trail.name}
            eventHandlers={markerA11y(trail.name)}
          >
            <Popup>
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                  {REGION_LABELS[trail.region]} · {CATEGORY_LABELS[trail.category]}
                </p>
                <p className="mt-0.5 font-semibold leading-snug text-basalt-900 dark:text-basalt-50">{trail.name}</p>
                <p className="mt-1.5 text-xs text-basalt-600 dark:text-basalt-300">
                  {DIFFICULTY_LABELS[trail.difficulty]} · {formatDistance(trail.distanceKm)} ·{' '}
                  {formatDuration(trail.durationMinutes)}
                </p>
                <Link
                  href={`/trails/${trail.slug}`}
                  className="mt-2.5 inline-block rounded-md bg-forest-700 px-3 py-1.5 text-xs font-semibold text-white no-underline"
                >
                  View trail
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

// ---------------------------------------------------------------- single trail

export function SingleTrailMap({
  trail,
  waypoints,
  height = '420px',
}: {
  trail: Pick<MapTrail, 'name' | 'difficulty' | 'startLat' | 'startLng' | 'routeGeoJson'>;
  waypoints: Waypoint[];
  height?: string;
}) {
  const routePoints: [number, number][] =
    trail.routeGeoJson?.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];

  const waypointPoints = waypoints.map((w) => [w.lat, w.lng] as [number, number]);
  const allPoints = [...routePoints, ...waypointPoints, [trail.startLat, trail.startLng] as [number, number]];
  const color = DIFFICULTY_MAP_COLOR[trail.difficulty];
  const [satellite, setSatellite] = useState(true);

  return (
    <MapContainer
      center={[trail.startLat, trail.startLng]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height, width: '100%' }}
      className="relative rounded-xl"
    >
      <MapLayers satellite={satellite} />
      <FitBounds points={allPoints} />
      <LayerToggle satellite={satellite} onChange={setSatellite} />
      <LocateControl onLocate={() => setSatellite(true)} />

      {routePoints.length > 1 && (
        <>
          {/* White casing under the route so it reads over dark terrain tiles. */}
          <Polyline positions={routePoints} pathOptions={{ color: '#fff', weight: 8, opacity: 0.9 }} />
          <Polyline positions={routePoints} pathOptions={{ color, weight: 4, opacity: 1 }} />
        </>
      )}

      {waypoints.map((wp, index) => (
        <Marker
          key={wp.id}
          position={[wp.lat, wp.lng]}
          icon={pinIcon(color, { label: String(index + 1) })}
          alt={`Waypoint ${index + 1}: ${wp.name}`}
          eventHandlers={markerA11y(`Waypoint ${index + 1}: ${wp.name}`)}
        >
          <Popup>
            <div className="p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                Waypoint {index + 1}
                {wp.elevationM ? ` · ${wp.elevationM.toLocaleString()} m` : ''}
              </p>
              <p className="mt-0.5 font-semibold leading-snug text-basalt-900 dark:text-basalt-50">{wp.name}</p>
              {wp.description && <p className="mt-1.5 text-xs text-basalt-600 dark:text-basalt-300">{wp.description}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// ---------------------------------------------------------------- landmark sites

export interface SitePoint {
  slug: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  elevationM?: number;
  teaser: string;
  sceneType?: 'mountain' | 'water' | 'none';
}

const SCENE_GLYPH: Record<'mountain' | 'water' | 'none', string> = {
  mountain: CATEGORY_GLYPH.SUMMIT,
  water: CATEGORY_GLYPH.LAKE,
  none: CATEGORY_GLYPH.CULTURAL,
};

/** Overview map of the historic/natural landmarks on the Cameroon Sites page. */
export function CameroonSitesMap({ sites, height = '480px' }: { sites: SitePoint[]; height?: string }) {
  const [satellite, setSatellite] = useState(true);
  const points = sites.map((s) => [s.lat, s.lng] as [number, number]);

  return (
    <MapContainer
      center={[5.6, 11.5]}
      zoom={6}
      scrollWheelZoom
      style={{ height, width: '100%' }}
      className="relative rounded-xl"
    >
      <MapLayers satellite={satellite} />
      <FitBounds points={points} />
      <LayerToggle satellite={satellite} onChange={setSatellite} />
      <LocateControl onLocate={() => setSatellite(true)} />

      <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={50}>
        {sites.map((site) => (
          <Marker
            key={site.slug}
            position={[site.lat, site.lng]}
            icon={pinIcon('#CE1126', { glyph: SCENE_GLYPH[site.sceneType ?? 'none'] })}
            alt={site.name}
            eventHandlers={markerA11y(site.name)}
          >
            <Popup>
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                  {site.region}
                  {site.elevationM ? ` · ${site.elevationM.toLocaleString()} m` : ''}
                </p>
                <p className="mt-0.5 font-semibold leading-snug text-basalt-900 dark:text-basalt-50">{site.name}</p>
                <p className="mt-1.5 text-xs text-basalt-600 dark:text-basalt-300">{site.teaser}</p>
                <Link
                  href={`/sites/${site.slug}`}
                  className="mt-2.5 inline-block rounded-md bg-forest-700 px-3 py-1.5 text-xs font-semibold text-white no-underline"
                >
                  History &amp; culture
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

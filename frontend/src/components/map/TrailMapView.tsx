'use client';

import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { MapTrail, Waypoint } from '@/lib/types';
import {
  ALL_DIFFICULTIES,
  DIFFICULTY_LABELS,
  DIFFICULTY_MAP_COLOR,
  REGION_LABELS,
  formatDistance,
  formatDuration,
} from '@/lib/format';

/**
 * Leaflet's default marker images resolve to broken URLs under a bundler, so
 * every marker here is a divIcon we style ourselves. It also lets the pin
 * colour carry the difficulty rating.
 */
const pinIcon = (color: string, label?: string) =>
  L.divIcon({
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
        <span style="transform:rotate(45deg)">${label ?? ''}</span>
      </span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
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
        L.marker([latitude, longitude], { icon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup(`You are here${accuracy ? ` &plusmn; ${Math.round(accuracy)} m` : ''}`);
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

      {trails.map((trail) => (
        <div key={trail.id}>
          {trail.routeGeoJson && (
            <Polyline
              // GeoJSON is [lng, lat]; Leaflet wants [lat, lng].
              positions={trail.routeGeoJson.coordinates.map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                color: DIFFICULTY_MAP_COLOR[trail.difficulty],
                weight: trail.slug === activeSlug ? 5 : 3,
                opacity: activeSlug && trail.slug !== activeSlug ? 0.4 : 0.85,
              }}
            />
          )}
          <Marker
            position={[trail.startLat, trail.startLng]}
            icon={pinIcon(DIFFICULTY_MAP_COLOR[trail.difficulty])}
          >
            <Popup>
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                  {REGION_LABELS[trail.region]}
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
        </div>
      ))}
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
        <Marker key={wp.id} position={[wp.lat, wp.lng]} icon={pinIcon(color, String(index + 1))}>
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
}

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

      {sites.map((site) => (
        <Marker key={site.slug} position={[site.lat, site.lng]} icon={pinIcon('#CE1126')}>
          <Popup>
            <div className="p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                {site.region}
                {site.elevationM ? ` · ${site.elevationM.toLocaleString()} m` : ''}
              </p>
              <p className="mt-0.5 font-semibold leading-snug text-basalt-900 dark:text-basalt-50">{site.name}</p>
              <p className="mt-1.5 text-xs text-basalt-600 dark:text-basalt-300">{site.teaser}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

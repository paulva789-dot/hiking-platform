'use client';

import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { useEffect } from 'react';
import type { MapTrail, Waypoint } from '@/lib/types';
import {
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

  return (
    <MapContainer
      // Roughly the geographic centre of Cameroon; FitBounds overrides it.
      center={[5.6, 11.5]}
      zoom={6}
      scrollWheelZoom
      style={{ height, width: '100%' }}
      className="rounded-xl"
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds points={points} />

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
                <p className="mt-0.5 font-semibold leading-snug text-basalt-900">{trail.name}</p>
                <p className="mt-1.5 text-xs text-basalt-600">
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

  return (
    <MapContainer
      center={[trail.startLat, trail.startLng]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height, width: '100%' }}
      className="rounded-xl"
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds points={allPoints} />

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
              <p className="mt-0.5 font-semibold leading-snug text-basalt-900">{wp.name}</p>
              {wp.description && <p className="mt-1.5 text-xs text-basalt-600">{wp.description}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

'use client';

import dynamic from 'next/dynamic';

/**
 * Leaflet reaches for `window` at import time, so both maps must be loaded
 * client-side only. Keeping the dynamic() calls in one client module lets
 * server components import them without ssr:false errors.
 */
const MapSkeleton = ({ height }: { height: string }) => (
  <div
    className="skeleton flex items-center justify-center rounded-xl"
    style={{ height }}
    aria-label="Loading map"
  >
    <span className="text-sm font-medium text-basalt-600 dark:text-basalt-300">Loading map…</span>
  </div>
);

export const TrailsOverviewMap = dynamic(
  () => import('./TrailMapView').then((m) => m.TrailsOverviewMap),
  { ssr: false, loading: () => <MapSkeleton height="600px" /> }
);

export const SingleTrailMap = dynamic(
  () => import('./TrailMapView').then((m) => m.SingleTrailMap),
  { ssr: false, loading: () => <MapSkeleton height="420px" /> }
);

export const CameroonSitesMap = dynamic(
  () => import('./TrailMapView').then((m) => m.CameroonSitesMap),
  { ssr: false, loading: () => <MapSkeleton height="480px" /> }
);

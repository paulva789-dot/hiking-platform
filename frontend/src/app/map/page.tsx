import type { Metadata } from 'next';
import { Suspense } from 'react';
import { serverFetch } from '@/lib/api';
import type { MapTrail } from '@/lib/types';
import fallbackTrails from '@/lib/map-trails.fallback.json';
import { MapExplorer } from './MapExplorer';
import { T } from '@/components/T';

export const metadata: Metadata = {
  title: 'Interactive trail map',
  description:
    'Every hiking trail in Cameroon on one map — routes, trailheads and difficulty, across all ten regions.',
};

export const revalidate = 600;

export default async function MapPage() {
  // If the API is down or returns nothing, plot the bundled copy of the seeded
  // trails so the map is never empty. Regenerate the JSON when trails.data.js changes.
  const live = await serverFetch<{ trails: MapTrail[] }>('/trails/map').catch(() => null);
  const trails = live?.trails?.length ? live.trails : (fallbackTrails as MapTrail[]);

  return (
    <div className="bg-basalt-50 dark:bg-basalt-950">
      <div className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-8">
          <h1 className="font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            <T k="page.map.title" />
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600 dark:text-basalt-300">
            All {trails.length} trails plotted on OpenStreetMap. Line colour is the difficulty
            rating; click any pin for the numbers and a link to the full trail page.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="section py-8"><div className="skeleton h-[620px] w-full" /></div>}>
        <MapExplorer trails={trails} />
      </Suspense>
    </div>
  );
}

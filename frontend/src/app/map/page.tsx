import type { Metadata } from 'next';
import { serverFetch } from '@/lib/api';
import type { MapTrail } from '@/lib/types';
import { MapExplorer } from './MapExplorer';
import { T } from '@/components/T';

export const metadata: Metadata = {
  title: 'Interactive trail map',
  description:
    'Every hiking destination in Cameroon on one map — routes, trailheads and difficulty, across all ten regions.',
};

export const revalidate = 600;

export default async function MapPage() {
  const { trails } = await serverFetch<{ trails: MapTrail[] }>('/trails/map').catch(() => ({
    trails: [] as MapTrail[],
  }));

  return (
    <div className="bg-basalt-50 dark:bg-basalt-950">
      <div className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-8">
          <h1 className="font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            <T k="page.map.title" />
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600 dark:text-basalt-300">
            All {trails.length} destinations plotted on OpenStreetMap. Line colour is the difficulty
            rating; click any pin for the numbers and a link to the full trail page.
          </p>
        </div>
      </div>

      <MapExplorer trails={trails} />
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { buildQuery, serverFetch } from '@/lib/api';
import type { Pagination, TrailCard as TrailCardType } from '@/lib/types';
import { DIFFICULTY_LABELS, REGION_LABELS } from '@/lib/format';
import { TrailCard } from '@/components/TrailCard';
import { TrailFilters } from '@/components/TrailFilters';
import { TrailSearchBar } from '@/components/TrailSearchBar';
import { EmptyState } from '@/components/ui';

export const metadata: Metadata = {
  title: 'All hiking trails',
  description:
    'Search 12 checked hiking destinations across all ten regions of Cameroon by difficulty, region and time needed.',
};

interface Facets {
  regions: { value: string; count: number }[];
  difficulties: { value: string; count: number }[];
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TrailsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const one = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const query = {
    q: one('q'),
    region: one('region'),
    difficulty: one('difficulty'),
    maxDurationMinutes: one('maxDurationMinutes'),
    sort: one('sort') ?? 'popular',
    page: one('page') ?? '1',
    limit: 12,
  };

  const [result, facets] = await Promise.all([
    serverFetch<{ trails: TrailCardType[]; pagination: Pagination }>(
      `/trails${buildQuery(query)}`,
      60
    ).catch(() => ({ trails: [], pagination: { page: 1, limit: 12, total: 0, pages: 1 } })),
    serverFetch<Facets>('/trails/facets', 600).catch(() => ({ regions: [], difficulties: [] })),
  ]);

  const { trails, pagination } = result;
  const activeFilters = [
    query.region && REGION_LABELS[query.region as keyof typeof REGION_LABELS],
    query.difficulty && DIFFICULTY_LABELS[query.difficulty as keyof typeof DIFFICULTY_LABELS],
    query.q && `“${query.q}”`,
  ].filter(Boolean);

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <div className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-10">
          <h1 className="font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            Hiking destinations
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600 dark:text-basalt-300">
            Twelve destinations, at least one in each of Cameroon&rsquo;s ten regions. Every distance,
            ascent and duration below is for the standard route and a moderately fit hiker.
          </p>
          <div className="mt-6 max-w-2xl">
            <Suspense fallback={<div className="skeleton h-11 w-full" />}>
              <TrailSearchBar />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="section grid gap-8 pt-8 lg:grid-cols-[260px_1fr]">
        <Suspense fallback={<div className="skeleton h-96 w-full" />}>
          <TrailFilters facets={facets} />
        </Suspense>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-basalt-600 dark:text-basalt-300">
              <span className="font-semibold text-basalt-900 dark:text-basalt-50">{pagination.total}</span>{' '}
              {pagination.total === 1 ? 'destination' : 'destinations'}
              {activeFilters.length > 0 && <> matching {activeFilters.join(' · ')}</>}
            </p>
            <Link href="/map" className="btn-secondary text-xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinejoin="round" d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
                <path d="M9 4v14M15 6v14" />
              </svg>
              View on map
            </Link>
          </div>

          {trails.length === 0 ? (
            <EmptyState
              title="No trails match those filters"
              message="Try widening the difficulty or region filter — there are only twelve destinations on the platform, so narrow searches run out fast."
              action={{ href: '/trails', label: 'Clear filters' }}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {trails.map((trail, i) => (
                <TrailCard key={trail.id} trail={trail} priority={i < 3} />
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => {
                const next = new URLSearchParams();
                for (const [k, v] of Object.entries(query)) {
                  if (v && k !== 'page' && k !== 'limit') next.set(k, String(v));
                }
                next.set('page', String(page));
                const isCurrent = page === pagination.page;
                return (
                  <Link
                    key={page}
                    href={`/trails?${next.toString()}`}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`grid h-10 w-10 place-items-center rounded-lg text-sm font-semibold ${
                      isCurrent
                        ? 'bg-forest-700 text-white'
                        : 'bg-white text-basalt-700 dark:bg-basalt-900 dark:text-basalt-300 dark:ring-basalt-700 ring-1 ring-basalt-300 hover:bg-basalt-100 dark:hover:bg-basalt-800'
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

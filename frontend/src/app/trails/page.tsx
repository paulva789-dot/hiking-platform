import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { buildQuery, serverFetch } from '@/lib/api';
import type { Pagination, TrailCard as TrailCardType } from '@/lib/types';
import { DIFFICULTY_LABELS, REGION_LABELS } from '@/lib/format';
import { TrailCard } from '@/components/TrailCard';
import { Reveal } from '@/components/Reveal';
import { TrailFilters } from '@/components/TrailFilters';
import { FilterDrawer } from '@/components/FilterDrawer';
import { TrailSearchBar } from '@/components/TrailSearchBar';
import { EmptyState } from '@/components/ui';
import { T } from '@/components/T';

export const metadata: Metadata = {
  title: 'All hiking trails',
  description:
    'Search 17 checked hiking destinations across all ten regions of Cameroon by difficulty, region and time needed.',
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
    serverFetch<{ trails: TrailCardType[]; pagination: Pagination; suggestions?: TrailCardType[] }>(
      `/trails${buildQuery(query)}`,
      60
    ).catch(() => ({
      trails: [] as TrailCardType[],
      pagination: { page: 1, limit: 12, total: 0, pages: 1 },
      suggestions: [] as TrailCardType[],
    })),
    serverFetch<Facets>('/trails/facets', 600).catch(() => ({ regions: [], difficulties: [] })),
  ]);

  const { trails, pagination, suggestions } = result;
  const activeFilters = [
    query.region && REGION_LABELS[query.region as keyof typeof REGION_LABELS],
    query.difficulty && DIFFICULTY_LABELS[query.difficulty as keyof typeof DIFFICULTY_LABELS],
    query.q && `“${query.q}”`,
  ].filter(Boolean);

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <div className="flag-bar" aria-hidden />
      <div className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-10">
          <h1 className="font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            <T k="page.trails.title" />
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600 dark:text-basalt-300">
            <T k="page.trails.subtitle" />
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
          <FilterDrawer activeCount={activeFilters.length}>
            <TrailFilters facets={facets} />
          </FilterDrawer>
        </Suspense>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-basalt-600 dark:text-basalt-300">
              <span className="font-semibold text-basalt-900 dark:text-basalt-50">{pagination.total}</span>{' '}
              <T k={pagination.total === 1 ? 'trailsPage.destination.one' : 'trailsPage.destination.other'} />
              {activeFilters.length > 0 && (
                <>
                  {' '}
                  <T k="trailsPage.matching" params={{ filters: activeFilters.join(' · ') }} />
                </>
              )}
            </p>
            <Link href={`/map${buildQuery({ region: query.region, difficulty: query.difficulty, maxDurationMinutes: query.maxDurationMinutes, sort: query.sort })}`} className="btn-secondary text-xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinejoin="round" d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
                <path d="M9 4v14M15 6v14" />
              </svg>
              <T k="trailsPage.viewOnMap" />
            </Link>
          </div>

          {trails.length === 0 ? (
            <>
              <EmptyState
                title={
                  query.q ? <T k="trailsPage.noMatchQuery" params={{ q: query.q }} /> : <T k="trailsPage.noMatchFilters" />
                }
                message={
                  query.q ? <T k="trailsPage.noMatchQueryHint" /> : <T k="trailsPage.noMatchFiltersHint" />
                }
                action={{ href: '/trails', label: <T k="trailsPage.clearFilters" /> }}
              />

              {suggestions && suggestions.length > 0 && (
                <div className="mt-8">
                  <p className="mb-4 text-xs font-bold uppercase tracking-wide text-basalt-500 dark:text-basalt-400">
                    <T k="trailsPage.popularInstead" />
                  </p>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {suggestions.map((trail) => (
                      <TrailCard key={trail.id} trail={trail} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {trails.map((trail, i) => (
                <Reveal key={trail.id}>
                  <div
                    className="animate-fade-up motion-reduce:animate-none"
                    style={{ animationDelay: `${Math.min(i % 6, 5) * 60}ms` }}
                  >
                    <TrailCard trail={trail} priority={i < 3} />
                  </div>
                </Reveal>
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

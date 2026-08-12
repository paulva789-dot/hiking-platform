'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { TrailsOverviewMap } from '@/components/map/LazyMaps';
import { TrailFilters, type Facets } from '@/components/TrailFilters';
import { FilterDrawer } from '@/components/FilterDrawer';
import type { Difficulty, MapTrail, Region } from '@/lib/types';
import { DIFFICULTY_MAP_COLOR, REGION_LABELS, formatDistance, formatDuration } from '@/lib/format';

const SORTERS: Record<string, (a: MapTrail, b: MapTrail) => number> = {
  popular: (a, b) => b.viewCount - a.viewCount || b.ratingAvg - a.ratingAvg,
  rating: (a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount,
  newest: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  distance: (a, b) => a.distanceKm - b.distanceKm,
  name: (a, b) => a.name.localeCompare(b.name),
};

export function MapExplorer({ trails }: { trails: MapTrail[] }) {
  const params = useSearchParams();
  const [hovered, setHovered] = useState<string | undefined>();

  const region = params.get('region') as Region | null;
  const difficulty = params.get('difficulty') as Difficulty | null;
  const maxDuration = params.get('maxDurationMinutes');
  const sort = params.get('sort') ?? 'popular';

  // Same shape /trails/facets returns, computed locally since every
  // published trail is already loaded here — one less request, and it
  // means /trails and /map always agree on what "unified filtering" counts.
  const facets: Facets = useMemo(() => {
    const count = (key: 'region' | 'difficulty') => {
      const tally = new Map<string, number>();
      for (const t of trails) tally.set(t[key], (tally.get(t[key]) ?? 0) + 1);
      return [...tally.entries()].map(([value, count]) => ({ value, count }));
    };
    return { regions: count('region'), difficulties: count('difficulty') };
  }, [trails]);

  const filtered = useMemo(() => {
    const list = trails.filter(
      (t) =>
        (!difficulty || t.difficulty === difficulty) &&
        (!region || t.region === region) &&
        (!maxDuration || t.durationMinutes <= Number(maxDuration))
    );
    return [...list].sort(SORTERS[sort] ?? SORTERS.popular);
  }, [trails, difficulty, region, maxDuration, sort]);

  const activeCount = [region, difficulty, maxDuration].filter(Boolean).length;
  const listQuery = new URLSearchParams();
  if (region) listQuery.set('region', region);
  if (difficulty) listQuery.set('difficulty', difficulty);
  if (maxDuration) listQuery.set('maxDurationMinutes', maxDuration);
  if (sort !== 'popular') listQuery.set('sort', sort);
  const listQs = listQuery.toString();

  return (
    <div className="section grid gap-6 py-8 lg:grid-cols-[260px_1fr_340px]">
      <FilterDrawer activeCount={activeCount}>
        <TrailFilters facets={facets} basePath="/map" />
      </FilterDrawer>

      <div className="order-3 lg:order-2">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-basalt-600 dark:text-basalt-300">
            <span className="font-semibold text-basalt-900 dark:text-basalt-50">{filtered.length}</span> of{' '}
            {trails.length} destinations shown
          </p>
          <Link href={`/trails${listQs ? `?${listQs}` : ''}`} className="btn-secondary text-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            View as list
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-basalt-200 shadow-sm">
          {/* Remount on filter change so FitBounds re-zooms to the new selection. */}
          <TrailsOverviewMap
            key={`${difficulty ?? 'all'}-${region ?? 'all'}-${maxDuration ?? 'any'}`}
            trails={filtered}
            activeSlug={hovered}
            height="620px"
          />
        </div>
      </div>

      <aside className="order-2 lg:order-3">
        <ul className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
          {filtered.map((trail) => (
            <li key={trail.id}>
              <Link
                href={`/trails/${trail.slug}`}
                onMouseEnter={() => setHovered(trail.slug)}
                onMouseLeave={() => setHovered(undefined)}
                className="card flex gap-3 p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: DIFFICULTY_MAP_COLOR[trail.difficulty] }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-basalt-900 dark:text-basalt-50">{trail.name}</p>
                  <p className="mt-0.5 text-xs text-basalt-600 dark:text-basalt-300">
                    {REGION_LABELS[trail.region]} · {formatDistance(trail.distanceKm)} ·{' '}
                    {formatDuration(trail.durationMinutes)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="card p-5 text-sm text-basalt-600 dark:text-basalt-300">
            No destinations match that combination. Clear a filter to see the rest.
          </p>
        )}
      </aside>
    </div>
  );
}

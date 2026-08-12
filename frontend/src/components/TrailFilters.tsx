'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { ALL_DIFFICULTIES, ALL_REGIONS, DIFFICULTY_LABELS, REGION_LABELS } from '@/lib/format';

export interface Facets {
  regions: { value: string; count: number }[];
  difficulties: { value: string; count: number }[];
}

export const DURATION_OPTIONS = [
  { value: '240', label: 'Half day (under 4 h)' },
  { value: '600', label: 'Full day (under 10 h)' },
  { value: '2880', label: 'Up to 2 days' },
  { value: '10080', label: 'Multi-day' },
];

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Most viewed' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'distance', label: 'Shortest first' },
  { value: 'newest', label: 'Recently added' },
  { value: 'name', label: 'A–Z' },
];

/**
 * Shared by /trails (server-paginated, URL is the source of truth) and /map
 * (everything already loaded client-side, filtered/sorted in memory) --
 * same component, same URL params, so a filter picked on one page carries
 * over if you follow a "view on map" / "view as list" link to the other.
 */
export function TrailFilters({ facets, basePath = '/trails' }: { facets: Facets; basePath?: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const countFor = (list: { value: string; count: number }[], value: string) =>
    list.find((f) => f.value === value)?.count ?? 0;

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      // Any filter change invalidates the current page number.
      next.delete('page');
      router.push(`${basePath}?${next.toString()}`, { scroll: false });
    },
    [params, router, basePath]
  );

  const activeCount = ['region', 'difficulty', 'maxDurationMinutes', 'q'].filter((k) =>
    params.get(k)
  ).length;

  return (
    <aside className="space-y-6" aria-label="Trail filters">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => router.push(basePath)}
            className="text-xs font-semibold text-terracotta-700 hover:underline"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <FilterGroup label="Sort by">
        <select
          value={params.get('sort') ?? 'popular'}
          onChange={(e) => setParam('sort', e.target.value === 'popular' ? null : e.target.value)}
          className="input"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="Difficulty">
        <div className="space-y-1.5">
          {ALL_DIFFICULTIES.map((level) => {
            const active = params.get('difficulty') === level;
            const count = countFor(facets.difficulties, level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => setParam('difficulty', active ? null : level)}
                disabled={count === 0 && !active}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-40 ${
                  active
                    ? 'bg-forest-700 font-semibold text-white'
                    : 'text-basalt-700 dark:text-basalt-300 hover:bg-basalt-100'
                }`}
              >
                <span>{DIFFICULTY_LABELS[level]}</span>
                <span className={active ? 'text-forest-100' : 'text-basalt-600 dark:text-basalt-400'}>{count}</span>
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup label="Region">
        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {ALL_REGIONS.map((region) => {
            const active = params.get('region') === region;
            const count = countFor(facets.regions, region);
            return (
              <button
                key={region}
                type="button"
                onClick={() => setParam('region', active ? null : region)}
                disabled={count === 0 && !active}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-40 ${
                  active
                    ? 'bg-forest-700 font-semibold text-white'
                    : 'text-basalt-700 dark:text-basalt-300 hover:bg-basalt-100'
                }`}
              >
                <span>{REGION_LABELS[region]}</span>
                <span className={active ? 'text-forest-100' : 'text-basalt-600 dark:text-basalt-400'}>{count}</span>
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup label="Time needed">
        <div className="space-y-1.5">
          {DURATION_OPTIONS.map((opt) => {
            const active = params.get('maxDurationMinutes') === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setParam('maxDurationMinutes', active ? null : opt.value)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active ? 'bg-forest-700 font-semibold text-white' : 'text-basalt-700 dark:text-basalt-300 hover:bg-basalt-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-300">{label}</p>
      {children}
    </div>
  );
}

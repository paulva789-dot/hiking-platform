'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, type ReactNode } from 'react';
import { ALL_DIFFICULTIES, ALL_REGIONS, DIFFICULTY_LABELS, REGION_LABELS } from '@/lib/format';
import { useLanguage } from '@/lib/i18n/language-context';
import type { TranslationKey } from '@/lib/i18n/translations';
import { T } from './T';

export interface Facets {
  regions: { value: string; count: number }[];
  difficulties: { value: string; count: number }[];
}

export const DURATION_OPTIONS: { value: string; labelKey: TranslationKey }[] = [
  { value: '240', labelKey: 'filters.duration.half' },
  { value: '600', labelKey: 'filters.duration.full' },
  { value: '2880', labelKey: 'filters.duration.twoDays' },
  { value: '10080', labelKey: 'filters.duration.multi' },
];

export const SORT_OPTIONS: { value: string; labelKey: TranslationKey }[] = [
  { value: 'popular', labelKey: 'filters.sort.popular' },
  { value: 'rating', labelKey: 'filters.sort.rating' },
  { value: 'distance', labelKey: 'filters.sort.distance' },
  { value: 'newest', labelKey: 'filters.sort.newest' },
  { value: 'name', labelKey: 'filters.sort.name' },
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
  const { t } = useLanguage();

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
        <h2 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
          <T k="filters.title" />
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => router.push(basePath)}
            className="text-xs font-semibold text-terracotta-700 hover:underline"
          >
            <T k="filters.clearAll" params={{ n: activeCount }} />
          </button>
        )}
      </div>

      <FilterGroup label={<T k="filters.sortBy" />}>
        <select
          aria-label={t('filters.sortBy')}
          value={params.get('sort') ?? 'popular'}
          onChange={(e) => setParam('sort', e.target.value === 'popular' ? null : e.target.value)}
          className="input"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label={<T k="filters.difficulty" />}>
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

      <FilterGroup label={<T k="filters.region" />}>
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

      <FilterGroup label={<T k="filters.timeNeeded" />}>
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
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-300">{label}</p>
      {children}
    </div>
  );
}

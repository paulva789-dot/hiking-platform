'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { TrailsOverviewMap } from '@/components/map/LazyMaps';
import type { Difficulty, MapTrail, Region } from '@/lib/types';
import {
  ALL_DIFFICULTIES,
  DIFFICULTY_LABELS,
  DIFFICULTY_MAP_COLOR,
  REGION_LABELS,
  formatDistance,
  formatDuration,
} from '@/lib/format';

export function MapExplorer({ trails }: { trails: MapTrail[] }) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [hovered, setHovered] = useState<string | undefined>();

  const regionsPresent = useMemo(
    () => [...new Set(trails.map((t) => t.region))].sort(),
    [trails]
  );

  const filtered = useMemo(
    () =>
      trails.filter(
        (t) => (!difficulty || t.difficulty === difficulty) && (!region || t.region === region)
      ),
    [trails, difficulty, region]
  );

  return (
    <div className="section grid gap-6 py-8 lg:grid-cols-[1fr_340px]">
      <div className="order-2 lg:order-1">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-300">Difficulty</span>
          {ALL_DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(difficulty === level ? null : level)}
              className={`chip transition-colors ${
                difficulty === level
                  ? 'bg-forest-700 text-white ring-forest-700'
                  : 'bg-white text-basalt-700 dark:bg-basalt-900 dark:text-basalt-300 dark:ring-basalt-700 ring-basalt-300 hover:bg-basalt-100 dark:hover:bg-basalt-800'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: DIFFICULTY_MAP_COLOR[level] }}
                aria-hidden
              />
              {DIFFICULTY_LABELS[level]}
            </button>
          ))}

          <select
            value={region ?? ''}
            onChange={(e) => setRegion((e.target.value || null) as Region | null)}
            aria-label="Filter by region"
            className="input ml-auto w-auto py-1.5 text-xs"
          >
            <option value="">All regions</option>
            {regionsPresent.map((r) => (
              <option key={r} value={r}>
                {REGION_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-basalt-200 shadow-sm">
          {/* Remount on filter change so FitBounds re-zooms to the new selection. */}
          <TrailsOverviewMap
            key={`${difficulty ?? 'all'}-${region ?? 'all'}`}
            trails={filtered}
            activeSlug={hovered}
            height="620px"
          />
        </div>
      </div>

      <aside className="order-1 lg:order-2">
        <p className="mb-3 text-sm text-basalt-600 dark:text-basalt-300">
          <span className="font-semibold text-basalt-900 dark:text-basalt-50">{filtered.length}</span> of {trails.length}{' '}
          destinations shown
        </p>

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

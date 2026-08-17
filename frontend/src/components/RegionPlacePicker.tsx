'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CAMEROON_SITES } from '@/lib/cameroon-sites';
import { ALL_REGIONS, REGION_LABELS } from '@/lib/format';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Region } from '@/lib/types';

/**
 * Region-first trip picker. Every region is visible and clickable at once —
 * not a region select gating a second, initially-disabled place select.
 * Clicking a region reveals its landmarks inline, right there.
 */
export function RegionPlacePicker() {
  const [region, setRegion] = useState<Region | null>(null);
  const { t } = useLanguage();

  const places = useMemo(() => (region ? CAMEROON_SITES.filter((s) => s.regionKey === region) : []), [region]);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cameroon-green">
        <span
          className="h-2 w-3 rounded-[1px] bg-flag-flow-gradient bg-[length:200%_100%] animate-flag-flow"
          aria-hidden
        />
        {t('picker.eyebrow')}
      </div>
      <h2 className="mt-2 font-display text-xl font-semibold text-basalt-900 dark:text-basalt-50">
        {t('picker.title')}
      </h2>
      <p className="mt-1 max-w-lg text-sm text-basalt-600 dark:text-basalt-300">{t('picker.body')}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {ALL_REGIONS.map((r) => {
          const active = region === r;
          const count = CAMEROON_SITES.filter((s) => s.regionKey === r).length;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(active ? null : r)}
              aria-pressed={active}
              className={`rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                active
                  ? 'bg-forest-700 text-white'
                  : 'bg-basalt-50 text-basalt-800 hover:bg-basalt-100 dark:bg-basalt-800 dark:text-basalt-200 dark:hover:bg-basalt-700'
              }`}
            >
              {REGION_LABELS[r]}
              <span
                className={`block font-mono text-[11px] font-normal tabular-nums ${
                  active ? 'text-forest-100' : 'text-basalt-500 dark:text-basalt-400'
                }`}
              >
                {t(count === 1 ? 'picker.siteCount.one' : 'picker.siteCount.other', { n: count })}
              </span>
            </button>
          );
        })}
      </div>

      {region && (
        <div className="mt-4 border-t border-basalt-100 pt-4 dark:border-basalt-800">
          {places.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {places.map((p) => (
                <Link
                  key={p.slug}
                  href={`/sites/${p.slug}`}
                  className="chip bg-forest-50 text-forest-800 ring-forest-200 hover:bg-forest-100 dark:bg-forest-900/40 dark:text-forest-300 dark:ring-forest-800"
                >
                  {p.name} →
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-basalt-600 dark:text-basalt-300">
              {t('picker.noneListed')} {REGION_LABELS[region]} —{' '}
              <Link href={`/trails?region=${region}`} className="font-semibold text-forest-700 hover:underline">
                {t('picker.checkTrails')}
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

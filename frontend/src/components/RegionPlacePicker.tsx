'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CAMEROON_SITES } from '@/lib/cameroon-sites';
import { ALL_REGIONS, REGION_LABELS } from '@/lib/format';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Region } from '@/lib/types';

/** Region-first trip picker. Every option is inside Cameroon — nothing else is on offer. */
export function RegionPlacePicker() {
  const [region, setRegion] = useState<Region | ''>('');
  const [place, setPlace] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  const places = useMemo(
    () => (region ? CAMEROON_SITES.filter((s) => s.regionKey === region) : []),
    [region]
  );

  const goToPlace = () => {
    if (!place) return;
    router.push(`/sites#${place}`);
  };

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

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label htmlFor="picker-region" className="sr-only">
            Region
          </label>
          <select
            id="picker-region"
            className="input"
            value={region}
            onChange={(e) => {
              setRegion(e.target.value as Region | '');
              setPlace('');
            }}
          >
            <option value="">{t('picker.chooseRegion')}</option>
            {ALL_REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="picker-place" className="sr-only">
            Place
          </label>
          <select
            id="picker-place"
            className="input"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            disabled={places.length === 0}
          >
            <option value="">
              {region ? `Place in ${REGION_LABELS[region]}` : t('picker.selectRegionFirst')}
            </option>
            {places.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={goToPlace} disabled={!place} className="btn-primary">
          {t('picker.viewPlace')}
        </button>
      </div>

      {region && places.length === 0 && (
        <p className="mt-3 text-xs text-basalt-500">
          No landmark listed yet for {REGION_LABELS[region]} — check the{' '}
          <a href="/trails" className="font-semibold text-forest-700 hover:underline">
            trails in this region
          </a>{' '}
          instead.
        </p>
      )}
    </div>
  );
}

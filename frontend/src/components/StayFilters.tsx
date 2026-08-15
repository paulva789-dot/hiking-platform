'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ACCOMMODATION_TYPE_LABELS, ALL_ACCOMMODATION_TYPES, ALL_REGIONS, REGION_LABELS } from '@/lib/format';
import type { AccommodationType, Region } from '@/lib/types';

export function StayFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get('type');
  const region = params.get('region');

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/stay?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-300">Type</span>
      <button
        type="button"
        onClick={() => setParam('type', null)}
        className={`chip transition-colors ${
          !type
            ? 'bg-forest-700 text-white ring-forest-700'
            : 'bg-white text-basalt-700 dark:bg-basalt-900 dark:text-basalt-300 dark:ring-basalt-700 ring-basalt-300 hover:bg-basalt-100 dark:hover:bg-basalt-800'
        }`}
      >
        All
      </button>
      {ALL_ACCOMMODATION_TYPES.map((t: AccommodationType) => (
        <button
          key={t}
          type="button"
          onClick={() => setParam('type', type === t ? null : t)}
          className={`chip transition-colors ${
            type === t
              ? 'bg-forest-700 text-white ring-forest-700'
              : 'bg-white text-basalt-700 dark:bg-basalt-900 dark:text-basalt-300 dark:ring-basalt-700 ring-basalt-300 hover:bg-basalt-100 dark:hover:bg-basalt-800'
          }`}
        >
          {ACCOMMODATION_TYPE_LABELS[t]}
        </button>
      ))}

      <select
        value={region ?? ''}
        onChange={(e) => setParam('region', (e.target.value || null) as Region | null)}
        aria-label="Filter by region"
        className="input ml-auto w-auto py-1.5 text-xs"
      >
        <option value="">All regions</option>
        {ALL_REGIONS.map((r) => (
          <option key={r} value={r}>
            {REGION_LABELS[r]}
          </option>
        ))}
      </select>
    </div>
  );
}

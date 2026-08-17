'use client';

import { useEffect, useState } from 'react';
import { api, apiBaseUrl } from '@/lib/api';
import type { AdCreative } from '@/lib/types';

/**
 * Sponsored placement -- GET /content/ads picks a live slot for this
 * placement (weighted random) and records the impression server-side, so
 * fetching this at all is the impression; nothing to track client-side.
 * Renders nothing when there's no live ad for this placement rather than
 * reserving space for one, since slots come and go from the admin console.
 */
export function AdBanner({ placement, className = '' }: { placement: string; className?: string }) {
  const [ad, setAd] = useState<AdCreative | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ ad: AdCreative | null }>('/content/ads', { query: { placement } })
      .then((d) => {
        if (!cancelled) setAd(d.ad);
      })
      .catch(() => {
        if (!cancelled) setAd(null);
      });
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (!ad) return null;

  return (
    <div className={className}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-basalt-500 dark:text-basalt-400">
        Sponsored
      </p>
      <a
        href={`${apiBaseUrl}/content/ads/${ad.id}/click`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block overflow-hidden rounded-xl ring-1 ring-basalt-200 dark:ring-basalt-800"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- partner creative comes from arbitrary hosts */}
        <img src={ad.imageUrl} alt={ad.advertiser} className="w-full object-cover" loading="lazy" />
      </a>
    </div>
  );
}

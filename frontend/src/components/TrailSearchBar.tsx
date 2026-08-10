'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';

interface Props {
  variant?: 'hero' | 'default';
}

function SearchInner({ variant = 'default' }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Preserve any filters already applied on the trails page.
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set('q', q.trim());
    else next.delete('q');
    next.delete('page');
    router.push(`/trails?${next.toString()}`);
  };

  const isHero = variant === 'hero';

  return (
    <form onSubmit={onSubmit} role="search" className="flex gap-2">
      <div className="relative flex-1">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-basalt-600 dark:text-basalt-400"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a trail, peak or town — Mount Cameroon, Buea, waterfall…"
          aria-label="Search trails"
          className={`input pl-11 ${isHero ? 'py-3.5 text-base shadow-lg ring-0' : ''}`}
        />
      </div>
      <button type="submit" className={isHero ? 'btn-accent px-6 py-3.5' : 'btn-primary'}>
        Search
      </button>
    </form>
  );
}

/**
 * useSearchParams opts a route out of static rendering unless it sits under a
 * Suspense boundary, so the boundary lives here rather than in every caller.
 */
export function TrailSearchBar(props: Props) {
  return (
    <Suspense fallback={<div className="skeleton h-11 w-full" />}>
      <SearchInner {...props} />
    </Suspense>
  );
}

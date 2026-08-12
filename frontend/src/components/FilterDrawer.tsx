'use client';

import { useState, type ReactNode } from 'react';

/**
 * Wraps TrailFilters (or anything else) so it behaves as a static sidebar on
 * desktop and a slide-over drawer on mobile — one render, not two: `lg:contents`
 * makes the wrapper disappear from layout entirely at desktop width, so its
 * children just sit in the parent grid like a plain sidebar would.
 */
export function FilterDrawer({ children, activeCount = 0 }: { children: ReactNode; activeCount?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary mb-4 flex items-center gap-2 lg:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="chip bg-forest-700 text-white ring-forest-700">{activeCount}</span>
        )}
      </button>

      <div className={`${open ? 'fixed inset-0 z-[60]' : 'hidden'} lg:static lg:z-auto lg:contents`}>
        <div
          className="absolute inset-0 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
        <div
          className="absolute inset-y-0 left-0 w-full max-w-xs overflow-y-auto bg-white p-5 shadow-xl
                     dark:bg-basalt-900 lg:static lg:w-auto lg:max-w-none lg:overflow-visible lg:bg-transparent
                     lg:p-0 lg:shadow-none dark:lg:bg-transparent"
        >
          <div className="mb-2 flex justify-end lg:hidden">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost px-2" aria-label="Close filters">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

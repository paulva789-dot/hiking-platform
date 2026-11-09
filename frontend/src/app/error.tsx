'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Catches any uncaught error in a page (most often the API being unreachable)
 * and shows a recoverable screen instead of a bare 500.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="section flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl font-semibold text-terracotta-600">Oops</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">
        The trail went quiet for a moment
      </h1>
      <p className="mt-2 max-w-md text-basalt-600 dark:text-basalt-300">
        Something went wrong loading this page — usually a connection hiccup. Try again, or head
        somewhere that works offline.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/trails" className="btn-secondary">
          Browse trails
        </Link>
        <Link href="/map" className="btn-secondary">
          Open the map
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 font-mono text-[11px] text-basalt-500 dark:text-basalt-400">Reference: {error.digest}</p>
      )}
    </div>
  );
}

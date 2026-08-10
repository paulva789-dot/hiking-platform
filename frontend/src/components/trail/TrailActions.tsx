'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui';

/** Save / unsave a trail. Signed-out users are sent to login and back. */
export function FavoriteButton({ trailId, slug }: { trailId: string; slug: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false);

  // The server-rendered page is cached and shared, so favourite state has to be
  // resolved client-side per viewer.
  useEffect(() => {
    if (!user) {
      setChecked(true);
      return;
    }
    let cancelled = false;
    api
      .get<{ favorites: { trail: { id: string } }[] }>('/favorites')
      .then((d) => {
        if (!cancelled) setSaved(d.favorites.some((f) => f.trail.id === trailId));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, trailId]);

  const toggle = async () => {
    if (!user) {
      router.push(`/login?next=/trails/${slug}`);
      return;
    }
    setBusy(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      if (next) await api.post(`/favorites/${trailId}`);
      else await api.delete(`/favorites/${trailId}`);
    } catch {
      setSaved(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy || !checked}
      aria-pressed={saved}
      className={saved ? 'btn-primary' : 'btn-secondary'}
    >
      {busy ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21s-7.5-4.7-9.3-9.2A5.2 5.2 0 0112 6.3a5.2 5.2 0 019.3 5.5C19.5 16.3 12 21 12 21z"
          />
        </svg>
      )}
      {saved ? 'Saved' : 'Save trail'}
    </button>
  );
}

/** Premium perk: download the whole trail as JSON for offline use. */
export function OfflinePackButton({ slug, trailName }: { slug: string; trailName: string }) {
  const { user, isPremium } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    if (!user) {
      router.push(`/login?next=/trails/${slug}`);
      return;
    }
    if (!isPremium) {
      router.push('/premium');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const pack = await api.get<unknown>(`/content/offline-pack/${slug}`);
      const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-offline-pack.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Download failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={() => void download()} disabled={busy} className="btn-secondary w-full">
        {busy ? <Spinner className="h-4 w-4" /> : <span aria-hidden>⬇</span>}
        {isPremium ? 'Download offline pack' : 'Offline pack (Premium)'}
      </button>
      <p className="mt-2 text-xs text-basalt-600 dark:text-basalt-300">
        Route, waypoints, hazards and emergency numbers for {trailName} — on your phone before you
        lose signal.
      </p>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Favorite } from '@/lib/types';
import { TrailCard, TrailCardSkeleton } from '@/components/TrailCard';
import { EmptyState, SectionHeading } from '@/components/ui';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ favorites: Favorite[] }>('/favorites')
      .then((d) => setFavorites(d.favorites))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (trailId: string) => {
    setRemoving(trailId);
    try {
      await api.delete(`/favorites/${trailId}`);
      setFavorites((prev) => prev.filter((f) => f.trail.id !== trailId));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div>
      <SectionHeading
        title="Saved trails"
        description="Everything you have saved. Premium safety alerts watch these trails for permit changes, closures and advisories."
      />

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <TrailCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          message="Tap Save on any trail page and it will appear here."
          action={{ href: '/trails', label: 'Browse trails' }}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <div key={fav.id} className="relative">
              <TrailCard trail={fav.trail} />
              <button
                type="button"
                onClick={() => void remove(fav.trail.id)}
                disabled={removing === fav.trail.id}
                aria-label={`Remove ${fav.trail.name} from saved trails`}
                className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-basalt-600 shadow hover:bg-red-50 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

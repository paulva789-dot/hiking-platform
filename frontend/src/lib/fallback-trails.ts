import type { Difficulty, Pagination, Region, Trail, TrailCard } from './types';
import cards from './trail-cards.fallback.json';
import details from './trail-details.fallback.json';

/**
 * Bundled copy of the seeded trails (regenerate from backend/prisma/trails.data.js
 * when that file changes). Used only when the API is unreachable, so the site
 * still shows real trails instead of empty sections.
 */
export const FALLBACK_TRAILS = cards as TrailCard[];

interface FallbackQuery {
  q?: string;
  region?: string;
  difficulty?: string;
  maxDurationMinutes?: string;
  sort?: string;
  page?: string;
  limit?: number;
}

/** Mirrors the /trails endpoint's filtering, sorting and pagination closely enough for an offline view. */
export function fallbackTrailList(query: FallbackQuery = {}): { trails: TrailCard[]; pagination: Pagination } {
  const q = query.q?.trim().toLowerCase();
  const maxMinutes = query.maxDurationMinutes ? Number(query.maxDurationMinutes) : undefined;

  let list = FALLBACK_TRAILS.filter(
    (t) =>
      (!query.region || t.region === (query.region as Region)) &&
      (!query.difficulty || t.difficulty === (query.difficulty as Difficulty)) &&
      (!maxMinutes || t.durationMinutes <= maxMinutes) &&
      (!q || `${t.name} ${t.summary} ${t.nearestTown}`.toLowerCase().includes(q))
  );

  switch (query.sort) {
    case 'distance':
      list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
      break;
    case 'name':
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // No view/rating data offline, so popular/rating/newest show the highest peaks first.
      list = [...list].sort((a, b) => (b.summitM ?? 0) - (a.summitM ?? 0));
  }

  const limit = query.limit ?? 12;
  const page = Math.max(1, Number(query.page) || 1);
  const pages = Math.max(1, Math.ceil(list.length / limit));
  return {
    trails: list.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total: list.length, pages },
  };
}

/** Full trail record from the bundled seed data, shaped like the /trails/:slug response. */
export function fallbackTrailDetail(slug: string) {
  const trail = (details as unknown as Trail[]).find((t) => t.slug === slug);
  if (!trail) return null;
  return {
    trail,
    isFavorite: false,
    myReviewId: null,
    ratingBreakdown: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0 })),
  };
}

/** Up to three other trails, same region first, for the "nearby" rail. */
export function fallbackNearby(slug: string): TrailCard[] {
  const current = FALLBACK_TRAILS.find((t) => t.slug === slug);
  return FALLBACK_TRAILS.filter((t) => t.slug !== slug)
    .sort((a, b) => Number(b.region === current?.region) - Number(a.region === current?.region))
    .slice(0, 3);
}

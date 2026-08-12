import type { Difficulty, Region, TrailCategory } from './types';

/**
 * Guides and tours are not limited to Cameroon — bookings can cover any of
 * these Central African (ECCAS/CEMAC) countries. Trail content stays
 * Cameroon-only, since that's the only country we have real, checked route
 * data for.
 */
export const CENTRAL_AFRICA_COUNTRIES = [
  'Cameroon',
  'Gabon',
  'Republic of the Congo',
  'Democratic Republic of the Congo',
  'Central African Republic',
  'Equatorial Guinea',
  'Chad',
  'São Tomé and Príncipe',
] as const;

export type CentralAfricaCountry = (typeof CENTRAL_AFRICA_COUNTRIES)[number];

export const REGION_LABELS: Record<Region, string> = {
  ADAMAWA: 'Adamawa',
  CENTRE: 'Centre',
  EAST: 'East',
  FAR_NORTH: 'Far North',
  LITTORAL: 'Littoral',
  NORTH: 'North',
  NORTH_WEST: 'North-West',
  SOUTH: 'South',
  SOUTH_WEST: 'South-West',
  WEST: 'West',
};

export const ALL_REGIONS = Object.keys(REGION_LABELS) as Region[];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: 'Easy',
  MODERATE: 'Moderate',
  HARD: 'Hard',
  EXPERT: 'Expert',
};

export const ALL_DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as Difficulty[];

/** What each rating actually commits to — mirrored in the safety guidelines. */
export const DIFFICULTY_MEANING: Record<Difficulty, string> = {
  EASY: 'Under 4 hours on a clear path. Fine for a first hike.',
  MODERATE: 'Half to full day with real climbing. Needs basic fitness.',
  HARD: 'Long day, sustained steep ground. Build up to it.',
  EXPERT: 'Multi-day, high altitude or big-game country. Consequences if it goes wrong.',
};

export const DIFFICULTY_CLASSES: Record<Difficulty, string> = {
  EASY: 'bg-forest-100 text-forest-800 ring-forest-200',
  MODERATE: 'bg-sky-100 text-sky-900 ring-sky-200',
  HARD: 'bg-plum-100 text-plum-800 ring-plum-200',
  EXPERT: 'bg-red-100 text-red-900 ring-red-200',
};

/**
 * Map/legend colours per difficulty. Moderate uses blue rather than orange —
 * it reads clearly next to the green Easy dot and doesn't fight the
 * red/plum Hard and Expert tones (and matches the familiar
 * green/blue/black ski-run difficulty convention).
 */
export const DIFFICULTY_MAP_COLOR: Record<Difficulty, string> = {
  EASY: '#3a7f5d',
  MODERATE: '#0369a1',
  HARD: '#8f4a68',
  EXPERT: '#991b1b',
};

export const CATEGORY_LABELS: Record<TrailCategory, string> = {
  SUMMIT: 'Summit',
  WATERFALL: 'Waterfall',
  LAKE: 'Lake',
  FOREST: 'Forest walk',
  WILDLIFE: 'Wildlife',
  COASTAL: 'Coastal',
  CULTURAL: 'Cultural walk',
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as TrailCategory[];

/** 165000 -> "165,000 XAF". CFA francs have no subunit, so never show decimals. */
export const formatXAF = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '—';
  return `${new Intl.NumberFormat('en-US').format(Math.round(amount))} XAF`;
};

export const formatCompactXAF = (amount: number) => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M XAF`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k XAF`;
  return `${amount} XAF`;
};

/** 2880 -> "2 days"; 480 -> "8 h"; 150 -> "2 h 30". */
export const formatDuration = (minutes: number) => {
  if (minutes >= 1440) {
    const days = Math.round(minutes / 1440);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  return mins === 0 ? `${hours} h` : `${hours} h ${mins}`;
};

export const formatDistance = (km: number) =>
  km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;

export const formatDate = (iso: string | Date | null | undefined) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateRange = (start: string, end: string) => {
  const a = new Date(start);
  const b = new Date(end);
  if (a.toDateString() === b.toDateString()) return formatDate(start);
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  return sameMonth
    ? `${a.getDate()}–${formatDate(end)}`
    : `${formatDate(start)} – ${formatDate(end)}`;
};

export const formatTimeFromUnix = (seconds: number) =>
  new Date(seconds * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

export const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/[\s_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/** Fallback cover so an unillustrated trail card never renders as a hole. */
export const trailFallbackImage = (difficulty: Difficulty) => {
  const tint = { EASY: '3a7f5d', MODERATE: '0369a1', HARD: '8f4a68', EXPERT: '991b1b' }[difficulty];
  return `https://placehold.co/800x600/${tint}/ffffff?text=Trek+Cameroon`;
};

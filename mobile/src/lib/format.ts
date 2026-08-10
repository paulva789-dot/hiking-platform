import type { Difficulty, Region } from './types';

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

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  EASY: '#3a7f5d',
  MODERATE: '#d97706',
  HARD: '#c74a2c',
  EXPERT: '#991b1b',
};

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

export const formatXAF = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '—';
  return `${new Intl.NumberFormat('en-US').format(Math.round(amount))} XAF`;
};

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

export const formatDistance = (km: number) => (km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`);

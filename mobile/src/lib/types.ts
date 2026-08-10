// Trimmed mirror of frontend/src/lib/types.ts — only what the mobile screens use.

export type Role = 'USER' | 'GUIDE' | 'ADMIN';
export type Difficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';
export type MembershipTier = 'FREE' | 'PREMIUM';

export type Region =
  | 'ADAMAWA'
  | 'CENTRE'
  | 'EAST'
  | 'FAR_NORTH'
  | 'LITTORAL'
  | 'NORTH'
  | 'NORTH_WEST'
  | 'SOUTH'
  | 'SOUTH_WEST'
  | 'WEST';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  tier: MembershipTier;
  tierExpires: string | null;
}

export interface TrailCard {
  id: string;
  slug: string;
  name: string;
  summary: string;
  region: Region;
  nearestTown: string;
  difficulty: Difficulty;
  distanceKm: number;
  elevationGainM: number;
  durationMinutes: number;
  summitM: number | null;
  startLat: number;
  startLng: number;
  coverImage: string | null;
  ratingAvg: number;
  ratingCount: number;
  permitRequired: boolean;
}

export interface Waypoint {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  elevationM: number | null;
  order: number;
}

export interface Trail extends TrailCard {
  description: string;
  bestMonths: string[];
  hazards: string[];
  waterSources: string | null;
  permitInfo: string | null;
  gettingThere: string | null;
  waypoints: Waypoint[];
}

export interface GuideCard {
  id: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  languages: string[];
  regions: Region[];
  countries: string[];
  dayRateXAF: number;
  ratingAvg: number;
  ratingCount: number;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

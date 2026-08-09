import { z } from 'zod';

export const REGIONS = [
  'ADAMAWA',
  'CENTRE',
  'EAST',
  'FAR_NORTH',
  'LITTORAL',
  'NORTH',
  'NORTH_WEST',
  'SOUTH',
  'SOUTH_WEST',
  'WEST',
];

export const DIFFICULTIES = ['EASY', 'MODERATE', 'HARD', 'EXPERT'];

/**
 * Guides and tours are not limited to Cameroon — bookings can cover any of
 * these Central African (ECCAS/CEMAC) countries. Trail content stays
 * Cameroon-only.
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
];

export const regionEnum = z.enum(REGIONS);
export const difficultyEnum = z.enum(DIFFICULTIES);
export const countryEnum = z.enum(CENTRAL_AFRICA_COUNTRIES);

export const cuid = z.string().min(1);

/** Query-string helpers: everything arrives as a string, so coerce. */
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(12),
});

export const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number');

// ------------------------------------------------------------------ auth

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: strongPassword,
  phone: z.string().trim().max(30).optional(),
  region: regionEnum.optional(),
  // Someone signing up as a guide still lands in the PENDING queue.
  asGuide: z.boolean().optional().default(false),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(1000).optional(),
  phone: z.string().trim().max(30).optional(),
  region: regionEnum.optional(),
  avatarUrl: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: strongPassword,
});

// ------------------------------------------------------------------ trails

const geoJsonLineString = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(z.tuple([z.number(), z.number()])).min(2),
});

export const trailSearchQuery = paginationQuery.extend({
  q: z.string().trim().max(120).optional(),
  region: regionEnum.optional(),
  difficulty: difficultyEnum.optional(),
  minDistance: z.coerce.number().min(0).optional(),
  maxDistance: z.coerce.number().min(0).optional(),
  maxDurationMinutes: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['popular', 'rating', 'newest', 'distance', 'name']).default('popular'),
});

export const trailWriteSchema = z.object({
  name: z.string().trim().min(3).max(140),
  summary: z.string().trim().min(10).max(300),
  description: z.string().trim().min(30),
  region: regionEnum,
  nearestTown: z.string().trim().min(2).max(120),
  difficulty: difficultyEnum,
  distanceKm: z.coerce.number().positive().max(500),
  elevationGainM: z.coerce.number().int().min(0).max(9000),
  durationMinutes: z.coerce.number().int().min(15).max(20160),
  summitM: z.coerce.number().int().min(0).max(9000).nullish(),
  startLat: z.coerce.number().min(-90).max(90),
  startLng: z.coerce.number().min(-180).max(180),
  routeGeoJson: geoJsonLineString.nullish(),
  bestMonths: z.array(z.string().trim()).max(12).default([]),
  hazards: z.array(z.string().trim()).max(20).default([]),
  waterSources: z.string().trim().max(600).nullish(),
  permitRequired: z.boolean().default(false),
  permitInfo: z.string().trim().max(600).nullish(),
  gettingThere: z.string().trim().max(2000).nullish(),
  coverImage: z.string().url().nullish(),
  published: z.boolean().default(true),
});

export const waypointSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(600).nullish(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  elevationM: z.coerce.number().int().min(0).max(9000).nullish(),
  order: z.coerce.number().int().min(0).default(0),
});

// ------------------------------------------------------------------ reviews

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(140),
  body: z.string().trim().min(20).max(4000),
  hikedOn: z.coerce.date().max(new Date(), 'You cannot review a future hike').optional(),
});

// ------------------------------------------------------------------ photos

export const photoMetaSchema = z.object({
  trailId: cuid.optional(),
  caption: z.string().trim().max(300).optional(),
  takenAt: z.coerce.date().optional(),
  forSale: z.coerce.boolean().default(false),
  priceXAF: z.coerce.number().int().min(500).max(5_000_000).optional(),
  licence: z.string().trim().max(120).optional(),
});

// ------------------------------------------------------------------ guides

export const guideProfileSchema = z.object({
  headline: z.string().trim().min(10).max(160),
  bio: z.string().trim().min(50).max(4000),
  yearsExperience: z.coerce.number().int().min(0).max(70),
  languages: z.array(z.string().trim()).min(1).max(10),
  certifications: z.array(z.string().trim()).max(15).default([]),
  regions: z.array(regionEnum).min(1).max(10),
  countries: z.array(countryEnum).min(1).max(CENTRAL_AFRICA_COUNTRIES.length).default(['Cameroon']),
  dayRateXAF: z.coerce.number().int().min(0).max(10_000_000),
  phone: z.string().trim().max(30).optional(),
  whatsapp: z.string().trim().max(30).optional(),
});

// ------------------------------------------------------------------ tours & bookings

export const tourSchema = z.object({
  trailId: cuid.nullish(),
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(30).max(6000),
  country: countryEnum.default('Cameroon'),
  priceXAF: z.coerce.number().int().min(0).max(50_000_000),
  maxGroupSize: z.coerce.number().int().min(1).max(60),
  durationDays: z.coerce.number().int().min(1).max(30),
  includes: z.array(z.string().trim()).max(25).default([]),
  excludes: z.array(z.string().trim()).max(25).default([]),
  meetingPoint: z.string().trim().max(300).nullish(),
  published: z.boolean().default(true),
});

export const scheduleSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    capacity: z.coerce.number().int().min(1).max(60),
  })
  .refine((s) => s.endDate >= s.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  });

export const bookingSchema = z.object({
  scheduleId: cuid,
  participants: z.coerce.number().int().min(1).max(60),
  contactPhone: z.string().trim().min(6).max(30),
  notes: z.string().trim().max(1000).optional(),
});

// ------------------------------------------------------------------ groups

export const groupSchema = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(3000),
  region: regionEnum.nullish(),
  coverImage: z.string().url().nullish(),
  isPrivate: z.boolean().default(false),
});

// ------------------------------------------------------------------ payments

/** Cameroonian MSISDN — accepts +237, 237 or local 6XXXXXXXX/2XXXXXXXX forms. */
export const cameroonPhone = z
  .string()
  .trim()
  .regex(/^(\+?237)?[62]\d{8}$/, 'Enter a valid Cameroon phone number, e.g. 6XXXXXXXX');

const premiumInitiateSchema = z.object({
  purpose: z.literal('PREMIUM_MEMBERSHIP'),
  months: z.coerce.number().int().refine((m) => [1, 6, 12].includes(m), {
    message: 'months must be 1, 6 or 12',
  }),
  provider: z.enum(['FLUTTERWAVE', 'INTOUCH']),
  method: z.enum(['MTN_MOMO', 'ORANGE_MONEY']),
  phone: cameroonPhone,
});

const guidePlanInitiateSchema = z.object({
  purpose: z.literal('GUIDE_PLAN'),
  guidePlan: z.enum(['BASIC', 'PRO']),
  months: z.coerce.number().int().min(1).max(24),
  provider: z.enum(['FLUTTERWAVE', 'INTOUCH']),
  method: z.enum(['MTN_MOMO', 'ORANGE_MONEY']),
  phone: cameroonPhone,
});

export const paymentInitiateSchema = z.discriminatedUnion('purpose', [
  premiumInitiateSchema,
  guidePlanInitiateSchema,
]);

// ------------------------------------------------------------------ weather

export const weatherQuery = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

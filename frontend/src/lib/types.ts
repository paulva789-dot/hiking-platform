export type Role = 'USER' | 'GUIDE' | 'ADMIN';
export type Difficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';
export type TrailCategory = 'SUMMIT' | 'WATERFALL' | 'LAKE' | 'FOREST' | 'WILDLIFE' | 'COASTAL' | 'CULTURAL';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'REFUND_PENDING';
export type MembershipTier = 'FREE' | 'PREMIUM';
export type GuidePlan = 'NONE' | 'BASIC' | 'PRO';

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
  bio: string | null;
  phone: string | null;
  region: Region | null;
  tier: MembershipTier;
  tierExpires: string | null;
  createdAt: string;
}

export interface UserRef {
  id: string;
  name: string;
  avatarUrl: string | null;
  region?: Region | null;
}

export interface RegionalExpert {
  region: Region;
  expert: (UserRef & { score: number }) | null;
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

export interface TrailCard {
  id: string;
  slug: string;
  name: string;
  summary: string;
  region: Region;
  nearestTown: string;
  difficulty: Difficulty;
  category: TrailCategory;
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
  /** Present on admin responses; public listings only ever return published trails. */
  published?: boolean;
}

export interface RouteGeoJson {
  type: 'LineString';
  coordinates: [number, number][];
}

export type ContentLocale = 'FR' | 'ES' | 'PT';

/** Every field optional and independently falls back to the English Trail
 * field it mirrors -- a partial translation (e.g. hazards done, gettingThere
 * not yet) still renders correctly rather than needing to be all-or-nothing. */
export interface TrailTranslation {
  locale: ContentLocale;
  summary: string | null;
  description: string | null;
  hazards: string[];
  waterSources: string | null;
  permitInfo: string | null;
  gettingThere: string | null;
}

export interface Trail extends TrailCard {
  description: string;
  routeGeoJson: RouteGeoJson | null;
  bestMonths: string[];
  hazards: string[];
  waterSources: string | null;
  permitInfo: string | null;
  gettingThere: string | null;
  viewCount: number;
  waypoints: Waypoint[];
  photos: GalleryPhoto[];
  reviews: Review[];
  tours: TourSummary[];
  translations: TrailTranslation[];
  _count: { reviews: number; favorites: number };
}

export interface MapTrail {
  id: string;
  slug: string;
  name: string;
  region: Region;
  difficulty: Difficulty;
  category: TrailCategory;
  distanceKm: number;
  durationMinutes: number;
  startLat: number;
  startLng: number;
  coverImage: string | null;
  ratingAvg: number;
  ratingCount: number;
  viewCount: number;
  createdAt: string;
  routeGeoJson: RouteGeoJson | null;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  hikedOn: string | null;
  status: ApprovalStatus;
  createdAt: string;
  user: UserRef;
  trail?: { id: string; slug: string; name: string; coverImage?: string | null };
}

export interface GalleryPhoto {
  id: string;
  url: string;
  width?: number | null;
  height?: number | null;
  caption: string | null;
  takenAt?: string | null;
  forSale: boolean;
  priceXAF: number | null;
  licence?: string | null;
  status?: ApprovalStatus;
  createdAt?: string;
  user: UserRef;
  trail?: { id: string; slug: string; name: string; region?: Region } | null;
}

export interface Favorite {
  id: string;
  createdAt: string;
  trail: TrailCard;
}

export interface GuideCard {
  id: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  languages: string[];
  certifications: string[];
  regions: Region[];
  /** Central African countries this guide runs tours in — not limited to Cameroon. */
  countries: string[];
  dayRateXAF: number;
  ratingAvg: number;
  ratingCount: number;
  plan: GuidePlan;
  user: UserRef;
  _count?: { tours: number };
}

export interface GuideProfile extends GuideCard {
  status: ApprovalStatus;
  planExpires: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  phone: string | null;
  whatsapp: string | null;
  createdAt: string;
  tours?: Tour[];
}

export interface TourSchedule {
  id: string;
  startDate: string;
  endDate: string;
  capacity: number;
  seatsBooked: number;
  cancelled: boolean;
  seatsLeft?: number;
}

export interface TourSummary {
  id: string;
  title: string;
  description: string;
  /** Which CEMAC country this specific tour runs in — defaults to Cameroon. */
  country: string;
  priceXAF: number;
  maxGroupSize: number;
  durationDays: number;
  includes: string[];
  excludes: string[];
  meetingPoint: string | null;
  published: boolean;
  guide: Partial<GuideCard> & { user: { name: string; avatarUrl: string | null } };
  schedules: TourSchedule[];
}

export interface Tour extends TourSummary {
  trailId: string | null;
  trail?: { id: string; slug: string; name: string; region?: Region; difficulty?: Difficulty } | null;
  _count?: { bookings: number };
}

export interface Booking {
  id: string;
  reference: string;
  participants: number;
  subtotalXAF: number;
  commissionXAF: number;
  totalXAF: number;
  /** Charged via MTN MoMo / Orange Money at booking time. */
  depositXAF: number;
  /** Paid in cash to the guide at the trailhead. */
  balanceDueXAF: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  contactPhone: string | null;
  notes: string | null;
  createdAt: string;
  tour: {
    id: string;
    title: string;
    durationDays?: number;
    meetingPoint?: string | null;
    trail?: { slug: string; name: string; coverImage: string | null; region: Region } | null;
    guide?: { id: string; phone: string | null; whatsapp: string | null; user: { name: string } };
  };
  schedule: { startDate: string; endDate: string; cancelled?: boolean };
  user?: { id: string; name: string; email: string; phone?: string | null; avatarUrl?: string | null };
}

export interface HikingGroup {
  id: string;
  slug: string;
  name: string;
  description: string;
  region: Region | null;
  coverImage: string | null;
  isPrivate: boolean;
  createdAt: string;
  owner: UserRef;
  myRole: 'OWNER' | 'MODERATOR' | 'MEMBER' | null;
  _count: { members: number };
  members?: { id: string; role: string; joinedAt: string; user: UserRef }[];
}

export interface SafetyCategory {
  category: string;
  items: { id: string; title: string; body: string; order: number }[];
}

export type AccommodationType = 'CAMPSITE' | 'GUESTHOUSE' | 'LODGE' | 'HOMESTAY' | 'HOTEL';

export interface Listing {
  id: string;
  kind: 'ACCOMMODATION' | 'EQUIPMENT';
  accommodationType?: AccommodationType | null;
  name: string;
  description: string;
  imageUrl: string | null;
  region: Region | null;
  town: string | null;
  priceFromXAF: number | null;
  partnerName: string | null;
  featured: boolean;
  /** Admin responses include the unpublished rows too. */
  published?: boolean;
}

export interface HikingEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  region: Region | null;
  location: string;
  startDate: string;
  endDate: string;
  priceXAF: number;
  capacity: number;
  ticketsSold: number;
  /** Computed by the API; absent on the admin listing, which returns raw rows. */
  ticketsLeft: number;
  coverImage: string | null;
  published?: boolean;
}

export interface EventTicket {
  id: string;
  reference: string;
  quantity: number;
  totalXAF: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  event: { slug: string; title: string; startDate: string; location: string; coverImage: string | null };
}

export interface WeatherDay {
  date: string;
  minC: number;
  maxC: number;
  rainMm: number;
  icon: string;
  condition: string;
}

export interface Weather {
  location: string;
  current: {
    tempC: number;
    feelsLikeC: number;
    humidity: number;
    windMs: number;
    visibilityM: number | null;
    condition: string;
    description: string;
    icon: string;
    sunrise: number;
    sunset: number;
  };
  advice: { level: 'good' | 'caution' | 'danger'; message: string };
  daily: WeatherDay[];
  fetchedAt: string;
  cached?: boolean;
}

// ------------------------------------------------------------ payments

export type PaymentProvider = 'FLUTTERWAVE' | 'INTOUCH';
export type PaymentMethod = 'MTN_MOMO' | 'ORANGE_MONEY';
export type PaymentAttemptStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED';

export interface PaymentInitiateResponse {
  reference: string;
  status: PaymentAttemptStatus;
  amountXAF: number;
  instructions: string;
}

export interface PaymentStatusResponse {
  reference: string;
  status: PaymentAttemptStatus;
  amountXAF: number;
  purpose: 'PREMIUM_MEMBERSHIP' | 'GUIDE_PLAN' | 'BOOKING';
  failureReason: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Analytics {
  overview: {
    users: number;
    newUsersLast30Days: number;
    premiumUsers: number;
    approvedGuides: number;
    pendingGuides: number;
    trails: number;
    reviews: number;
    pendingPhotos: number;
    groups: number;
  };
  bookings: {
    byStatus: { status: BookingStatus; count: number }[];
    paidCount: number;
    grossVolumeXAF: number;
    depositsCollectedXAF: number;
    commissionEarnedXAF: number;
    last30Days: { grossVolumeXAF: number; depositsCollectedXAF: number; commissionEarnedXAF: number };
    commissionPct: number;
    depositPct: number;
  };
  revenueStreams: {
    bookingCommissionXAF: number;
    eventTicketsXAF: number;
    affiliateClicks: number;
    adImpressions: number;
    adClicks: number;
  };
  trailsByRegion: { region: Region; count: number }[];
  trailsByDifficulty: { difficulty: Difficulty; count: number }[];
  topTrails: {
    id: string;
    slug: string;
    name: string;
    region: Region;
    viewCount: number;
    ratingAvg: number;
    ratingCount: number;
    _count: { favorites: number };
  }[];
  topGuides: {
    id: string;
    ratingAvg: number;
    ratingCount: number;
    plan: GuidePlan;
    user: { name: string; avatarUrl: string | null };
    _count: { tours: number };
  }[];
}

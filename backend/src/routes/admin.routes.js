import { Router } from 'express';
import slugify from 'slugify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { config } from '../config.js';
import { asyncHandler, badRequest, notFound } from '../lib/errors.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  paginationQuery,
  regionEnum,
  trailWriteSchema,
  waypointSchema,
} from '../lib/schemas.js';
import { refreshTrailRating } from './review.routes.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

// ------------------------------------------------------- analytics

/** GET /api/admin/analytics — the numbers the dashboard charts. */
router.get(
  '/analytics',
  asyncHandler(async (_req, res) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      users,
      newUsers,
      premiumUsers,
      guides,
      pendingGuides,
      trails,
      reviews,
      pendingPhotos,
      groups,
      bookings,
      revenue,
      recentRevenue,
      byRegion,
      byDifficulty,
      topTrails,
      topGuides,
      listingClicks,
      adStats,
      ticketRevenue,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { tier: 'PREMIUM' } }),
      prisma.guideProfile.count({ where: { status: 'APPROVED' } }),
      prisma.guideProfile.count({ where: { status: 'PENDING' } }),
      prisma.trail.count(),
      prisma.review.count(),
      prisma.photo.count({ where: { status: 'PENDING' } }),
      prisma.hikingGroup.count(),
      prisma.booking.groupBy({ by: ['status'], _count: true }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalXAF: true, depositXAF: true, commissionXAF: true },
        _count: true,
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: thirtyDaysAgo } },
        _sum: { totalXAF: true, depositXAF: true, commissionXAF: true },
      }),
      prisma.trail.groupBy({ by: ['region'], _count: true }),
      prisma.trail.groupBy({ by: ['difficulty'], _count: true }),
      prisma.trail.findMany({
        orderBy: { viewCount: 'desc' },
        take: 8,
        select: {
          id: true,
          slug: true,
          name: true,
          region: true,
          viewCount: true,
          ratingAvg: true,
          ratingCount: true,
          _count: { select: { favorites: true } },
        },
      }),
      prisma.guideProfile.findMany({
        where: { status: 'APPROVED' },
        orderBy: { ratingAvg: 'desc' },
        take: 5,
        select: {
          id: true,
          ratingAvg: true,
          ratingCount: true,
          plan: true,
          user: { select: { name: true, avatarUrl: true } },
          _count: { select: { tours: true } },
        },
      }),
      prisma.listing.aggregate({ _sum: { clickCount: true } }),
      prisma.adSlot.aggregate({ _sum: { impressions: true, clicks: true } }),
      prisma.eventTicket.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalXAF: true } }),
    ]);

    res.json({
      overview: {
        users,
        newUsersLast30Days: newUsers,
        premiumUsers,
        approvedGuides: guides,
        pendingGuides,
        trails,
        reviews,
        pendingPhotos,
        groups,
      },
      bookings: {
        byStatus: bookings.map((b) => ({ status: b.status, count: b._count })),
        paidCount: revenue._count,
        grossVolumeXAF: revenue._sum.totalXAF ?? 0,
        // Deposits are the only booking money that actually moves through the
        // platform -- the rest is settled in cash at the trailhead, so this
        // (not grossVolumeXAF) is the real cash-flow figure.
        depositsCollectedXAF: revenue._sum.depositXAF ?? 0,
        commissionEarnedXAF: revenue._sum.commissionXAF ?? 0,
        last30Days: {
          grossVolumeXAF: recentRevenue._sum.totalXAF ?? 0,
          depositsCollectedXAF: recentRevenue._sum.depositXAF ?? 0,
          commissionEarnedXAF: recentRevenue._sum.commissionXAF ?? 0,
        },
        commissionPct: config.commission.booking,
        depositPct: config.booking.depositPct,
      },
      revenueStreams: {
        bookingCommissionXAF: revenue._sum.commissionXAF ?? 0,
        eventTicketsXAF: ticketRevenue._sum.totalXAF ?? 0,
        affiliateClicks: listingClicks._sum.clickCount ?? 0,
        adImpressions: adStats._sum.impressions ?? 0,
        adClicks: adStats._sum.clicks ?? 0,
      },
      trailsByRegion: byRegion.map((r) => ({ region: r.region, count: r._count })),
      trailsByDifficulty: byDifficulty.map((d) => ({ difficulty: d.difficulty, count: d._count })),
      topTrails,
      topGuides,
    });
  })
);

// ------------------------------------------------------- trail management

/** GET /api/admin/trails — includes unpublished drafts. */
router.get(
  '/trails',
  validate(paginationQuery.extend({ q: z.string().optional(), region: regionEnum.optional() }), 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, q, region } = req.query;
    const where = {};
    if (region) where.region = region;
    if (q) where.name = { contains: q, mode: 'insensitive' };

    const [total, trails] = await prisma.$transaction([
      prisma.trail.count({ where }),
      prisma.trail.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { reviews: true, favorites: true, waypoints: true, tours: true } } },
      }),
    ]);

    res.json({ trails, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
  })
);

const uniqueSlug = async (name, excludeId) => {
  const base = slugify(name, { lower: true, strict: true }).slice(0, 70) || 'trail';
  let slug = base;
  let n = 2;
  // Loop rather than blindly suffixing, so re-saving a trail keeps its URL.
  while (true) {
    const clash = await prisma.trail.findUnique({ where: { slug }, select: { id: true } });
    if (!clash || clash.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
};

/** POST /api/admin/trails */
router.post(
  '/trails',
  validate(trailWriteSchema),
  asyncHandler(async (req, res) => {
    const trail = await prisma.trail.create({
      data: { ...req.body, slug: await uniqueSlug(req.body.name) },
    });
    res.status(201).json({ trail });
  })
);

/** PATCH /api/admin/trails/:id */
router.patch(
  '/trails/:id',
  validate(trailWriteSchema.partial()),
  asyncHandler(async (req, res) => {
    const existing = await prisma.trail.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Trail not found');

    const data = { ...req.body };
    if (req.body.name && req.body.name !== existing.name) {
      data.slug = await uniqueSlug(req.body.name, existing.id);
    }

    const trail = await prisma.trail.update({ where: { id: existing.id }, data });
    res.json({ trail });
  })
);

/** DELETE /api/admin/trails/:id */
router.delete(
  '/trails/:id',
  asyncHandler(async (req, res) => {
    const liveBookings = await prisma.booking.count({
      where: { tour: { trailId: req.params.id }, status: { in: ['PENDING', 'CONFIRMED'] } },
    });
    if (liveBookings > 0) {
      throw badRequest(`${liveBookings} active booking(s) reference this trail. Unpublish it instead.`);
    }

    await prisma.trail.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

/** PUT /api/admin/trails/:id/waypoints — replaces the whole ordered set. */
router.put(
  '/trails/:id/waypoints',
  validate(z.object({ waypoints: z.array(waypointSchema).max(80) })),
  asyncHandler(async (req, res) => {
    const trail = await prisma.trail.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!trail) throw notFound('Trail not found');

    const waypoints = await prisma.$transaction(async (tx) => {
      await tx.waypoint.deleteMany({ where: { trailId: trail.id } });
      await tx.waypoint.createMany({
        data: req.body.waypoints.map((w, i) => ({ ...w, trailId: trail.id, order: w.order ?? i })),
      });
      return tx.waypoint.findMany({ where: { trailId: trail.id }, orderBy: { order: 'asc' } });
    });

    res.json({ waypoints });
  })
);

// ------------------------------------------------------- guide approval

/** GET /api/admin/guides?status=PENDING */
router.get(
  '/guides',
  validate(z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional() }), 'query'),
  asyncHandler(async (req, res) => {
    const guides = await prisma.guideProfile.findMany({
      where: req.query.status ? { status: req.query.status } : {},
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, createdAt: true } },
        _count: { select: { tours: true } },
      },
    });
    res.json({ guides });
  })
);

/** PATCH /api/admin/guides/:id/status */
router.patch(
  '/guides/:id/status',
  validate(
    z.object({
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
      reviewNote: z.string().trim().max(1000).optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    const guide = await prisma.guideProfile.update({
      where: { id: req.params.id },
      data: { ...req.body, reviewedAt: new Date() },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Rejecting a guide must also pull their tours out of the public listing.
    if (req.body.status === 'REJECTED') {
      await prisma.tour.updateMany({ where: { guideId: guide.id }, data: { published: false } });
    }

    res.json({ guide });
  })
);

// ------------------------------------------------------- moderation

/** GET /api/admin/photos?status=PENDING */
router.get(
  '/photos',
  validate(z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING') }), 'query'),
  asyncHandler(async (req, res) => {
    const photos = await prisma.photo.findMany({
      where: { status: req.query.status },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        trail: { select: { id: true, name: true, slug: true } },
      },
    });
    res.json({ photos });
  })
);

/** PATCH /api/admin/photos/:id/status */
router.patch(
  '/photos/:id/status',
  validate(z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']) })),
  asyncHandler(async (req, res) => {
    const photo = await prisma.photo.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json({ photo });
  })
);

/** GET /api/admin/reviews — newest first, for spot checks. */
router.get(
  '/reviews',
  validate(paginationQuery, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const [total, reviews] = await prisma.$transaction([
      prisma.review.count(),
      prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          trail: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);
    res.json({ reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
  })
);

/** PATCH /api/admin/reviews/:id/status */
router.patch(
  '/reviews/:id/status',
  validate(z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']) })),
  asyncHandler(async (req, res) => {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    await refreshTrailRating(review.trailId);
    res.json({ review });
  })
);

// ------------------------------------------------------- bookings

/** GET /api/admin/bookings */
router.get(
  '/bookings',
  validate(
    paginationQuery.extend({
      status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
    }),
    'query'
  ),
  asyncHandler(async (req, res) => {
    const { page, limit, status } = req.query;
    const where = status ? { status } : {};

    const [total, bookings] = await prisma.$transaction([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          tour: {
            select: { id: true, title: true, guide: { select: { user: { select: { name: true } } } } },
          },
          schedule: { select: { startDate: true, endDate: true } },
        },
      }),
    ]);

    res.json({ bookings, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
  })
);

// ------------------------------------------------------- group / corporate inquiries

/** GET /api/admin/group-inquiries */
router.get(
  '/group-inquiries',
  validate(
    paginationQuery.extend({ status: z.enum(['NEW', 'CONTACTED', 'CLOSED']).optional() }),
    'query'
  ),
  asyncHandler(async (req, res) => {
    const { page, limit, status } = req.query;
    const where = status ? { status } : {};

    const [total, inquiries] = await prisma.$transaction([
      prisma.groupInquiry.count({ where }),
      prisma.groupInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({ inquiries, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
  })
);

/** PATCH /api/admin/group-inquiries/:id — move a lead through NEW → CONTACTED → CLOSED. */
router.patch(
  '/group-inquiries/:id',
  validate(z.object({ status: z.enum(['NEW', 'CONTACTED', 'CLOSED']) })),
  asyncHandler(async (req, res) => {
    const inquiry = await prisma.groupInquiry.findUnique({ where: { id: req.params.id } });
    if (!inquiry) throw notFound('Inquiry not found');

    const updated = await prisma.groupInquiry.update({
      where: { id: inquiry.id },
      data: { status: req.body.status },
    });
    res.json({ inquiry: updated });
  })
);

// ------------------------------------------------------- users

/** GET /api/admin/users */
router.get(
  '/users',
  validate(
    paginationQuery.extend({
      q: z.string().optional(),
      role: z.enum(['USER', 'GUIDE', 'ADMIN']).optional(),
    }),
    'query'
  ),
  asyncHandler(async (req, res) => {
    const { page, limit, q, role } = req.query;
    const where = {};
    if (role) where.role = role;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          tier: true,
          region: true,
          isActive: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { bookings: true, reviews: true, photos: true } },
        },
      }),
    ]);

    res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
  })
);

/** PATCH /api/admin/users/:id */
router.patch(
  '/users/:id',
  validate(
    z.object({
      role: z.enum(['USER', 'GUIDE', 'ADMIN']).optional(),
      isActive: z.boolean().optional(),
      tier: z.enum(['FREE', 'PREMIUM']).optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user.id && req.body.isActive === false) {
      throw badRequest('You cannot suspend your own account');
    }
    if (req.params.id === req.user.id && req.body.role && req.body.role !== 'ADMIN') {
      throw badRequest('You cannot remove your own admin role');
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      select: { id: true, name: true, email: true, role: true, tier: true, isActive: true },
    });
    res.json({ user });
  })
);

// ------------------------------------------------------- CMS: safety, listings, events, ads

const safetySchema = z.object({
  category: z.string().trim().min(2).max(60),
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(10),
  order: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(true),
});

router.get(
  '/safety',
  asyncHandler(async (_req, res) => {
    const items = await prisma.safetyGuideline.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] });
    res.json({ items });
  })
);

router.post(
  '/safety',
  validate(safetySchema),
  asyncHandler(async (req, res) => {
    const item = await prisma.safetyGuideline.create({ data: req.body });
    res.status(201).json({ item });
  })
);

router.patch(
  '/safety/:id',
  validate(safetySchema.partial()),
  asyncHandler(async (req, res) => {
    const item = await prisma.safetyGuideline.update({ where: { id: req.params.id }, data: req.body });
    res.json({ item });
  })
);

router.delete(
  '/safety/:id',
  asyncHandler(async (req, res) => {
    await prisma.safetyGuideline.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

const listingSchema = z.object({
  kind: z.enum(['ACCOMMODATION', 'EQUIPMENT']),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(3000),
  imageUrl: z.string().url().nullish(),
  region: regionEnum.nullish(),
  town: z.string().trim().max(120).nullish(),
  priceFromXAF: z.coerce.number().int().min(0).nullish(),
  affiliateUrl: z.string().url(),
  partnerName: z.string().trim().max(160).nullish(),
  commissionPct: z.coerce.number().min(0).max(100).default(10),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

router.get(
  '/listings',
  asyncHandler(async (_req, res) => {
    const listings = await prisma.listing.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ listings });
  })
);

router.post(
  '/listings',
  validate(listingSchema),
  asyncHandler(async (req, res) => {
    const listing = await prisma.listing.create({ data: req.body });
    res.status(201).json({ listing });
  })
);

router.patch(
  '/listings/:id',
  validate(listingSchema.partial()),
  asyncHandler(async (req, res) => {
    const listing = await prisma.listing.update({ where: { id: req.params.id }, data: req.body });
    res.json({ listing });
  })
);

router.delete(
  '/listings/:id',
  asyncHandler(async (req, res) => {
    await prisma.listing.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

// Kept as a plain object so `.partial()` still works for PATCH; `.refine()`
// would turn it into a ZodEffects, which has no `.partial()`.
const eventFields = z.object({
  title: z.string().trim().min(4).max(180),
  description: z.string().trim().min(20).max(6000),
  region: regionEnum.nullish(),
  location: z.string().trim().min(2).max(200),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  priceXAF: z.coerce.number().int().min(0),
  capacity: z.coerce.number().int().min(1).max(100000),
  coverImage: z.string().url().nullish(),
  published: z.boolean().default(true),
});

const datesInOrder = (e) => !e.startDate || !e.endDate || e.endDate >= e.startDate;
const dateOrderMessage = {
  message: 'End date must be on or after the start date',
  path: ['endDate'],
};

const eventSchema = eventFields.refine(datesInOrder, dateOrderMessage);
const eventPatchSchema = eventFields.partial().refine(datesInOrder, dateOrderMessage);

router.get(
  '/events',
  asyncHandler(async (_req, res) => {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'desc' },
      include: { _count: { select: { tickets: true } } },
    });
    res.json({ events });
  })
);

router.post(
  '/events',
  validate(eventSchema),
  asyncHandler(async (req, res) => {
    const slug = `${slugify(req.body.title, { lower: true, strict: true }).slice(0, 60)}-${req.body.startDate
      .toISOString()
      .slice(0, 10)}`;
    const event = await prisma.event.create({ data: { ...req.body, slug } });
    res.status(201).json({ event });
  })
);

router.patch(
  '/events/:id',
  validate(eventPatchSchema),
  asyncHandler(async (req, res) => {
    const event = await prisma.event.update({ where: { id: req.params.id }, data: req.body });
    res.json({ event });
  })
);

const adSchema = z.object({
  placement: z.string().trim().min(2).max(60),
  advertiser: z.string().trim().min(2).max(160),
  imageUrl: z.string().url(),
  targetUrl: z.string().url(),
  weight: z.coerce.number().int().min(1).max(100).default(1),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().nullish(),
  active: z.boolean().default(true),
});

router.get(
  '/ads',
  asyncHandler(async (_req, res) => {
    const ads = await prisma.adSlot.findMany({ orderBy: { placement: 'asc' } });
    res.json({ ads });
  })
);

router.post(
  '/ads',
  validate(adSchema),
  asyncHandler(async (req, res) => {
    const ad = await prisma.adSlot.create({ data: req.body });
    res.status(201).json({ ad });
  })
);

router.patch(
  '/ads/:id',
  validate(adSchema.partial()),
  asyncHandler(async (req, res) => {
    const ad = await prisma.adSlot.update({ where: { id: req.params.id }, data: req.body });
    res.json({ ad });
  })
);

router.delete(
  '/ads/:id',
  asyncHandler(async (req, res) => {
    await prisma.adSlot.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

export default router;

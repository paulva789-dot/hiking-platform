import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, badRequest, forbidden, notFound } from '../lib/errors.js';
import { requireApprovedGuide, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  countryEnum,
  guideProfileSchema,
  paginationQuery,
  regionEnum,
  scheduleSchema,
  tourSchema,
} from '../lib/schemas.js';
import { z } from 'zod';

const router = Router();

const GUIDE_CARD = {
  id: true,
  headline: true,
  bio: true,
  yearsExperience: true,
  languages: true,
  certifications: true,
  regions: true,
  countries: true,
  dayRateXAF: true,
  ratingAvg: true,
  ratingCount: true,
  plan: true,
  user: { select: { id: true, name: true, avatarUrl: true, region: true } },
};

// ------------------------------------------------------- public directory

/** GET /api/guides — approved guides only. PRO members surface first. */
router.get(
  '/',
  validate(
    paginationQuery.extend({ region: regionEnum.optional(), country: countryEnum.optional(), q: z.string().optional() }),
    'query'
  ),
  asyncHandler(async (req, res) => {
    const { page, limit, region, country, q } = req.query;

    const where = { status: 'APPROVED' };
    if (region) where.regions = { has: region };
    if (country) where.countries = { has: country };
    if (q) {
      where.OR = [
        { headline: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, guides] = await prisma.$transaction([
      prisma.guideProfile.count({ where }),
      prisma.guideProfile.findMany({
        where,
        select: { ...GUIDE_CARD, _count: { select: { tours: true } } },
        // Paid promotional placement is part of the guide-membership offer.
        orderBy: [{ plan: 'desc' }, { ratingAvg: 'desc' }, { yearsExperience: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({ guides, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
  })
);

/** GET /api/guides/:id — public guide page with their live tours. */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const guide = await prisma.guideProfile.findUnique({
      where: { id: req.params.id },
      select: {
        ...GUIDE_CARD,
        status: true,
        createdAt: true,
        tours: {
          where: { published: true },
          include: {
            trail: { select: { id: true, slug: true, name: true, region: true, difficulty: true } },
            schedules: {
              where: { cancelled: false, startDate: { gte: new Date() } },
              orderBy: { startDate: 'asc' },
            },
          },
        },
      },
    });

    if (!guide || guide.status !== 'APPROVED') throw notFound('Guide not found');

    // Fire-and-forget view counter; a failure here must not break the page.
    prisma.guideProfile
      .update({ where: { id: guide.id }, data: { profileViews: { increment: 1 } } })
      .catch(() => {});

    res.json({ guide });
  })
);

// ------------------------------------------------------- own profile

/** POST /api/guides/profile — create or update. Edits reset to PENDING. */
router.post(
  '/profile',
  requireAuth,
  validate(guideProfileSchema),
  asyncHandler(async (req, res) => {
    const existing = await prisma.guideProfile.findUnique({ where: { userId: req.user.id } });

    const profile = await prisma.guideProfile.upsert({
      where: { userId: req.user.id },
      create: { ...req.body, userId: req.user.id },
      update: {
        ...req.body,
        // A rejected guide who fixes their application goes back in the queue.
        status: existing?.status === 'REJECTED' ? 'PENDING' : existing?.status,
      },
    });

    // Signing up as a guide upgrades the account role once, never downgrades an admin.
    if (req.user.role === 'USER') {
      await prisma.user.update({ where: { id: req.user.id }, data: { role: 'GUIDE' } });
    }

    res.status(existing ? 200 : 201).json({ profile });
  })
);

/** GET /api/guides/me/dashboard — profile, tours, upcoming bookings, earnings. */
router.get(
  '/me/dashboard',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await prisma.guideProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        tours: {
          include: {
            trail: { select: { id: true, slug: true, name: true } },
            schedules: { orderBy: { startDate: 'asc' } },
            _count: { select: { bookings: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) return res.json({ profile: null, bookings: [], earnings: null });

    const tourIds = profile.tours.map((t) => t.id);
    const [bookings, paid] = await Promise.all([
      prisma.booking.findMany({
        where: { tourId: { in: tourIds } },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
          tour: { select: { id: true, title: true } },
          schedule: { select: { id: true, startDate: true, endDate: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.booking.aggregate({
        where: { tourId: { in: tourIds }, paymentStatus: 'PAID' },
        _sum: { subtotalXAF: true, commissionXAF: true },
        _count: true,
      }),
    ]);

    res.json({
      profile,
      bookings,
      earnings: {
        paidBookings: paid._count,
        grossXAF: paid._sum.subtotalXAF ?? 0,
        platformCommissionXAF: paid._sum.commissionXAF ?? 0,
        netPayoutXAF: (paid._sum.subtotalXAF ?? 0) - (paid._sum.commissionXAF ?? 0),
      },
      // Guide toolkit: a rough view-to-booking conversion signal.
      toolkit: {
        profileViews: profile.profileViews,
        totalBookings: bookings.length,
        conversionPct:
          profile.profileViews > 0 ? Math.round((bookings.length / profile.profileViews) * 1000) / 10 : 0,
      },
    });
  })
);

// Guide plans (BASIC/PRO) are activated via POST /api/payments/initiate —
// MTN MoMo / Orange Money through Flutterwave or Intouch — same as Premium.

// ------------------------------------------------------- tours

/** POST /api/guides/tours */
router.post(
  '/tours',
  requireAuth,
  requireApprovedGuide,
  validate(tourSchema),
  asyncHandler(async (req, res) => {
    const tour = await prisma.tour.create({ data: { ...req.body, guideId: req.guide.id } });
    res.status(201).json({ tour });
  })
);

/** PATCH /api/guides/tours/:id */
router.patch(
  '/tours/:id',
  requireAuth,
  requireApprovedGuide,
  validate(tourSchema.partial()),
  asyncHandler(async (req, res) => {
    const tour = await prisma.tour.findUnique({ where: { id: req.params.id } });
    if (!tour) throw notFound('Tour not found');
    if (tour.guideId !== req.guide.id) throw forbidden('That tour belongs to another guide');

    const updated = await prisma.tour.update({ where: { id: tour.id }, data: req.body });
    res.json({ tour: updated });
  })
);

/** DELETE /api/guides/tours/:id — blocked while people hold live bookings. */
router.delete(
  '/tours/:id',
  requireAuth,
  requireApprovedGuide,
  asyncHandler(async (req, res) => {
    const tour = await prisma.tour.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { bookings: true } } },
    });
    if (!tour) throw notFound('Tour not found');
    if (tour.guideId !== req.guide.id) throw forbidden('That tour belongs to another guide');

    const live = await prisma.booking.count({
      where: { tourId: tour.id, status: { in: ['PENDING', 'CONFIRMED'] } },
    });
    if (live > 0) {
      throw badRequest(
        `${live} active booking(s) reference this tour. Unpublish it instead of deleting.`
      );
    }

    await prisma.tour.delete({ where: { id: tour.id } });
    res.json({ ok: true });
  })
);

/** POST /api/guides/tours/:id/schedules */
router.post(
  '/tours/:id/schedules',
  requireAuth,
  requireApprovedGuide,
  validate(scheduleSchema),
  asyncHandler(async (req, res) => {
    const tour = await prisma.tour.findUnique({ where: { id: req.params.id } });
    if (!tour) throw notFound('Tour not found');
    if (tour.guideId !== req.guide.id) throw forbidden('That tour belongs to another guide');
    if (req.body.capacity > tour.maxGroupSize) {
      throw badRequest(`Capacity cannot exceed the tour's max group size of ${tour.maxGroupSize}`);
    }

    const schedule = await prisma.tourSchedule.create({ data: { ...req.body, tourId: tour.id } });
    res.status(201).json({ schedule });
  })
);

/** DELETE /api/guides/schedules/:id — cancels the date and every booking on it. */
router.delete(
  '/schedules/:id',
  requireAuth,
  requireApprovedGuide,
  asyncHandler(async (req, res) => {
    const schedule = await prisma.tourSchedule.findUnique({
      where: { id: req.params.id },
      include: { tour: true },
    });
    if (!schedule) throw notFound('Schedule not found');
    if (schedule.tour.guideId !== req.guide.id) throw forbidden('That date belongs to another guide');

    await prisma.$transaction([
      prisma.tourSchedule.update({ where: { id: schedule.id }, data: { cancelled: true } }),
      prisma.booking.updateMany({
        where: { scheduleId: schedule.id, status: { in: ['PENDING', 'CONFIRMED'] } },
        data: { status: 'CANCELLED' },
      }),
    ]);
    res.json({ ok: true });
  })
);

export default router;

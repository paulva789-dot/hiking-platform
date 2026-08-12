import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, notFound } from '../lib/errors.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { trailSearchQuery } from '../lib/schemas.js';

const router = Router();

const SORTS = {
  popular: [{ viewCount: 'desc' }, { ratingAvg: 'desc' }],
  rating: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
  newest: [{ createdAt: 'desc' }],
  distance: [{ distanceKm: 'asc' }],
  name: [{ name: 'asc' }],
};

const CARD_FIELDS = {
  id: true,
  slug: true,
  name: true,
  summary: true,
  region: true,
  nearestTown: true,
  difficulty: true,
  category: true,
  distanceKm: true,
  elevationGainM: true,
  durationMinutes: true,
  summitM: true,
  startLat: true,
  startLng: true,
  coverImage: true,
  ratingAvg: true,
  ratingCount: true,
  permitRequired: true,
};

/** GET /api/trails — search, filter, sort, paginate. Open to visitors. */
router.get(
  '/',
  validate(trailSearchQuery, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, q, region, difficulty, minDistance, maxDistance, maxDurationMinutes, sort } =
      req.query;

    const where = { published: true };
    if (region) where.region = region;
    if (difficulty) where.difficulty = difficulty;
    if (maxDurationMinutes) where.durationMinutes = { lte: maxDurationMinutes };
    if (minDistance != null || maxDistance != null) {
      where.distanceKm = {
        ...(minDistance != null ? { gte: minDistance } : {}),
        ...(maxDistance != null ? { lte: maxDistance } : {}),
      };
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { nearestTown: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, trails] = await prisma.$transaction([
      prisma.trail.count({ where }),
      prisma.trail.findMany({
        where,
        select: CARD_FIELDS,
        orderBy: SORTS[sort],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      trails,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  })
);

/** GET /api/trails/map — lightweight payload for the interactive map. */
router.get(
  '/map',
  asyncHandler(async (_req, res) => {
    const trails = await prisma.trail.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        name: true,
        region: true,
        difficulty: true,
        category: true,
        distanceKm: true,
        durationMinutes: true,
        startLat: true,
        startLng: true,
        coverImage: true,
        ratingAvg: true,
        routeGeoJson: true,
      },
    });
    res.json({ trails });
  })
);

/** GET /api/trails/facets — filter counts for the search sidebar. */
router.get(
  '/facets',
  asyncHandler(async (_req, res) => {
    const [byRegion, byDifficulty] = await prisma.$transaction([
      prisma.trail.groupBy({ by: ['region'], where: { published: true }, _count: true }),
      prisma.trail.groupBy({ by: ['difficulty'], where: { published: true }, _count: true }),
    ]);

    res.json({
      regions: byRegion.map((r) => ({ value: r.region, count: r._count })),
      difficulties: byDifficulty.map((d) => ({ value: d.difficulty, count: d._count })),
    });
  })
);

/** GET /api/trails/:slug — full detail, including whether the viewer saved it. */
router.get(
  '/:slug',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const trail = await prisma.trail.findUnique({
      where: { slug: req.params.slug },
      include: {
        waypoints: { orderBy: { order: 'asc' } },
        photos: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: {
            id: true,
            url: true,
            caption: true,
            forSale: true,
            priceXAF: true,
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        tours: {
          where: {
            published: true,
            guide: { status: 'APPROVED' },
          },
          include: {
            guide: {
              select: {
                id: true,
                headline: true,
                ratingAvg: true,
                ratingCount: true,
                user: { select: { name: true, avatarUrl: true } },
              },
            },
            schedules: {
              where: { cancelled: false, startDate: { gte: new Date() } },
              orderBy: { startDate: 'asc' },
              take: 5,
            },
          },
        },
        _count: { select: { reviews: true, favorites: true } },
      },
    });

    if (!trail || (!trail.published && req.user?.role !== 'ADMIN')) throw notFound('Trail not found');

    // Fire-and-forget view counter; a failure here must not break the page.
    prisma.trail
      .update({ where: { id: trail.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    let isFavorite = false;
    let myReviewId = null;
    if (req.user) {
      const [fav, mine] = await Promise.all([
        prisma.favorite.findUnique({
          where: { userId_trailId: { userId: req.user.id, trailId: trail.id } },
        }),
        prisma.review.findUnique({
          where: { userId_trailId: { userId: req.user.id, trailId: trail.id } },
        }),
      ]);
      isFavorite = Boolean(fav);
      myReviewId = mine?.id ?? null;
    }

    const ratingBuckets = await prisma.review.groupBy({
      by: ['rating'],
      where: { trailId: trail.id, status: 'APPROVED' },
      _count: true,
    });

    res.json({
      trail,
      isFavorite,
      myReviewId,
      ratingBreakdown: [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: ratingBuckets.find((b) => b.rating === rating)?._count ?? 0,
      })),
    });
  })
);

/** GET /api/trails/:slug/nearby — same region, similar difficulty. */
router.get(
  '/:slug/nearby',
  asyncHandler(async (req, res) => {
    const trail = await prisma.trail.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, region: true },
    });
    if (!trail) throw notFound('Trail not found');

    const trails = await prisma.trail.findMany({
      where: { published: true, region: trail.region, id: { not: trail.id } },
      select: CARD_FIELDS,
      orderBy: { ratingAvg: 'desc' },
      take: 3,
    });
    res.json({ trails });
  })
);

export default router;

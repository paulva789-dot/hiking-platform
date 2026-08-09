import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, forbidden, notFound } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paginationQuery, reviewSchema } from '../lib/schemas.js';

const router = Router();

/** Recomputes a trail's cached rating from its approved reviews. */
export const refreshTrailRating = async (trailId) => {
  const agg = await prisma.review.aggregate({
    where: { trailId, status: 'APPROVED' },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.trail.update({
    where: { id: trailId },
    data: {
      ratingAvg: Number((agg._avg.rating ?? 0).toFixed(2)),
      ratingCount: agg._count,
    },
  });
};

/** GET /api/trails/:trailId/reviews */
router.get(
  '/trails/:trailId/reviews',
  validate(paginationQuery, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const where = { trailId: req.params.trailId, status: 'APPROVED' };

    const [total, reviews] = await prisma.$transaction([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({ reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
  })
);

/** POST /api/trails/:trailId/reviews — one review per user per trail. */
router.post(
  '/trails/:trailId/reviews',
  requireAuth,
  validate(reviewSchema),
  asyncHandler(async (req, res) => {
    const { trailId } = req.params;
    const trail = await prisma.trail.findUnique({ where: { id: trailId }, select: { id: true } });
    if (!trail) throw notFound('Trail not found');

    const review = await prisma.review.upsert({
      where: { userId_trailId: { userId: req.user.id, trailId } },
      create: { ...req.body, userId: req.user.id, trailId },
      update: req.body,
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await refreshTrailRating(trailId);
    res.status(201).json({ review });
  })
);

/** DELETE /api/reviews/:id — author or admin. */
router.delete(
  '/reviews/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw notFound('Review not found');
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw forbidden('You can only delete your own reviews');
    }

    await prisma.review.delete({ where: { id: review.id } });
    await refreshTrailRating(review.trailId);
    res.json({ ok: true });
  })
);

/** GET /api/reviews/mine */
router.get(
  '/reviews/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      include: { trail: { select: { id: true, slug: true, name: true, coverImage: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  })
);

export default router;

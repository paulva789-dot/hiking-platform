import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, notFound } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

/** GET /api/favorites — the signed-in user's saved trails. */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        trail: {
          select: {
            id: true,
            slug: true,
            name: true,
            summary: true,
            region: true,
            difficulty: true,
            distanceKm: true,
            durationMinutes: true,
            coverImage: true,
            ratingAvg: true,
            ratingCount: true,
          },
        },
      },
    });
    res.json({ favorites });
  })
);

/** POST /api/favorites/:trailId — idempotent save. */
router.post(
  '/:trailId',
  asyncHandler(async (req, res) => {
    const { trailId } = req.params;
    const trail = await prisma.trail.findUnique({ where: { id: trailId }, select: { id: true } });
    if (!trail) throw notFound('Trail not found');

    await prisma.favorite.upsert({
      where: { userId_trailId: { userId: req.user.id, trailId } },
      create: { userId: req.user.id, trailId },
      update: {},
    });
    res.status(201).json({ isFavorite: true });
  })
);

/** DELETE /api/favorites/:trailId — idempotent unsave. */
router.delete(
  '/:trailId',
  asyncHandler(async (req, res) => {
    await prisma.favorite.deleteMany({
      where: { userId: req.user.id, trailId: req.params.trailId },
    });
    res.json({ isFavorite: false });
  })
);

export default router;

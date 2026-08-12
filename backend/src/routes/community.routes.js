import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();

const REGIONS = [
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

// Reviews carry the most weight — a firsthand account is worth more than a
// save. Favorites are the lowest-effort signal, so they count least.
const WEIGHTS = { review: 3, photo: 2, favorite: 1 };

const userRef = { select: { id: true, name: true, avatarUrl: true } };

/** GET /api/community/regional-experts — the top contributor per region, by weighted activity. */
router.get(
  '/regional-experts',
  asyncHandler(async (_req, res) => {
    const [reviews, photos, favorites] = await Promise.all([
      prisma.review.findMany({
        where: { status: 'APPROVED' },
        select: { user: userRef, trail: { select: { region: true } } },
      }),
      prisma.photo.findMany({
        where: { status: 'APPROVED', trailId: { not: null } },
        select: { user: userRef, trail: { select: { region: true } } },
      }),
      prisma.favorite.findMany({
        select: { user: userRef, trail: { select: { region: true } } },
      }),
    ]);

    // scores[region][userId] = { user, score }
    const scores = {};
    const add = (rows, weight) => {
      for (const row of rows) {
        const region = row.trail?.region;
        if (!region) continue;
        scores[region] ??= {};
        const entry = (scores[region][row.user.id] ??= { user: row.user, score: 0 });
        entry.score += weight;
      }
    };
    add(reviews, WEIGHTS.review);
    add(photos, WEIGHTS.photo);
    add(favorites, WEIGHTS.favorite);

    const experts = REGIONS.map((region) => {
      const byUser = Object.values(scores[region] ?? {});
      const top = byUser.sort((a, b) => b.score - a.score)[0];
      return {
        region,
        expert: top ? { ...top.user, score: top.score } : null,
      };
    });

    res.json({ experts });
  })
);

export default router;

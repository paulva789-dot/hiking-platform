import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, badRequest, forbidden, notFound } from '../lib/errors.js';
import { requireAuth, requirePremium } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { checkInSchema } from '../lib/schemas.js';

const router = Router();

const MAX_ACTIVE_PER_USER = 3;

/** GET /api/checkins — the signed-in user's check-ins, most recent first. */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const checkIns = await prisma.safetyCheckIn.findMany({
      where: { userId: req.user.id },
      orderBy: { dueBackAt: 'desc' },
    });
    res.json({ checkIns });
  })
);

/**
 * POST /api/checkins — Premium perk: "alert my contact if I'm not back by X."
 * A background sweep (safety-sweep.js) does the actual alerting.
 */
router.post(
  '/',
  requireAuth,
  requirePremium,
  validate(checkInSchema),
  asyncHandler(async (req, res) => {
    const activeCount = await prisma.safetyCheckIn.count({
      where: { userId: req.user.id, status: { in: ['ACTIVE', 'OVERDUE'] } },
    });
    if (activeCount >= MAX_ACTIVE_PER_USER) {
      throw badRequest(`You can only have ${MAX_ACTIVE_PER_USER} active check-ins at once`);
    }

    const checkIn = await prisma.safetyCheckIn.create({
      data: { userId: req.user.id, ...req.body },
    });
    res.status(201).json({ checkIn });
  })
);

/** POST /api/checkins/:id/check-in — "I'm back / I'm safe." */
router.post(
  '/:id/check-in',
  requireAuth,
  asyncHandler(async (req, res) => {
    const checkIn = await prisma.safetyCheckIn.findUnique({ where: { id: req.params.id } });
    if (!checkIn) throw notFound('Check-in not found');
    if (checkIn.userId !== req.user.id) throw forbidden('That check-in is not yours');
    if (!['ACTIVE', 'OVERDUE'].includes(checkIn.status)) {
      throw badRequest(`This check-in is already ${checkIn.status.toLowerCase()}`);
    }

    const updated = await prisma.safetyCheckIn.update({
      where: { id: checkIn.id },
      data: { status: 'CHECKED_IN', checkedInAt: new Date() },
    });
    res.json({ checkIn: updated });
  })
);

/** DELETE /api/checkins/:id — cancel a plan before it goes overdue. */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const checkIn = await prisma.safetyCheckIn.findUnique({ where: { id: req.params.id } });
    if (!checkIn) throw notFound('Check-in not found');
    if (checkIn.userId !== req.user.id) throw forbidden('That check-in is not yours');
    if (checkIn.status === 'ALERTED') {
      throw badRequest('The emergency contact was already alerted for this check-in');
    }

    const updated = await prisma.safetyCheckIn.update({
      where: { id: checkIn.id },
      data: { status: 'CANCELLED' },
    });
    res.json({ checkIn: updated });
  })
);

export default router;

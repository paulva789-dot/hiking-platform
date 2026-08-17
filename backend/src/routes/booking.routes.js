import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { config } from '../config.js';
import { asyncHandler, badRequest, conflict, forbidden, notFound } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { bookingSchema } from '../lib/schemas.js';
import { refundBookingPayment } from '../lib/refunds.js';

const router = Router();

const reference = (prefix) =>
  `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

/** GET /api/bookings/tours/:tourId — public tour detail with open dates. */
router.get(
  '/tours/:tourId',
  asyncHandler(async (req, res) => {
    const tour = await prisma.tour.findUnique({
      where: { id: req.params.tourId },
      include: {
        trail: {
          select: { id: true, slug: true, name: true, region: true, difficulty: true, coverImage: true },
        },
        guide: {
          select: {
            id: true,
            headline: true,
            ratingAvg: true,
            ratingCount: true,
            yearsExperience: true,
            languages: true,
            status: true,
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        schedules: {
          where: { cancelled: false, startDate: { gte: new Date() } },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!tour || !tour.published || tour.guide.status !== 'APPROVED') throw notFound('Tour not found');

    res.json({
      tour,
      schedules: tour.schedules.map((s) => ({ ...s, seatsLeft: s.capacity - s.seatsBooked })),
    });
  })
);

/** GET /api/bookings — the signed-in user's bookings. */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            durationDays: true,
            meetingPoint: true,
            trail: { select: { slug: true, name: true, coverImage: true, region: true } },
            guide: {
              select: { id: true, phone: true, whatsapp: true, user: { select: { name: true } } },
            },
          },
        },
        schedule: { select: { startDate: true, endDate: true, cancelled: true } },
      },
    });
    res.json({ bookings });
  })
);

/**
 * POST /api/bookings/tours/:tourId — reserve seats.
 *
 * Seats are claimed with a single conditional UPDATE so two people booking the
 * last spot at the same moment cannot both succeed; the loser gets a 409.
 */
router.post(
  '/tours/:tourId',
  requireAuth,
  validate(bookingSchema),
  asyncHandler(async (req, res) => {
    const { scheduleId, participants, contactPhone, notes } = req.body;

    const schedule = await prisma.tourSchedule.findUnique({
      where: { id: scheduleId },
      include: { tour: { include: { guide: { select: { status: true, userId: true } } } } },
    });

    if (!schedule || schedule.tourId !== req.params.tourId) throw notFound('Tour date not found');
    if (schedule.cancelled) throw badRequest('That date has been cancelled');
    if (schedule.startDate < new Date()) throw badRequest('That date has already started');
    if (!schedule.tour.published || schedule.tour.guide.status !== 'APPROVED') {
      throw badRequest('This tour is not currently accepting bookings');
    }
    if (schedule.tour.guide.userId === req.user.id) {
      throw badRequest('You cannot book your own tour');
    }
    if (participants > schedule.tour.maxGroupSize) {
      throw badRequest(`This tour takes a maximum of ${schedule.tour.maxGroupSize} people`);
    }

    const subtotalXAF = schedule.tour.priceXAF * participants;
    const commissionXAF = Math.round((subtotalXAF * config.commission.booking) / 100);
    // The deposit always covers at least the commission, even if depositPct
    // were ever misconfigured below commission.booking or rounding on a
    // tiny booking pushed it under -- the platform's cut must clear.
    const depositXAF = Math.max(
      commissionXAF,
      Math.round((subtotalXAF * config.booking.depositPct) / 100)
    );
    const balanceDueXAF = subtotalXAF - depositXAF;

    const booking = await prisma.$transaction(async (tx) => {
      const claimed = await tx.$queryRaw`
        UPDATE "TourSchedule"
        SET "seatsBooked" = "seatsBooked" + ${participants}
        WHERE "id" = ${scheduleId}
          AND "cancelled" = false
          AND "seatsBooked" + ${participants} <= "capacity"
        RETURNING "id", "seatsBooked", "capacity"
      `;

      if (!Array.isArray(claimed) || claimed.length === 0) {
        throw conflict(
          `Only ${schedule.capacity - schedule.seatsBooked} seat(s) remain on that date`
        );
      }

      return tx.booking.create({
        data: {
          reference: reference('TRK'),
          userId: req.user.id,
          tourId: schedule.tourId,
          scheduleId,
          participants,
          subtotalXAF,
          // Platform revenue: commission is recorded per booking, not derived later.
          commissionXAF,
          totalXAF: subtotalXAF,
          depositXAF,
          balanceDueXAF,
          contactPhone,
          notes,
        },
        include: {
          tour: { select: { title: true } },
          schedule: { select: { startDate: true, endDate: true } },
        },
      });
    });

    res.status(201).json({
      booking,
      commissionPct: config.commission.booking,
      depositPct: config.booking.depositPct,
    });
  })
);

/** DELETE /api/bookings/:id — cancel and release the seats. */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { schedule: true },
    });
    if (!booking) throw notFound('Booking not found');
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw forbidden('That booking is not yours');
    }
    if (booking.status === 'CANCELLED') return res.json({ booking });
    if (booking.status === 'COMPLETED') throw badRequest('Completed bookings cannot be cancelled');

    // A real refund request against the provider, not a status relabel --
    // done before the transaction since it's an external API call. The seat
    // is released either way; a refund hiccup shouldn't trap someone in a
    // booking they no longer want.
    let paymentStatus = booking.paymentStatus;
    let refundReason;
    if (booking.paymentStatus === 'PAID') {
      const result = await refundBookingPayment(booking.id);
      paymentStatus = result.refunded ? 'REFUNDED' : 'REFUND_PENDING';
      if (!result.refunded) refundReason = result.reason;
    } else if (booking.paymentStatus === 'UNPAID') {
      paymentStatus = 'UNPAID';
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Guard against underflow if seats were reconciled elsewhere.
      await tx.$executeRaw`
        UPDATE "TourSchedule"
        SET "seatsBooked" = GREATEST(0, "seatsBooked" - ${booking.participants})
        WHERE "id" = ${booking.scheduleId}
      `;
      return tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED', paymentStatus },
      });
    });

    res.json({ booking: updated, refundReason });
  })
);

/** PATCH /api/bookings/:id/status — guide or admin moves a booking along. */
router.patch(
  '/:id/status',
  requireAuth,
  validate(z.object({ status: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED']) })),
  asyncHandler(async (req, res) => {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { tour: { include: { guide: { select: { userId: true } } } } },
    });
    if (!booking) throw notFound('Booking not found');

    const isOwningGuide = booking.tour.guide.userId === req.user.id;
    if (!isOwningGuide && req.user.role !== 'ADMIN') {
      throw forbidden('Only the tour guide or an admin can change a booking status');
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (req.body.status === 'CANCELLED' && booking.status !== 'CANCELLED') {
        await tx.$executeRaw`
          UPDATE "TourSchedule"
          SET "seatsBooked" = GREATEST(0, "seatsBooked" - ${booking.participants})
          WHERE "id" = ${booking.scheduleId}
        `;
      }
      return tx.booking.update({ where: { id: booking.id }, data: { status: req.body.status } });
    });

    res.json({ booking: updated });
  })
);

export default router;

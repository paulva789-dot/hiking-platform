import { prisma } from './prisma.js';

/** Whether a user's Premium membership is currently active (tier flips back
 * to FREE only lazily -- tierExpires is the real source of truth). */
export function isPremiumActive(user) {
  return user.tier === 'PREMIUM' && (!user.tierExpires || user.tierExpires > new Date());
}

/** Extends (or starts) a user's Premium membership by N months from whichever is later: now, or their current expiry. */
export async function extendPremiumMembership(userId, months) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const base = user.tierExpires && user.tierExpires > new Date() ? user.tierExpires : new Date();
  const tierExpires = new Date(base);
  tierExpires.setMonth(tierExpires.getMonth() + months);

  return prisma.user.update({
    where: { id: userId },
    data: { tier: 'PREMIUM', tierExpires },
    select: { id: true, tier: true, tierExpires: true },
  });
}

/** Extends (or starts) a guide's paid plan by N months. Requires a guide profile to already exist. */
export async function activateGuidePlan(userId, plan, months) {
  const profile = await prisma.guideProfile.findUniqueOrThrow({ where: { userId } });
  const base = profile.planExpires && profile.planExpires > new Date() ? profile.planExpires : new Date();
  const planExpires = new Date(base);
  planExpires.setMonth(planExpires.getMonth() + months);

  return prisma.guideProfile.update({
    where: { id: profile.id },
    data: { plan, planExpires },
  });
}

/** Marks the booking a successful payment was for as paid and confirmed --
 * "paid" means the deposit cleared; the balance is settled in cash at the
 * trailhead. Safe to call more than once. */
export async function confirmBookingPayment(bookingId) {
  if (!bookingId) return;
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.paymentStatus === 'PAID') return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
  });
}

/** Applies whatever a successful Payment record was for. Safe to call more than once. */
export async function applyPaymentEntitlement(payment) {
  if (payment.purpose === 'PREMIUM_MEMBERSHIP') {
    await extendPremiumMembership(payment.userId, payment.months ?? 1);
  } else if (payment.purpose === 'GUIDE_PLAN') {
    await activateGuidePlan(payment.userId, payment.guidePlan ?? 'BASIC', payment.months ?? 1);
  } else if (payment.purpose === 'BOOKING') {
    await confirmBookingPayment(payment.bookingId);
  }
}

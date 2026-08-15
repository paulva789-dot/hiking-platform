import { prisma } from './prisma.js';
import { refundFlutterwaveCharge } from './payments/flutterwave.js';

/**
 * Actually refunds a booking's payment, rather than just relabelling it.
 * Returns { refunded: true } once money has genuinely been requested back
 * from the provider, or { refunded: false, reason } when that's not
 * possible right now (no successful charge, provider has no refund path
 * wired up, or the provider's API call failed) — the caller is responsible
 * for surfacing that honestly instead of claiming REFUNDED regardless.
 */
export async function refundBookingPayment(bookingId) {
  const payment = await prisma.payment.findFirst({
    where: { bookingId, purpose: 'BOOKING', status: 'SUCCESSFUL' },
    orderBy: { createdAt: 'desc' },
  });

  if (!payment) {
    // Nothing was ever actually charged for this booking — no refund needed.
    return { refunded: true, reason: 'No successful charge on record' };
  }
  if (payment.refundedAt) {
    return { refunded: true, reason: 'Already refunded' };
  }
  if (payment.provider !== 'FLUTTERWAVE') {
    // Intouch has no refund endpoint wired up here yet — see
    // backend/src/lib/payments/intouch.js. Don't pretend otherwise.
    return { refunded: false, reason: `No automatic refund path for ${payment.provider} yet` };
  }

  try {
    await refundFlutterwaveCharge({
      providerRef: payment.providerRef,
      amountXAF: payment.amountXAF,
      reason: 'Booking cancelled by hiker',
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { refundedAt: new Date() },
    });
    return { refunded: true };
  } catch (err) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { refundReason: err.message?.slice(0, 500) },
    });
    return { refunded: false, reason: err.message || 'Refund request failed' };
  }
}

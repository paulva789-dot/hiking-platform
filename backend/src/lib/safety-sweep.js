import { prisma } from './prisma.js';
import { sendSms, smsReady } from './sms.js';

/**
 * Finds ACTIVE check-ins past their dueBackAt, flips them OVERDUE, and tries
 * to SMS the emergency contact. Called on an interval from server.js -- this
 * is a long-running Railway process, not a serverless function, so an
 * in-process timer is the simplest thing that actually works.
 */
export async function runOverdueCheckInSweep() {
  const overdue = await prisma.safetyCheckIn.findMany({
    where: { status: 'ACTIVE', dueBackAt: { lt: new Date() } },
    include: { user: { select: { name: true } } },
  });

  for (const checkIn of overdue) {
    await prisma.safetyCheckIn.update({ where: { id: checkIn.id }, data: { status: 'OVERDUE' } });

    if (!smsReady()) {
      console.error(`[safety-sweep] SMS not configured -- could not alert contact for check-in ${checkIn.id}`);
      await prisma.safetyCheckIn.update({
        where: { id: checkIn.id },
        data: { alertFailureReason: 'SMS is not configured on this server' },
      });
      continue;
    }

    try {
      await sendSms({
        to: checkIn.emergencyContactPhone,
        message: `Travesia Cameroon safety alert: ${checkIn.user.name} has not checked in from "${checkIn.planLabel}" (expected back ${checkIn.dueBackAt.toISOString()}). You are listed as their emergency contact.`,
      });
      await prisma.safetyCheckIn.update({
        where: { id: checkIn.id },
        data: { status: 'ALERTED', alertedAt: new Date(), alertFailureReason: null },
      });
    } catch (err) {
      console.error(`[safety-sweep] Failed to alert contact for check-in ${checkIn.id}: ${err.message}`);
      await prisma.safetyCheckIn.update({
        where: { id: checkIn.id },
        data: { alertFailureReason: err.message?.slice(0, 500) },
      });
    }
  }

  return overdue.length;
}

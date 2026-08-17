'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { BOOKING_DEPOSIT_PCT, formatDateRange, formatXAF } from '@/lib/format';
import type { Booking, TourSchedule } from '@/lib/types';
import { Alert, Spinner } from '@/components/ui';
import { PaymentPanel } from '@/components/PaymentPanel';

interface BookingDraft {
  scheduleId: string;
  participants: number;
  contactPhone: string;
  notes: string;
}

const draftKey = (tourId: string) => `booking-draft-${tourId}`;

export function BookingWidget({
  tourId,
  tourTitle,
  priceXAF,
  maxGroupSize,
  schedules,
  guideId,
  guideName,
  trailSlug,
}: {
  tourId: string;
  tourTitle: string;
  priceXAF: number;
  maxGroupSize: number;
  schedules: TourSchedule[];
  /** For the sold-out dead end — "message the guide" needs somewhere real to send them. */
  guideId?: string;
  guideName?: string;
  trailSlug?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const openSchedules = schedules.filter((s) => !s.cancelled && s.capacity - s.seatsBooked > 0);
  const [scheduleId, setScheduleId] = useState(openSchedules[0]?.id ?? '');
  const [participants, setParticipants] = useState(1);
  const [contactPhone, setContactPhone] = useState(user?.phone ?? '');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  // Signing in mid-booking used to lose everything picked so far — restore a
  // draft saved right before the redirect, once, the moment we come back
  // signed in. Only trust a scheduleId that's still actually open.
  useEffect(() => {
    if (!user) return;
    const raw = sessionStorage.getItem(draftKey(tourId));
    if (!raw) return;
    sessionStorage.removeItem(draftKey(tourId));
    try {
      const draft = JSON.parse(raw) as BookingDraft;
      if (openSchedules.some((s) => s.id === draft.scheduleId)) setScheduleId(draft.scheduleId);
      setParticipants(draft.participants);
      setContactPhone(draft.contactPhone);
      setNotes(draft.notes);
      // eslint-disable-next-line no-empty
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const selected = openSchedules.find((s) => s.id === scheduleId);
  const seatsLeft = selected ? selected.capacity - selected.seatsBooked : 0;
  const subtotal = priceXAF * participants;
  const estimatedDeposit = Math.round((subtotal * BOOKING_DEPOSIT_PCT) / 100);
  const estimatedBalance = subtotal - estimatedDeposit;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      const draft: BookingDraft = { scheduleId, participants, contactPhone, notes };
      sessionStorage.setItem(draftKey(tourId), JSON.stringify(draft));
      router.push(`/login?next=/tours/${tourId}`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ booking: Booking }>(`/bookings/tours/${tourId}`, {
        scheduleId,
        participants,
        contactPhone,
        notes: notes || undefined,
      });
      setBooking(res.booking);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Booking failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (booking && paid) {
    return (
      <div className="card space-y-4 border-forest-300 bg-forest-50 p-6 dark:border-forest-800 dark:bg-forest-950/40">
        <p className="text-xs font-bold uppercase tracking-wide text-forest-700 dark:text-forest-300">
          Deposit paid — seat confirmed
        </p>
        <p className="text-sm text-basalt-700 dark:text-basalt-300">
          The guide will contact you on {booking.contactPhone} to arrange the meeting point. Bring{' '}
          <strong>{formatXAF(booking.balanceDueXAF)}</strong> in cash to pay the guide directly at the
          trailhead.
        </p>
        <button type="button" onClick={() => router.push('/dashboard/bookings')} className="btn-primary w-full">
          Go to my bookings
        </button>
      </div>
    );
  }

  if (booking && paying) {
    return (
      <div className="card space-y-4 p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-forest-700 dark:text-forest-300">
            Pay for your seat
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-basalt-900 dark:text-basalt-50">{tourTitle}</h3>
        </div>
        <p className="text-sm text-basalt-600 dark:text-basalt-300">
          A {formatXAF(booking.depositXAF)} deposit holds your seat. The remaining{' '}
          {formatXAF(booking.balanceDueXAF)} is paid in cash to the guide at the trailhead.
        </p>
        <PaymentPanel
          purpose="BOOKING"
          extra={{ bookingId: booking.id }}
          amountXAF={booking.depositXAF}
          onSuccess={() => setPaid(true)}
          onCancel={() => setPaying(false)}
        />
      </div>
    );
  }

  if (booking) {
    return (
      <div className="card space-y-4 border-forest-300 bg-forest-50 p-6 dark:border-forest-800 dark:bg-forest-950/40">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-forest-700 dark:text-forest-300">Seat reserved</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-basalt-900 dark:text-basalt-50">{tourTitle}</h3>
        </div>

        <dl className="space-y-2 text-sm">
          <Row label="Reference" value={<code className="font-mono">{booking.reference}</code>} />
          <Row
            label="Dates"
            value={formatDateRange(booking.schedule.startDate, booking.schedule.endDate)}
          />
          <Row label="People" value={String(booking.participants)} />
          <Row label="Trip total" value={formatXAF(booking.totalXAF)} />
          <Row label="Deposit due now" value={<strong>{formatXAF(booking.depositXAF)}</strong>} />
          <Row label="Balance in cash at trailhead" value={formatXAF(booking.balanceDueXAF)} />
        </dl>

        <Alert tone="info">
          Your seat is held but the deposit isn&apos;t paid yet. Pay it by MTN Mobile Money or Orange
          Money now, or later from your bookings page — the guide will contact you on{' '}
          {booking.contactPhone} to arrange the meeting point either way. The remaining{' '}
          {formatXAF(booking.balanceDueXAF)} is paid in cash directly to the guide at the trailhead.
        </Alert>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPaying(true)} className="btn-accent">
            Pay {formatXAF(booking.depositXAF)} deposit now
          </button>
          <button type="button" onClick={() => router.push('/dashboard/bookings')} className="btn-secondary">
            Pay later
          </button>
        </div>
      </div>
    );
  }

  if (openSchedules.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">No open dates</h3>
        <p className="mt-2 text-sm text-basalt-600 dark:text-basalt-300">
          Every scheduled departure for this tour is full or past.
          {guideId ? ` Message ${guideName ?? 'the guide'} directly` : ' Message the guide directly'}
          {trailSlug ? ', or check the other tours on this trail.' : '.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {guideId && (
            <Link href={`/guides/${guideId}`} className="btn-primary">
              {guideName ? `Message ${guideName}` : 'Contact the guide'}
            </Link>
          )}
          {trailSlug && (
            <Link href={`/trails/${trailSlug}#book`} className="btn-secondary">
              Other tours on this trail
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <p className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">{formatXAF(priceXAF)}</p>
        <p className="text-xs text-basalt-600 dark:text-basalt-300">per person · max {maxGroupSize} in a group</p>
      </div>

      <div>
        <label htmlFor="schedule" className="label">
          Departure date
        </label>
        <select
          id="schedule"
          value={scheduleId}
          onChange={(e) => {
            setScheduleId(e.target.value);
            setParticipants(1);
          }}
          className="input"
          required
        >
          {openSchedules.map((s) => (
            <option key={s.id} value={s.id}>
              {formatDateRange(s.startDate, s.endDate)} — {s.capacity - s.seatsBooked} seat
              {s.capacity - s.seatsBooked === 1 ? '' : 's'} left
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="participants" className="label">
          How many people?
        </label>
        <input
          id="participants"
          type="number"
          min={1}
          max={Math.min(seatsLeft, maxGroupSize)}
          value={participants}
          onChange={(e) => setParticipants(Math.max(1, Number(e.target.value)))}
          className="input"
          required
        />
        {seatsLeft > 0 && seatsLeft <= 3 && (
          <p className="mt-1 text-xs font-semibold text-terracotta-700 dark:text-terracotta-400">
            Only {seatsLeft} seat{seatsLeft === 1 ? '' : 's'} left on this date.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="label">
          Phone number for the guide
        </label>
        <input
          id="phone"
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="+237 6 XX XX XX XX"
          minLength={6}
          className="input"
          required
        />
      </div>

      <div>
        <label htmlFor="notes" className="label">
          Anything the guide should know? <span className="font-normal text-basalt-600 dark:text-basalt-300">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Fitness level, first time at altitude, dietary needs…"
          className="input resize-y"
        />
      </div>

      <dl className="space-y-1.5 border-t border-basalt-100 pt-4 text-sm">
        <Row label={`${formatXAF(priceXAF)} × ${participants}`} value={formatXAF(subtotal)} />
        <div className="flex justify-between border-t border-basalt-100 pt-2 font-semibold text-basalt-900 dark:text-basalt-50">
          <dt>Trip total</dt>
          <dd>{formatXAF(subtotal)}</dd>
        </div>
        <Row label={`Deposit to reserve (~${BOOKING_DEPOSIT_PCT}%)`} value={formatXAF(estimatedDeposit)} />
        <Row label="Balance in cash at trailhead" value={formatXAF(estimatedBalance)} />
      </dl>

      {error && <Alert tone="danger">{error}</Alert>}

      <button type="submit" disabled={busy || !scheduleId} className="btn-accent w-full">
        {busy && <Spinner className="h-4 w-4" />}
        {user ? 'Reserve seats' : 'Sign in to book'}
      </button>

      <p className="text-xs leading-relaxed text-basalt-600 dark:text-basalt-300">
        You pay nothing now. Reserving holds the seats; you&apos;ll then pay a small deposit by MTN
        Mobile Money or Orange Money to confirm, and settle the rest in cash with the guide at the
        trailhead. Free cancellation from your bookings page.
      </p>
    </form>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-basalt-600 dark:text-basalt-300">{label}</dt>
      <dd className="text-right text-basalt-900 dark:text-basalt-50">{value}</dd>
    </div>
  );
}

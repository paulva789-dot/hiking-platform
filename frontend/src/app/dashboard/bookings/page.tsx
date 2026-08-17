'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { formatDateRange, formatXAF, relativeTime } from '@/lib/format';
import type { Booking } from '@/lib/types';
import { Alert, EmptyState, SectionHeading, Skeleton, Spinner, StatusBadge } from '@/components/ui';
import { PaymentPanel } from '@/components/PaymentPanel';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);

  const load = () =>
    api
      .get<{ bookings: Booking[] }>('/bookings')
      .then((d) => setBookings(d.bookings))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const act = async (id: string, action: 'pay' | 'cancel') => {
    if (action === 'pay') {
      const booking = bookings.find((b) => b.id === id);
      if (booking) setPayingBooking(booking);
      return;
    }
    setBusyId(id);
    setError(null);
    setInfo(null);
    try {
      const res = await api.delete<{ booking: Booking; refundReason?: string }>(`/bookings/${id}`);
      if (res.booking.paymentStatus === 'REFUND_PENDING') {
        setInfo(
          `Booking cancelled. The automatic refund could not be completed${res.refundReason ? ` (${res.refundReason})` : ''} — we'll follow up to send the money back manually.`
        );
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That did not work. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => b.status !== 'CANCELLED' && new Date(b.schedule.startDate) >= now
  );
  const past = bookings.filter(
    (b) => b.status === 'CANCELLED' || new Date(b.schedule.startDate) < now
  );

  return (
    <div className="space-y-10">
      <SectionHeading
        title="My bookings"
        description="Reserved seats hold your place until you pay by MTN Mobile Money or Orange Money — the guide confirms and arranges the meeting point once payment clears."
      />

      {error && <Alert tone="danger">{error}</Alert>}
      {info && <Alert tone="warn">{info}</Alert>}

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          message="Guided tours are listed on every trail page and on each guide's profile."
          action={{ href: '/trails', label: 'Find a trail' }}
        />
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">Upcoming</h2>
              <ul className="space-y-4">
                {upcoming.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    busy={busyId === booking.id}
                    onAct={act}
                  />
                ))}
              </ul>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                Past and cancelled
              </h2>
              <ul className="space-y-4">
                {past.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} busy={false} onAct={act} readOnly />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {payingBooking && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPayingBooking(null)} aria-hidden />
          <div className="card relative w-full max-w-sm p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-forest-700 dark:text-forest-300">
                  Pay for your seat
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                  {payingBooking.tour.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPayingBooking(null)}
                className="btn-ghost px-2"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
            <p className="mb-3 text-sm text-basalt-600 dark:text-basalt-300">
              A {formatXAF(payingBooking.depositXAF)} deposit confirms your seat. The remaining{' '}
              {formatXAF(payingBooking.balanceDueXAF)} is paid in cash to the guide at the trailhead.
            </p>
            <PaymentPanel
              purpose="BOOKING"
              extra={{ bookingId: payingBooking.id }}
              amountXAF={payingBooking.depositXAF}
              onSuccess={() => {
                setPayingBooking(null);
                void load();
              }}
              onCancel={() => setPayingBooking(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BookingRow({
  booking,
  busy,
  onAct,
  readOnly = false,
}: {
  booking: Booking;
  busy: boolean;
  onAct: (id: string, action: 'pay' | 'cancel') => void;
  readOnly?: boolean;
}) {
  const trail = booking.tour.trail;

  return (
    <li className={`card p-5 ${booking.status === 'CANCELLED' ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
              {booking.tour.title}
            </h3>
            <StatusBadge status={booking.status} />
            {booking.paymentStatus === 'PAID' && (
              <span className="chip bg-forest-100 text-forest-800 ring-forest-200">Paid</span>
            )}
            {booking.paymentStatus === 'REFUNDED' && (
              <span className="chip bg-blue-100 text-blue-900 ring-blue-200">Refunded</span>
            )}
            {booking.paymentStatus === 'REFUND_PENDING' && (
              <span className="chip bg-amber-100 text-amber-900 ring-amber-200">Refund pending</span>
            )}
          </div>

          {trail && (
            <Link
              href={`/trails/${trail.slug}`}
              className="mt-1 inline-block text-xs font-semibold text-forest-700 hover:underline"
            >
              {trail.name} →
            </Link>
          )}

          <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <Row label="Dates" value={formatDateRange(booking.schedule.startDate, booking.schedule.endDate)} />
            <Row label="People" value={String(booking.participants)} />
            <Row label="Reference" value={<code className="font-mono">{booking.reference}</code>} />
            <Row label="Booked" value={relativeTime(booking.createdAt)} />
            {booking.tour.guide && <Row label="Guide" value={booking.tour.guide.user.name} />}
            {booking.tour.meetingPoint && (
              <Row label="Meeting point" value={booking.tour.meetingPoint} />
            )}
          </dl>

          {booking.schedule.cancelled && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-900">
              The guide cancelled this departure date.
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-xl font-semibold text-basalt-900 dark:text-basalt-50">
            {formatXAF(booking.totalXAF)}
          </p>
          <p className="text-xs text-basalt-600 dark:text-basalt-300">
            {formatXAF(booking.subtotalXAF / booking.participants)} pp
          </p>
          {booking.status !== 'CANCELLED' && (
            <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
              {booking.paymentStatus === 'UNPAID'
                ? `${formatXAF(booking.depositXAF)} deposit + ${formatXAF(booking.balanceDueXAF)} cash`
                : `${formatXAF(booking.balanceDueXAF)} cash at trailhead`}
            </p>
          )}

          {!readOnly && booking.status !== 'CANCELLED' && (
            <div className="mt-3 flex flex-col gap-2">
              {booking.paymentStatus === 'UNPAID' && (
                <button
                  type="button"
                  onClick={() => onAct(booking.id, 'pay')}
                  disabled={busy}
                  className="btn-accent text-xs"
                >
                  {busy && <Spinner className="h-3 w-3" />}
                  Pay deposit
                </button>
              )}
              <button
                type="button"
                onClick={() => onAct(booking.id, 'cancel')}
                disabled={busy}
                className="btn-secondary text-xs"
              >
                Cancel booking
              </button>
            </div>
          )}
        </div>
      </div>

      {booking.tour.guide?.whatsapp && booking.status === 'CONFIRMED' && (
        <a
          href={`https://wa.me/${booking.tour.guide.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-xs font-semibold text-forest-700 hover:underline"
        >
          Message {booking.tour.guide.user.name} on WhatsApp →
        </a>
      )}
    </li>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-basalt-600 dark:text-basalt-300">{label}:</dt>
      <dd className="min-w-0 text-basalt-800 dark:text-basalt-200">{value}</dd>
    </div>
  );
}

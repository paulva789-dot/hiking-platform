'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDateRange, formatXAF } from '@/lib/format';
import type { Booking, TourSchedule } from '@/lib/types';
import { Alert, Spinner } from '@/components/ui';

export function BookingWidget({
  tourId,
  tourTitle,
  priceXAF,
  maxGroupSize,
  schedules,
}: {
  tourId: string;
  tourTitle: string;
  priceXAF: number;
  maxGroupSize: number;
  schedules: TourSchedule[];
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

  const selected = openSchedules.find((s) => s.id === scheduleId);
  const seatsLeft = selected ? selected.capacity - selected.seatsBooked : 0;
  const subtotal = priceXAF * participants;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
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

  if (booking) {
    return (
      <div className="card space-y-4 border-forest-300 bg-forest-50 p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-forest-700">Seat reserved</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-basalt-900 dark:text-basalt-50">{tourTitle}</h3>
        </div>

        <dl className="space-y-2 text-sm">
          <Row label="Reference" value={<code className="font-mono">{booking.reference}</code>} />
          <Row
            label="Dates"
            value={formatDateRange(booking.schedule.startDate, booking.schedule.endDate)}
          />
          <Row label="People" value={String(booking.participants)} />
          <Row label="Total" value={<strong>{formatXAF(booking.totalXAF)}</strong>} />
        </dl>

        <Alert tone="info">
          Your seat is held but not yet paid. Confirm payment from your bookings page — the guide
          will contact you on {booking.contactPhone} to arrange the meeting point.
        </Alert>

        <div className="flex gap-2">
          <button type="button" onClick={() => router.push('/dashboard/bookings')} className="btn-primary">
            Go to my bookings
          </button>
          <button type="button" onClick={() => setBooking(null)} className="btn-secondary">
            Book another date
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
          Every scheduled departure for this tour is full or past. Message the guide directly, or
          check the other tours on this trail.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <p className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">{formatXAF(priceXAF)}</p>
        <p className="text-xs text-basalt-500">per person · max {maxGroupSize} in a group</p>
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
          <p className="mt-1 text-xs font-semibold text-laterite-700 dark:text-laterite-400">
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
          Anything the guide should know? <span className="font-normal text-basalt-500">(optional)</span>
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
          <dt>Total</dt>
          <dd>{formatXAF(subtotal)}</dd>
        </div>
      </dl>

      {error && <Alert tone="danger">{error}</Alert>}

      <button type="submit" disabled={busy || !scheduleId} className="btn-accent w-full">
        {busy && <Spinner className="h-4 w-4" />}
        {user ? 'Reserve seats' : 'Sign in to book'}
      </button>

      <p className="text-xs leading-relaxed text-basalt-500">
        You pay nothing now. Reserving holds the seats; the guide confirms and arranges the meeting
        point. Free cancellation from your bookings page.
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

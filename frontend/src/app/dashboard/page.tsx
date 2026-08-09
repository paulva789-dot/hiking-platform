'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatDateRange, formatXAF } from '@/lib/format';
import type { Booking, EventTicket, Favorite } from '@/lib/types';
import { EmptyState, SectionHeading, Skeleton, Stat, StatusBadge } from '@/components/ui';

export default function DashboardOverview() {
  const { user, stats, guideProfile, isPremium } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get<{ bookings: Booking[] }>('/bookings').catch(() => ({ bookings: [] })),
      api.get<{ favorites: Favorite[] }>('/favorites').catch(() => ({ favorites: [] })),
      api.get<{ tickets: EventTicket[] }>('/content/tickets/mine').catch(() => ({ tickets: [] })),
    ]).then(([b, f, t]) => {
      if (cancelled) return;
      setBookings(b.bookings);
      setFavorites(f.favorites);
      setTickets(t.tickets);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = bookings
    .filter((b) => b.status !== 'CANCELLED' && new Date(b.schedule.startDate) >= new Date())
    .sort((a, b) => +new Date(a.schedule.startDate) - +new Date(b.schedule.startDate));

  return (
    <div className="space-y-10">
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Saved trails" value={stats?.favorites ?? 0} />
          <Stat label="Bookings" value={stats?.bookings ?? 0} hint={`${upcoming.length} upcoming`} />
          <Stat label="Reviews written" value={stats?.reviews ?? 0} />
          <Stat
            label="Membership"
            value={isPremium ? 'Premium' : 'Free'}
            hint={
              isPremium && user?.tierExpires
                ? `until ${formatDate(user.tierExpires)}`
                : 'offline maps locked'
            }
          />
        </div>
      </section>

      {guideProfile && guideProfile.status !== 'APPROVED' && (
        <section>
          <div className="card border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-amber-900">
                  Your guide profile is {guideProfile.status.toLowerCase()}
                </h2>
                <p className="mt-1 text-sm text-amber-900">
                  {guideProfile.status === 'PENDING'
                    ? 'We are reviewing your application. Your tours stay hidden until it is approved.'
                    : (guideProfile.reviewNote ??
                      'Update your profile with the missing details and it will go back into the review queue.')}
                </p>
              </div>
              <Link href="/guide" className="btn-secondary">
                Guide workspace
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------- upcoming */}
      <section>
        <SectionHeading
          title="Upcoming hikes"
          action={
            <Link href="/dashboard/bookings" className="btn-secondary text-xs">
              All bookings
            </Link>
          }
        />

        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : upcoming.length === 0 ? (
          <EmptyState
            title="Nothing booked yet"
            message="Browse guided tours on any trail page, or start with a guide covering your region."
            action={{ href: '/trails', label: 'Find a trail' }}
          />
        ) : (
          <ul className="space-y-3">
            {upcoming.slice(0, 3).map((booking) => (
              <li key={booking.id} className="card flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-basalt-900">{booking.tour.title}</h3>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-basalt-600">
                    {formatDateRange(booking.schedule.startDate, booking.schedule.endDate)} ·{' '}
                    {booking.participants} {booking.participants === 1 ? 'person' : 'people'}
                    {booking.tour.guide && ` · with ${booking.tour.guide.user.name}`}
                  </p>
                  <p className="mt-1 font-mono text-xs text-basalt-400">{booking.reference}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-semibold text-basalt-900">
                    {formatXAF(booking.totalXAF)}
                  </p>
                  <StatusBadge status={booking.paymentStatus === 'PAID' ? 'APPROVED' : 'PENDING'} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------- favorites */}
      <section>
        <SectionHeading
          title="Saved trails"
          action={
            <Link href="/dashboard/favorites" className="btn-secondary text-xs">
              See all
            </Link>
          }
        />

        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : favorites.length === 0 ? (
          <EmptyState
            title="No saved trails"
            message="Tap Save on any trail page to keep it here — it is also how Premium safety alerts know which trails to watch."
            action={{ href: '/trails', label: 'Browse trails' }}
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.slice(0, 6).map((fav) => (
              <li key={fav.id}>
                <Link href={`/trails/${fav.trail.slug}`} className="card block p-4 hover:shadow-md">
                  <p className="font-semibold text-basalt-900">{fav.trail.name}</p>
                  <p className="mt-1 text-xs text-basalt-500">
                    Saved {formatDate(fav.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --------------------------------------------------------- tickets */}
      {tickets.length > 0 && (
        <section>
          <SectionHeading title="Event tickets" />
          <ul className="space-y-3">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="card flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-basalt-900">{ticket.event.title}</h3>
                  <p className="mt-1 text-sm text-basalt-600">
                    {formatDate(ticket.event.startDate)} · {ticket.event.location}
                  </p>
                  <p className="mt-1 font-mono text-xs text-basalt-400">{ticket.reference}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-basalt-900">{formatXAF(ticket.totalXAF)}</p>
                  <p className="text-xs text-basalt-500">
                    {ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

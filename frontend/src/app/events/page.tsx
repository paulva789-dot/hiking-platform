import type { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import type { HikingEvent } from '@/lib/types';
import { REGION_LABELS, formatDateRange, formatXAF } from '@/lib/format';
import { EmptyState } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Hiking events and camping weekends',
  description:
    'Organised hiking events, camping weekends, outdoor festivals and nature excursions across Cameroon.',
};

export const revalidate = 300;

export default async function EventsPage() {
  const { events } = await serverFetch<{ events: HikingEvent[] }>('/content/events').catch(() => ({
    events: [] as HikingEvent[],
  }));

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <header className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-10">
          <h1 className="font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            Events
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600 dark:text-basalt-300">
            Camping weekends, training days, outdoor festivals and nature excursions. Tickets are
            sold here; capacity is real and limited.
          </p>
        </div>
      </header>

      <div className="section py-8">
        {events.length === 0 ? (
          <EmptyState
            title="No upcoming events"
            message="Nothing scheduled right now. Join a hiking group — most trips get organised there between events."
            action={{ href: '/groups', label: 'Browse groups' }}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {events.map((event) => {
              const soldOut = event.ticketsLeft <= 0;
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="card group overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div className="flex gap-5 p-6">
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-forest-700 text-white">
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {new Date(event.startDate).toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                      <span className="font-display text-3xl font-bold leading-none">
                        {new Date(event.startDate).getDate()}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-1.5">
                        {event.region && (
                          <span className="chip bg-forest-50 text-forest-800 ring-forest-200">
                            {REGION_LABELS[event.region]}
                          </span>
                        )}
                        {soldOut ? (
                          <span className="chip bg-basalt-200 text-basalt-700 dark:text-basalt-300 ring-basalt-300">
                            Sold out
                          </span>
                        ) : (
                          event.ticketsLeft <= 20 && (
                            <span className="chip bg-laterite-100 text-laterite-800 ring-laterite-200">
                              {event.ticketsLeft} left
                            </span>
                          )
                        )}
                      </div>

                      <h2 className="mt-2 font-display text-xl font-semibold text-basalt-900 dark:text-basalt-50 group-hover:text-forest-800">
                        {event.title}
                      </h2>
                      <p className="mt-1 text-xs text-basalt-500">
                        {formatDateRange(event.startDate, event.endDate)} · {event.location}
                      </p>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">
                        {event.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-basalt-100 pt-4">
                        <p className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                          {event.priceXAF === 0 ? 'Free' : formatXAF(event.priceXAF)}
                        </p>
                        <span className="text-xs font-semibold text-forest-700 group-hover:underline">
                          {soldOut ? 'View event' : 'Get tickets'} →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

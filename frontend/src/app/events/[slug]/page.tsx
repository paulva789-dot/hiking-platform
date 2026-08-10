import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, serverFetch } from '@/lib/api';
import type { HikingEvent } from '@/lib/types';
import { REGION_LABELS, formatDateRange } from '@/lib/format';
import { TicketPurchase } from './TicketPurchase';

export const revalidate = 120;

type Params = Promise<{ slug: string }>;

async function getEvent(slug: string) {
  try {
    const { event } = await serverFetch<{ event: HikingEvent }>(`/content/events/${slug}`, 120);
    return event;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug).catch(() => null);
  if (!event) return { title: 'Event not found' };
  return { title: event.title, description: event.description.slice(0, 160) };
}

export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <header className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-10">
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-basalt-600 dark:text-basalt-300">
            <Link href="/events" className="hover:text-basalt-900 dark:text-basalt-50">
              Events
            </Link>
          </nav>

          <div className="flex flex-wrap gap-2">
            {event.region && (
              <span className="chip bg-forest-100 text-forest-800 ring-forest-200">
                {REGION_LABELS[event.region]}
              </span>
            )}
            <span className="chip bg-basalt-100 text-basalt-700 dark:text-basalt-300 ring-basalt-200">
              {formatDateRange(event.startDate, event.endDate)}
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            {event.title}
          </h1>
          <p className="mt-2 text-basalt-600 dark:text-basalt-300">{event.location}</p>
        </div>
      </header>

      <div className="section grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-basalt-700 dark:text-basalt-300">
            {event.description}
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <Fact label="Dates" value={formatDateRange(event.startDate, event.endDate)} />
            <Fact label="Location" value={event.location} />
            <Fact
              label="Capacity"
              value={`${event.ticketsSold} of ${event.capacity} sold`}
            />
          </dl>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <TicketPurchase
            eventId={event.id}
            title={event.title}
            priceXAF={event.priceXAF}
            ticketsLeft={event.ticketsLeft}
          />
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-basalt-900 dark:text-basalt-50">{value}</dd>
    </div>
  );
}

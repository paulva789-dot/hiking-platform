import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, serverFetch } from '@/lib/api';
import type { Tour, TourSchedule } from '@/lib/types';
import { REGION_LABELS, formatDateRange, formatXAF } from '@/lib/format';
import { BookingWidget } from '@/components/trail/BookingWidget';
import { Avatar, Stars } from '@/components/ui';

export const revalidate = 60;

type Params = Promise<{ id: string }>;

async function getTour(id: string) {
  try {
    return await serverFetch<{ tour: Tour; schedules: TourSchedule[] }>(`/bookings/tours/${id}`, 60);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const data = await getTour(id).catch(() => null);
  if (!data) return { title: 'Tour not found' };

  return {
    title: data.tour.title,
    description: data.tour.description.slice(0, 160),
  };
}

export default async function TourPage({ params }: { params: Params }) {
  const { id } = await params;
  const data = await getTour(id);
  if (!data) notFound();

  const { tour, schedules } = data;

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <header className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-10">
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-basalt-500">
            <Link href="/guides" className="hover:text-basalt-900 dark:text-basalt-50">
              Guides
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/guides/${tour.guide.id}`} className="hover:text-basalt-900 dark:text-basalt-50">
              {tour.guide.user.name}
            </Link>
          </nav>

          <div className="flex flex-wrap gap-2">
            <span className="flag-chip">{tour.country}</span>
            <span className="chip bg-laterite-100 text-laterite-800 ring-laterite-200">
              {tour.durationDays} day{tour.durationDays > 1 ? 's' : ''}
            </span>
            <span className="chip bg-basalt-100 text-basalt-700 dark:text-basalt-300 ring-basalt-200">
              Max {tour.maxGroupSize} people
            </span>
            {tour.trail?.region && (
              <span className="chip bg-forest-100 text-forest-800 ring-forest-200">
                {REGION_LABELS[tour.trail.region]}
              </span>
            )}
          </div>

          <h1 className="mt-4 max-w-4xl font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            {tour.title}
          </h1>

          {tour.trail && (
            <Link
              href={`/trails/${tour.trail.slug}`}
              className="mt-3 inline-block text-sm font-semibold text-forest-700 hover:underline"
            >
              Full trail information for {tour.trail.name} →
            </Link>
          )}
        </div>
      </header>

      <div className="section grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-xl font-semibold text-basalt-900 dark:text-basalt-50">What this tour is</h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-basalt-700 dark:text-basalt-300">
              {tour.description}
            </p>
          </section>

          {(tour.includes.length > 0 || tour.excludes.length > 0) && (
            <section className="grid gap-5 sm:grid-cols-2">
              {tour.includes.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-display text-base font-semibold text-forest-800">
                    What&rsquo;s included
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {tour.includes.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-basalt-700 dark:text-basalt-300">
                        <span className="text-forest-600" aria-hidden>
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tour.excludes.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-display text-base font-semibold text-basalt-700 dark:text-basalt-300">
                    Not included
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {tour.excludes.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-basalt-600 dark:text-basalt-300">
                        <span className="text-basalt-400" aria-hidden>
                          ✕
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {tour.meetingPoint && (
            <section className="card p-5">
              <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">Meeting point</h3>
              <p className="mt-2 text-sm leading-relaxed text-basalt-700 dark:text-basalt-300">{tour.meetingPoint}</p>
            </section>
          )}

          <section>
            <h2 className="font-display text-xl font-semibold text-basalt-900 dark:text-basalt-50">Your guide</h2>
            <Link
              href={`/guides/${tour.guide.id}`}
              className="card mt-3 flex gap-4 p-5 transition-shadow hover:shadow-md"
            >
              <Avatar name={tour.guide.user.name} src={tour.guide.user.avatarUrl} size="lg" />
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                  {tour.guide.user.name}
                </p>
                {tour.guide.ratingAvg !== undefined && (
                  <Stars rating={tour.guide.ratingAvg} count={tour.guide.ratingCount} />
                )}
                <p className="mt-1.5 text-sm text-basalt-600 dark:text-basalt-300">{tour.guide.headline}</p>
                <p className="mt-2 text-xs text-basalt-500">
                  {tour.guide.yearsExperience} years guiding
                  {tour.guide.languages?.length
                    ? ` · speaks ${tour.guide.languages.join(', ')}`
                    : ''}
                </p>
              </div>
            </Link>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-basalt-900 dark:text-basalt-50">All departures</h2>
            {schedules.length === 0 ? (
              <p className="mt-3 text-sm text-basalt-600 dark:text-basalt-300">No upcoming departures scheduled.</p>
            ) : (
              <ul className="mt-3 divide-y divide-basalt-100 overflow-hidden rounded-xl border border-basalt-200 bg-white">
                {schedules.map((s) => {
                  const left = s.seatsLeft ?? s.capacity - s.seatsBooked;
                  return (
                    <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                      <span className="text-sm font-medium text-basalt-800">
                        {formatDateRange(s.startDate, s.endDate)}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          left === 0
                            ? 'text-basalt-400'
                            : left <= 3
                              ? 'text-laterite-700'
                              : 'text-forest-700'
                        }`}
                      >
                        {left === 0 ? 'Full' : `${left} of ${s.capacity} seats left`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget
            tourId={tour.id}
            tourTitle={tour.title}
            priceXAF={tour.priceXAF}
            maxGroupSize={tour.maxGroupSize}
            schedules={schedules}
          />
        </div>
      </div>
    </div>
  );
}

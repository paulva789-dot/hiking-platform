import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, serverFetch } from '@/lib/api';
import type { GuideProfile } from '@/lib/types';
import { REGION_LABELS, formatDateRange, formatXAF } from '@/lib/format';
import { Avatar, SectionHeading, Stars } from '@/components/ui';

export const revalidate = 300;

type Params = Promise<{ id: string }>;

async function getGuide(id: string) {
  try {
    const { guide } = await serverFetch<{ guide: GuideProfile }>(`/guides/${id}`);
    return guide;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const guide = await getGuide(id).catch(() => null);
  if (!guide) return { title: 'Guide not found' };

  return { title: `${guide.user.name} — hiking guide`, description: guide.headline };
}

export default async function GuideDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const guide = await getGuide(id);
  if (!guide) notFound();

  const tours = guide.tours ?? [];

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <header className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-10">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-basalt-600 dark:text-basalt-300">
            <Link href="/guides" className="hover:text-basalt-900 dark:text-basalt-50">
              Guides
            </Link>
            <span className="mx-2">/</span>
            <span className="text-basalt-700 dark:text-basalt-300">{guide.user.name}</span>
          </nav>

          <div className="flex flex-wrap items-start gap-6">
            <Avatar name={guide.user.name} src={guide.user.avatarUrl} size="lg" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50">
                  {guide.user.name}
                </h1>
                <span className="chip bg-forest-100 text-forest-800 ring-forest-200">Verified</span>
                {guide.plan === 'PRO' && (
                  <span className="chip bg-amber-100 text-amber-900 ring-amber-200">Pro member</span>
                )}
              </div>

              <p className="mt-2 text-lg text-basalt-700 dark:text-basalt-300">{guide.headline}</p>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-basalt-600 dark:text-basalt-300">
                <Stars rating={guide.ratingAvg} count={guide.ratingCount} />
                <span>{guide.yearsExperience} years guiding</span>
                <span>Speaks {guide.languages.join(', ')}</span>
              </div>
            </div>

            <div className="card w-full shrink-0 p-5 sm:w-64">
              <p className="text-[10px] font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-400">
                Day rate from
              </p>
              <p className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">
                {formatXAF(guide.dayRateXAF)}
              </p>
              {tours.length > 0 && (
                <a href="#tours" className="btn-accent mt-4 w-full">
                  See {tours.length} tour{tours.length === 1 ? '' : 's'}
                </a>
              )}
              {guide.whatsapp && (
                <a
                  href={`https://wa.me/${guide.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-2 w-full"
                >
                  Message on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="section grid gap-10 py-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">About</h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-basalt-700 dark:text-basalt-300">
              {guide.bio}
            </p>
          </section>

          <section id="tours" className="scroll-mt-24">
            <SectionHeading
              title="Tours and departure dates"
              description="Reserve a seat here; the guide confirms and arranges the meeting point with you."
            />

            {tours.length === 0 ? (
              <div className="card p-6">
                <p className="text-sm text-basalt-600 dark:text-basalt-300">
                  This guide has not published a scheduled tour yet. Contact them directly using the
                  details in the sidebar.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {tours.map((tour) => {
                  const open = tour.schedules.filter(
                    (s) => !s.cancelled && s.capacity - s.seatsBooked > 0
                  );
                  return (
                    <li key={tour.id} className="card p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                              {tour.title}
                            </h3>
                            <span className="flag-chip">{tour.country}</span>
                          </div>
                          {tour.trail && (
                            <Link
                              href={`/trails/${tour.trail.slug}`}
                              className="mt-1 inline-block text-xs font-semibold text-forest-700 hover:underline"
                            >
                              On {tour.trail.name} →
                            </Link>
                          )}
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">
                            {tour.description}
                          </p>
                          <p className="mt-2 text-xs text-basalt-600 dark:text-basalt-300">
                            {tour.durationDays} day{tour.durationDays > 1 ? 's' : ''} · max{' '}
                            {tour.maxGroupSize} people ·{' '}
                            {open.length > 0
                              ? `${open.length} open date${open.length === 1 ? '' : 's'}`
                              : 'no open dates'}
                          </p>
                          {open.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {open.slice(0, 3).map((s) => (
                                <span
                                  key={s.id}
                                  className="chip bg-basalt-100 text-basalt-700 dark:bg-basalt-800 dark:text-basalt-300 ring-basalt-200"
                                >
                                  {formatDateRange(s.startDate, s.endDate)} ·{' '}
                                  {s.capacity - s.seatsBooked} left
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-display text-xl font-semibold text-basalt-900 dark:text-basalt-50">
                            {formatXAF(tour.priceXAF)}
                          </p>
                          <p className="text-xs text-basalt-600 dark:text-basalt-300">per person</p>
                          <Link href={`/tours/${tour.id}`} className="btn-accent mt-3">
                            View & book
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">Covers</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {guide.regions.map((r) => (
                <Link
                  key={r}
                  href={`/trails?region=${r}`}
                  className="chip bg-forest-50 text-forest-800 ring-forest-200 hover:bg-forest-100"
                >
                  {REGION_LABELS[r]}
                </Link>
              ))}
            </div>
            {guide.countries && guide.countries.length > 0 && (
              <>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-400">
                  Countries
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {guide.countries.map((c) => (
                    <span key={c} className="flag-chip">
                      {c}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {guide.certifications.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">
                Certifications
              </h3>
              <ul className="mt-3 space-y-2">
                {guide.certifications.map((cert) => (
                  <li key={cert} className="flex gap-2 text-sm text-basalt-700 dark:text-basalt-300">
                    <span className="text-forest-600" aria-hidden>
                      ✓
                    </span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(guide.phone || guide.whatsapp) && (
            <div className="card p-5">
              <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">Contact</h3>
              {guide.phone && (
                <a
                  href={`tel:${guide.phone}`}
                  className="mt-2 block text-sm text-forest-700 hover:underline"
                >
                  {guide.phone}
                </a>
              )}
              <p className="mt-3 text-xs leading-relaxed text-basalt-600 dark:text-basalt-300">
                Booking through the platform means your seat, dates and price are on record. Direct
                arrangements are between you and the guide.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

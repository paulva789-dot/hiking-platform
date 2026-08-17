import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, buildQuery, serverFetch } from '@/lib/api';
import type { Listing, Review, Trail, TrailCard as TrailCardType } from '@/lib/types';
import {
  ACCOMMODATION_TYPE_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_MAP_COLOR,
  DIFFICULTY_MEANING,
  REGION_LABELS,
  SUGGESTED_ACCOMMODATION_ORDER,
  formatDateRange,
  formatDistance,
  formatDuration,
  formatXAF,
} from '@/lib/format';
import { SingleTrailMap } from '@/components/map/LazyMaps';
import { ElevationProfile } from '@/components/trail/ElevationProfile';
import { TranslatedHazards, TranslatedTrailProse, TranslatedTrailText } from '@/components/trail/TranslatedTrailText';
import { Reveal } from '@/components/Reveal';
import { WeatherPanel } from '@/components/WeatherPanel';
import { TrailCard } from '@/components/TrailCard';
import { TrailImageFallback } from '@/components/TrailImageFallback';
import { ReviewSection } from '@/components/trail/ReviewSection';
import { FavoriteButton, OfflinePackButton } from '@/components/trail/TrailActions';
import { Alert, DifficultyChip, SectionHeading, Stars } from '@/components/ui';
import { T } from '@/components/T';

export const revalidate = 300;

interface TrailResponse {
  trail: Trail;
  isFavorite: boolean;
  myReviewId: string | null;
  ratingBreakdown: { rating: number; count: number }[];
}

type Params = Promise<{ slug: string }>;

async function getTrail(slug: string) {
  try {
    return await serverFetch<TrailResponse>(`/trails/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTrail(slug).catch(() => null);
  if (!data) return { title: 'Trail not found' };

  const { trail } = data;
  return {
    title: trail.name,
    description: trail.summary,
    openGraph: {
      title: trail.name,
      description: trail.summary,
      images: trail.coverImage ? [trail.coverImage] : undefined,
    },
  };
}

export default async function TrailDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getTrail(slug);
  if (!data) notFound();

  const { trail, ratingBreakdown } = data;
  const nearby = await serverFetch<{ trails: TrailCardType[] }>(`/trails/${slug}/nearby`).catch(
    () => ({ trails: [] })
  );
  const nearbyStays = await serverFetch<{ listings: Listing[] }>(
    `/content/listings${buildQuery({ kind: 'ACCOMMODATION', region: trail.region })}`
  )
    .then((d) =>
      [...d.listings].sort((a, b) => {
        const order = SUGGESTED_ACCOMMODATION_ORDER[trail.difficulty];
        const rank = (l: Listing) => (l.accommodationType ? order.indexOf(l.accommodationType) : order.length);
        return rank(a) - rank(b);
      })
    )
    .catch(() => [] as Listing[]);

  return (
    <article className="pb-20">
      {/* ------------------------------------------------------------ hero */}
      <header className="relative bg-forest-950 text-white">
        <div className="absolute inset-0">
          {trail.coverImage ? (
            <Image src={trail.coverImage} alt="" fill priority className="object-cover opacity-45" />
          ) : (
            <TrailImageFallback difficulty={trail.difficulty} className="opacity-45" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/70 to-forest-950/40" />
        </div>

        <div className="section relative pb-10 pt-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-basalt-300">
            <Link href="/" className="hover:text-white">
              <T k="common.home" />
            </Link>
            <span className="mx-2">/</span>
            <Link href="/trails" className="hover:text-white">
              <T k="nav.trails" />
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/trails?region=${trail.region}`} className="hover:text-white">
              {REGION_LABELS[trail.region]}
            </Link>
          </nav>

          <div className="flex flex-wrap gap-2">
            <DifficultyChip difficulty={trail.difficulty} />
            <span className="chip bg-white/15 text-white ring-white/25">
              {REGION_LABELS[trail.region]}
            </span>
            {trail.permitRequired && (
              <span className="chip bg-amber-400/20 text-amber-100 ring-amber-300/40">
                <T k="trailDetail.permitRequiredBadge" />
              </span>
            )}
            {trail.summitM && (
              <span className="chip bg-white/15 text-white ring-white/25">
                <T k="trailDetail.summitBadge" params={{ n: trail.summitM.toLocaleString() }} />
              </span>
            )}
          </div>

          <h1 className="mt-4 max-w-4xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {trail.name}
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-basalt-200">
            <TranslatedTrailText english={trail.summary} translations={trail.translations} field="summary" />
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-basalt-300">
            <Stars rating={trail.ratingAvg} count={trail.ratingCount} />
            <span>
              <T k="trailCard.nearestTown" params={{ town: trail.nearestTown }} />
            </span>
            <span>
              <T k="trailDetail.saved" params={{ n: trail._count.favorites }} />
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <FavoriteButton trailId={trail.id} slug={trail.slug} />
            <a href="#book" className="btn bg-white/10 text-white ring-1 ring-inset ring-white/25 hover:bg-white/20">
              <T k="trailDetail.bookTour" />
            </a>
            <a href="#map" className="btn bg-white/10 text-white ring-1 ring-inset ring-white/25 hover:bg-white/20">
              <T k="trailDetail.seeRoute" />
            </a>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------- key facts */}
      <section className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <dl className="section grid grid-cols-2 divide-basalt-200 py-6 sm:grid-cols-4 sm:divide-x">
          <KeyFact label={<T k="trailCard.distance" />} value={formatDistance(trail.distanceKm)} sub={<T k="trailDetail.roundTrip" />} />
          <KeyFact
            label={<T k="filters.timeNeeded" />}
            value={formatDuration(trail.durationMinutes)}
            sub={<T k="trailDetail.moderatelyFitHiker" />}
          />
          <KeyFact
            label={<T k="trailDetail.totalAscent" />}
            value={`${trail.elevationGainM.toLocaleString()} m`}
            sub={
              trail.summitM ? (
                <T k="trailDetail.toSummit" params={{ n: trail.summitM.toLocaleString() }} />
              ) : (
                <T k="trailDetail.cumulative" />
              )
            }
          />
          <KeyFact
            label={<T k="filters.difficulty" />}
            value={DIFFICULTY_LABELS[trail.difficulty]}
            sub={DIFFICULTY_MEANING[trail.difficulty]}
            numeric={false}
          />
        </dl>
      </section>

      <div className="section grid gap-10 pt-10 lg:grid-cols-[1fr_360px]">
        {/* ------------------------------------------------------ main column */}
        <div className="space-y-12">
          <Reveal>
            <section className="card animate-fade-up p-6 motion-reduce:animate-none sm:p-8">
              <h2 className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">
                <T k="trailDetail.aboutHike" />
              </h2>
              <div className="prose-trail mt-4">
                <TranslatedTrailProse english={trail.description} translations={trail.translations} />
              </div>
            </section>
          </Reveal>

          {/* ------------------------------------------------------------ map */}
          <Reveal>
          <section id="map" className="scroll-mt-24 animate-fade-up motion-reduce:animate-none">
            <SectionHeading
              title={<T k="trailDetail.routeWaypoints" />}
              description={<T k="trailDetail.routeWaypointsDesc" />}
            />
            <div className="overflow-hidden rounded-xl border border-basalt-200">
              <SingleTrailMap trail={trail} waypoints={trail.waypoints} height="440px" />
            </div>

            {trail.waypoints.length >= 2 && (
              <div className="card mt-4 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-basalt-500 dark:text-basalt-400">
                  <T k="trailDetail.elevationProfile" />
                </p>
                <ElevationProfile waypoints={trail.waypoints} color={DIFFICULTY_MAP_COLOR[trail.difficulty]} />
              </div>
            )}

            {trail.waypoints.length > 0 && (
              <ol className="mt-5 space-y-3">
                {trail.waypoints.map((wp, i) => (
                  <li key={wp.id} className="card flex gap-4 p-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest-700 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="font-semibold text-basalt-900 dark:text-basalt-50">{wp.name}</h3>
                        {wp.elevationM !== null && (
                          <span className="text-xs font-medium text-basalt-600 dark:text-basalt-300">
                            {wp.elevationM.toLocaleString()} m
                          </span>
                        )}
                      </div>
                      {wp.description && (
                        <p className="mt-1 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">{wp.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
          </Reveal>

          {/* -------------------------------------------------- safety block */}
          <Reveal>
          <section className="animate-fade-up motion-reduce:animate-none">
            <SectionHeading
              title={<T k="trailDetail.hazardsTitle" />}
              description={<T k="trailDetail.hazardsDesc" />}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {trail.hazards.length > 0 && (
                <div className="card border-red-200 bg-red-50 p-5 dark:border-red-800/60 dark:bg-red-950/40 sm:col-span-2">
                  <h3 className="font-display text-base font-semibold text-red-900 dark:text-red-200">
                    <T k="trailDetail.knownHazards" />
                  </h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    <TranslatedHazards english={trail.hazards} translations={trail.translations} />
                  </ul>
                </div>
              )}

              {trail.waterSources && (
                <InfoCard
                  title={<T k="trailDetail.water" />}
                  body={
                    <TranslatedTrailText
                      english={trail.waterSources}
                      translations={trail.translations}
                      field="waterSources"
                    />
                  }
                />
              )}
              {trail.permitInfo && (
                <InfoCard
                  title={<T k={trail.permitRequired ? 'trailDetail.permitRequired' : 'trailDetail.permit'} />}
                  body={
                    <TranslatedTrailText
                      english={trail.permitInfo}
                      translations={trail.translations}
                      field="permitInfo"
                    />
                  }
                  tone={trail.permitRequired ? 'warn' : 'default'}
                />
              )}
              {trail.gettingThere && (
                <InfoCard
                  title={<T k="trailDetail.gettingThere" />}
                  body={
                    <TranslatedTrailText
                      english={trail.gettingThere}
                      translations={trail.translations}
                      field="gettingThere"
                    />
                  }
                  className="sm:col-span-2"
                />
              )}
              {trail.bestMonths.length > 0 && (
                <div className="card p-5 sm:col-span-2">
                  <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">
                    <T k="trailDetail.bestMonths" />
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {trail.bestMonths.map((month) => (
                      <span key={month} className="chip bg-forest-100 text-forest-800 ring-forest-200">
                        {month}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/safety" className="mt-4 inline-block text-sm font-semibold text-forest-700 hover:underline">
              <T k="trailDetail.readSafety" />
            </Link>
          </section>
          </Reveal>

          {/* ---------------------------------------------------- guided tours */}
          <Reveal>
          <section id="book" className="scroll-mt-24 animate-fade-up motion-reduce:animate-none">
            <SectionHeading
              eyebrow={<T k="trailDetail.bookIt" />}
              title={<T k="trailDetail.guidedTours" />}
              description={<T k="trailDetail.guidedToursDesc" />}
            />

            {trail.tours.length === 0 ? (
              <div className="card p-6">
                <p className="text-sm text-basalt-600 dark:text-basalt-300">
                  <T k="trailDetail.noTours" params={{ region: REGION_LABELS[trail.region] }} />
                </p>
                <Link href={`/guides?region=${trail.region}`} className="btn-secondary mt-4">
                  <T k="trailDetail.guidesInRegion" params={{ region: REGION_LABELS[trail.region] }} />
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {trail.tours.map((tour) => (
                  <li key={tour.id} className="card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                          {tour.title}
                        </h3>
                        <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
                          <T k="trailDetail.withGuide" params={{ name: tour.guide.user.name }} /> ·{' '}
                          {tour.durationDays}{' '}
                          <T k={tour.durationDays > 1 ? 'trailDetail.day.other' : 'trailDetail.day.one'} /> ·{' '}
                          <T k="trailDetail.maxPeople" params={{ n: tour.maxGroupSize }} />
                        </p>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">
                          {tour.description}
                        </p>

                        {tour.includes.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {tour.includes.slice(0, 4).map((inc) => (
                              <span key={inc} className="chip bg-forest-50 text-forest-800 ring-forest-200">
                                ✓ {inc}
                              </span>
                            ))}
                            {tour.includes.length > 4 && (
                              <span className="chip bg-basalt-100 text-basalt-600 dark:text-basalt-300 ring-basalt-200">
                                <T k="trailDetail.moreCount" params={{ n: tour.includes.length - 4 }} />
                              </span>
                            )}
                          </div>
                        )}

                        {tour.schedules.length > 0 && (
                          <p className="mt-3 text-xs text-basalt-600 dark:text-basalt-300">
                            <T k="trailDetail.nextDepartures" />{' '}
                            {tour.schedules
                              .slice(0, 2)
                              .map((s) => formatDateRange(s.startDate, s.endDate))
                              .join(' · ')}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-mono text-xl font-semibold tabular-nums text-basalt-900 dark:text-basalt-50">
                          {formatXAF(tour.priceXAF)}
                        </p>
                        <p className="text-xs text-basalt-600 dark:text-basalt-300">
                          <T k="trailDetail.perPerson" />
                        </p>
                        <Link href={`/tours/${tour.id}`} className="btn-accent mt-3">
                          <T k="trailDetail.viewBook" />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          </Reveal>

          {/* -------------------------------------------------------- gallery */}
          {trail.photos.length > 0 && (
            <Reveal>
            <section className="animate-fade-up motion-reduce:animate-none">
              <SectionHeading
                title={<T k="trailDetail.photosTitle" />}
                description={<T k="trailDetail.photosDesc" />}
                action={
                  <Link href={`/gallery?trail=${trail.id}`} className="btn-secondary">
                    <T k="trailDetail.allPhotos" />
                  </Link>
                }
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {trail.photos.map((photo) => (
                  <figure key={photo.id} className="group relative overflow-hidden rounded-xl bg-basalt-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption ?? `Photo of ${trail.name}`}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="font-medium">{photo.user.name}</p>
                      {photo.forSale && photo.priceXAF && (
                        <p className="text-amber-300">
                          <T k="trailDetail.licenceFrom" params={{ price: formatXAF(photo.priceXAF) }} />
                        </p>
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
            </Reveal>
          )}

          {/* -------------------------------------------------------- reviews */}
          <Reveal>
          <ReviewSection
            trailId={trail.id}
            trailSlug={trail.slug}
            initialReviews={trail.reviews as Review[]}
            totalReviews={trail._count.reviews}
            ratingAvg={trail.ratingAvg}
            breakdown={ratingBreakdown}
          />
          </Reveal>
        </div>

        {/* ---------------------------------------------------------- sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <WeatherPanel lat={trail.startLat} lng={trail.startLng} trailName={trail.name} />

          <div className="card p-5">
            <OfflinePackButton slug={trail.slug} trailName={trail.name} />
          </div>

          <div className="card p-5">
            <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">
              <T k="trailDetail.trailhead" />
            </h3>
            <p className="mt-2 font-mono text-sm text-basalt-700 dark:text-basalt-300">
              {trail.startLat.toFixed(4)}, {trail.startLng.toFixed(4)}
            </p>
            <a
              href={`https://www.openstreetmap.org/?mlat=${trail.startLat}&mlon=${trail.startLng}#map=13/${trail.startLat}/${trail.startLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-3 w-full text-xs"
            >
              <T k="trailDetail.openOsm" />
            </a>
          </div>

          {nearbyStays.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">
                <T k="trailDetail.whereToStay" />
              </h3>
              <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
                {trail.difficulty === 'EXPERT' || trail.difficulty === 'HARD' ? (
                  <T k="trailDetail.stayHintHard" />
                ) : (
                  <T k="trailDetail.stayHintEasy" params={{ region: REGION_LABELS[trail.region] }} />
                )}
              </p>
              <ul className="mt-3 space-y-3">
                {nearbyStays.slice(0, 3).map((listing) => (
                  <li key={listing.id} className="border-t border-basalt-100 pt-3 first:border-t-0 first:pt-0 dark:border-basalt-800">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-basalt-900 dark:text-basalt-50">{listing.name}</p>
                      {listing.accommodationType && (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-terracotta-700 dark:text-terracotta-400">
                          {ACCOMMODATION_TYPE_LABELS[listing.accommodationType]}
                        </span>
                      )}
                    </div>
                    {listing.town && <p className="text-xs text-basalt-600 dark:text-basalt-300">{listing.town}</p>}
                  </li>
                ))}
              </ul>
              <Link href={`/stay?region=${trail.region}`} className="btn-secondary mt-4 w-full text-xs">
                <T k="trailDetail.seeAllStays" params={{ region: REGION_LABELS[trail.region] }} />
              </Link>
            </div>
          )}

          <Alert tone="warn" title={<T k="trailDetail.beforeYouSetOff" />}>
            <T k="trailDetail.beforeYouSetOffBody" />
          </Alert>
        </aside>
      </div>

      {/* --------------------------------------------------------- nearby */}
      {nearby.trails.length > 0 && (
        <section className="section mt-16">
          <SectionHeading
            title={<T k="trailDetail.moreInRegion" params={{ region: REGION_LABELS[trail.region] }} />}
            description={<T k="trailDetail.moreInRegionDesc" />}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.trails.map((t, i) => (
              <Reveal key={t.id}>
                <div className="animate-fade-up motion-reduce:animate-none" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                  <TrailCard trail={t} />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function KeyFact({
  label,
  value,
  sub,
  numeric = true,
}: {
  label: ReactNode;
  value: string;
  sub?: ReactNode;
  numeric?: boolean;
}) {
  return (
    <div className="px-2 py-2 text-center sm:px-4">
      <dt className="text-[11px] font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-400">{label}</dt>
      <dd
        className={`mt-1 text-xl font-semibold text-basalt-900 dark:text-basalt-50 ${
          numeric ? 'font-mono tabular-nums' : 'font-display'
        }`}
      >
        {value}
      </dd>
      {sub && <p className="mt-0.5 text-xs leading-snug text-basalt-600 dark:text-basalt-300">{sub}</p>}
    </div>
  );
}

function InfoCard({
  title,
  body,
  tone = 'default',
  className = '',
}: {
  title: ReactNode;
  body: ReactNode;
  tone?: 'default' | 'warn';
  className?: string;
}) {
  return (
    <div
      className={`card p-5 ${tone === 'warn' ? 'border-amber-200 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/40' : ''} ${className}`}
    >
      <h3
        className={`font-display text-base font-semibold ${
          tone === 'warn' ? 'text-amber-900 dark:text-amber-200' : 'text-basalt-900 dark:text-basalt-50'
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          tone === 'warn' ? 'text-amber-900 dark:text-amber-200' : 'text-basalt-600 dark:text-basalt-300'
        }`}
      >
        {body}
      </p>
    </div>
  );
}

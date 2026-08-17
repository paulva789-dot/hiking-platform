import Image from 'next/image';
import Link from 'next/link';
import heroPhoto from '@/assets/hero-rhumsiki.jpg';
import { serverFetch } from '@/lib/api';
import type { GuideCard, HikingEvent, SafetyCategory, TrailCard as TrailCardType } from '@/lib/types';
import { ALL_DIFFICULTIES, DIFFICULTY_LABELS, DIFFICULTY_MEANING, REGION_LABELS, formatXAF } from '@/lib/format';
import { TrailCard } from '@/components/TrailCard';
import { AdBanner } from '@/components/AdBanner';
import { DifficultyChip, SectionHeading, Stars } from '@/components/ui';
import { TrailSearchBar } from '@/components/TrailSearchBar';
import { RegionPlacePicker } from '@/components/RegionPlacePicker';
import { CloudDrift } from '@/components/SceneOverlay';
import { T } from '@/components/T';
import { AnimatedText } from '@/components/AnimatedText';
import { Reveal } from '@/components/Reveal';
import type { TranslationKey } from '@/lib/i18n/translations';

export const revalidate = 300;

const WHAT_HIKING_ENTAILS: { titleKey: TranslationKey; bodyKey: TranslationKey; icon: React.ReactNode }[] = [
  {
    titleKey: 'whatIsHiking.route.title',
    bodyKey: 'whatIsHiking.route.body',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l4-11 3 5 3-8 6 14H4z" />
      </svg>
    ),
  },
  {
    titleKey: 'whatIsHiking.fitness.title',
    bodyKey: 'whatIsHiking.fitness.body',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    titleKey: 'whatIsHiking.gear.title',
    bodyKey: 'whatIsHiking.gear.body',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 8V6a6 6 0 1112 0v2M4 8h16l-1 13H5L4 8z" />
      </svg>
    ),
  },
  {
    titleKey: 'whatIsHiking.guide.title',
    bodyKey: 'whatIsHiking.guide.body',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
        <circle cx="12" cy="8" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
      </svg>
    ),
  },
];

async function getHomeData() {
  // Each call is independently cached, and a failure in one section should not
  // blank the whole landing page.
  const settle = <R,>(p: Promise<R>, fallback: R) => p.catch(() => fallback);

  const [popular, easy, guides, events, safety] = await Promise.all([
    settle(serverFetch<{ trails: TrailCardType[]; pagination: { total: number } }>('/trails?sort=popular&limit=6'), {
      trails: [],
      pagination: { total: 0 },
    }),
    settle(serverFetch<{ trails: TrailCardType[] }>('/trails?difficulty=EASY&limit=3'), { trails: [] }),
    settle(serverFetch<{ guides: GuideCard[] }>('/guides?limit=3'), { guides: [] }),
    settle(serverFetch<{ events: HikingEvent[] }>('/content/events'), { events: [] }),
    settle(serverFetch<{ categories: SafetyCategory[] }>('/content/safety'), { categories: [] }),
  ]);

  return {
    popular: popular.trails,
    totalTrails: popular.pagination.total,
    easy: easy.trails,
    guides: guides.guides,
    events: events.events.slice(0, 2),
    safety: safety.categories.flatMap((c) => c.items).slice(0, 3),
  };
}

export default async function HomePage() {
  const { popular, totalTrails, easy, guides, events, safety } = await getHomeData();
  const regionsCovered = new Set(popular.map((t) => t.region)).size;

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="relative overflow-hidden bg-forest-950 text-white">
        <div className="absolute inset-0">
          <Image
            src={heroPhoto}
            alt=""
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/80 to-forest-950" />
          <CloudDrift />
        </div>
        <p className="absolute bottom-1.5 right-3 z-10 text-[10px] text-basalt-400">
          Rhumsiki Peak, Far North — Wikimedia Commons
        </p>

        <div className="section relative py-20 sm:py-28">
          <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
            <AnimatedText k="hero.title" startDelay={0.1} />
          </h1>

          <p
            className="mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-basalt-200 motion-reduce:animate-none"
            style={{ animationDelay: '0.7s', opacity: 0, animationFillMode: 'both' }}
          >
            <T k="hero.body" />
          </p>

          <div className="mt-8 max-w-2xl">
            <TrailSearchBar variant="hero" />
          </div>

          <a
            href="#difficulty"
            className="mt-4 inline-block text-sm font-semibold text-basalt-300 hover:text-white hover:underline"
          >
            <T k="hero.difficultyLink" /> →
          </a>

          <p className="mt-8 max-w-2xl font-mono text-sm tabular-nums text-basalt-300">
            <T k="hero.statLine" params={{ summit: '4,040 m', n: totalTrails || 17 }} />
          </p>
        </div>
      </section>

      <div className="section pt-8">
        <AdBanner placement="home-hero" />
      </div>

      {/* ------------------------------------------------ popular trails */}
      <section className="py-16">
        <div className="section">
          <SectionHeading
            eyebrow="Trails"
            title="Where people are hiking"
            description={`Volcanic summits, crater lakes, rainforest and savannah — spread across ${regionsCovered || 10} regions.`}
            action={
              <Link href="/trails" className="btn-secondary">
                All {totalTrails || 17} trails
              </Link>
            }
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((trail, i) => (
              <TrailCard key={trail.id} trail={trail} priority={i < 3} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- first hikes */}
      {easy.length > 0 && (
        <section className="bg-basalt-100 py-16 dark:bg-basalt-900">
          <div className="section">
            <SectionHeading
              eyebrow="Never hiked before?"
              title="Start with one of these"
              description="Under four hours, clear paths, and reachable in a day from Douala or Yaoundé. Do these before you book Mount Cameroon."
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {easy.map((trail) => (
                <TrailCard key={trail.id} trail={trail} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- guides */}
      {guides.length > 0 && (
        <section className="py-16">
          <div className="section">
            <SectionHeading
              eyebrow="Registered guides"
              title="Booked directly, verified by us"
              description="Every guide on the platform is checked before their tours go live. Rates are theirs; we take a transparent commission on bookings. Booking is not limited to Cameroon — some guides run tours across Central Africa."
              action={
                <Link href="/guides" className="btn-secondary">
                  All guides
                </Link>
              }
            />

            <div className="grid gap-5 md:grid-cols-3">
              {guides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.id}`}
                  className="card group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    {guide.user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={guide.user.avatarUrl}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-700 font-semibold text-white">
                        {guide.user.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-semibold text-basalt-900 dark:text-basalt-50">{guide.user.name}</p>
                        <span
                          className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-forest-100 text-forest-700 dark:bg-forest-900/50 dark:text-forest-400"
                          title="Verified guide"
                          aria-label="Verified guide"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                            <path
                              fillRule="evenodd"
                              d="M10 1.5l2.1 1.9 2.8-.4.9 2.7 2.7.9-.4 2.8 1.9 2.1-1.9 2.1.4 2.8-2.7.9-.9 2.7-2.8-.4-2.1 1.9-2.1-1.9-2.8.4-.9-2.7-2.7-.9.4-2.8-1.9-2.1 1.9-2.1-.4-2.8 2.7-.9.9-2.7 2.8.4z"
                              clipRule="evenodd"
                            />
                            <path
                              fill="#fff"
                              d="M8.6 12.4L6.4 10.2l-1 1 3.2 3.2 5.5-5.5-1-1z"
                            />
                          </svg>
                        </span>
                      </div>
                      <Stars rating={guide.ratingAvg} count={guide.ratingCount} />
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm font-medium leading-snug text-basalt-800 dark:text-basalt-200">
                    {guide.headline}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {guide.regions.slice(0, 3).map((r) => (
                      <span key={r} className="chip bg-basalt-100 text-basalt-700 dark:bg-basalt-800 dark:text-basalt-300 ring-basalt-200">
                        {REGION_LABELS[r]}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-end justify-between border-t border-basalt-100 pt-3 dark:border-basalt-800">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-400">
                        From
                      </p>
                      <p className="font-mono text-sm font-semibold tabular-nums text-basalt-900 dark:text-basalt-50">
                        {formatXAF(guide.dayRateXAF)}
                        <span className="font-sans font-normal text-basalt-500 dark:text-basalt-400"> /day</span>
                      </p>
                    </div>
                    <p className="text-xs text-basalt-600 dark:text-basalt-300">
                      Speaks {guide.languages.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------- difficulty key */}
      <section id="difficulty" className="scroll-mt-16 bg-basalt-100 py-16 dark:bg-basalt-900">
        <div className="section">
          <SectionHeading
            eyebrow="Ratings you can trust"
            title="What our difficulty levels mean"
            description="These are not vibes. Each level is a specific commitment about time, terrain and consequence, and every trail is rated against it."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ALL_DIFFICULTIES.map((level) => (
              <Link
                key={level}
                href={`/trails?difficulty=${level}`}
                className="card group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <DifficultyChip difficulty={level} />
                <p className="mt-3 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">{DIFFICULTY_MEANING[level]}</p>
                <p className="mt-3 text-xs font-semibold text-forest-700 group-hover:underline dark:text-forest-400">
                  See {DIFFICULTY_LABELS[level].toLowerCase()} trails →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- what we fix */}
      <section className="border-b border-basalt-200 bg-white py-14 dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section">
          <Reveal>
            <SectionHeading
              eyebrow="Why this exists"
              title="Bad information keeps people off the trail"
              description="Every problem below is one we heard from people who wanted to hike in Cameroon and gave up. Each one has a specific answer on this site."
            />
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            <ProblemCard
              problem="&ldquo;How long does it actually take?&rdquo;"
              answer="Every trail carries a measured distance, ascent and realistic duration for a moderately fit hiker — plus what the difficulty rating commits to."
              href="/trails"
              cta="Browse trails"
            />
            <ProblemCard
              problem="&ldquo;Is it safe right now?&rdquo;"
              answer="Live conditions on every trail page, read as a plain verdict: good to go, take care, or not advisable. Plus hazards, water, and regional security notes."
              href="/safety"
              cta="Read safety guidance"
            />
            <ProblemCard
              problem="&ldquo;Who do I even ask?&rdquo;"
              answer="Registered guides with verified profiles, real day rates, languages spoken, and departure dates you can book without a phone call."
              href="/guides"
              cta="Find a guide"
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- trip picker */}
      <section className="border-b border-basalt-200 bg-white py-14 dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section">
          <RegionPlacePicker />
        </div>
      </section>

      {/* ------------------------------------------------- what is hiking */}
      <section className="border-b border-basalt-200 bg-basalt-100 py-14 dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <Reveal>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-forest-700 dark:text-forest-400">
              <T k="whatIsHiking.eyebrow" />
            </p>
            <h2 className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-3xl">
              <AnimatedText k="whatIsHiking.title" />
            </h2>
            <p
              className="mt-3 animate-fade-up text-sm leading-relaxed text-basalt-600 dark:text-basalt-300 motion-reduce:animate-none"
              style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'both' }}
            >
              <T k="whatIsHiking.body" />
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {WHAT_HIKING_ENTAILS.map((item, i) => (
              <Reveal key={item.titleKey}>
                <div
                  className="card animate-fade-up p-5 motion-reduce:animate-none"
                  style={{ animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: 'both' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-700 dark:bg-forest-900/40 dark:text-forest-300" aria-hidden>
                      {item.icon}
                    </span>
                    <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">
                      <T k={item.titleKey} />
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">
                    <T k={item.bodyKey} />
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- safety teaser */}
      {safety.length > 0 && (
        <section className="bg-forest-950 py-16 text-white">
          <div className="section grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-forest-400">
                Before you go
              </p>
              <h2 className="font-display text-3xl font-semibold">
                The things that actually go wrong
              </h2>
              <p className="mt-4 leading-relaxed text-basalt-300">
                Mountain rescue does not exist here. On Mount Cameroon, evacuation means your guide
                and porters carrying you down. That single fact shapes every piece of advice on this
                site — and it is why we would rather tell you to turn back than sell you a summit.
              </p>
              <Link href="/safety" className="btn-accent mt-6">
                Read all safety guidelines
              </Link>
            </div>

            <ul className="space-y-3">
              {safety.map((item) => (
                <li key={item.id} className="rounded-xl bg-white/5 p-5 ring-1 ring-white/10">
                  <h3 className="font-display text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-basalt-300">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- events */}
      {events.length > 0 && (
        <section className="py-16">
          <div className="section">
            <SectionHeading
              eyebrow="What&rsquo;s on"
              title="Upcoming events"
              action={
                <Link href="/events" className="btn-secondary">
                  All events
                </Link>
              }
            />
            <div className="grid gap-5 md:grid-cols-2">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="card group flex gap-4 overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-forest-700 text-white">
                    <span className="text-xs font-semibold uppercase">
                      {new Date(event.startDate).toLocaleDateString('en-GB', { month: 'short' })}
                    </span>
                    <span className="font-display text-xl font-bold leading-none">
                      {new Date(event.startDate).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50 group-hover:text-forest-800">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">{event.location}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-basalt-600 dark:text-basalt-300">{event.description}</p>
                    <p className="mt-2 text-xs font-semibold text-terracotta-700 dark:text-terracotta-400">
                      {event.ticketsLeft} of {event.capacity} tickets left
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ CTA */}
      <section className="bg-terracotta-600 py-14 text-white">
        <div className="section flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Save trails, book guides, share your photos
            </h2>
            <p className="mt-2 max-w-xl text-terracotta-50">
              A free account gets you saved trails, reviews, photo uploads and direct booking.
              Premium adds downloadable offline packs — route, waypoints, hazards and emergency
              numbers — for when the signal goes, which on these mountains it will.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/register" className="btn bg-white text-terracotta-700 hover:bg-terracotta-50">
              Create free account
            </Link>
            <Link href="/premium" className="btn bg-terracotta-700 text-white hover:bg-terracotta-800">
              See Premium
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function ProblemCard({
  problem,
  answer,
  href,
  cta,
}: {
  problem: string;
  answer: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="card flex flex-col p-6">
      <p className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">{problem}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">{answer}</p>
      <Link href={href} className="mt-4 text-sm font-semibold text-forest-700 hover:underline dark:text-forest-400">
        {cta} →
      </Link>
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import type { GuideCard, HikingEvent, SafetyCategory, TrailCard as TrailCardType } from '@/lib/types';
import { ALL_DIFFICULTIES, DIFFICULTY_LABELS, DIFFICULTY_MEANING, REGION_LABELS } from '@/lib/format';
import { TrailCard } from '@/components/TrailCard';
import { SectionHeading, Stars } from '@/components/ui';
import { TrailSearchBar } from '@/components/TrailSearchBar';

export const revalidate = 300;

async function getHomeData() {
  // Each call is independently cached, and a failure in one section should not
  // blank the whole landing page.
  const settle = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback);

  const [popular, easy, guides, events, safety] = await Promise.all([
    settle(serverFetch<{ trails: TrailCardType[] }>('/trails?sort=popular&limit=6'), { trails: [] }),
    settle(serverFetch<{ trails: TrailCardType[] }>('/trails?difficulty=EASY&limit=3'), { trails: [] }),
    settle(serverFetch<{ guides: GuideCard[] }>('/guides?limit=3'), { guides: [] }),
    settle(serverFetch<{ events: HikingEvent[] }>('/content/events'), { events: [] }),
    settle(serverFetch<{ categories: SafetyCategory[] }>('/content/safety'), { categories: [] }),
  ]);

  return {
    popular: popular.trails,
    easy: easy.trails,
    guides: guides.guides,
    events: events.events.slice(0, 2),
    safety: safety.categories.flatMap((c) => c.items).slice(0, 3),
  };
}

export default async function HomePage() {
  const { popular, easy, guides, events, safety } = await getHomeData();
  const regionsCovered = new Set(popular.map((t) => t.region)).size;

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="relative overflow-hidden bg-forest-950 text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=70"
            alt=""
            fill
            priority
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/80 to-forest-950" />
        </div>

        <div className="section relative py-20 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ring-1 ring-white/20">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-400" />
            All ten regions of Cameroon
          </p>

          <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
            Hiking in Cameroon, with the information you actually need
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-basalt-200">
            Most people who want to hike here never start, because what they can find is vague, wrong
            or missing. This is the fix: real distances and durations, difficulty ratings that mean
            something specific, live weather that tells you when not to go, permit rules, and
            registered local guides you can book directly.
          </p>

          <div className="mt-8 max-w-2xl">
            <TrailSearchBar variant="hero" />
          </div>

          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            <HeroStat value="12" label="Destinations, all checked" />
            <HeroStat value="10" label="Regions covered" />
            <HeroStat value="4,040 m" label="Highest summit — Fako" />
            <HeroStat value="XAF" label="Prices in local currency" />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- what we fix */}
      <section className="border-b border-basalt-200 bg-white py-14">
        <div className="section">
          <SectionHeading
            eyebrow="Why this exists"
            title="Bad information keeps people off the trail"
            description="Every problem below is one we heard from people who wanted to hike in Cameroon and gave up. Each one has a specific answer on this site."
          />

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

      {/* ------------------------------------------------ popular trails */}
      <section className="py-16">
        <div className="section">
          <SectionHeading
            eyebrow="Destinations"
            title="Where people are hiking"
            description={`Volcanic summits, crater lakes, rainforest and savannah — spread across ${regionsCovered || 10} regions.`}
            action={
              <Link href="/trails" className="btn-secondary">
                All 12 destinations
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

      {/* ------------------------------------------------- difficulty key */}
      <section className="bg-basalt-100 py-16">
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
                className="card group p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: { EASY: '#3a7f5d', MODERATE: '#d97706', HARD: '#c74a2c', EXPERT: '#991b1b' }[level],
                    }}
                  />
                  <h3 className="font-display text-lg font-semibold text-basalt-900">
                    {DIFFICULTY_LABELS[level]}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-basalt-600">{DIFFICULTY_MEANING[level]}</p>
                <p className="mt-3 text-xs font-semibold text-forest-700 group-hover:underline">
                  See {DIFFICULTY_LABELS[level].toLowerCase()} trails →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- first hikes */}
      {easy.length > 0 && (
        <section className="py-16">
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
        <section className="bg-white py-16">
          <div className="section">
            <SectionHeading
              eyebrow="Registered guides"
              title="Booked directly, verified by us"
              description="Every guide on the platform is checked before their tours go live. Rates are theirs; we take a transparent commission on bookings."
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
                  className="card group p-5 transition-shadow hover:shadow-md"
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
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-basalt-900">{guide.user.name}</p>
                      <Stars rating={guide.ratingAvg} count={guide.ratingCount} />
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm font-medium leading-snug text-basalt-800">
                    {guide.headline}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {guide.regions.slice(0, 3).map((r) => (
                      <span key={r} className="chip bg-basalt-100 text-basalt-700 ring-basalt-200">
                        {REGION_LABELS[r]}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 border-t border-basalt-100 pt-3 text-xs text-basalt-500">
                    {guide.yearsExperience} years guiding · speaks {guide.languages.slice(0, 3).join(', ')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
                  className="card group flex gap-4 overflow-hidden p-5 transition-shadow hover:shadow-md"
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
                    <h3 className="font-display text-base font-semibold text-basalt-900 group-hover:text-forest-800">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-xs text-basalt-500">{event.location}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-basalt-600">{event.description}</p>
                    <p className="mt-2 text-xs font-semibold text-laterite-700">
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
      <section className="bg-laterite-600 py-14 text-white">
        <div className="section flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Save trails, book guides, share your photos
            </h2>
            <p className="mt-2 max-w-xl text-laterite-50">
              A free account gets you saved trails, reviews, photo uploads and direct booking.
              Premium adds offline maps for when the signal goes — which on these mountains it will.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/register" className="btn bg-white text-laterite-700 hover:bg-laterite-50">
              Create free account
            </Link>
            <Link href="/premium" className="btn bg-laterite-700 text-white hover:bg-laterite-800">
              See Premium
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-basalt-300">{label}</p>
    </div>
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
      <p className="font-display text-lg font-semibold text-basalt-900">{problem}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-basalt-600">{answer}</p>
      <Link href={href} className="mt-4 text-sm font-semibold text-forest-700 hover:underline">
        {cta} →
      </Link>
    </div>
  );
}

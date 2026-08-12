import type { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import type { SafetyCategory } from '@/lib/types';
import { ALL_DIFFICULTIES, DIFFICULTY_LABELS, DIFFICULTY_MEANING } from '@/lib/format';
import { Alert } from '@/components/ui';
import { T } from '@/components/T';

export const metadata: Metadata = {
  title: 'Safety guidelines',
  description:
    'What actually goes wrong hiking in Cameroon, and how to avoid it: altitude, water, weather, wildlife, sacred sites, regional security and emergency numbers.',
};

export const revalidate = 3600;

const EMERGENCY = [
  { label: 'Police', number: '117' },
  { label: 'Fire brigade', number: '118' },
  { label: 'Ambulance', number: '119' },
];

const EQUIPMENT = [
  {
    title: 'Footwear & clothing',
    items: [
      'Broken-in hiking boots with ankle support',
      'Moisture-wicking base layers',
      'Waterproof rain shell — rain arrives fast and hard',
      'Warm insulated layer for altitude (near-freezing near Fako’s summit)',
      'Sun hat and gloves for high camps',
      'Gaiters for muddy or overgrown sections',
    ],
  },
  {
    title: 'Navigation & light',
    items: [
      'Offline map or downloaded GPX of the route',
      'Headtorch plus spare batteries',
      'Whistle, for signalling if separated from your group',
      'Power bank — there is no signal above ~2,000 m on Fako or Oku',
    ],
  },
  {
    title: 'Water, food & health',
    items: [
      'At least 3 litres of water capacity',
      'Water purification tablets or a filter — do not drink untreated streams',
      'High-energy food and electrolyte sachets',
      'Personal first-aid kit and any regular medication',
      'SPF 50 sunscreen and insect repellent',
      'Altitude-sickness tablets if you are going above 3,000 m',
    ],
  },
  {
    title: 'Multi-day & summit trips',
    items: [
      '3-season tent, or confirmed hut/refuge space',
      'Sleeping bag rated to at least 0°C for Mount Cameroon’s high camps',
      'Sleeping mat and a portable stove',
      'Cash for permits, huts and porters — rural checkpoints do not take cards',
      'A printed permit and your guide’s phone number, in case your phone dies',
    ],
  },
];

const RISK_LEVEL_CLASSES: Record<'Common' | 'Serious' | 'Regional', string> = {
  Common: 'bg-amber-100 text-amber-900 ring-amber-200',
  Serious: 'bg-red-100 text-red-900 ring-red-200',
  Regional: 'bg-blue-100 text-blue-900 ring-blue-200',
};

const RISKS: { title: string; level: 'Common' | 'Serious' | 'Regional'; body: string }[] = [
  {
    title: 'Altitude sickness',
    level: 'Serious',
    body: 'Above roughly 3,000 m on Mount Cameroon and Mount Oku, headaches, nausea and breathlessness are common in people who ascend too fast. Build in acclimatisation days on multi-day summit attempts and turn back if symptoms worsen — it does not resolve by pushing on.',
  },
  {
    title: 'Sudden weather and fog',
    level: 'Common',
    body: 'Cloud can close in within minutes on Fako, Oku and the Bamboutos highlands, dropping visibility to a few metres and temperature sharply. Trails that are obvious in clear weather are not obvious in fog — this is the single biggest reason hikers get lost.',
  },
  {
    title: 'Dehydration & heat exhaustion',
    level: 'Common',
    body: 'In Sahelian terrain around Waza and the North, daytime heat and low humidity dehydrate hikers faster than they notice. Carry more water than feels necessary and rest during the hottest hours.',
  },
  {
    title: 'Waterborne illness',
    level: 'Common',
    body: 'Streams that look clean can carry parasites and bacteria from upstream grazing or settlements. Treat all natural water sources, even ones your guide drinks from without treating.',
  },
  {
    title: 'Wildlife encounters',
    level: 'Serious',
    body: 'Elephants and buffalo in and around Waza and Korup can be dangerous at close range, and venomous snakes are present in rainforest and savanna alike. Stay with your guide, who knows how to read and avoid these encounters — most incidents happen to people who wander off alone.',
  },
  {
    title: 'Volcanic & gas hazards',
    level: 'Serious',
    body: 'Mount Cameroon is an active volcano that has erupted within living memory, and Lake Nyos remains a carbon-dioxide risk despite the degassing pipes installed since 2001. Follow any current access restrictions around both without exception.',
  },
  {
    title: 'Getting lost off-trail',
    level: 'Common',
    body: 'Most trails on this site are not signposted. Hiking without a guide or a downloaded route is the leading cause of people needing to be found, and — see above — there is no mountain rescue service to find them.',
  },
  {
    title: 'Regional security',
    level: 'Regional',
    body: 'Parts of the Far North (Boko Haram-linked activity near the Nigeria/Chad border) and the North-West and South-West (the Anglophone crisis) have had periods of serious insecurity. Check current advisories before travelling to these regions and always travel with a locally briefed guide.',
  },
  {
    title: 'River crossings in rainy season',
    level: 'Common',
    body: 'Streams that are ankle-deep in dry season can become fast, chest-deep crossings from May to October. Never attempt a crossing your guide advises against, and build flexibility into your itinerary for this.',
  },
  {
    title: 'Sunburn & UV exposure',
    level: 'Common',
    body: 'UV intensity rises sharply with altitude and is easy to underestimate in cloud or cool air. Reapply sunscreen through the day, not just at the start.',
  },
];

export default async function SafetyPage() {
  const { categories } = await serverFetch<{ categories: SafetyCategory[] }>(
    '/content/safety'
  ).catch(() => ({ categories: [] as SafetyCategory[] }));

  return (
    <div className="pb-20">
      <header className="bg-forest-950 py-14 text-white">
        <div className="section">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-forest-400">
            Read this first
          </p>
          <h1 className="max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            <T k="page.safety.title" />
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-basalt-300">
            Mountain rescue does not exist here. On Mount Cameroon, evacuation means your guide and
            porters carrying you down; outside the major cities, ambulance response is very limited.
            Everything below follows from that one fact.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {EMERGENCY.map((e) => (
              <a
                key={e.number}
                href={`tel:${e.number}`}
                className="rounded-xl bg-white/10 px-5 py-3 ring-1 ring-white/20 transition-colors hover:bg-white/20"
              >
                <p className="text-xs uppercase tracking-wide text-basalt-300">{e.label}</p>
                <p className="font-display text-2xl font-semibold">{e.number}</p>
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-basalt-600 dark:text-basalt-400">Free from any Cameroonian mobile.</p>
        </div>
      </header>

      {/* ------------------------------------------------ difficulty meaning */}
      <section className="border-b border-basalt-200 bg-white py-12">
        <div className="section">
          <h2 className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">
            What our difficulty ratings commit to
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-basalt-600 dark:text-basalt-300">
            Ratings on this site are specific promises about time, terrain and consequence. Pick
            honestly — do an Easy and a Moderate before you book anything rated Expert.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ALL_DIFFICULTIES.map((level) => (
              <Link
                key={level}
                href={`/trails?difficulty=${level}`}
                className="card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: { EASY: '#3a7f5d', MODERATE: '#0369a1', HARD: '#9c4a2e', EXPERT: '#991b1b' }[level],
                    }}
                  />
                  <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                    {DIFFICULTY_LABELS[level]}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">
                  {DIFFICULTY_MEANING[level]}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ equipment & risks */}
      <section className="border-b border-basalt-200 bg-basalt-50 py-12">
        <div className="section grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">Equipment you actually need</h2>
            <p className="mt-2 max-w-xl text-sm text-basalt-600 dark:text-basalt-300">
              What to bring changes with altitude and duration, but this covers a day hike up to a
              multi-day summit attempt. Rent what you don&rsquo;t own from your guide rather than buy it
              once — most gear below is available in Buea and Bamenda.
            </p>

            <div className="mt-6 space-y-5">
              {EQUIPMENT.map((group) => (
                <div key={group.title} className="card p-5">
                  <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">{group.title}</h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-basalt-700 dark:text-basalt-300">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="mt-0.5 h-4 w-4 shrink-0 text-forest-600"
                          aria-hidden
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">Risks that actually happen here</h2>
            <p className="mt-2 max-w-xl text-sm text-basalt-600 dark:text-basalt-300">
              Not hypotheticals — these are the specific ways trips in Cameroon go wrong, and what
              lowers the odds of each one.
            </p>

            <ul className="mt-6 space-y-3">
              {RISKS.map((risk) => (
                <li key={risk.title} className="card p-5">
                  <div className="flex items-center gap-2">
                    <span className={`chip ${RISK_LEVEL_CLASSES[risk.level]}`}>{risk.level}</span>
                    <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">{risk.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">{risk.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- guidelines */}
      <div className="section grid gap-10 py-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Sections" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-300">On this page</p>
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.category}>
                <a
                  href={`#${slug(cat.category)}`}
                  className="block rounded-lg px-3 py-2 text-sm text-basalt-700 dark:text-basalt-300 hover:bg-basalt-100"
                >
                  {cat.category}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-12">
          {categories.length === 0 && (
            <Alert tone="warn">
              Safety content could not be loaded from the API. Check that the backend is running and
              that the database has been seeded.
            </Alert>
          )}

          {categories.map((cat) => (
            <section key={cat.category} id={slug(cat.category)} className="scroll-mt-24">
              <h2 className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">{cat.category}</h2>
              <div className="mt-5 space-y-4">
                {cat.items.map((item) => (
                  <article key={item.id} className="card p-6">
                    <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-basalt-700 dark:text-basalt-300">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="rounded-2xl bg-terracotta-600 p-8 text-white sm:p-10">
          <h2 className="font-display text-2xl font-semibold">Take the important bits offline</h2>
          <p className="mt-3 max-w-2xl text-terracotta-50">
            Premium members can download an offline pack for any trail — the route, numbered
            waypoints, hazards, permit notes and these emergency numbers — before they lose signal.
            Above 2,000 m on Mount Cameroon and Mount Oku, they will.
          </p>
          <Link href="/premium" className="btn mt-6 bg-white text-terracotta-700 hover:bg-terracotta-50">
            See Premium
          </Link>
        </div>
      </section>
    </div>
  );
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

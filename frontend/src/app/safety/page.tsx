import type { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import type { SafetyCategory } from '@/lib/types';
import { ALL_DIFFICULTIES, DIFFICULTY_LABELS, DIFFICULTY_MEANING } from '@/lib/format';
import { Alert } from '@/components/ui';

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
            Safety guidelines for hiking in Cameroon
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
          <p className="mt-3 text-xs text-basalt-400">Free from any Cameroonian mobile.</p>
        </div>
      </header>

      {/* ------------------------------------------------ difficulty meaning */}
      <section className="border-b border-basalt-200 bg-white py-12">
        <div className="section">
          <h2 className="font-display text-2xl font-semibold text-basalt-900">
            What our difficulty ratings commit to
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-basalt-600">
            Ratings on this site are specific promises about time, terrain and consequence. Pick
            honestly — do an Easy and a Moderate before you book anything rated Expert.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ALL_DIFFICULTIES.map((level) => (
              <Link
                key={level}
                href={`/trails?difficulty=${level}`}
                className="card p-5 transition-shadow hover:shadow-md"
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
                <p className="mt-2 text-sm leading-relaxed text-basalt-600">
                  {DIFFICULTY_MEANING[level]}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- guidelines */}
      <div className="section grid gap-10 py-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Sections" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-basalt-500">On this page</p>
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.category}>
                <a
                  href={`#${slug(cat.category)}`}
                  className="block rounded-lg px-3 py-2 text-sm text-basalt-700 hover:bg-basalt-100"
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
              <h2 className="font-display text-2xl font-semibold text-basalt-900">{cat.category}</h2>
              <div className="mt-5 space-y-4">
                {cat.items.map((item) => (
                  <article key={item.id} className="card p-6">
                    <h3 className="font-display text-lg font-semibold text-basalt-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-basalt-700">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="rounded-2xl bg-laterite-600 p-8 text-white sm:p-10">
          <h2 className="font-display text-2xl font-semibold">Take the important bits offline</h2>
          <p className="mt-3 max-w-2xl text-laterite-50">
            Premium members can download an offline pack for any trail — the route, numbered
            waypoints, hazards, permit notes and these emergency numbers — before they lose signal.
            Above 2,000 m on Mount Cameroon and Mount Oku, they will.
          </p>
          <Link href="/premium" className="btn mt-6 bg-white text-laterite-700 hover:bg-laterite-50">
            See Premium
          </Link>
        </div>
      </section>
    </div>
  );
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

import type { Metadata } from 'next';
import Link from 'next/link';
import { buildQuery, serverFetch } from '@/lib/api';
import type { GuideCard, Pagination } from '@/lib/types';
import { ALL_REGIONS, REGION_LABELS, formatXAF } from '@/lib/format';
import { Avatar, EmptyState, SectionHeading, Stars } from '@/components/ui';
import { T } from '@/components/T';

export const metadata: Metadata = {
  title: 'Registered hiking guides',
  description:
    'Verified local hiking guides across Cameroon — day rates, languages, certifications and bookable departure dates.',
};

export const revalidate = 300;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function GuidesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const region = typeof params.region === 'string' ? params.region : undefined;

  const { guides, pagination } = await serverFetch<{ guides: GuideCard[]; pagination: Pagination }>(
    `/guides${buildQuery({ region, limit: 24 })}`
  ).catch(() => ({ guides: [], pagination: { page: 1, limit: 24, total: 0, pages: 1 } }));

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <div className="flag-bar" aria-hidden />
      <header className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-10">
          <h1 className="font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            <T k="page.guides.title" />
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600 dark:text-basalt-300">
            Every guide here has been verified by us before their tours went live. Rates are theirs.
            On Mount Cameroon, in Bénoué and in the Dja, a registered guide is not optional — it is
            enforced at the gate. Booking is not limited to Cameroon — some guides run trips across
            Central Africa.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/guides"
              className={`chip ${
                !region ? 'bg-forest-700 text-white ring-forest-700' : 'bg-white text-basalt-700 dark:bg-basalt-900 dark:text-basalt-300 dark:ring-basalt-700 ring-basalt-300'
              }`}
            >
              All regions
            </Link>
            {ALL_REGIONS.map((r) => (
              <Link
                key={r}
                href={`/guides?region=${r}`}
                className={`chip ${
                  region === r
                    ? 'bg-forest-700 text-white ring-forest-700'
                    : 'bg-white text-basalt-700 dark:bg-basalt-900 dark:text-basalt-300 dark:ring-basalt-700 ring-basalt-300 hover:bg-basalt-100 dark:hover:bg-basalt-800'
                }`}
              >
                {REGION_LABELS[r]}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div className="section py-8">
        <p className="mb-5 text-sm text-basalt-600 dark:text-basalt-300">
          <span className="font-semibold text-basalt-900 dark:text-basalt-50">{pagination.total}</span> verified guide
          {pagination.total === 1 ? '' : 's'}
          {region && ` covering ${REGION_LABELS[region as keyof typeof REGION_LABELS]}`}
        </p>

        {guides.length === 0 ? (
          <EmptyState
            title="No guides in that region yet"
            message="We only list guides once we have verified them. If you guide in this region, apply — verification usually takes a few days."
            action={{ href: '/register?guide=1', label: 'Apply as a guide' }}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.id}`}
                className="card group flex flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={guide.user.name} src={guide.user.avatarUrl} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                        {guide.user.name}
                      </p>
                      {guide.plan === 'PRO' && (
                        <span className="chip bg-amber-100 text-amber-900 ring-amber-200">Pro</span>
                      )}
                    </div>
                    <Stars rating={guide.ratingAvg} count={guide.ratingCount} />
                    <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
                      {guide.yearsExperience} years guiding
                      {guide._count ? ` · ${guide._count.tours} tours` : ''}
                    </p>
                  </div>
                </div>

                <p className="mt-4 font-medium leading-snug text-basalt-800 dark:text-basalt-200">{guide.headline}</p>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">
                  {guide.bio}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {guide.regions.map((r) => (
                    <span key={r} className="chip bg-forest-50 text-forest-800 ring-forest-200">
                      {REGION_LABELS[r]}
                    </span>
                  ))}
                  {guide.countries
                    ?.filter((c) => c !== 'Cameroon')
                    .map((c) => (
                      <span key={c} className="flag-chip">
                        {c}
                      </span>
                    ))}
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-basalt-100 pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-400">
                      Day rate from
                    </p>
                    <p className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                      {formatXAF(guide.dayRateXAF)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-forest-700 group-hover:underline dark:text-forest-400">
                    Profile →
                  </span>
                </div>

                <p className="mt-3 text-xs text-basalt-600 dark:text-basalt-300">
                  Speaks {guide.languages.join(', ')}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-forest-950 p-8 text-white sm:p-10">
          <SectionHeading
            eyebrow={<span className="text-forest-400">For guides</span>}
            title={<span className="text-forest-300">List your services on Trek Cameroon</span>}
          />
          <p className="-mt-2 max-w-2xl text-basalt-300">
            Create a profile, get verified, publish tours with real departure dates, and take
            bookings without a phone call. We handle the listing; you keep your rate minus a
            transparent booking commission. Paid membership adds promotional placement in this
            directory.
          </p>
          <Link href="/register?guide=1" className="btn-accent mt-6">
            Apply as a guide
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DIFFICULTY_LABELS, REGION_LABELS, formatCompactXAF, formatXAF } from '@/lib/format';
import type { Analytics } from '@/lib/types';
import { Alert, SectionHeading, Skeleton, Stat } from '@/components/ui';

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Analytics>('/admin/analytics')
      .then(setData)
      .catch(() => setError('Could not load analytics. Check the API is running.'));
  }, []);

  if (error) return <Alert tone="danger">{error}</Alert>;

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const { overview, bookings, revenueStreams, trailsByRegion, trailsByDifficulty, topTrails, topGuides } =
    data;

  const totalRevenue =
    revenueStreams.bookingCommissionXAF + revenueStreams.eventTicketsXAF;

  return (
    <div className="space-y-10">
      {/* --------------------------------------------------------- overview */}
      <section>
        <SectionHeading title="Platform at a glance" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Users"
            value={overview.users}
            hint={`+${overview.newUsersLast30Days} in 30 days`}
          />
          <Stat
            label="Premium members"
            value={overview.premiumUsers}
            hint={
              overview.users > 0
                ? `${((overview.premiumUsers / overview.users) * 100).toFixed(1)}% conversion`
                : undefined
            }
          />
          <Stat
            label="Verified guides"
            value={overview.approvedGuides}
            hint={overview.pendingGuides > 0 ? `${overview.pendingGuides} awaiting review` : 'queue clear'}
          />
          <Stat label="Trails published" value={overview.trails} />
          <Stat label="Reviews" value={overview.reviews} />
          <Stat
            label="Photos awaiting moderation"
            value={overview.pendingPhotos}
            hint={overview.pendingPhotos > 0 ? 'needs attention' : 'queue clear'}
          />
          <Stat label="Hiking groups" value={overview.groups} />
          <Stat label="Paid bookings" value={bookings.paidCount} />
        </div>

        {(overview.pendingGuides > 0 || overview.pendingPhotos > 0) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {overview.pendingGuides > 0 && (
              <Link href="/admin/guides" className="btn-accent">
                Review {overview.pendingGuides} guide application
                {overview.pendingGuides === 1 ? '' : 's'}
              </Link>
            )}
            {overview.pendingPhotos > 0 && (
              <Link href="/admin/moderation" className="btn-secondary">
                Moderate {overview.pendingPhotos} photo{overview.pendingPhotos === 1 ? '' : 's'}
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- revenue */}
      <section>
        <SectionHeading
          title="Revenue"
          description={`Booking commission is charged at ${bookings.commissionPct}% of every paid booking.`}
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-basalt-500">
              Recognised revenue
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50">
              {formatXAF(totalRevenue)}
            </p>
            <p className="mt-1 text-xs text-basalt-500">
              Commission + ticket sales. Affiliate and advertising revenue settle externally.
            </p>

            <dl className="mt-5 space-y-3">
              <RevenueRow
                label="Tour booking commission"
                value={revenueStreams.bookingCommissionXAF}
                total={totalRevenue}
              />
              <RevenueRow
                label="Event ticket sales"
                value={revenueStreams.eventTicketsXAF}
                total={totalRevenue}
              />
            </dl>
          </div>

          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-basalt-500">
              Gross booking volume
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50">
              {formatXAF(bookings.grossVolumeXAF)}
            </p>
            <p className="mt-1 text-xs text-basalt-500">
              {formatXAF(bookings.last30Days.grossVolumeXAF)} in the last 30 days
            </p>

            <div className="mt-5 space-y-2">
              {bookings.byStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between text-sm">
                  <span className="text-basalt-600 dark:text-basalt-300">
                    {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                  </span>
                  <span className="font-semibold text-basalt-900 dark:text-basalt-50">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-basalt-500">
              Partner and advertising
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-basalt-600 dark:text-basalt-300">Affiliate click-throughs</dt>
                <dd className="font-semibold text-basalt-900 dark:text-basalt-50">{revenueStreams.affiliateClicks}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-basalt-600 dark:text-basalt-300">Ad impressions</dt>
                <dd className="font-semibold text-basalt-900 dark:text-basalt-50">{revenueStreams.adImpressions}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-basalt-600 dark:text-basalt-300">Ad clicks</dt>
                <dd className="font-semibold text-basalt-900 dark:text-basalt-50">{revenueStreams.adClicks}</dd>
              </div>
              <div className="flex justify-between border-t border-basalt-100 pt-3">
                <dt className="text-basalt-600 dark:text-basalt-300">Click-through rate</dt>
                <dd className="font-semibold text-basalt-900 dark:text-basalt-50">
                  {revenueStreams.adImpressions > 0
                    ? `${((revenueStreams.adClicks / revenueStreams.adImpressions) * 100).toFixed(2)}%`
                    : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ distribution */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">Trails by region</h3>
          <BarList
            items={trailsByRegion.map((r) => ({
              label: REGION_LABELS[r.region],
              value: r.count,
            }))}
          />
        </div>

        <div className="card p-6">
          <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
            Trails by difficulty
          </h3>
          <BarList
            items={trailsByDifficulty.map((d) => ({
              label: DIFFICULTY_LABELS[d.difficulty],
              value: d.count,
              color: { EASY: '#3a7f5d', MODERATE: '#0369a1', HARD: '#c74a2c', EXPERT: '#991b1b' }[
                d.difficulty
              ],
            }))}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------- tops */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">Most viewed trails</h3>
          <ul className="mt-4 divide-y divide-basalt-100">
            {topTrails.map((trail, i) => (
              <li key={trail.id} className="flex items-center gap-3 py-3 first:pt-0">
                <span className="w-5 shrink-0 text-sm font-bold text-basalt-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/trails/${trail.slug}`}
                    className="truncate text-sm font-semibold text-basalt-900 dark:text-basalt-50 hover:text-forest-700"
                  >
                    {trail.name}
                  </Link>
                  <p className="text-xs text-basalt-500">
                    {REGION_LABELS[trail.region]} · {trail._count.favorites} saved ·{' '}
                    {trail.ratingCount} review{trail.ratingCount === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-basalt-700 dark:text-basalt-300">
                  {trail.viewCount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">Top-rated guides</h3>
          {topGuides.length === 0 ? (
            <p className="mt-4 text-sm text-basalt-500">No approved guides yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-basalt-100">
              {topGuides.map((guide) => (
                <li key={guide.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/guides/${guide.id}`}
                      className="truncate text-sm font-semibold text-basalt-900 dark:text-basalt-50 hover:text-forest-700"
                    >
                      {guide.user.name}
                    </Link>
                    <p className="text-xs text-basalt-500">
                      {guide._count.tours} tour{guide._count.tours === 1 ? '' : 's'}
                      {guide.plan !== 'NONE' && ` · ${guide.plan} member`}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-amber-600">
                    ★ {guide.ratingAvg.toFixed(1)}
                    <span className="ml-1 text-xs font-normal text-basalt-400">
                      ({guide.ratingCount})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function RevenueRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <dt className="text-basalt-600 dark:text-basalt-300">{label}</dt>
        <dd className="font-semibold text-basalt-900 dark:text-basalt-50">{formatCompactXAF(value)}</dd>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-basalt-100">
        <div className="h-full rounded-full bg-forest-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BarList({ items }: { items: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 truncate text-basalt-600 dark:text-basalt-300">{item.label}</span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-basalt-100">
            <div
              className="flex h-full items-center justify-end rounded pr-2 text-[10px] font-bold text-white"
              style={{
                width: `${Math.max(8, (item.value / max) * 100)}%`,
                background: item.color ?? '#296549',
              }}
            >
              {item.value}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

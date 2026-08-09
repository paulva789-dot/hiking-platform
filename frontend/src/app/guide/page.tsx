'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatDateRange, formatXAF } from '@/lib/format';
import type { Booking, GuideProfile, Tour } from '@/lib/types';
import {
  Alert,
  Avatar,
  EmptyState,
  SectionHeading,
  Skeleton,
  Spinner,
  Stat,
  StatusBadge,
} from '@/components/ui';
import { GuideProfileForm } from './GuideProfileForm';
import { TourManager } from './TourManager';
import { PaymentPanel } from '@/components/PaymentPanel';

interface DashboardData {
  profile: (GuideProfile & { tours: Tour[] }) | null;
  bookings: Booking[];
  earnings: {
    paidBookings: number;
    grossXAF: number;
    platformCommissionXAF: number;
    netPayoutXAF: number;
  } | null;
}

const TABS = ['Overview', 'Tours', 'Bookings', 'Profile', 'Membership'] as const;
type Tab = (typeof TABS)[number];

export default function GuideWorkspace() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('Overview');

  const load = useCallback(async () => {
    try {
      const res = await api.get<DashboardData>('/guides/me/dashboard');
      setData(res);
      // A guide with no profile has nothing to see but the application form.
      if (!res.profile) setTab('Profile');
    } catch {
      setData({ profile: null, bookings: [], earnings: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=/guide');
      return;
    }
    if (user) void load();
  }, [authLoading, user, router, load]);

  if (authLoading || loading) {
    return (
      <div className="section flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-forest-700" />
      </div>
    );
  }

  const profile = data?.profile ?? null;
  const bookings = data?.bookings ?? [];
  const earnings = data?.earnings;

  const upcomingBookings = bookings.filter(
    (b) => b.status !== 'CANCELLED' && new Date(b.schedule.startDate) >= new Date()
  );

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <header className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-8">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={user!.name} src={user!.avatarUrl} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">
                  Guide workspace
                </h1>
                {profile && <StatusBadge status={profile.status} />}
                {profile && profile.plan !== 'NONE' && (
                  <span className="chip bg-amber-100 text-amber-900 ring-amber-200">
                    {profile.plan === 'PRO' ? 'Pro member' : 'Basic member'}
                  </span>
                )}
              </div>
              <p className="text-sm text-basalt-500">{user!.name}</p>
            </div>

            {profile?.status === 'APPROVED' && (
              <Link href={`/guides/${profile.id}`} className="btn-secondary">
                View public profile
              </Link>
            )}
          </div>

          {profile && (
            <nav className="-mb-px mt-6 flex gap-1 overflow-x-auto" aria-label="Guide sections">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  aria-current={tab === t ? 'page' : undefined}
                  className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    tab === t
                      ? 'border-forest-700 text-forest-800'
                      : 'border-transparent text-basalt-600 dark:text-basalt-300 hover:border-basalt-300 hover:text-basalt-900 dark:text-basalt-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <div className="section space-y-8 py-8">
        {profile && profile.status !== 'APPROVED' && (
          <Alert tone={profile.status === 'PENDING' ? 'warn' : 'danger'}>
            <p className="font-semibold">
              Your profile is {profile.status.toLowerCase()}
              {profile.reviewedAt ? ` (reviewed ${formatDate(profile.reviewedAt)})` : ''}
            </p>
            <p className="mt-1">
              {profile.status === 'PENDING'
                ? 'An administrator is reviewing your application. You can create tours now, but they stay hidden from the public until you are approved.'
                : (profile.reviewNote ??
                  'Your application was not approved. Update your profile with the missing details and it will return to the review queue.')}
            </p>
          </Alert>
        )}

        {!profile ? (
          <div className="space-y-8">
            <GuideRequirements />
            <div>
              <SectionHeading
                eyebrow="Step 1 of 1"
                title="Create your guide profile"
                description="This is what hikers see, and what we verify against. Be specific about what you actually run and where — vague profiles take longer to approve."
              />
              <GuideProfileForm onSaved={load} />
            </div>
          </div>
        ) : (
          <>
            {tab === 'Overview' && (
              <div className="space-y-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="Published tours" value={profile.tours.length} />
                  <Stat
                    label="Upcoming bookings"
                    value={upcomingBookings.length}
                    hint={`${bookings.length} all time`}
                  />
                  <Stat
                    label="Gross booked"
                    value={formatXAF(earnings?.grossXAF ?? 0)}
                    hint={`${earnings?.paidBookings ?? 0} paid bookings`}
                  />
                  <Stat
                    label="Your net payout"
                    value={formatXAF(earnings?.netPayoutXAF ?? 0)}
                    hint={`after ${formatXAF(earnings?.platformCommissionXAF ?? 0)} platform commission`}
                  />
                </div>

                <section>
                  <SectionHeading title="Next departures" />
                  {upcomingBookings.length === 0 ? (
                    <EmptyState
                      title="No upcoming bookings"
                      message="Add departure dates to your tours — hikers can only book a date that exists."
                    />
                  ) : (
                    <ul className="space-y-3">
                      {upcomingBookings.slice(0, 5).map((b) => (
                        <li key={b.id} className="card flex flex-wrap items-center gap-4 p-5">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-basalt-900 dark:text-basalt-50">{b.tour.title}</h3>
                              <StatusBadge status={b.status} />
                            </div>
                            <p className="mt-1 text-sm text-basalt-600 dark:text-basalt-300">
                              {formatDateRange(b.schedule.startDate, b.schedule.endDate)} ·{' '}
                              {b.participants} {b.participants === 1 ? 'person' : 'people'}
                            </p>
                            {b.user && (
                              <p className="mt-1 text-xs text-basalt-500">
                                {b.user.name} · {b.contactPhone ?? b.user.email}
                              </p>
                            )}
                          </div>
                          <p className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                            {formatXAF(b.totalXAF)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            )}

            {tab === 'Tours' && (
              <TourManager
                tours={profile.tours}
                canPublish={profile.status === 'APPROVED'}
                onChange={load}
              />
            )}

            {tab === 'Bookings' && <GuideBookings bookings={bookings} onChange={load} />}

            {tab === 'Profile' && (
              <div>
                <SectionHeading
                  title="Edit your profile"
                  description="Changes to an approved profile stay live. A rejected profile returns to the review queue when you save."
                />
                <GuideProfileForm existing={profile} onSaved={load} />
              </div>
            )}

            {tab === 'Membership' && <Membership profile={profile} onChange={load} />}
          </>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ bookings

function GuideBookings({ bookings, onChange }: { bookings: Booking[]; onChange: () => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setStatus = async (id: string, status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    setBusyId(id);
    setError(null);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the booking');
    } finally {
      setBusyId(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No bookings yet"
        message="Bookings appear here as soon as someone reserves a seat on one of your departure dates."
      />
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        title="All bookings"
        description="Confirm a booking once you have spoken to the hiker, and mark it complete after the hike."
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <ul className="space-y-3">
        {bookings.map((b) => (
          <li key={b.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-basalt-900 dark:text-basalt-50">{b.tour.title}</h3>
                  <StatusBadge status={b.status} />
                  {b.paymentStatus === 'PAID' && (
                    <span className="chip bg-forest-100 text-forest-800 ring-forest-200">Paid</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-basalt-600 dark:text-basalt-300">
                  {formatDateRange(b.schedule.startDate, b.schedule.endDate)} · {b.participants}{' '}
                  {b.participants === 1 ? 'person' : 'people'}
                </p>
                {b.user && (
                  <p className="mt-1 text-sm text-basalt-700 dark:text-basalt-300">
                    <strong>{b.user.name}</strong> · {b.contactPhone ?? b.user.phone ?? b.user.email}
                  </p>
                )}
                {b.notes && (
                  <p className="mt-2 rounded-lg bg-basalt-50 px-3 py-2 text-sm text-basalt-700 dark:text-basalt-300">
                    &ldquo;{b.notes}&rdquo;
                  </p>
                )}
                <p className="mt-1 font-mono text-xs text-basalt-400">{b.reference}</p>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                  {formatXAF(b.totalXAF)}
                </p>
                <p className="text-xs text-basalt-500">
                  −{formatXAF(b.commissionXAF)} commission
                </p>
                <p className="mt-0.5 text-xs font-semibold text-forest-700">
                  {formatXAF(b.totalXAF - b.commissionXAF)} to you
                </p>

                {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                  <div className="mt-3 flex flex-col gap-2">
                    {b.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => void setStatus(b.id, 'CONFIRMED')}
                        disabled={busyId === b.id}
                        className="btn-primary text-xs"
                      >
                        {busyId === b.id && <Spinner className="h-3 w-3" />}
                        Confirm
                      </button>
                    )}
                    {b.status === 'CONFIRMED' && (
                      <button
                        type="button"
                        onClick={() => void setStatus(b.id, 'COMPLETED')}
                        disabled={busyId === b.id}
                        className="btn-secondary text-xs"
                      >
                        Mark completed
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void setStatus(b.id, 'CANCELLED')}
                      disabled={busyId === b.id}
                      className="text-xs font-semibold text-red-700 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- membership

const PLANS = [
  {
    plan: 'BASIC' as const,
    priceXAF: 10000,
    features: ['Listed in the guide directory', 'Unlimited tours and dates', 'Booking requests'],
  },
  {
    plan: 'PRO' as const,
    priceXAF: 25000,
    features: [
      'Everything in Basic',
      'Top placement in the guide directory',
      'Pro badge on your profile and tours',
      'Promotional slots on region pages',
    ],
  },
];

function Membership({ profile, onChange }: { profile: GuideProfile; onChange: () => void }) {
  const [checkout, setCheckout] = useState<{ plan: 'BASIC' | 'PRO'; months: number; priceXAF: number } | null>(
    null
  );

  if (checkout) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setCheckout(null)}
          className="mb-4 text-xs font-semibold text-basalt-500 hover:text-basalt-800"
        >
          ← Back to plans
        </button>
        <SectionHeading
          title="Pay with Mobile Money"
          description={`${checkout.plan} plan · ${checkout.months} month${checkout.months > 1 ? 's' : ''} · ${formatXAF(checkout.priceXAF)}`}
        />
        <div className="card max-w-sm p-6">
          <PaymentPanel
            purpose="GUIDE_PLAN"
            extra={{ months: checkout.months, guidePlan: checkout.plan }}
            amountXAF={checkout.priceXAF}
            onSuccess={() => {
              setCheckout(null);
              onChange();
            }}
            onCancel={() => setCheckout(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeading
        title="Guide membership"
        description="Listing is what gets you found; Pro is what gets you found first. Booking commission is charged separately, per booking."
      />

      {profile.plan !== 'NONE' && (
        <Alert tone="success">
          You are on the {profile.plan} plan
          {profile.planExpires ? `, active until ${formatDate(profile.planExpires)}` : ''}.
        </Alert>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {PLANS.map((p) => (
          <div
            key={p.plan}
            className={`card p-6 ${profile.plan === p.plan ? 'border-forest-400 ring-2 ring-forest-200' : ''}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-basalt-900 dark:text-basalt-50">{p.plan}</h3>
              {profile.plan === p.plan && (
                <span className="chip bg-forest-100 text-forest-800 ring-forest-200">Current</span>
              )}
            </div>

            <p className="mt-2 font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">
              {formatXAF(p.priceXAF)}
              <span className="text-sm font-normal text-basalt-500"> / month</span>
            </p>

            <ul className="mt-4 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-basalt-700 dark:text-basalt-300">
                  <span className="text-forest-600" aria-hidden>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setCheckout({ plan: p.plan, months: 1, priceXAF: p.priceXAF })}
                className="btn-secondary flex-1 text-xs"
              >
                1 month
              </button>
              <button
                type="button"
                onClick={() => setCheckout({ plan: p.plan, months: 12, priceXAF: p.priceXAF * 12 })}
                className="btn-accent flex-1 text-xs"
              >
                12 months
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-basalt-500">
        Pay with MTN Mobile Money or Orange Money, via Flutterwave or Intouch. Your plan activates
        as soon as the payment is confirmed.
      </p>
    </div>
  );
}

// ----------------------------------------------------------- requirements

const GUIDE_SKILLS = [
  'Wilderness first aid — recognising and responding to altitude sickness, heat exhaustion and injuries with no ambulance nearby',
  'Route-finding on unmarked or partially marked trails, including in fog and low visibility',
  'Group management — pacing a mixed-fitness group and making the call to turn back',
  'Working local knowledge of at least one region: water sources, weather patterns, hazards and permit rules',
  'Basic spoken English and French; a local language is a strong plus for rural regions',
  'Clear, calm communication under pressure — safety briefings, incident handling, difficult conversations with clients',
];

const GUIDE_NECESSITIES = [
  'A government-issued ID and, where applicable, an official mountain-guide registration (e.g. Mount CEO for Mount Cameroon)',
  'Your own reliable first-aid kit, sized for your group',
  'A phone that can hold offline maps of your routes',
  'Public liability awareness — know what you are and are not responsible for on a paid tour',
  'Established relationships with porters, cooks or transport where your tours need them',
  'A bank account or mobile money account (MTN MoMo / Orange Money) to receive payouts',
];

function GuideRequirements() {
  return (
    <div className="card p-6">
      <h2 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
        What it takes to become a guide here
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-basalt-600 dark:text-basalt-300">
        We verify every application before tours go live. Profiles that clearly show the skills and
        necessities below get approved faster — vague ones go back with questions.
      </p>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-basalt-500">Skills we look for</h3>
          <ul className="mt-3 space-y-2.5">
            {GUIDE_SKILLS.map((skill) => (
              <li key={skill} className="flex items-start gap-2 text-sm text-basalt-700 dark:text-basalt-300">
                <span className="flag-star mt-0.5" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M12 1.5l2.9 6.6 7.1.7-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.7z" />
                  </svg>
                </span>
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-basalt-500">
            What you need to have ready
          </h3>
          <ul className="mt-3 space-y-2.5">
            {GUIDE_NECESSITIES.map((item) => (
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
      </div>

      <p className="mt-5 rounded-lg bg-basalt-50 p-3.5 text-xs leading-relaxed text-basalt-600 dark:text-basalt-300 ring-1 ring-inset ring-basalt-100">
        None of this needs to be perfect on day one — certifications and languages can be added later.
        What we actually reject applications for is vagueness: name the specific trails or regions you
        run, your real years of experience, and certifications we can check.
      </p>
    </div>
  );
}

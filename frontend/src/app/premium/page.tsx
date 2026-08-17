'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatXAF } from '@/lib/format';
import { PaymentPanel } from '@/components/PaymentPanel';

const PLANS = [
  { months: 1, priceXAF: 3500, label: 'Monthly' },
  { months: 6, priceXAF: 18000, label: '6 months', save: '14%' },
  { months: 12, priceXAF: 30000, label: '12 months', save: '29%' },
];

const FEATURES = [
  {
    title: 'Offline trail packs',
    body: 'Download the route, numbered waypoints, hazards, permit notes and emergency numbers for any trail as a file on your phone. Above 2,000 m on Mount Cameroon and Mount Oku there is no signal — this is the difference between having the information and not.',
  },
  {
    title: 'Advanced navigation data',
    body: 'Full GeoJSON route geometry and waypoint elevations, exportable into whatever mapping app you already use.',
  },
  {
    title: 'Safety alerts',
    body: 'Conditions and access changes for the trails you have saved — permit rule changes, seasonal closures, regional security advisories.',
  },
  {
    title: 'Exclusive routes',
    body: 'Variant routes and lesser-known approaches contributed by verified guides, not published on the public trail pages.',
  },
  {
    title: 'Personalised recommendations',
    body: 'Suggestions built from what you have saved, reviewed and booked — and from the difficulty level you have actually proven.',
  },
];

export default function PremiumPage() {
  const { user, isPremium, refresh } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState(PLANS[1]);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  const startCheckout = () => {
    if (!user) {
      router.push('/login?next=/premium');
      return;
    }
    setPaying(true);
  };

  const onPaid = async () => {
    await refresh();
    setDone(true);
  };

  return (
    <div className="pb-20">
      <div className="flag-bar" aria-hidden />
      <header className="bg-forest-950 py-16 text-white">
        <div className="section text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-amber-400">
            Travesía Cameroon Premium
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            The information you need most is the information you cannot download at 3,000 m
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-basalt-300">
            Everything on this site stays free. Premium is for the part that matters when the signal
            drops: offline packs, navigation data, and alerts on the trails you have saved.
          </p>

          {isPremium && (
            <div className="mx-auto mt-8 max-w-md rounded-xl bg-amber-400/15 p-5 ring-1 ring-amber-400/30">
              <p className="font-display text-lg font-semibold text-amber-200">
                You are a Premium member
              </p>
              {user?.tierExpires && (
                <p className="mt-1 text-sm text-basalt-300">
                  Active until {formatDate(user.tierExpires)}
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="section grid gap-10 py-14 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">What you get</h2>
          <ul className="mt-6 space-y-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-4">
                <span
                  className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-forest-700 text-xs font-bold text-white"
                  aria-hidden
                >
                  ✓
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-xl border border-basalt-200 bg-white p-6">
            <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">
              What stays free, permanently
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">
              Every trail page, every distance and duration, every hazard warning, the interactive
              map, the safety guidelines, the guide directory and booking. The problem this platform
              exists to fix is people not hiking because the information is wrong or missing —
              putting that behind a paywall would be self-defeating.
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            {done ? (
              <div className="space-y-4 text-center">
                <p className="font-display text-xl font-semibold text-forest-800 dark:text-forest-400">
                  Premium is active
                </p>
                <p className="text-sm text-basalt-600 dark:text-basalt-300">
                  Offline packs are now available on every trail page.
                </p>
                <Link href="/trails" className="btn-primary w-full">
                  Browse trails
                </Link>
              </div>
            ) : paying ? (
              <>
                <button
                  type="button"
                  onClick={() => setPaying(false)}
                  className="mb-4 text-xs font-semibold text-basalt-600 dark:text-basalt-300 hover:text-basalt-800 dark:text-basalt-200"
                >
                  ← Change plan
                </button>
                <h2 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                  Pay with Mobile Money
                </h2>
                <p className="mt-1 mb-4 text-sm text-basalt-600 dark:text-basalt-300">
                  {selected.label} · {formatXAF(selected.priceXAF)}
                </p>
                <PaymentPanel
                  purpose="PREMIUM_MEMBERSHIP"
                  extra={{ months: selected.months }}
                  amountXAF={selected.priceXAF}
                  onSuccess={() => void onPaid()}
                  onCancel={() => setPaying(false)}
                />
              </>
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">Choose a plan</h2>

                <div className="mt-4 space-y-2">
                  {PLANS.map((plan) => (
                    <button
                      key={plan.months}
                      type="button"
                      onClick={() => setSelected(plan)}
                      aria-pressed={selected.months === plan.months}
                      className={`flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                        selected.months === plan.months
                          ? 'border-forest-700 bg-forest-50'
                          : 'border-basalt-200 hover:border-basalt-300'
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-basalt-900 dark:text-basalt-50">
                          {plan.label}
                        </span>
                        {plan.save && (
                          <span className="text-xs font-medium text-forest-700">
                            Save {plan.save}
                          </span>
                        )}
                      </span>
                      <span className="text-right">
                        <span className="block font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                          {formatXAF(plan.priceXAF)}
                        </span>
                        <span className="text-xs text-basalt-600 dark:text-basalt-300">
                          {formatXAF(Math.round(plan.priceXAF / plan.months))}/mo
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <button type="button" onClick={startCheckout} className="btn-accent mt-5 w-full">
                  {!user
                    ? 'Sign in to subscribe'
                    : isPremium
                      ? `Extend by ${selected.months} month${selected.months > 1 ? 's' : ''}`
                      : 'Continue to payment'}
                </button>

                <p className="mt-3 text-xs leading-relaxed text-basalt-600 dark:text-basalt-300">
                  Pay with MTN Mobile Money or Orange Money, via Flutterwave or Intouch. Your
                  membership activates as soon as the payment is confirmed.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

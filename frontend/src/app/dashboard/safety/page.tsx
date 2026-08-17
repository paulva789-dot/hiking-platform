'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime, relativeTime } from '@/lib/format';
import type { CheckInStatus, SafetyCheckIn } from '@/lib/types';
import { Alert, EmptyState, SectionHeading, Skeleton, Spinner } from '@/components/ui';

const STATUS_STYLES: Record<CheckInStatus, string> = {
  ACTIVE: 'bg-forest-100 text-forest-800 ring-forest-200',
  CHECKED_IN: 'bg-basalt-100 text-basalt-700 ring-basalt-200',
  OVERDUE: 'bg-amber-100 text-amber-900 ring-amber-200',
  ALERTED: 'bg-red-100 text-red-900 ring-red-200',
  CANCELLED: 'bg-basalt-100 text-basalt-500 ring-basalt-200',
};

const STATUS_LABELS: Record<CheckInStatus, string> = {
  ACTIVE: 'Active',
  CHECKED_IN: 'Checked in',
  OVERDUE: 'Overdue',
  ALERTED: 'Contact alerted',
  CANCELLED: 'Cancelled',
};

// Local time, trimmed to what <input type="datetime-local"> accepts.
const defaultDueBack = () => {
  const d = new Date(Date.now() + 8 * 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function SafetyCheckInPage() {
  const { isPremium } = useAuth();
  const [checkIns, setCheckIns] = useState<SafetyCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [planLabel, setPlanLabel] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [dueBackAt, setDueBackAt] = useState(defaultDueBack());

  const load = () =>
    api
      .get<{ checkIns: SafetyCheckIn[] }>('/checkins')
      .then((d) => setCheckIns(d.checkIns))
      .catch(() => setCheckIns([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (isPremium) void load();
    else setLoading(false);
  }, [isPremium]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await api.post('/checkins', {
        planLabel,
        emergencyContactName: contactName,
        emergencyContactPhone: contactPhone,
        dueBackAt: new Date(dueBackAt).toISOString(),
      });
      setPlanLabel('');
      setContactName('');
      setContactPhone('');
      setDueBackAt(defaultDueBack());
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the check-in');
    } finally {
      setCreating(false);
    }
  };

  const act = async (id: string, action: 'check-in' | 'cancel') => {
    setBusyId(id);
    setError(null);
    try {
      if (action === 'check-in') await api.post(`/checkins/${id}/check-in`);
      else await api.delete(`/checkins/${id}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That did not work. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  if (!isPremium) {
    return (
      <div>
        <SectionHeading
          title="Safety check-in"
          description="Tell us when you expect to be back. If you're not, we text your emergency contact."
        />
        <div className="card mt-6 p-8 text-center">
          <p className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
            This is a Premium feature
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-basalt-600 dark:text-basalt-300">
            Set a plan and a return time before you head out. If you go overdue, we send an SMS to
            the emergency contact you name — no signal on your end required, since the alert fires
            from our side.
          </p>
          <Link href="/premium" className="btn-accent mt-5 inline-block">
            Go Premium
          </Link>
        </div>
      </div>
    );
  }

  const active = checkIns.filter((c) => c.status === 'ACTIVE' || c.status === 'OVERDUE');
  const past = checkIns.filter((c) => c.status === 'CHECKED_IN' || c.status === 'ALERTED' || c.status === 'CANCELLED');

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <SectionHeading
          title="Safety check-in"
          description="If you go overdue and haven't checked in, we text your emergency contact automatically."
        />

        {error && <Alert tone="danger">{error}</Alert>}

        {loading ? (
          <Skeleton className="mt-4 h-32 w-full" />
        ) : checkIns.length === 0 ? (
          <EmptyState
            title="No check-ins yet"
            message="Set one up before you head out on the right — it only takes a moment."
          />
        ) : (
          <div className="mt-6 space-y-6">
            {active.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">
                  Active
                </h2>
                <ul className="space-y-3">
                  {active.map((c) => (
                    <CheckInRow key={c.id} checkIn={c} busy={busyId === c.id} onAct={act} />
                  ))}
                </ul>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">
                  Past
                </h2>
                <ul className="space-y-3">
                  {past.map((c) => (
                    <CheckInRow key={c.id} checkIn={c} busy={false} onAct={act} readOnly />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <form onSubmit={create} className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
            New check-in
          </h2>

          <div>
            <label htmlFor="planLabel" className="label">
              Where are you headed?
            </label>
            <input
              id="planLabel"
              value={planLabel}
              onChange={(e) => setPlanLabel(e.target.value)}
              placeholder="Mount Cameroon, Guinness route"
              minLength={3}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="dueBackAt" className="label">
              Expected back by
            </label>
            <input
              id="dueBackAt"
              type="datetime-local"
              value={dueBackAt}
              onChange={(e) => setDueBackAt(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="contactName" className="label">
              Emergency contact name
            </label>
            <input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="contactPhone" className="label">
              Emergency contact phone
            </label>
            <input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+237 6 XX XX XX XX"
              minLength={6}
              className="input"
              required
            />
          </div>

          <button type="submit" disabled={creating} className="btn-accent w-full">
            {creating && <Spinner className="h-4 w-4" />}
            Start check-in
          </button>

          <p className="text-xs leading-relaxed text-basalt-600 dark:text-basalt-300">
            We only contact your emergency contact if you go overdue without checking in. Cancel or
            check in any time before then.
          </p>
        </form>
      </aside>
    </div>
  );
}

function CheckInRow({
  checkIn,
  busy,
  onAct,
  readOnly = false,
}: {
  checkIn: SafetyCheckIn;
  busy: boolean;
  onAct: (id: string, action: 'check-in' | 'cancel') => void;
  readOnly?: boolean;
}) {
  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-basalt-900 dark:text-basalt-50">{checkIn.planLabel}</h3>
            <span className={`chip ${STATUS_STYLES[checkIn.status]}`}>{STATUS_LABELS[checkIn.status]}</span>
          </div>
          <p className="mt-1 text-sm text-basalt-600 dark:text-basalt-300">
            Due back {formatDateTime(checkIn.dueBackAt)}
          </p>
          <p className="mt-1 text-sm text-basalt-600 dark:text-basalt-300">
            Contact: {checkIn.emergencyContactName} · {checkIn.emergencyContactPhone}
          </p>
          {checkIn.status === 'ALERTED' && checkIn.alertedAt && (
            <p className="mt-1 text-xs font-semibold text-red-700 dark:text-red-400">
              Alerted {relativeTime(checkIn.alertedAt)}
            </p>
          )}
          {checkIn.alertFailureReason && (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Alert not sent: {checkIn.alertFailureReason}
            </p>
          )}
        </div>

        {!readOnly && (
          <div className="flex shrink-0 flex-col gap-2">
            <button
              type="button"
              onClick={() => onAct(checkIn.id, 'check-in')}
              disabled={busy}
              className="btn-accent text-xs"
            >
              {busy && <Spinner className="h-3 w-3" />}
              I&apos;m back
            </button>
            <button
              type="button"
              onClick={() => onAct(checkIn.id, 'cancel')}
              disabled={busy}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

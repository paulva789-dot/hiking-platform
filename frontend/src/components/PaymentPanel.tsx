'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { formatXAF } from '@/lib/format';
import type { PaymentInitiateResponse, PaymentMethod, PaymentStatusResponse } from '@/lib/types';
import { Alert, Spinner } from '@/components/ui';

const METHODS: { value: PaymentMethod; label: string; badge: string }[] = [
  { value: 'MTN_MOMO', label: 'MTN Mobile Money', badge: 'bg-amber-400 text-amber-950' },
  { value: 'ORANGE_MONEY', label: 'Orange Money', badge: 'bg-orange-500 text-white' },
];

// Flutterwave vs Intouch is an operator-side routing choice, not something a
// hiker paying with MTN/Orange has any basis to decide correctly — pick one
// internally instead of asking.
const PAYMENT_PROVIDER = 'FLUTTERWAVE' as const;

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

type Body =
  | { purpose: 'PREMIUM_MEMBERSHIP'; months: number }
  | { purpose: 'GUIDE_PLAN'; guidePlan: 'BASIC' | 'PRO'; months: number };

export function PaymentPanel({
  purpose,
  extra,
  amountXAF,
  onSuccess,
  onCancel,
}: {
  purpose: 'PREMIUM_MEMBERSHIP' | 'GUIDE_PLAN';
  extra: { months: number; guidePlan?: 'BASIC' | 'PRO' };
  amountXAF: number;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState<'form' | 'pending' | 'success' | 'failed'>('form');
  const [reference, setReference] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollDeadline = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  const startPolling = (ref: string) => {
    pollDeadline.current = Date.now() + POLL_TIMEOUT_MS;
    pollTimer.current = setInterval(async () => {
      if (Date.now() > pollDeadline.current) {
        if (pollTimer.current) clearInterval(pollTimer.current);
        setStage('failed');
        setError('This is taking longer than expected. If you approved the prompt, check back shortly.');
        return;
      }
      try {
        const status = await api.get<PaymentStatusResponse>(`/payments/${ref}`);
        if (status.status === 'SUCCESSFUL') {
          if (pollTimer.current) clearInterval(pollTimer.current);
          setStage('success');
          onSuccess();
        } else if (status.status === 'FAILED') {
          if (pollTimer.current) clearInterval(pollTimer.current);
          setStage('failed');
          setError(status.failureReason ?? 'The payment failed or was declined.');
        }
      } catch {
        // Transient network errors during polling are not fatal — keep trying.
      }
    }, POLL_INTERVAL_MS);
  };

  /**
   * A MoMo/Orange prompt already sent to the phone can still be approved
   * after the UI gives up on it — "Try again" alone risks a second real
   * charge for something that already went through. Always offer one
   * explicit re-check against the same reference before starting over.
   */
  const checkStatusAgain = async () => {
    if (!reference) return;
    setBusy(true);
    try {
      const status = await api.get<PaymentStatusResponse>(`/payments/${reference}`);
      if (status.status === 'SUCCESSFUL') {
        setStage('success');
        onSuccess();
      } else if (status.status === 'FAILED') {
        setError(status.failureReason ?? 'The payment failed or was declined.');
      } else {
        setError('Still not confirmed. If you approved the prompt on your phone, wait a moment and check again.');
      }
    } catch {
      setError('Could not reach the server to check. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body: Body =
        purpose === 'PREMIUM_MEMBERSHIP'
          ? { purpose: 'PREMIUM_MEMBERSHIP', months: extra.months }
          : { purpose: 'GUIDE_PLAN', guidePlan: extra.guidePlan!, months: extra.months };

      const res = await api.post<PaymentInitiateResponse>('/payments/initiate', {
        ...body,
        provider: PAYMENT_PROVIDER,
        method,
        phone,
      });

      setReference(res.reference);
      setInstructions(res.instructions);
      setStage('pending');
      startPolling(res.reference);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the payment');
    } finally {
      setBusy(false);
    }
  };

  if (stage === 'success') {
    return (
      <div className="space-y-3 text-center">
        <p className="font-display text-xl font-semibold text-forest-800 dark:text-forest-400">Payment confirmed</p>
        <p className="text-sm text-basalt-600 dark:text-basalt-300">Reference {reference}</p>
      </div>
    );
  }

  if (stage === 'pending') {
    return (
      <div className="space-y-4 text-center">
        <Spinner className="mx-auto h-8 w-8 text-forest-700" />
        <p className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
          Waiting for confirmation
        </p>
        <p className="text-sm text-basalt-600 dark:text-basalt-300">{instructions}</p>
        <p className="text-xs text-basalt-600 dark:text-basalt-300">
          Reference {reference} · this checks automatically, no need to refresh.
        </p>
        {error && <Alert tone="danger">{error}</Alert>}
        <button
          type="button"
          onClick={() => {
            if (pollTimer.current) clearInterval(pollTimer.current);
            setStage('form');
            setError(null);
          }}
          className="btn-secondary w-full"
        >
          Cancel and try again
        </button>
        <p className="text-xs text-basalt-500 dark:text-basalt-400">
          If you already approved the prompt on your phone, cancelling here will not stop it — it
          may still go through.
        </p>
      </div>
    );
  }

  if (stage === 'failed') {
    return (
      <div className="space-y-4 text-center">
        <p className="font-display text-lg font-semibold text-red-700">Payment did not go through</p>
        {error && <Alert tone="danger">{error}</Alert>}
        <button type="button" onClick={() => void checkStatusAgain()} disabled={busy} className="btn-primary w-full">
          {busy && <Spinner className="h-4 w-4" />}
          Check status again
        </button>
        <p className="text-xs text-basalt-500 dark:text-basalt-400">
          If you approved the prompt on your phone, check again before starting a new payment — a
          second attempt could charge you twice.
        </p>
        <button type="button" onClick={() => setStage('form')} className="btn-ghost w-full">
          Start a new payment instead
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <span className="label">Mobile money network</span>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(m.value)}
              aria-pressed={method === m.value}
              className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                method === m.value
                  ? 'border-forest-700 bg-forest-50 dark:bg-forest-900/30'
                  : 'border-basalt-200 hover:border-basalt-300 dark:border-basalt-700'
              }`}
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${m.badge}`} aria-hidden />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="pay-phone" className="label">
          Phone number
        </label>
        <input
          id="pay-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="6XXXXXXXX"
          className="input"
        />
        <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
          The number registered to that {method === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Orange Money'}{' '}
          account.
        </p>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <button type="submit" disabled={busy} className="btn-accent w-full">
        {busy && <Spinner className="h-4 w-4" />}
        Pay {formatXAF(amountXAF)}
      </button>

      {onCancel && (
        <button type="button" onClick={onCancel} className="btn-ghost w-full">
          Cancel
        </button>
      )}
    </form>
  );
}

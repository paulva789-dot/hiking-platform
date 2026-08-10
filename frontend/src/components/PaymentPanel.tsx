'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { formatXAF } from '@/lib/format';
import type {
  PaymentInitiateResponse,
  PaymentMethod,
  PaymentProvider,
  PaymentStatusResponse,
} from '@/lib/types';
import { Alert, Spinner } from '@/components/ui';

const METHODS: { value: PaymentMethod; label: string; badge: string }[] = [
  { value: 'MTN_MOMO', label: 'MTN Mobile Money', badge: 'bg-amber-400 text-amber-950' },
  { value: 'ORANGE_MONEY', label: 'Orange Money', badge: 'bg-orange-500 text-white' },
];

const PROVIDERS: { value: PaymentProvider; label: string; hint: string }[] = [
  { value: 'FLUTTERWAVE', label: 'Flutterwave', hint: 'Prompt sent straight to your phone' },
  { value: 'INTOUCH', label: 'Intouch', hint: 'Direct local mobile money collection' },
];

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
  const [provider, setProvider] = useState<PaymentProvider>('FLUTTERWAVE');
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
        provider,
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
        <p className="text-xs text-basalt-500">
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
      </div>
    );
  }

  if (stage === 'failed') {
    return (
      <div className="space-y-4 text-center">
        <p className="font-display text-lg font-semibold text-red-700">Payment did not go through</p>
        {error && <Alert tone="danger">{error}</Alert>}
        <button type="button" onClick={() => setStage('form')} className="btn-primary w-full">
          Try again
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
        <span className="label">Payment gateway</span>
        <div className="grid grid-cols-2 gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setProvider(p.value)}
              aria-pressed={provider === p.value}
              className={`rounded-lg border-2 px-3 py-2.5 text-left transition-colors ${
                provider === p.value
                  ? 'border-forest-700 bg-forest-50 dark:bg-forest-900/30'
                  : 'border-basalt-200 hover:border-basalt-300 dark:border-basalt-700'
              }`}
            >
              <span className="block text-sm font-semibold text-basalt-900 dark:text-basalt-50">{p.label}</span>
              <span className="block text-xs text-basalt-500">{p.hint}</span>
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
        <p className="mt-1 text-xs text-basalt-500">
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

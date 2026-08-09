'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatXAF } from '@/lib/format';
import type { EventTicket } from '@/lib/types';
import { Alert, Spinner } from '@/components/ui';

export function TicketPurchase({
  eventId,
  title,
  priceXAF,
  ticketsLeft,
}: {
  eventId: string;
  title: string;
  priceXAF: number;
  ticketsLeft: number;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<EventTicket | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ ticket: EventTicket }>(
        `/content/events/${eventId}/tickets`,
        { quantity }
      );
      setTicket(res.ticket);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reserve tickets');
    } finally {
      setBusy(false);
    }
  };

  if (ticket) {
    return (
      <div className="card space-y-3 border-forest-300 bg-forest-50 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-forest-700">Tickets reserved</p>
        <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">{title}</h3>
        <p className="text-sm text-basalt-700 dark:text-basalt-300">
          Reference <code className="font-mono font-semibold">{ticket.reference}</code> ·{' '}
          {ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''} · {formatXAF(ticket.totalXAF)}
        </p>
        <Alert tone="info">
          Payment is settled on arrival or by mobile money before the event. Bring the reference.
        </Alert>
        <button type="button" onClick={() => router.push('/dashboard')} className="btn-primary w-full">
          View my tickets
        </button>
      </div>
    );
  }

  if (ticketsLeft <= 0) {
    return (
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">Sold out</h3>
        <p className="mt-2 text-sm text-basalt-600 dark:text-basalt-300">
          Every ticket for this event has gone. Check the events page for what else is coming up.
        </p>
      </div>
    );
  }

  const max = Math.min(10, ticketsLeft);

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <p className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">
          {priceXAF === 0 ? 'Free' : formatXAF(priceXAF)}
        </p>
        <p className="text-xs text-basalt-500">per ticket · {ticketsLeft} remaining</p>
      </div>

      <div>
        <label htmlFor="qty" className="label">
          How many tickets?
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          max={max}
          value={quantity}
          onChange={(e) => setQuantity(Math.min(max, Math.max(1, Number(e.target.value))))}
          className="input"
          required
        />
        <p className="mt-1 text-xs text-basalt-500">Maximum {max} per person.</p>
      </div>

      <div className="flex justify-between border-t border-basalt-100 pt-4 font-semibold text-basalt-900 dark:text-basalt-50">
        <span>Total</span>
        <span>{formatXAF(priceXAF * quantity)}</span>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <button type="submit" disabled={busy} className="btn-accent w-full">
        {busy && <Spinner className="h-4 w-4" />}
        {user ? 'Reserve tickets' : 'Sign in to book'}
      </button>
    </form>
  );
}

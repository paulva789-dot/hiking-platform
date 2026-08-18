'use client';

import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { ALL_REGIONS, REGION_LABELS } from '@/lib/format';
import { Alert, Spinner } from '@/components/ui';

export default function CorporatePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [groupSize, setGroupSize] = useState(15);
  const [preferredRegion, setPreferredRegion] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/content/group-inquiries', {
        name,
        email,
        phone: phone || undefined,
        organization: organization || undefined,
        groupSize,
        preferredRegion: preferredRegion || undefined,
        message,
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.details?.map((d) => d.message).join('. ') ?? err.message)
          : 'Could not send that. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <header className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-10">
          <h1 className="font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            Group and corporate hikes
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600 dark:text-basalt-300">
            Most guided tours here take groups of six to ten. For a team offsite, a larger party, or
            an itinerary built around what your group actually wants, tell us the details below and a
            guide will follow up directly — no account needed to ask.
          </p>
        </div>
      </header>

      <div className="section grid gap-10 py-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-5 text-sm leading-relaxed text-basalt-700 dark:text-basalt-300">
          <div className="card p-5">
            <h2 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">
              What this is for
            </h2>
            <ul className="mt-3 space-y-2">
              <li>A team or company trip larger than a normal tour&apos;s group size</li>
              <li>A custom route, pace or duration built around your group specifically</li>
              <li>Coordinating one hike across several departure dates for a big party</li>
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">
              How it works
            </h2>
            <p className="mt-2">
              This goes to our team, not straight to a booking. We match it to a registered guide who
              covers the region you want, and they follow up by email or phone to work out dates,
              price and logistics before anything is booked or paid for.
            </p>
          </div>
        </div>

        <aside>
          <form onSubmit={submit} className="card space-y-4 p-6">
            {done ? (
              <div className="space-y-3 text-center">
                <p className="font-display text-lg font-semibold text-forest-800 dark:text-forest-400">
                  Sent
                </p>
                <p className="text-sm text-basalt-600 dark:text-basalt-300">
                  Thanks — a guide or our team will follow up at the email you gave.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                  Tell us about your group
                </h2>

                <div>
                  <label htmlFor="name" className="label">
                    Your name
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    className="input"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="label">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="label">
                      Phone <span className="font-normal text-basalt-600 dark:text-basalt-300">(optional)</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+237 6 XX XX XX XX"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="organization" className="label">
                    Company or organization <span className="font-normal text-basalt-600 dark:text-basalt-300">(optional)</span>
                  </label>
                  <input
                    id="organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="groupSize" className="label">
                      Group size
                    </label>
                    <input
                      id="groupSize"
                      type="number"
                      min={1}
                      max={500}
                      value={groupSize}
                      onChange={(e) => setGroupSize(Math.max(1, Number(e.target.value)))}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="preferredRegion" className="label">
                      Preferred region <span className="font-normal text-basalt-600 dark:text-basalt-300">(optional)</span>
                    </label>
                    <select
                      id="preferredRegion"
                      value={preferredRegion}
                      onChange={(e) => setPreferredRegion(e.target.value)}
                      className="input"
                    >
                      <option value="">No preference</option>
                      {ALL_REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {REGION_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="label">
                    What are you planning?
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    placeholder="Dates you're considering, fitness level of the group, what you're hoping to get out of the day…"
                    className="input resize-y"
                  />
                </div>

                {error && <Alert tone="danger">{error}</Alert>}

                <button type="submit" disabled={busy} className="btn-accent w-full">
                  {busy && <Spinner className="h-4 w-4" />}
                  Send inquiry
                </button>
              </>
            )}
          </form>
        </aside>
      </div>
    </div>
  );
}

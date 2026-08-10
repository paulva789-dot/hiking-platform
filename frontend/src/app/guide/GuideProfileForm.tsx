'use client';

import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { ALL_REGIONS, CENTRAL_AFRICA_COUNTRIES, REGION_LABELS } from '@/lib/format';
import type { GuideProfile, Region } from '@/lib/types';
import { Alert, Spinner } from '@/components/ui';

/** Comma-separated text ↔ string[], because a tag input is overkill here. */
const toList = (value: string) =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export function GuideProfileForm({
  existing,
  onSaved,
}: {
  existing?: GuideProfile;
  onSaved: () => void;
}) {
  const [headline, setHeadline] = useState(existing?.headline ?? '');
  const [bio, setBio] = useState(existing?.bio ?? '');
  const [yearsExperience, setYears] = useState(String(existing?.yearsExperience ?? 0));
  const [languages, setLanguages] = useState((existing?.languages ?? []).join(', '));
  const [certifications, setCerts] = useState((existing?.certifications ?? []).join(', '));
  const [regions, setRegions] = useState<Region[]>(existing?.regions ?? []);
  const [countries, setCountries] = useState<string[]>(existing?.countries ?? ['Cameroon']);
  const [dayRateXAF, setRate] = useState(String(existing?.dayRateXAF ?? ''));
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(existing?.whatsapp ?? '');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const toggleRegion = (region: Region) =>
    setRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );

  const toggleCountry = (country: string) =>
    setCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (regions.length === 0) {
      setError('Choose at least one region you guide in');
      return;
    }
    if (countries.length === 0) {
      setError('Choose at least one country you run tours in');
      return;
    }

    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await api.post('/guides/profile', {
        headline,
        bio,
        yearsExperience: Number(yearsExperience),
        languages: toList(languages),
        certifications: toList(certifications),
        regions,
        countries,
        dayRateXAF: Number(dayRateXAF || 0),
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
      });
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.details?.map((d) => `${d.field}: ${d.message}`).join('. ') ?? err.message)
          : 'Could not save your profile'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card max-w-3xl space-y-5 p-6">
      <div>
        <label htmlFor="headline" className="label">
          Headline
        </label>
        <input
          id="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          required
          minLength={10}
          maxLength={160}
          placeholder="Mount CEO registered guide — 14 years on Mount Cameroon"
          className="input"
        />
        <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
          One line. What you are registered for and how long you have done it.
        </p>
      </div>

      <div>
        <label htmlFor="bio" className="label">
          About you
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
          minLength={50}
          maxLength={4000}
          rows={7}
          placeholder="What you run, where, how you brief people, how you handle bad conditions, and what you will not do."
          className="input resize-y"
        />
        <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
          {bio.length}/4000 — minimum 50 characters. Specific profiles get approved faster.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="years" className="label">
            Years guiding
          </label>
          <input
            id="years"
            type="number"
            min={0}
            max={70}
            value={yearsExperience}
            onChange={(e) => setYears(e.target.value)}
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="rate" className="label">
            Day rate (XAF)
          </label>
          <input
            id="rate"
            type="number"
            min={0}
            step={1000}
            value={dayRateXAF}
            onChange={(e) => setRate(e.target.value)}
            required
            placeholder="30000"
            className="input"
          />
        </div>
      </div>

      <div>
        <span className="label">Regions you guide in</span>
        <div className="flex flex-wrap gap-2">
          {ALL_REGIONS.map((r) => {
            const active = regions.includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() => toggleRegion(r)}
                aria-pressed={active}
                className={`chip transition-colors ${
                  active
                    ? 'bg-forest-700 text-white ring-forest-700'
                    : 'bg-white text-basalt-700 dark:bg-basalt-900 dark:text-basalt-300 dark:ring-basalt-700 ring-basalt-300 hover:bg-basalt-100 dark:hover:bg-basalt-800'
                }`}
              >
                {REGION_LABELS[r]}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">Cameroon&rsquo;s regions — where your Cameroon tours run.</p>
      </div>

      <div>
        <span className="label">Countries you run tours in</span>
        <div className="flex flex-wrap gap-2">
          {CENTRAL_AFRICA_COUNTRIES.map((c) => {
            const active = countries.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCountry(c)}
                aria-pressed={active}
                className={`chip transition-colors ${
                  active
                    ? 'bg-cameroon-green text-white ring-cameroon-green'
                    : 'bg-white text-basalt-700 dark:bg-basalt-900 dark:text-basalt-300 dark:ring-basalt-700 ring-basalt-300 hover:bg-basalt-100 dark:hover:bg-basalt-800'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
          Not limited to Cameroon — tick any Central African country where you actually lead trips.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="languages" className="label">
            Languages
          </label>
          <input
            id="languages"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            required
            placeholder="English, French, Pidgin, Bakweri"
            className="input"
          />
          <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">Comma-separated.</p>
        </div>

        <div>
          <label htmlFor="certs" className="label">
            Certifications <span className="font-normal text-basalt-600 dark:text-basalt-300">(optional)</span>
          </label>
          <input
            id="certs"
            value={certifications}
            onChange={(e) => setCerts(e.target.value)}
            placeholder="Mount CEO registered guide, Wilderness First Aid (2024)"
            className="input"
          />
          <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
            Comma-separated. We check these before approving.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="guide-phone" className="label">
            Phone
          </label>
          <input
            id="guide-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+237 6 XX XX XX XX"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className="label">
            WhatsApp <span className="font-normal text-basalt-600 dark:text-basalt-300">(optional)</span>
          </label>
          <input
            id="whatsapp"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+237 6 XX XX XX XX"
            className="input"
          />
        </div>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}
      {saved && (
        <Alert tone="success">
          Profile saved.{' '}
          {existing?.status === 'APPROVED'
            ? 'Your changes are live.'
            : 'It is now in the review queue — we usually get through applications within a few days.'}
        </Alert>
      )}

      <button type="submit" disabled={busy} className="btn-primary">
        {busy && <Spinner className="h-4 w-4" />}
        {existing ? 'Save profile' : 'Submit for verification'}
      </button>
    </form>
  );
}

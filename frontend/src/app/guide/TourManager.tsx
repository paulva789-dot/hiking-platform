'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { CENTRAL_AFRICA_COUNTRIES, formatDateRange, formatXAF } from '@/lib/format';
import type { Tour, TrailCard } from '@/lib/types';
import { Alert, EmptyState, SectionHeading, Spinner } from '@/components/ui';

const toList = (value: string) =>
  value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

export function TourManager({
  tours,
  canPublish,
  onChange,
}: {
  tours: Tour[];
  canPublish: boolean;
  onChange: () => void;
}) {
  const [trails, setTrails] = useState<TrailCard[]>([]);
  const [editing, setEditing] = useState<Tour | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ trails: TrailCard[] }>('/trails', { query: { limit: 60, sort: 'name' } })
      .then((d) => setTrails(d.trails))
      .catch(() => setTrails([]));
  }, []);

  const remove = async (tour: Tour) => {
    setError(null);
    try {
      await api.delete(`/guides/tours/${tour.id}`);
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the tour');
    }
  };

  const togglePublished = async (tour: Tour) => {
    setError(null);
    try {
      await api.patch(`/guides/tours/${tour.id}`, { published: !tour.published });
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the tour');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="My tours"
        description="A tour needs at least one departure date before anyone can book it."
        action={
          <button type="button" onClick={() => setEditing('new')} className="btn-primary">
            New tour
          </button>
        }
      />

      {!canPublish && (
        <Alert tone="warn">
          Your profile is not approved yet, so these tours are not visible to the public. You can
          still set everything up now.
        </Alert>
      )}

      {error && <Alert tone="danger">{error}</Alert>}

      {editing && (
        <TourForm
          tour={editing === 'new' ? undefined : editing}
          trails={trails}
          onDone={() => {
            setEditing(null);
            onChange();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {tours.length === 0 && !editing ? (
        <EmptyState
          title="No tours yet"
          message="Create a tour, add departure dates, and it appears on the trail page and your public profile."
        />
      ) : (
        <ul className="space-y-4">
          {tours.map((tour) => (
            <li key={tour.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                      {tour.title}
                    </h3>
                    <span
                      className={`chip ${
                        tour.published
                          ? 'bg-forest-100 text-forest-800 ring-forest-200'
                          : 'bg-basalt-200 text-basalt-700 dark:text-basalt-300 ring-basalt-300'
                      }`}
                    >
                      {tour.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-basalt-600 dark:text-basalt-300">
                    {tour.trail && <span>On {tour.trail.name}</span>}
                    <span className="flag-chip">{tour.country}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-basalt-600 dark:text-basalt-300">{tour.description}</p>
                  <p className="mt-2 text-xs text-basalt-600 dark:text-basalt-300">
                    {formatXAF(tour.priceXAF)} pp · {tour.durationDays} day
                    {tour.durationDays > 1 ? 's' : ''} · max {tour.maxGroupSize} ·{' '}
                    {tour._count?.bookings ?? 0} booking
                    {(tour._count?.bookings ?? 0) === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(tour)}
                    className="btn-secondary text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void togglePublished(tour)}
                    className="btn-ghost text-xs"
                  >
                    {tour.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(tour)}
                    className="text-xs font-semibold text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <ScheduleManager tour={tour} onChange={onChange} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- schedules

function ScheduleManager({ tour, onChange }: { tour: Tour; onChange: () => void }) {
  const [adding, setAdding] = useState(false);
  const [startDate, setStart] = useState('');
  const [endDate, setEnd] = useState('');
  const [capacity, setCapacity] = useState(String(tour.maxGroupSize));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post(`/guides/tours/${tour.id}/schedules`, {
        startDate,
        endDate: endDate || startDate,
        capacity: Number(capacity),
      });
      setAdding(false);
      setStart('');
      setEnd('');
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add the date');
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (scheduleId: string) => {
    if (!confirm('Cancel this date? Every booking on it will be cancelled too.')) return;
    await api.delete(`/guides/schedules/${scheduleId}`);
    onChange();
  };

  const active = tour.schedules.filter((s) => !s.cancelled);

  return (
    <div className="mt-4 border-t border-basalt-100 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-300">
          Departure dates ({active.length})
        </p>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="text-xs font-semibold text-forest-700 hover:underline"
        >
          {adding ? 'Cancel' : '+ Add date'}
        </button>
      </div>

      {adding && (
        <form onSubmit={add} className="mt-3 grid gap-3 rounded-lg bg-basalt-50 p-3 sm:grid-cols-4">
          <div>
            <label htmlFor={`start-${tour.id}`} className="label text-xs">
              Start
            </label>
            <input
              id={`start-${tour.id}`}
              type="date"
              value={startDate}
              onChange={(e) => setStart(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              required
              className="input py-1.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor={`end-${tour.id}`} className="label text-xs">
              End
            </label>
            <input
              id={`end-${tour.id}`}
              type="date"
              value={endDate}
              onChange={(e) => setEnd(e.target.value)}
              min={startDate || new Date().toISOString().slice(0, 10)}
              className="input py-1.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor={`cap-${tour.id}`} className="label text-xs">
              Capacity
            </label>
            <input
              id={`cap-${tour.id}`}
              type="number"
              min={1}
              max={tour.maxGroupSize}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              className="input py-1.5 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={busy} className="btn-primary w-full py-1.5 text-xs">
              {busy && <Spinner className="h-3 w-3" />}
              Add
            </button>
          </div>

          {error && (
            <div className="sm:col-span-4">
              <Alert tone="danger">{error}</Alert>
            </div>
          )}
        </form>
      )}

      {active.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {active.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-basalt-50 px-3 py-2 text-sm"
            >
              <span className="text-basalt-800 dark:text-basalt-200">{formatDateRange(s.startDate, s.endDate)}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-basalt-600 dark:text-basalt-300">
                  {s.seatsBooked}/{s.capacity} booked
                </span>
                <button
                  type="button"
                  onClick={() => void cancel(s.id)}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Cancel
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ------------------------------------------------------------------- form

function TourForm({
  tour,
  trails,
  onDone,
  onCancel,
}: {
  tour?: Tour;
  trails: TrailCard[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(tour?.title ?? '');
  const [description, setDescription] = useState(tour?.description ?? '');
  const [country, setCountry] = useState(tour?.country ?? 'Cameroon');
  const [trailId, setTrailId] = useState(tour?.trailId ?? '');
  const [priceXAF, setPrice] = useState(String(tour?.priceXAF ?? ''));
  const [maxGroupSize, setMax] = useState(String(tour?.maxGroupSize ?? 8));
  const [durationDays, setDays] = useState(String(tour?.durationDays ?? 1));
  const [includes, setIncludes] = useState((tour?.includes ?? []).join('\n'));
  const [excludes, setExcludes] = useState((tour?.excludes ?? []).join('\n'));
  const [meetingPoint, setMeeting] = useState(tour?.meetingPoint ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      title,
      description,
      country,
      trailId: trailId || null,
      priceXAF: Number(priceXAF),
      maxGroupSize: Number(maxGroupSize),
      durationDays: Number(durationDays),
      includes: toList(includes),
      excludes: toList(excludes),
      meetingPoint: meetingPoint || null,
    };

    try {
      if (tour) await api.patch(`/guides/tours/${tour.id}`, payload);
      else await api.post('/guides/tours', payload);
      onDone();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.details?.map((d) => `${d.field}: ${d.message}`).join('. ') ?? err.message)
          : 'Could not save the tour'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 border-forest-300 p-6">
      <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
        {tour ? 'Edit tour' : 'New tour'}
      </h3>

      <div>
        <label htmlFor="tour-title" className="label">
          Title
        </label>
        <input
          id="tour-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={5}
          maxLength={160}
          placeholder="Mount Cameroon Summit — 2 days, Guinness Route"
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tour-trail" className="label">
            Which trail?
          </label>
          <select
            id="tour-trail"
            value={trailId}
            onChange={(e) => setTrailId(e.target.value)}
            className="input"
          >
            <option value="">Not tied to a listed trail</option>
            {trails.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
            Linking a trail puts this tour on that trail&rsquo;s page, which is where most bookings
            come from.
          </p>
        </div>

        <div>
          <label htmlFor="tour-country" className="label">
            Country
          </label>
          <select
            id="tour-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="input"
          >
            {CENTRAL_AFRICA_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
            Not limited to Cameroon — pick wherever this specific tour actually runs.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="tour-desc" className="label">
          Description
        </label>
        <textarea
          id="tour-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={30}
          maxLength={6000}
          rows={6}
          placeholder="Day-by-day shape of the trip, what the pace is like, who it suits, and what you do if conditions turn."
          className="input resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="tour-price" className="label">
            Price per person (XAF)
          </label>
          <input
            id="tour-price"
            type="number"
            min={0}
            step={1000}
            value={priceXAF}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="tour-max" className="label">
            Max group size
          </label>
          <input
            id="tour-max"
            type="number"
            min={1}
            max={60}
            value={maxGroupSize}
            onChange={(e) => setMax(e.target.value)}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="tour-days" className="label">
            Duration (days)
          </label>
          <input
            id="tour-days"
            type="number"
            min={1}
            max={30}
            value={durationDays}
            onChange={(e) => setDays(e.target.value)}
            required
            className="input"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tour-inc" className="label">
            What&rsquo;s included
          </label>
          <textarea
            id="tour-inc"
            value={includes}
            onChange={(e) => setIncludes(e.target.value)}
            rows={5}
            placeholder={'Park entry and hut fees\nRegistered guide\nOne porter per two climbers'}
            className="input resize-y font-mono text-xs"
          />
          <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">One per line.</p>
        </div>

        <div>
          <label htmlFor="tour-exc" className="label">
            Not included
          </label>
          <textarea
            id="tour-exc"
            value={excludes}
            onChange={(e) => setExcludes(e.target.value)}
            rows={5}
            placeholder={'Transport to Buea\nAccommodation\nPersonal insurance'}
            className="input resize-y font-mono text-xs"
          />
          <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">One per line.</p>
        </div>
      </div>

      <div>
        <label htmlFor="tour-meeting" className="label">
          Meeting point
        </label>
        <input
          id="tour-meeting"
          value={meetingPoint}
          onChange={(e) => setMeeting(e.target.value)}
          maxLength={300}
          placeholder="Mount CEO office, Buea Town — 16:00 the day before for the briefing"
          className="input"
        />
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy && <Spinner className="h-4 w-4" />}
          {tour ? 'Save tour' : 'Create tour'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

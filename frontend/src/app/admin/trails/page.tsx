'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import {
  ALL_DIFFICULTIES,
  ALL_REGIONS,
  DIFFICULTY_LABELS,
  REGION_LABELS,
  formatDistance,
  formatDuration,
} from '@/lib/format';
import type { Difficulty, Pagination, Region, Trail } from '@/lib/types';
import { Alert, EmptyState, SectionHeading, Skeleton, Spinner } from '@/components/ui';

type TrailRow = Trail & {
  _count: { reviews: number; favorites: number; waypoints: number; tours: number };
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AdminTrailsPage() {
  const [trails, setTrails] = useState<TrailRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TrailRow | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ trails: TrailRow[]; pagination: Pagination }>('/admin/trails', {
        query: { q: q || undefined, page, limit: 20 },
      });
      setTrails(data.trails);
      setPagination(data.pagination);
    } catch {
      setTrails([]);
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  const remove = async (trail: TrailRow) => {
    if (!confirm(`Delete "${trail.name}"? This removes its reviews, photos and waypoints too.`)) return;
    setError(null);
    try {
      await api.delete(`/admin/trails/${trail.id}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the trail');
    }
  };

  const togglePublished = async (trail: TrailRow) => {
    setError(null);
    try {
      await api.patch(`/admin/trails/${trail.id}`, { published: !trail.published });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the trail');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Trail management"
        description="The content that makes this platform worth using. Every number here is a claim someone will plan a hike around — check it against a local guide association before publishing."
        action={
          <button type="button" onClick={() => setEditing('new')} className="btn-primary">
            New trail
          </button>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {editing && (
        <TrailForm
          trail={editing === 'new' ? undefined : editing}
          onDone={() => {
            setEditing(null);
            void load();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
        placeholder="Search trails…"
        aria-label="Search trails"
        className="input max-w-xs"
      />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : trails.length === 0 ? (
        <EmptyState title="No trails" message="Nothing matches that search." />
      ) : (
        <>
          <ul className="space-y-3">
            {trails.map((trail) => (
              <li key={trail.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                        {trail.name}
                      </h3>
                      <span
                        className={`chip ${
                          trail.published
                            ? 'bg-forest-100 text-forest-800 ring-forest-200'
                            : 'bg-basalt-200 text-basalt-700 dark:text-basalt-300 ring-basalt-300'
                        }`}
                      >
                        {trail.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="chip bg-basalt-100 text-basalt-700 dark:bg-basalt-800 dark:text-basalt-300 ring-basalt-200">
                        {REGION_LABELS[trail.region]}
                      </span>
                      <span className="chip bg-basalt-100 text-basalt-700 dark:bg-basalt-800 dark:text-basalt-300 ring-basalt-200">
                        {DIFFICULTY_LABELS[trail.difficulty]}
                      </span>
                    </div>

                    <p className="mt-1.5 line-clamp-2 text-sm text-basalt-600 dark:text-basalt-300">{trail.summary}</p>

                    <p className="mt-2 text-xs text-basalt-600 dark:text-basalt-300">
                      {formatDistance(trail.distanceKm)} · {formatDuration(trail.durationMinutes)} ·{' '}
                      {trail.elevationGainM} m ascent · {trail._count.waypoints} waypoints ·{' '}
                      {trail._count.reviews} reviews · {trail._count.favorites} saved ·{' '}
                      {trail._count.tours} tours · {trail.viewCount} views
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(trail)}
                      className="btn-secondary text-xs"
                    >
                      Edit
                    </button>
                    <Link href={`/trails/${trail.slug}`} className="btn-ghost text-xs">
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => void togglePublished(trail)}
                      className="btn-ghost text-xs"
                    >
                      {trail.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(trail)}
                      className="text-xs font-semibold text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-basalt-600 dark:text-basalt-300">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="btn-secondary text-xs"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// -------------------------------------------------------------------- form

function TrailForm({
  trail,
  onDone,
  onCancel,
}: {
  trail?: TrailRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: trail?.name ?? '',
    summary: trail?.summary ?? '',
    description: trail?.description ?? '',
    region: (trail?.region ?? 'SOUTH_WEST') as Region,
    nearestTown: trail?.nearestTown ?? '',
    difficulty: (trail?.difficulty ?? 'MODERATE') as Difficulty,
    distanceKm: String(trail?.distanceKm ?? ''),
    elevationGainM: String(trail?.elevationGainM ?? ''),
    durationMinutes: String(trail?.durationMinutes ?? ''),
    summitM: String(trail?.summitM ?? ''),
    startLat: String(trail?.startLat ?? ''),
    startLng: String(trail?.startLng ?? ''),
    waterSources: trail?.waterSources ?? '',
    permitInfo: trail?.permitInfo ?? '',
    gettingThere: trail?.gettingThere ?? '',
    coverImage: trail?.coverImage ?? '',
    permitRequired: trail?.permitRequired ?? false,
    published: trail?.published ?? true,
  });
  const [hazards, setHazards] = useState((trail?.hazards ?? []).join('\n'));
  const [bestMonths, setBestMonths] = useState<string[]>(trail?.bestMonths ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      ...form,
      distanceKm: Number(form.distanceKm),
      elevationGainM: Number(form.elevationGainM),
      durationMinutes: Number(form.durationMinutes),
      summitM: form.summitM ? Number(form.summitM) : null,
      startLat: Number(form.startLat),
      startLng: Number(form.startLng),
      waterSources: form.waterSources || null,
      permitInfo: form.permitInfo || null,
      gettingThere: form.gettingThere || null,
      coverImage: form.coverImage || null,
      hazards: hazards.split('\n').map((s) => s.trim()).filter(Boolean),
      bestMonths,
    };

    try {
      if (trail) await api.patch(`/admin/trails/${trail.id}`, payload);
      else await api.post('/admin/trails', payload);
      onDone();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.details?.map((d) => `${d.field}: ${d.message}`).join('. ') ?? err.message)
          : 'Could not save the trail'
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleMonth = (month: string) =>
    setBestMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );

  return (
    <form onSubmit={submit} className="card space-y-5 border-forest-300 p-6">
      <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
        {trail ? `Edit: ${trail.name}` : 'New trail'}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" id="t-name">
          <input
            id="t-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            minLength={3}
            className="input"
          />
        </Field>

        <Field label="Nearest town" id="t-town">
          <input
            id="t-town"
            value={form.nearestTown}
            onChange={(e) => set('nearestTown', e.target.value)}
            required
            className="input"
          />
        </Field>
      </div>

      <Field label="Summary (one or two sentences, shown on cards)" id="t-summary">
        <input
          id="t-summary"
          value={form.summary}
          onChange={(e) => set('summary', e.target.value)}
          required
          minLength={10}
          maxLength={300}
          className="input"
        />
      </Field>

      <Field label="Full description (blank line between paragraphs)" id="t-desc">
        <textarea
          id="t-desc"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          required
          minLength={30}
          rows={10}
          className="input resize-y"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Region" id="t-region">
          <select
            id="t-region"
            value={form.region}
            onChange={(e) => set('region', e.target.value as Region)}
            className="input"
          >
            {ALL_REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Difficulty" id="t-diff">
          <select
            id="t-diff"
            value={form.difficulty}
            onChange={(e) => set('difficulty', e.target.value as Difficulty)}
            className="input"
          >
            {ALL_DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Distance (km, round trip)" id="t-dist">
          <input
            id="t-dist"
            type="number"
            step="0.1"
            min="0.1"
            value={form.distanceKm}
            onChange={(e) => set('distanceKm', e.target.value)}
            required
            className="input"
          />
        </Field>

        <Field label="Ascent (m)" id="t-asc">
          <input
            id="t-asc"
            type="number"
            min="0"
            value={form.elevationGainM}
            onChange={(e) => set('elevationGainM', e.target.value)}
            required
            className="input"
          />
        </Field>

        <Field label="Duration (minutes)" id="t-dur">
          <input
            id="t-dur"
            type="number"
            min="15"
            value={form.durationMinutes}
            onChange={(e) => set('durationMinutes', e.target.value)}
            required
            className="input"
          />
        </Field>

        <Field label="Summit elevation (m, optional)" id="t-summit">
          <input
            id="t-summit"
            type="number"
            min="0"
            value={form.summitM}
            onChange={(e) => set('summitM', e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Trailhead latitude" id="t-lat">
          <input
            id="t-lat"
            type="number"
            step="0.0001"
            value={form.startLat}
            onChange={(e) => set('startLat', e.target.value)}
            required
            className="input"
          />
        </Field>

        <Field label="Trailhead longitude" id="t-lng">
          <input
            id="t-lng"
            type="number"
            step="0.0001"
            value={form.startLng}
            onChange={(e) => set('startLng', e.target.value)}
            required
            className="input"
          />
        </Field>
      </div>

      <div>
        <span className="label">Best months to hike</span>
        <div className="flex flex-wrap gap-1.5">
          {MONTHS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleMonth(m)}
              aria-pressed={bestMonths.includes(m)}
              className={`chip ${
                bestMonths.includes(m)
                  ? 'bg-forest-700 text-white ring-forest-700'
                  : 'bg-white text-basalt-700 dark:bg-basalt-900 dark:text-basalt-300 dark:ring-basalt-700 ring-basalt-300 hover:bg-basalt-100 dark:hover:bg-basalt-800'
              }`}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <Field label="Hazards (one per line)" id="t-haz">
        <textarea
          id="t-haz"
          value={hazards}
          onChange={(e) => setHazards(e.target.value)}
          rows={5}
          placeholder={'Altitude sickness above 2,800 m\nLoose scoria on the summit cone'}
          className="input resize-y font-mono text-xs"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Water sources" id="t-water">
          <textarea
            id="t-water"
            value={form.waterSources}
            onChange={(e) => set('waterSources', e.target.value)}
            rows={3}
            className="input resize-y"
          />
        </Field>

        <Field label="Permit information" id="t-permit">
          <textarea
            id="t-permit"
            value={form.permitInfo}
            onChange={(e) => set('permitInfo', e.target.value)}
            rows={3}
            className="input resize-y"
          />
        </Field>
      </div>

      <Field label="Getting there" id="t-there">
        <textarea
          id="t-there"
          value={form.gettingThere}
          onChange={(e) => set('gettingThere', e.target.value)}
          rows={3}
          className="input resize-y"
        />
      </Field>

      <Field label="Cover image URL" id="t-img">
        <input
          id="t-img"
          type="url"
          value={form.coverImage}
          onChange={(e) => set('coverImage', e.target.value)}
          placeholder="https://res.cloudinary.com/…"
          className="input"
        />
      </Field>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-basalt-700 dark:text-basalt-300">
          <input
            type="checkbox"
            checked={form.permitRequired}
            onChange={(e) => set('permitRequired', e.target.checked)}
            className="h-4 w-4 rounded border-basalt-300 text-forest-700 focus:ring-forest-600"
          />
          Permit required
        </label>

        <label className="flex items-center gap-2 text-sm text-basalt-700 dark:text-basalt-300">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set('published', e.target.checked)}
            className="h-4 w-4 rounded border-basalt-300 text-forest-700 focus:ring-forest-600"
          />
          Published
        </label>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy && <Spinner className="h-4 w-4" />}
          {trail ? 'Save trail' : 'Create trail'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>

      {trail && (
        <p className="text-xs text-basalt-600 dark:text-basalt-300">
          Waypoints and route geometry are seeded from{' '}
          <code className="font-mono">prisma/trails.data.js</code> and can be replaced via{' '}
          <code className="font-mono">PUT /api/admin/trails/{trail.id}/waypoints</code>.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
    </div>
  );
}

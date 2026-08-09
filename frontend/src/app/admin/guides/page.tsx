'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { REGION_LABELS, formatDate, formatXAF } from '@/lib/format';
import type { ApprovalStatus, GuideProfile } from '@/lib/types';
import { Alert, Avatar, EmptyState, SectionHeading, Skeleton, Spinner, StatusBadge } from '@/components/ui';

type GuideRow = GuideProfile & {
  user: { id: string; name: string; email: string; phone: string | null; avatarUrl: string | null; createdAt: string };
  _count: { tours: number };
};

const FILTERS: (ApprovalStatus | 'ALL')[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<GuideRow[]>([]);
  const [filter, setFilter] = useState<ApprovalStatus | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ guides: GuideRow[] }>('/admin/guides', {
        query: { status: filter === 'ALL' ? undefined : filter },
      });
      setGuides(data.guides);
    } catch {
      setGuides([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (id: string, status: ApprovalStatus) => {
    setBusyId(id);
    setError(null);
    try {
      await api.patch(`/admin/guides/${id}/status`, {
        status,
        reviewNote: notes[id] || undefined,
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the guide');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Guide applications"
        description="Check the certifications named in each profile before approving. Rejecting a guide also unpublishes all of their tours."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : guides.length === 0 ? (
        <EmptyState
          title={filter === 'PENDING' ? 'Queue is clear' : 'Nothing here'}
          message={
            filter === 'PENDING'
              ? 'No guide applications are waiting for review.'
              : 'No guide profiles match that filter.'
          }
        />
      ) : (
        <ul className="space-y-4">
          {guides.map((guide) => (
            <li key={guide.id} className="card p-6">
              <div className="flex flex-wrap items-start gap-4">
                <Avatar name={guide.user.name} src={guide.user.avatarUrl} size="lg" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                      {guide.user.name}
                    </h3>
                    <StatusBadge status={guide.status} />
                    {guide.plan !== 'NONE' && (
                      <span className="chip bg-amber-100 text-amber-900 ring-amber-200">
                        {guide.plan}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-sm text-basalt-500">
                    {guide.user.email}
                    {guide.user.phone && ` · ${guide.user.phone}`} · joined{' '}
                    {formatDate(guide.user.createdAt)}
                  </p>

                  <p className="mt-3 font-medium text-basalt-800">{guide.headline}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">
                    {guide.bio}
                  </p>

                  <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <Field label="Experience" value={`${guide.yearsExperience} years`} />
                    <Field label="Day rate" value={formatXAF(guide.dayRateXAF)} />
                    <Field label="Languages" value={guide.languages.join(', ')} />
                    <Field label="Tours created" value={String(guide._count.tours)} />
                    <Field
                      label="Regions"
                      value={guide.regions.map((r) => REGION_LABELS[r]).join(', ')}
                    />
                    <Field
                      label="Certifications"
                      value={guide.certifications.join(', ') || 'None declared'}
                    />
                  </dl>

                  {guide.reviewNote && (
                    <p className="mt-3 rounded-lg bg-basalt-50 px-3 py-2 text-xs text-basalt-600 dark:text-basalt-300">
                      Previous note: {guide.reviewNote}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-end gap-3">
                    <div className="min-w-[240px] flex-1">
                      <label htmlFor={`note-${guide.id}`} className="label text-xs">
                        Review note{' '}
                        <span className="font-normal text-basalt-500">
                          (shown to the guide — required if rejecting)
                        </span>
                      </label>
                      <input
                        id={`note-${guide.id}`}
                        value={notes[guide.id] ?? ''}
                        onChange={(e) => setNotes((n) => ({ ...n, [guide.id]: e.target.value }))}
                        maxLength={1000}
                        placeholder="Certification could not be verified with Mount CEO — please attach a reference."
                        className="input py-1.5 text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      {guide.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => void decide(guide.id, 'APPROVED')}
                          disabled={busyId === guide.id}
                          className="btn-primary text-xs"
                        >
                          {busyId === guide.id && <Spinner className="h-3 w-3" />}
                          Approve
                        </button>
                      )}
                      {guide.status !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => void decide(guide.id, 'REJECTED')}
                          disabled={busyId === guide.id}
                          className="btn-danger text-xs"
                        >
                          Reject
                        </button>
                      )}
                      {guide.status === 'APPROVED' && (
                        <Link href={`/guides/${guide.id}`} className="btn-secondary text-xs">
                          View public
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-basalt-500">{label}:</dt>
      <dd className="min-w-0 text-basalt-800">{value}</dd>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { REGION_LABELS, relativeTime } from '@/lib/format';
import type { GroupInquiry, InquiryStatus, Pagination } from '@/lib/types';
import { EmptyState, SectionHeading, Skeleton, Spinner } from '@/components/ui';

const FILTERS: (InquiryStatus | 'ALL')[] = ['ALL', 'NEW', 'CONTACTED', 'CLOSED'];

const STATUS_STYLES: Record<InquiryStatus, string> = {
  NEW: 'bg-amber-100 text-amber-900 ring-amber-200',
  CONTACTED: 'bg-forest-100 text-forest-800 ring-forest-200',
  CLOSED: 'bg-basalt-100 text-basalt-600 ring-basalt-200',
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<GroupInquiry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [status, setStatus] = useState<InquiryStatus | 'ALL'>('NEW');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ inquiries: GroupInquiry[]; pagination: Pagination }>(
        '/admin/group-inquiries',
        { query: { status: status === 'ALL' ? undefined : status, page, limit: 25 } }
      );
      setInquiries(data.inquiries);
      setPagination(data.pagination);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const setInquiryStatus = async (id: string, next: InquiryStatus) => {
    setBusyId(id);
    try {
      await api.patch(`/admin/group-inquiries/${id}`, { status: next });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Group & corporate inquiries"
        description="Leads from the /corporate form — groups bigger than a normal tour, or a custom itinerary."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setStatus(f);
              setPage(1);
            }}
            className={status === f ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : inquiries.length === 0 ? (
        <EmptyState title="No inquiries" message="Nothing matches that filter yet." />
      ) : (
        <>
          <ul className="space-y-3">
            {inquiries.map((inq) => (
              <li key={inq.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-basalt-900 dark:text-basalt-50">{inq.name}</h3>
                      <span className={`chip ${STATUS_STYLES[inq.status]}`}>{inq.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-basalt-600 dark:text-basalt-300">
                      {inq.email}
                      {inq.phone ? ` · ${inq.phone}` : ''}
                      {inq.organization ? ` · ${inq.organization}` : ''}
                    </p>
                    <p className="mt-1 text-sm text-basalt-600 dark:text-basalt-300">
                      {inq.groupSize} people
                      {inq.preferredRegion ? ` · ${REGION_LABELS[inq.preferredRegion]}` : ''} ·{' '}
                      {relativeTime(inq.createdAt)}
                    </p>
                    <p className="mt-2 rounded-lg bg-basalt-50 px-3 py-2 text-sm text-basalt-700 dark:text-basalt-300">
                      {inq.message}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    {inq.status === 'NEW' && (
                      <button
                        type="button"
                        onClick={() => void setInquiryStatus(inq.id, 'CONTACTED')}
                        disabled={busyId === inq.id}
                        className="btn-primary text-xs"
                      >
                        {busyId === inq.id && <Spinner className="h-3 w-3" />}
                        Mark contacted
                      </button>
                    )}
                    {inq.status !== 'CLOSED' && (
                      <button
                        type="button"
                        onClick={() => void setInquiryStatus(inq.id, 'CLOSED')}
                        disabled={busyId === inq.id}
                        className="btn-secondary text-xs"
                      >
                        Close
                      </button>
                    )}
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
                Page {pagination.page} of {pagination.pages} · {pagination.total} total
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

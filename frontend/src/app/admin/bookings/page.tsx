'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDateRange, formatXAF, relativeTime } from '@/lib/format';
import type { Booking, BookingStatus, Pagination } from '@/lib/types';
import { EmptyState, SectionHeading, Skeleton, StatusBadge } from '@/components/ui';

const FILTERS: (BookingStatus | 'ALL')[] = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [status, setStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ bookings: Booking[]; pagination: Pagination }>(
        '/admin/bookings',
        { query: { status: status === 'ALL' ? undefined : status, page, limit: 25 } }
      );
      setBookings(data.bookings);
      setPagination(data.pagination);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = bookings.reduce(
    (acc, b) => ({
      gross: acc.gross + b.totalXAF,
      deposits: acc.deposits + b.depositXAF,
      commission: acc.commission + b.commissionXAF,
    }),
    { gross: 0, deposits: 0, commission: 0 }
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        title="All bookings"
        description="Every reservation across the platform, with the commission recorded on each one."
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
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings" message="Nothing matches that filter yet." />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-basalt-200 bg-basalt-50 text-left">
                <tr>
                  <Th>Reference</Th>
                  <Th>Tour</Th>
                  <Th>Hiker</Th>
                  <Th>Guide</Th>
                  <Th>Dates</Th>
                  <Th className="text-center">Pax</Th>
                  <Th className="text-right">Total</Th>
                  <Th className="text-right">Deposit</Th>
                  <Th className="text-right">Commission</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-basalt-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-basalt-50">
                    <Td>
                      <code className="font-mono text-xs">{b.reference}</code>
                      <p className="mt-0.5 text-xs text-basalt-600 dark:text-basalt-400">{relativeTime(b.createdAt)}</p>
                    </Td>
                    <Td className="max-w-[220px]">
                      <span className="block truncate font-medium text-basalt-900 dark:text-basalt-50">
                        {b.tour.title}
                      </span>
                    </Td>
                    <Td>
                      <span className="block text-basalt-800 dark:text-basalt-200">{b.user?.name}</span>
                      <span className="block text-xs text-basalt-600 dark:text-basalt-300">{b.user?.email}</span>
                    </Td>
                    <Td className="text-basalt-700 dark:text-basalt-300">{b.tour.guide?.user.name ?? '—'}</Td>
                    <Td className="whitespace-nowrap text-basalt-700 dark:text-basalt-300">
                      {formatDateRange(b.schedule.startDate, b.schedule.endDate)}
                    </Td>
                    <Td className="text-center text-basalt-700 dark:text-basalt-300">{b.participants}</Td>
                    <Td className="whitespace-nowrap text-right font-semibold text-basalt-900 dark:text-basalt-50">
                      {formatXAF(b.totalXAF)}
                    </Td>
                    <Td className="whitespace-nowrap text-right text-basalt-700 dark:text-basalt-300">
                      {formatXAF(b.depositXAF)}
                    </Td>
                    <Td className="whitespace-nowrap text-right font-semibold text-forest-700">
                      {formatXAF(b.commissionXAF)}
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={b.status} />
                        {b.paymentStatus !== 'UNPAID' && (
                          <span
                            className={
                              b.paymentStatus === 'REFUND_PENDING'
                                ? 'text-xs font-semibold text-terracotta-700 dark:text-terracotta-400'
                                : 'text-xs text-basalt-600 dark:text-basalt-300'
                            }
                          >
                            {b.paymentStatus.toLowerCase().replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-basalt-200 bg-basalt-50 font-semibold">
                <tr>
                  <Td colSpan={6} className="text-basalt-600 dark:text-basalt-300">
                    Page total ({bookings.length} bookings)
                  </Td>
                  <Td className="whitespace-nowrap text-right text-basalt-900 dark:text-basalt-50">
                    {formatXAF(totals.gross)}
                  </Td>
                  <Td className="whitespace-nowrap text-right text-basalt-700 dark:text-basalt-300">
                    {formatXAF(totals.deposits)}
                  </Td>
                  <Td className="whitespace-nowrap text-right text-forest-700">
                    {formatXAF(totals.commission)}
                  </Td>
                  <Td />
                </tr>
              </tfoot>
            </table>
          </div>

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

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-300 ${className}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={`px-4 py-3 align-top ${className}`}>
      {children}
    </td>
  );
}

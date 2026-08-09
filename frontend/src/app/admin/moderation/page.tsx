'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { formatXAF, relativeTime } from '@/lib/format';
import type { ApprovalStatus, GalleryPhoto, Pagination, Review } from '@/lib/types';
import { Alert, EmptyState, SectionHeading, Skeleton, Stars, StatusBadge } from '@/components/ui';

export default function ModerationPage() {
  const [tab, setTab] = useState<'photos' | 'reviews'>('photos');

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Moderation"
        description="Uploads stay hidden until approved. Reviews publish immediately and are checked here after the fact."
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('photos')}
          className={tab === 'photos' ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
        >
          Photos
        </button>
        <button
          type="button"
          onClick={() => setTab('reviews')}
          className={tab === 'reviews' ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
        >
          Reviews
        </button>
      </div>

      {tab === 'photos' ? <PhotoQueue /> : <ReviewQueue />}
    </div>
  );
}

// ------------------------------------------------------------------ photos

type PhotoRow = GalleryPhoto & {
  user: { id: string; name: string; avatarUrl: string | null; email?: string };
};

function PhotoQueue() {
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [status, setStatus] = useState<ApprovalStatus>('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ photos: PhotoRow[] }>('/admin/photos', { query: { status } });
      setPhotos(data.photos);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (id: string, next: ApprovalStatus) => {
    setError(null);
    // Optimistic removal — the row leaves the current filter either way.
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.patch(`/admin/photos/${id}/status`, { status: next });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the photo');
      await load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['PENDING', 'APPROVED', 'REJECTED'] as ApprovalStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={status === s ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : photos.length === 0 ? (
        <EmptyState
          title={status === 'PENDING' ? 'Queue is clear' : 'Nothing here'}
          message="No photos match that status."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption ?? ''}
                className="h-56 w-full bg-basalt-100 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <p className="text-sm font-semibold text-basalt-900">{photo.user.name}</p>
                {photo.user.email && <p className="text-xs text-basalt-500">{photo.user.email}</p>}

                {photo.caption && (
                  <p className="mt-2 text-sm leading-relaxed text-basalt-700">{photo.caption}</p>
                )}

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {photo.trail && (
                    <span className="chip bg-forest-50 text-forest-800 ring-forest-200">
                      {photo.trail.name}
                    </span>
                  )}
                  {photo.forSale && photo.priceXAF && (
                    <span className="chip bg-amber-100 text-amber-900 ring-amber-200">
                      For sale · {formatXAF(photo.priceXAF)}
                    </span>
                  )}
                </div>

                {photo.createdAt && (
                  <p className="mt-2 text-xs text-basalt-400">{relativeTime(photo.createdAt)}</p>
                )}

                <div className="mt-4 flex gap-2">
                  {status !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => void decide(photo.id, 'APPROVED')}
                      className="btn-primary flex-1 text-xs"
                    >
                      Approve
                    </button>
                  )}
                  {status !== 'REJECTED' && (
                    <button
                      type="button"
                      onClick={() => void decide(photo.id, 'REJECTED')}
                      className="btn-danger flex-1 text-xs"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- reviews

type ReviewRow = Review & {
  user: { id: string; name: string; email: string; avatarUrl: string | null };
  trail: { id: string; name: string; slug: string };
};

function ReviewQueue() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ reviews: ReviewRow[]; pagination: Pagination }>(
        '/admin/reviews',
        { query: { page, limit: 20 } }
      );
      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (id: string, status: ApprovalStatus) => {
    await api.patch(`/admin/reviews/${id}/status`, { status });
    await load();
  };

  if (loading) return <Skeleton className="h-64 w-full" />;

  if (reviews.length === 0) {
    return <EmptyState title="No reviews yet" message="Reviews appear here as hikers write them." />;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {reviews.map((review) => (
          <li key={review.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars rating={review.rating} />
                  <StatusBadge status={review.status} />
                  <Link
                    href={`/trails/${review.trail.slug}`}
                    className="text-xs font-semibold text-forest-700 hover:underline"
                  >
                    {review.trail.name}
                  </Link>
                </div>

                <p className="mt-2 font-semibold text-basalt-900">{review.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-basalt-700">{review.body}</p>
                <p className="mt-2 text-xs text-basalt-500">
                  {review.user.name} ({review.user.email}) · {relativeTime(review.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                {review.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => void decide(review.id, 'APPROVED')}
                    className="btn-primary text-xs"
                  >
                    Approve
                  </button>
                )}
                {review.status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => void decide(review.id, 'REJECTED')}
                    className="btn-danger text-xs"
                  >
                    Hide
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
          <span className="px-3 py-2 text-sm text-basalt-600">
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
    </div>
  );
}

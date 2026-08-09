'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate, relativeTime } from '@/lib/format';
import type { Review } from '@/lib/types';
import { EmptyState, SectionHeading, Skeleton, Stars, StatusBadge } from '@/components/ui';

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ reviews: Review[] }>('/reviews/mine')
      .then((d) => setReviews(d.reviews))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    await api.delete(`/reviews/${id}`);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <SectionHeading
        title="My reviews"
        description="What you wrote about conditions, timings and guides — the single most useful thing for the next person."
      />

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="You have not reviewed a trail yet"
          message="Hiked one of these? Your notes on actual timings and conditions are worth more than any brochure."
          action={{ href: '/trails', label: 'Browse trails' }}
        />
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  {review.trail && (
                    <Link
                      href={`/trails/${review.trail.slug}`}
                      className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50 hover:text-forest-800"
                    >
                      {review.trail.name}
                    </Link>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <Stars rating={review.rating} />
                    <span className="text-xs text-basalt-500">
                      {relativeTime(review.createdAt)}
                      {review.hikedOn && ` · hiked ${formatDate(review.hikedOn)}`}
                    </span>
                    {review.status !== 'APPROVED' && <StatusBadge status={review.status} />}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void remove(review.id)}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>

              <h3 className="mt-3 font-semibold text-basalt-900 dark:text-basalt-50">{review.title}</h3>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-basalt-700 dark:text-basalt-300">
                {review.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, relativeTime } from '@/lib/format';
import type { Review } from '@/lib/types';
import { Alert, Avatar, Spinner, Stars } from '@/components/ui';

export function ReviewSection({
  trailId,
  trailSlug,
  initialReviews,
  totalReviews,
  ratingAvg,
  breakdown,
}: {
  trailId: string;
  trailSlug: string;
  initialReviews: Review[];
  totalReviews: number;
  ratingAvg: number;
  breakdown: { rating: number; count: number }[];
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [open, setOpen] = useState(false);

  const myReview = user ? reviews.find((r) => r.user.id === user.id) : undefined;

  const onSaved = (review: Review) => {
    setReviews((prev) => [review, ...prev.filter((r) => r.user.id !== review.user.id)]);
    setOpen(false);
  };

  const onDelete = async (id: string) => {
    await api.delete(`/reviews/${id}`);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const maxCount = Math.max(1, ...breakdown.map((b) => b.count));

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-basalt-900">
          Reviews from people who hiked it
        </h2>
        {user ? (
          <button type="button" onClick={() => setOpen((v) => !v)} className="btn-primary">
            {myReview ? 'Edit your review' : 'Write a review'}
          </button>
        ) : (
          <Link href={`/login?next=/trails/${trailSlug}`} className="btn-secondary">
            Sign in to review
          </Link>
        )}
      </div>

      {totalReviews > 0 && (
        <div className="card mb-6 grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
          <div className="text-center sm:border-r sm:border-basalt-100 sm:pr-6">
            <p className="font-display text-4xl font-semibold text-basalt-900">
              {ratingAvg.toFixed(1)}
            </p>
            <Stars rating={ratingAvg} />
            <p className="mt-1 text-xs text-basalt-500">
              {totalReviews} review{totalReviews === 1 ? '' : 's'}
            </p>
          </div>
          <ul className="space-y-1.5 self-center">
            {breakdown.map((b) => (
              <li key={b.rating} className="flex items-center gap-3 text-xs">
                <span className="w-8 shrink-0 font-medium text-basalt-600">{b.rating}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-basalt-100">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${(b.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-basalt-500">{b.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && user && (
        <ReviewForm trailId={trailId} existing={myReview} onSaved={onSaved} onCancel={() => setOpen(false)} />
      )}

      {reviews.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-basalt-600">
            No reviews yet. If you have hiked this one, your notes on conditions, timings and the
            guide you used are exactly what the next person needs.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={review.user.name} src={review.user.avatarUrl} />
                  <div>
                    <p className="font-semibold text-basalt-900">{review.user.name}</p>
                    <p className="text-xs text-basalt-500">
                      {relativeTime(review.createdAt)}
                      {review.hikedOn && ` · hiked ${formatDate(review.hikedOn)}`}
                    </p>
                  </div>
                </div>
                <Stars rating={review.rating} />
              </div>

              <h3 className="mt-4 font-display text-base font-semibold text-basalt-900">
                {review.title}
              </h3>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-basalt-700">
                {review.body}
              </p>

              {(user?.id === review.user.id || user?.role === 'ADMIN') && (
                <button
                  type="button"
                  onClick={() => void onDelete(review.id)}
                  className="mt-3 text-xs font-semibold text-red-700 hover:underline"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReviewForm({
  trailId,
  existing,
  onSaved,
  onCancel,
}: {
  trailId: string;
  existing?: Review;
  onSaved: (review: Review) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [hikedOn, setHikedOn] = useState(existing?.hikedOn?.slice(0, 10) ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { review } = await api.post<{ review: Review }>(`/trails/${trailId}/reviews`, {
        rating,
        title,
        body,
        hikedOn: hikedOn || undefined,
      });
      onSaved(review);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.details?.map((d) => d.message).join('. ') ?? err.message)
          : 'Could not save your review'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mb-6 space-y-4 p-6">
      <div>
        <span className="label">Your rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              aria-pressed={rating === n}
              className={`text-2xl transition-transform hover:scale-110 ${
                n <= rating ? 'text-amber-500' : 'text-basalt-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-title" className="label">
          Headline
        </label>
        <input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          maxLength={140}
          placeholder="Two hard days, and the altitude is real"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="review-body" className="label">
          What should the next hiker know?
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={20}
          maxLength={4000}
          rows={5}
          placeholder="Conditions, actual timings, the guide you used, what you wish you had packed…"
          className="input resize-y"
        />
        <p className="mt-1 text-xs text-basalt-500">{body.length}/4000 — minimum 20 characters</p>
      </div>

      <div>
        <label htmlFor="review-date" className="label">
          When did you hike it? <span className="font-normal text-basalt-500">(optional)</span>
        </label>
        <input
          id="review-date"
          type="date"
          value={hikedOn}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setHikedOn(e.target.value)}
          className="input sm:w-56"
        />
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy && <Spinner className="h-4 w-4" />}
          {existing ? 'Update review' : 'Publish review'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

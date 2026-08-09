'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatXAF, relativeTime } from '@/lib/format';
import type { GalleryPhoto, Pagination } from '@/lib/types';
import { Avatar, EmptyState, Skeleton, Spinner } from '@/components/ui';

export function GalleryBrowser() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [commissionPct, setCommissionPct] = useState(20);
  const [forSaleOnly, setForSaleOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{
        photos: GalleryPhoto[];
        pagination: Pagination;
        photoCommissionPct: number;
      }>('/photos', { query: { page, limit: 24, forSale: forSaleOnly || undefined } });

      // Appending rather than replacing keeps the "load more" flow smooth.
      setPhotos((prev) => (page === 1 ? data.photos : [...prev, ...data.photos]));
      setPagination(data.pagination);
      setCommissionPct(data.photoCommissionPct);
    } catch {
      if (page === 1) setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [page, forSaleOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  // Escape closes the lightbox.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const setFilter = (value: boolean) => {
    setForSaleOnly(value);
    setPage(1);
    setPhotos([]);
  };

  return (
    <div className="section py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter(false)}
            className={!forSaleOnly ? 'btn-primary' : 'btn-secondary'}
          >
            All photos
          </button>
          <button
            type="button"
            onClick={() => setFilter(true)}
            className={forSaleOnly ? 'btn-primary' : 'btn-secondary'}
          >
            Available to licence
          </button>
        </div>

        {user ? (
          <Link href="/dashboard/photos" className="btn-accent">
            Upload a photo
          </Link>
        ) : (
          <Link href="/login?next=/gallery" className="btn-secondary">
            Sign in to upload
          </Link>
        )}
      </div>

      {loading && photos.length === 0 ? (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} className={`mb-4 w-full ${i % 3 === 0 ? 'h-64' : 'h-48'}`} />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <EmptyState
          title={forSaleOnly ? 'No photos listed for licence yet' : 'The gallery is empty'}
          message={
            forSaleOnly
              ? 'No photographer has listed an image for sale yet. Check back, or list your own — you keep the majority of every sale.'
              : 'Nobody has uploaded an approved photo yet. Uploads go through moderation before they appear here.'
          }
          action={{ href: user ? '/dashboard/photos' : '/register', label: 'Upload a photo' }}
        />
      ) : (
        <>
          {/* Masonry via CSS columns — photos here are wildly mixed aspect ratios. */}
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightbox(photo)}
                className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl bg-basalt-200 text-left"
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption ?? `Photo by ${photo.user.name}`}
                    loading="lazy"
                    className="w-full transition-transform duration-500 group-hover:scale-105"
                  />
                  {photo.forSale && photo.priceXAF && (
                    <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950">
                      {formatXAF(photo.priceXAF)}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    {photo.trail && (
                      <p className="text-xs font-semibold text-white">{photo.trail.name}</p>
                    )}
                    <p className="text-xs text-white/80">{photo.user.name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {pagination && pagination.page < pagination.pages && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="btn-secondary"
              >
                {loading && <Spinner className="h-4 w-4" />}
                Load more ({pagination.total - photos.length} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* ------------------------------------------------------- lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.caption ?? 'Photo'}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-h-full w-full max-w-5xl overflow-y-auto rounded-xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt={lightbox.caption ?? ''}
              className="max-h-[70vh] w-full bg-basalt-900 object-contain"
            />
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={lightbox.user.name} src={lightbox.user.avatarUrl} />
                  <div>
                    <p className="font-semibold text-basalt-900 dark:text-basalt-50">{lightbox.user.name}</p>
                    {lightbox.createdAt && (
                      <p className="text-xs text-basalt-500">{relativeTime(lightbox.createdAt)}</p>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => setLightbox(null)} className="btn-secondary">
                  Close
                </button>
              </div>

              {lightbox.caption && (
                <p className="mt-4 text-sm leading-relaxed text-basalt-700 dark:text-basalt-300">{lightbox.caption}</p>
              )}

              {lightbox.trail && (
                <Link
                  href={`/trails/${lightbox.trail.slug}`}
                  className="mt-3 inline-block text-sm font-semibold text-forest-700 hover:underline"
                >
                  Taken on {lightbox.trail.name} →
                </Link>
              )}

              {lightbox.forSale && lightbox.priceXAF && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-display text-lg font-semibold text-amber-950">
                    Licence this image — {formatXAF(lightbox.priceXAF)}
                  </p>
                  <p className="mt-1 text-sm text-amber-900">
                    {lightbox.licence ?? 'Standard licence'}. The photographer keeps{' '}
                    {100 - commissionPct}% of every sale; the platform takes {commissionPct}%.
                  </p>
                  <a
                    href={`mailto:licensing@trekcameroon.cm?subject=Licence request: photo ${lightbox.id}`}
                    className="btn-accent mt-3"
                  >
                    Request a licence
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { formatXAF, relativeTime } from '@/lib/format';
import type { GalleryPhoto, TrailCard } from '@/lib/types';
import { Alert, EmptyState, SectionHeading, Skeleton, Spinner, StatusBadge } from '@/components/ui';

export default function MyPhotosPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [trails, setTrails] = useState<TrailCard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get<{ photos: GalleryPhoto[] }>('/photos/mine')
      .then((d) => setPhotos(d.photos))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
    api
      .get<{ trails: TrailCard[] }>('/trails', { query: { limit: 60, sort: 'name' } })
      .then((d) => setTrails(d.trails))
      .catch(() => setTrails([]));
  }, []);

  const remove = async (id: string) => {
    await api.delete(`/photos/${id}`);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-10">
      <UploadForm trails={trails} onUploaded={load} />

      <section>
        <SectionHeading
          title="My photos"
          description="Uploads are reviewed before they appear in the public gallery."
        />

        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : photos.length === 0 ? (
          <EmptyState
            title="No uploads yet"
            message="Photographs of these places are how people decide to go. Upload one from your last hike."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <li key={photo.id} className="card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption ?? ''}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    {photo.status && <StatusBadge status={photo.status} />}
                    {photo.forSale && photo.priceXAF && (
                      <span className="chip bg-amber-100 text-amber-900 ring-amber-200">
                        {formatXAF(photo.priceXAF)}
                      </span>
                    )}
                  </div>

                  {photo.caption && (
                    <p className="mt-2 line-clamp-2 text-sm text-basalt-700">{photo.caption}</p>
                  )}
                  {photo.trail && (
                    <p className="mt-1 text-xs text-basalt-500">{photo.trail.name}</p>
                  )}
                  {photo.createdAt && (
                    <p className="mt-1 text-xs text-basalt-400">{relativeTime(photo.createdAt)}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => void remove(photo.id)}
                    className="mt-3 text-xs font-semibold text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function UploadForm({ trails, onUploaded }: { trails: TrailCard[]; onUploaded: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [trailId, setTrailId] = useState('');
  const [caption, setCaption] = useState('');
  const [forSale, setForSale] = useState(false);
  const [priceXAF, setPriceXAF] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onFileChange = () => {
    const file = fileRef.current?.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Choose an image first');
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(false);

    // Multipart, because the image goes to Cloudinary via the API — the
    // Cloudinary secret never reaches the browser.
    const form = new FormData();
    form.append('image', file);
    if (trailId) form.append('trailId', trailId);
    if (caption) form.append('caption', caption);
    form.append('forSale', String(forSale));
    if (forSale && priceXAF) form.append('priceXAF', priceXAF);

    try {
      await api.post('/photos', form);
      setSuccess(true);
      setPreview(null);
      setCaption('');
      setPriceXAF('');
      setForSale(false);
      if (fileRef.current) fileRef.current.value = '';
      onUploaded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <SectionHeading
        title="Upload a photo"
        description="JPEG, PNG, WebP or AVIF, up to 10 MB. Images are stored on Cloudinary and reviewed before publication."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="photo-file" className="label">
            Image
          </label>
          <input
            id="photo-file"
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={onFileChange}
            required
            className="block w-full text-sm text-basalt-600 file:mr-3 file:rounded-lg file:border-0 file:bg-forest-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-forest-800"
          />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="mt-3 h-40 w-full rounded-lg object-cover" />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="photo-trail" className="label">
              Which trail? <span className="font-normal text-basalt-500">(optional)</span>
            </label>
            <select
              id="photo-trail"
              value={trailId}
              onChange={(e) => setTrailId(e.target.value)}
              className="input"
            >
              <option value="">Not trail-specific</option>
              {trails.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="photo-caption" className="label">
              Caption
            </label>
            <textarea
              id="photo-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Dawn on the crater rim, 06:20, before the cloud came up."
              className="input resize-y"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-basalt-50 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-basalt-800">
          <input
            type="checkbox"
            checked={forSale}
            onChange={(e) => setForSale(e.target.checked)}
            className="h-4 w-4 rounded border-basalt-300 text-forest-700 focus:ring-forest-600"
          />
          List this image for licence
        </label>

        {forSale && (
          <div className="mt-3">
            <label htmlFor="photo-price" className="label">
              Licence price (XAF)
            </label>
            <input
              id="photo-price"
              type="number"
              min={500}
              step={500}
              value={priceXAF}
              onChange={(e) => setPriceXAF(e.target.value)}
              placeholder="25000"
              required={forSale}
              className="input sm:w-48"
            />
            <p className="mt-1.5 text-xs text-basalt-500">
              You keep the majority of every sale; the platform takes a commission. Only list images
              you own, and get permission before selling a photo of an identifiable person.
            </p>
          </div>
        )}
      </div>

      {error && <Alert tone="danger">{error}</Alert>}
      {success && (
        <Alert tone="success">
          Uploaded. It will appear in the public gallery once a moderator approves it.
        </Alert>
      )}

      <button type="submit" disabled={busy} className="btn-primary">
        {busy && <Spinner className="h-4 w-4" />}
        Upload photo
      </button>
    </form>
  );
}

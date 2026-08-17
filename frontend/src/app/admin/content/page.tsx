'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { ALL_REGIONS, REGION_LABELS, formatDate, formatXAF } from '@/lib/format';
import type { HikingEvent, Listing } from '@/lib/types';
import { Alert, EmptyState, SectionHeading, Skeleton, Spinner } from '@/components/ui';

const TABS = ['Safety', 'Partners & gear', 'Events', 'Advertising'] as const;
type Tab = (typeof TABS)[number];

export default function ContentPage() {
  const [tab, setTab] = useState<Tab>('Safety');

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Content management"
        description="Safety guidelines, partner and gear listings, events and ad slots — everything the public site renders that is not a trail."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={tab === t ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Safety' && <SafetyManager />}
      {tab === 'Partners & gear' && <ListingManager />}
      {tab === 'Events' && <EventManager />}
      {tab === 'Advertising' && <AdManager />}
    </div>
  );
}

// ------------------------------------------------------------------ safety

interface SafetyItem {
  id: string;
  category: string;
  title: string;
  body: string;
  order: number;
  published: boolean;
}

function SafetyManager() {
  const [items, setItems] = useState<SafetyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SafetyItem | 'new' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ items: SafetyItem[] }>('/admin/safety');
      setItems(data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: string) => {
    if (!confirm('Delete this guideline?')) return;
    await api.delete(`/admin/safety/${id}`);
    await load();
  };

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setEditing('new')} className="btn-primary">
        New guideline
      </button>

      {editing && (
        <SafetyForm
          item={editing === 'new' ? undefined : editing}
          categories={[...new Set(items.map((i) => i.category))]}
          onDone={() => {
            setEditing(null);
            void load();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {items.length === 0 ? (
        <EmptyState title="No safety guidelines" message="Add the first one, or run the seed." />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="card flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip bg-basalt-100 text-basalt-700 dark:bg-basalt-800 dark:text-basalt-300 ring-basalt-200">
                    {item.category}
                  </span>
                  <span className="text-xs text-basalt-600 dark:text-basalt-400">order {item.order}</span>
                  {!item.published && (
                    <span className="chip bg-basalt-200 text-basalt-700 dark:text-basalt-300 ring-basalt-300">Hidden</span>
                  )}
                </div>
                <h3 className="mt-1.5 font-semibold text-basalt-900 dark:text-basalt-50">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-basalt-600 dark:text-basalt-300">{item.body}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => setEditing(item)} className="btn-secondary text-xs">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void remove(item.id)}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SafetyForm({
  item,
  categories,
  onDone,
  onCancel,
}: {
  item?: SafetyItem;
  categories: string[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState(item?.category ?? categories[0] ?? 'Before you go');
  const [title, setTitle] = useState(item?.title ?? '');
  const [body, setBody] = useState(item?.body ?? '');
  const [order, setOrder] = useState(String(item?.order ?? 0));
  const [published, setPublished] = useState(item?.published ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = { category, title, body, order: Number(order), published };
    try {
      if (item) await api.patch(`/admin/safety/${item.id}`, payload);
      else await api.post('/admin/safety', payload);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 border-forest-300 p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="s-cat" className="label">
            Category
          </label>
          <input
            id="s-cat"
            list="safety-categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="input"
          />
          <datalist id="safety-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="s-order" className="label">
            Order
          </label>
          <input
            id="s-order"
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="s-title" className="label">
          Title
        </label>
        <input
          id="s-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="s-body" className="label">
          Body
        </label>
        <textarea
          id="s-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          rows={6}
          className="input resize-y"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-basalt-700 dark:text-basalt-300">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-basalt-300 text-forest-700 focus:ring-forest-600"
        />
        Published
      </label>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy && <Spinner className="h-4 w-4" />}
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- listings

type ListingRow = Listing & { affiliateUrl: string; commissionPct: number; clickCount: number };

function ListingManager() {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ListingRow | 'new' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ listings: ListingRow[] }>('/admin/listings');
      setListings(data.listings);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    await api.delete(`/admin/listings/${id}`);
    await load();
  };

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setEditing('new')} className="btn-primary">
        New listing
      </button>

      {editing && (
        <ListingForm
          listing={editing === 'new' ? undefined : editing}
          onDone={() => {
            setEditing(null);
            void load();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {listings.length === 0 ? (
        <EmptyState title="No listings" message="Accommodation and gear listings appear here." />
      ) : (
        <ul className="space-y-2">
          {listings.map((l) => (
            <li key={l.id} className="card flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip bg-basalt-100 text-basalt-700 dark:bg-basalt-800 dark:text-basalt-300 ring-basalt-200">
                    {l.kind === 'ACCOMMODATION' ? 'Stay' : 'Gear'}
                  </span>
                  {l.featured && (
                    <span className="chip bg-amber-100 text-amber-900 ring-amber-200">Featured</span>
                  )}
                  {!l.published && (
                    <span className="chip bg-basalt-200 text-basalt-700 dark:text-basalt-300 ring-basalt-300">Hidden</span>
                  )}
                </div>
                <h3 className="mt-1.5 font-semibold text-basalt-900 dark:text-basalt-50">{l.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-basalt-600 dark:text-basalt-300">{l.description}</p>
                <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
                  {l.priceFromXAF ? `From ${formatXAF(l.priceFromXAF)} · ` : ''}
                  {l.commissionPct}% commission · {l.clickCount} click-throughs
                  {l.partnerName && ` · ${l.partnerName}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => setEditing(l)} className="btn-secondary text-xs">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void remove(l.id)}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ListingForm({
  listing,
  onDone,
  onCancel,
}: {
  listing?: ListingRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    kind: listing?.kind ?? 'ACCOMMODATION',
    name: listing?.name ?? '',
    description: listing?.description ?? '',
    imageUrl: listing?.imageUrl ?? '',
    region: listing?.region ?? '',
    town: listing?.town ?? '',
    priceFromXAF: String(listing?.priceFromXAF ?? ''),
    affiliateUrl: listing?.affiliateUrl ?? '',
    partnerName: listing?.partnerName ?? '',
    commissionPct: String(listing?.commissionPct ?? 10),
    featured: listing?.featured ?? false,
    published: listing?.published ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      ...form,
      region: form.region || null,
      town: form.town || null,
      imageUrl: form.imageUrl || null,
      partnerName: form.partnerName || null,
      priceFromXAF: form.priceFromXAF ? Number(form.priceFromXAF) : null,
      commissionPct: Number(form.commissionPct),
    };

    try {
      if (listing) await api.patch(`/admin/listings/${listing.id}`, payload);
      else await api.post('/admin/listings', payload);
      onDone();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.details?.map((d) => `${d.field}: ${d.message}`).join('. ') ?? err.message)
          : 'Could not save'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 border-forest-300 p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="l-kind" className="label">
            Kind
          </label>
          <select
            id="l-kind"
            value={form.kind}
            onChange={(e) => set('kind', e.target.value)}
            className="input"
          >
            <option value="ACCOMMODATION">Accommodation</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="l-name" className="label">
            Name
          </label>
          <input
            id="l-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="l-desc" className="label">
          Description
        </label>
        <textarea
          id="l-desc"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          required
          minLength={10}
          rows={3}
          className="input resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="l-url" className="label">
            Affiliate URL
          </label>
          <input
            id="l-url"
            type="url"
            value={form.affiliateUrl}
            onChange={(e) => set('affiliateUrl', e.target.value)}
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="l-img" className="label">
            Image URL
          </label>
          <input
            id="l-img"
            type="url"
            value={form.imageUrl}
            onChange={(e) => set('imageUrl', e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label htmlFor="l-region" className="label">
            Region
          </label>
          <select
            id="l-region"
            value={form.region}
            onChange={(e) => set('region', e.target.value)}
            className="input"
          >
            <option value="">None</option>
            {ALL_REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="l-town" className="label">
            Town
          </label>
          <input id="l-town" value={form.town} onChange={(e) => set('town', e.target.value)} className="input" />
        </div>

        <div>
          <label htmlFor="l-price" className="label">
            Price from (XAF)
          </label>
          <input
            id="l-price"
            type="number"
            min={0}
            value={form.priceFromXAF}
            onChange={(e) => set('priceFromXAF', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="l-comm" className="label">
            Commission %
          </label>
          <input
            id="l-comm"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={form.commissionPct}
            onChange={(e) => set('commissionPct', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="l-partner" className="label">
            Partner
          </label>
          <input
            id="l-partner"
            value={form.partnerName}
            onChange={(e) => set('partnerName', e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-basalt-700 dark:text-basalt-300">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="h-4 w-4 rounded border-basalt-300 text-forest-700 focus:ring-forest-600"
          />
          Featured
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
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ------------------------------------------------------------------ events

function EventManager() {
  const [events, setEvents] = useState<(HikingEvent & { _count: { tickets: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ events: (HikingEvent & { _count: { tickets: number } })[] }>(
        '/admin/events'
      );
      setEvents(data.events);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setCreating((v) => !v)} className="btn-primary">
        {creating ? 'Cancel' : 'New event'}
      </button>

      {creating && (
        <EventForm
          onDone={() => {
            setCreating(false);
            void load();
          }}
        />
      )}

      {events.length === 0 ? (
        <EmptyState title="No events" message="Create one to start selling tickets." />
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className="card flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-basalt-900 dark:text-basalt-50">{e.title}</h3>
                  {!e.published && (
                    <span className="chip bg-basalt-200 text-basalt-700 dark:text-basalt-300 ring-basalt-300">Hidden</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
                  {formatDate(e.startDate)} · {e.location} · {formatXAF(e.priceXAF)}
                </p>
                <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
                  {e.ticketsSold} of {e.capacity} sold · {e._count.tickets} orders ·{' '}
                  {formatXAF(e.ticketsSold * e.priceXAF)} gross
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  void api
                    .patch(`/admin/events/${e.id}`, { published: !e.published })
                    .then(load)
                }
                className="btn-secondary text-xs"
              >
                {e.published ? 'Unpublish' : 'Publish'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EventForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    region: '',
    startDate: '',
    endDate: '',
    priceXAF: '0',
    capacity: '30',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/admin/events', {
        ...form,
        region: form.region || null,
        endDate: form.endDate || form.startDate,
        priceXAF: Number(form.priceXAF),
        capacity: Number(form.capacity),
      });
      onDone();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.details?.map((d) => `${d.field}: ${d.message}`).join('. ') ?? err.message)
          : 'Could not save'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 border-forest-300 p-6">
      <div>
        <label htmlFor="e-title" className="label">
          Title
        </label>
        <input
          id="e-title"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
          minLength={4}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="e-desc" className="label">
          Description
        </label>
        <textarea
          id="e-desc"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          required
          minLength={20}
          rows={4}
          className="input resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="e-loc" className="label">
            Location
          </label>
          <input
            id="e-loc"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="e-region" className="label">
            Region
          </label>
          <select
            id="e-region"
            value={form.region}
            onChange={(e) => set('region', e.target.value)}
            className="input"
          >
            <option value="">None</option>
            {ALL_REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="e-price" className="label">
            Ticket price (XAF)
          </label>
          <input
            id="e-price"
            type="number"
            min={0}
            step={500}
            value={form.priceXAF}
            onChange={(e) => set('priceXAF', e.target.value)}
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="e-start" className="label">
            Start date
          </label>
          <input
            id="e-start"
            type="date"
            value={form.startDate}
            onChange={(e) => set('startDate', e.target.value)}
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="e-end" className="label">
            End date
          </label>
          <input
            id="e-end"
            type="date"
            value={form.endDate}
            min={form.startDate}
            onChange={(e) => set('endDate', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="e-cap" className="label">
            Capacity
          </label>
          <input
            id="e-cap"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => set('capacity', e.target.value)}
            required
            className="input"
          />
        </div>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <button type="submit" disabled={busy} className="btn-primary">
        {busy && <Spinner className="h-4 w-4" />}
        Create event
      </button>
    </form>
  );
}

// --------------------------------------------------------------- advertising

interface AdRow {
  id: string;
  placement: string;
  advertiser: string;
  imageUrl: string;
  targetUrl: string;
  weight: number;
  impressions: number;
  clicks: number;
  active: boolean;
  endsAt: string | null;
}

function AdManager() {
  const [ads, setAds] = useState<AdRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ ads: AdRow[] }>('/admin/ads');
      setAds(data.ads);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: string) => {
    if (!confirm('Delete this ad slot?')) return;
    await api.delete(`/admin/ads/${id}`);
    await load();
  };

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setCreating((v) => !v)} className="btn-primary">
        {creating ? 'Cancel' : 'New ad slot'}
      </button>

      {creating && (
        <AdForm
          onDone={() => {
            setCreating(false);
            void load();
          }}
        />
      )}

      {ads.length === 0 ? (
        <EmptyState
          title="No ad slots"
          message="Placements used by the site: home-hero, trail-sidebar."
        />
      ) : (
        <ul className="space-y-2">
          {ads.map((ad) => (
            <li key={ad.id} className="card flex flex-wrap items-center gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.imageUrl}
                alt=""
                className="h-12 w-32 rounded object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-basalt-900 dark:text-basalt-50">{ad.advertiser}</p>
                  <span className="chip bg-basalt-100 text-basalt-700 dark:bg-basalt-800 dark:text-basalt-300 ring-basalt-200">
                    {ad.placement}
                  </span>
                  {!ad.active && (
                    <span className="chip bg-basalt-200 text-basalt-700 dark:text-basalt-300 ring-basalt-300">Paused</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
                  weight {ad.weight} · {ad.impressions} impressions · {ad.clicks} clicks ·{' '}
                  {ad.impressions > 0 ? `${((ad.clicks / ad.impressions) * 100).toFixed(2)}% CTR` : 'no data'}
                  {ad.endsAt && ` · ends ${formatDate(ad.endsAt)}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void api.patch(`/admin/ads/${ad.id}`, { active: !ad.active }).then(load)}
                  className="btn-secondary text-xs"
                >
                  {ad.active ? 'Pause' : 'Resume'}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(ad.id)}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    placement: 'home-hero',
    advertiser: '',
    imageUrl: '',
    targetUrl: '',
    weight: '1',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/admin/ads', { ...form, weight: Number(form.weight) });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 border-forest-300 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="a-place" className="label">
            Placement
          </label>
          <select
            id="a-place"
            value={form.placement}
            onChange={(e) => set('placement', e.target.value)}
            className="input"
          >
            <option value="home-hero">home-hero</option>
            <option value="trail-sidebar">trail-sidebar</option>
          </select>
        </div>

        <div>
          <label htmlFor="a-adv" className="label">
            Advertiser
          </label>
          <input
            id="a-adv"
            value={form.advertiser}
            onChange={(e) => set('advertiser', e.target.value)}
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="a-weight" className="label">
            Weight
          </label>
          <input
            id="a-weight"
            type="number"
            min={1}
            max={100}
            value={form.weight}
            onChange={(e) => set('weight', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="a-img" className="label">
            Creative image URL
          </label>
          <input
            id="a-img"
            type="url"
            value={form.imageUrl}
            onChange={(e) => set('imageUrl', e.target.value)}
            required
            className="input"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="a-target" className="label">
            Target URL
          </label>
          <input
            id="a-target"
            type="url"
            value={form.targetUrl}
            onChange={(e) => set('targetUrl', e.target.value)}
            required
            className="input"
          />
        </div>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <button type="submit" disabled={busy} className="btn-primary">
        {busy && <Spinner className="h-4 w-4" />}
        Create ad slot
      </button>
    </form>
  );
}

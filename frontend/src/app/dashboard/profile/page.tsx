'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ALL_REGIONS, REGION_LABELS, formatDate } from '@/lib/format';
import { Alert, Avatar, SectionHeading, Spinner } from '@/components/ui';

export default function ProfilePage() {
  const { user, refresh, isPremium } = useAuth();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [travelerSegment, setTravelerSegment] = useState<'LOCAL' | 'INTERNATIONAL'>('LOCAL');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed the form once the session has loaded.
  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setBio(user.bio ?? '');
    setPhone(user.phone ?? '');
    setRegion(user.region ?? '');
    setTravelerSegment(user.travelerSegment);
  }, [user]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.patch('/auth/me', {
        name,
        bio: bio || undefined,
        phone: phone || undefined,
        region: region || undefined,
        travelerSegment,
      });
      await refresh();
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.details?.map((d) => d.message).join('. ') ?? err.message)
          : 'Could not save'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-10">
      <section>
        <SectionHeading title="Profile" />
        <AvatarUpload name={user.name} avatarUrl={user.avatarUrl} onDone={refresh} />

        <form onSubmit={save} className="card mt-5 space-y-4 p-6">
          <div>
            <label htmlFor="name" className="label">
              Full name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={80}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="bio" className="label">
              About you
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Weekend hiker based in Douala. Working up to Mount Cameroon."
              className="input resize-y"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="label">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+237 6 XX XX XX XX"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="region" className="label">
                Region
              </label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="input"
              >
                <option value="">Prefer not to say</option>
                {ALL_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {REGION_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="travelerSegment" className="label">
              Hiking as a local, or visiting from abroad?
            </label>
            <select
              id="travelerSegment"
              value={travelerSegment}
              onChange={(e) => setTravelerSegment(e.target.value as 'LOCAL' | 'INTERNATIONAL')}
              className="input"
            >
              <option value="LOCAL">Local / CEMAC resident</option>
              <option value="INTERNATIONAL">Visiting from outside CEMAC</option>
            </select>
            <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
              Only affects Premium pricing.
            </p>
          </div>

          {error && <Alert tone="danger">{error}</Alert>}
          {saved && <Alert tone="success">Profile saved.</Alert>}

          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner className="h-4 w-4" />}
            Save changes
          </button>
        </form>
      </section>

      <section>
        <SectionHeading title="Account" />
        <dl className="card divide-y divide-basalt-100 p-6 text-sm">
          <Row label="Email" value={user.email} />
          <Row label="Role" value={user.role.charAt(0) + user.role.slice(1).toLowerCase()} />
          <Row
            label="Membership"
            value={
              isPremium
                ? `Premium${user.tierExpires ? ` until ${formatDate(user.tierExpires)}` : ''}`
                : 'Free'
            }
          />
          <Row label="Member since" value={formatDate(user.createdAt)} />
        </dl>
      </section>

      <ChangePassword />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-basalt-600 dark:text-basalt-300">{label}</dt>
      <dd className="text-right font-medium text-basalt-900 dark:text-basalt-50">{value}</dd>
    </div>
  );
}

function AvatarUpload({
  name,
  avatarUrl,
  onDone,
}: {
  name: string;
  avatarUrl: string | null;
  onDone: () => Promise<void>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async () => {
    const file = ref.current?.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append('image', file);
    try {
      await api.post('/photos/avatar', form);
      await onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <div className="card flex flex-wrap items-center gap-5 p-6">
      <Avatar name={name} src={avatarUrl} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-basalt-800 dark:text-basalt-200">Profile picture</p>
        <input
          ref={ref}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={() => void upload()}
          disabled={busy}
          className="mt-2 block w-full text-sm text-basalt-600 dark:text-basalt-300 file:mr-3 file:rounded-lg file:border-0 file:bg-basalt-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-basalt-800 dark:text-basalt-200 hover:file:bg-basalt-200"
        />
        {busy && <p className="mt-2 text-xs text-basalt-600 dark:text-basalt-300">Uploading…</p>}
        {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      </div>
    </div>
  );
}

function ChangePassword() {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setCurrent('');
      setNew('');
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.details?.map((d) => d.message).join('. ') ?? err.message)
          : 'Could not change your password'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <SectionHeading title="Change password" />
      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label htmlFor="current" className="label">
            Current password
          </label>
          <input
            id="current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrent(e.target.value)}
            required
            autoComplete="current-password"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="new" className="label">
            New password
          </label>
          <input
            id="new"
            type="password"
            value={newPassword}
            onChange={(e) => setNew(e.target.value)}
            required
            autoComplete="new-password"
            className="input"
          />
          <p className="mt-1 text-xs text-basalt-600 dark:text-basalt-300">
            At least 8 characters, with an uppercase letter, a lowercase letter and a number.
          </p>
        </div>

        {error && <Alert tone="danger">{error}</Alert>}
        {done && <Alert tone="success">Password updated.</Alert>}

        <button type="submit" disabled={busy} className="btn-primary">
          {busy && <Spinner className="h-4 w-4" />}
          Update password
        </button>
      </form>
    </section>
  );
}

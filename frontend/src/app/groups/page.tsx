'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ALL_REGIONS, REGION_LABELS } from '@/lib/format';
import type { HikingGroup, RegionalExpert } from '@/lib/types';
import { Alert, Avatar, EmptyState, SectionHeading, Skeleton, Spinner } from '@/components/ui';

export default function GroupsPage() {
  const { user, isPremium } = useAuth();
  const [groups, setGroups] = useState<HikingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ groups: HikingGroup[] }>('/groups');
      setGroups(data.groups);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, user]);

  const toggleMembership = async (group: HikingGroup) => {
    setBusyId(group.id);
    try {
      if (group.myRole) await api.delete(`/groups/${group.id}/leave`);
      else await api.post(`/groups/${group.id}/join`);
      await load();
    } catch {
      // Errors here are almost always "owner cannot leave" — reload shows truth.
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <header className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-10">
          <h1 className="font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            Hiking groups
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600 dark:text-basalt-300">
            Nobody should do their first big climb alone, and transport is cheaper split four ways.
            Apply to join a group near you — Premium members can start their own.
          </p>
          {!user && (
            <Link href="/login?next=/groups" className="btn-primary mt-5">
              Sign in to apply to a group
            </Link>
          )}
          {user && isPremium && (
            <button type="button" onClick={() => setCreating((v) => !v)} className="btn-primary mt-5">
              {creating ? 'Cancel' : 'Start a group'}
            </button>
          )}
          {user && !isPremium && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg bg-plum-50 px-4 py-3 text-sm text-plum-800 ring-1 ring-inset ring-plum-200">
              <span>
                Starting a group is a <strong>Premium</strong> feature. Free accounts can apply to join
                any group below.
              </span>
              <Link href="/premium" className="font-semibold text-plum-700 hover:underline">
                See Premium →
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="section py-8">
        {creating && user && isPremium && (
          <CreateGroupForm
            onCreated={() => {
              setCreating(false);
              void load();
            }}
          />
        )}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            title="No groups yet"
            message="Be the first — a group is just a name, a region and a description of when you walk."
            action={{ href: user ? '/groups' : '/register', label: 'Create an account' }}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <article key={group.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                      {group.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-basalt-600 dark:text-basalt-300">
                      {group.region ? REGION_LABELS[group.region] : 'All of Cameroon'} ·{' '}
                      {group._count.members} member{group._count.members === 1 ? '' : 's'}
                    </p>
                  </div>
                  {group.isPrivate && (
                    <span className="chip bg-basalt-100 text-basalt-600 dark:text-basalt-300 ring-basalt-200">Private</span>
                  )}
                </div>

                <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">
                  {group.description}
                </p>

                <div className="mt-4 flex items-center gap-2 border-t border-basalt-100 pt-4">
                  <Avatar name={group.owner.name} src={group.owner.avatarUrl} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-xs text-basalt-600 dark:text-basalt-300">
                    Started by {group.owner.name}
                  </span>

                  {user &&
                    (group.myRole === 'OWNER' ? (
                      <span className="chip bg-forest-100 text-forest-800 ring-forest-200">Owner</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void toggleMembership(group)}
                        disabled={busyId === group.id || (group.isPrivate && !group.myRole)}
                        className={group.myRole ? 'btn-secondary text-xs' : 'btn-primary text-xs'}
                      >
                        {busyId === group.id && <Spinner className="h-3 w-3" />}
                        {group.myRole ? 'Leave' : group.isPrivate ? 'Invite only' : 'Apply to join'}
                      </button>
                    ))}
                </div>
              </article>
            ))}
          </div>
        )}

        <RegionalExperts />
      </div>
    </div>
  );
}

/** Top contributor per region, ranked by reviews (3pts) + photos (2pts) + saves (1pt). */
function RegionalExperts() {
  const [experts, setExperts] = useState<RegionalExpert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ experts: RegionalExpert[] }>('/community/regional-experts')
      .then((d) => setExperts(d.experts.filter((e) => e.expert)))
      .catch(() => setExperts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && experts.length === 0) return null;

  return (
    <div className="mt-12 border-t border-basalt-200 pt-8 dark:border-basalt-800">
      <SectionHeading
        title="Regional experts"
        description="The most active hiker in each region right now, by reviews written, photos shared and trails saved."
      />
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map(({ region, expert }) => (
            <li key={region} className="card flex items-center gap-3 p-4">
              <Avatar name={expert!.name} src={expert!.avatarUrl} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-basalt-900 dark:text-basalt-50">{expert!.name}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-700 dark:text-forest-400">
                  {REGION_LABELS[region]} local expert
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CreateGroupForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/groups', {
        name,
        description,
        region: region || null,
        isPrivate,
      });
      onCreated();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.details?.map((d) => d.message).join('. ') ?? err.message)
          : 'Could not create the group'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mb-8 space-y-4 p-6">
      <SectionHeading title="Start a hiking group" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="group-name" className="label">
            Group name
          </label>
          <input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            maxLength={120}
            placeholder="Douala Weekend Hikers"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="group-region" className="label">
            Region <span className="font-normal text-basalt-600 dark:text-basalt-300">(optional)</span>
          </label>
          <select
            id="group-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="input"
          >
            <option value="">All of Cameroon</option>
            {ALL_REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="group-desc" className="label">
          What does this group do?
        </label>
        <textarea
          id="group-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={20}
          maxLength={3000}
          rows={4}
          placeholder="When you walk, where you go, how people join a trip, and what level of fitness to expect."
          className="input resize-y"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-basalt-700 dark:text-basalt-300">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="h-4 w-4 rounded border-basalt-300 text-forest-700 focus:ring-forest-600"
        />
        Invite only — hide from people who are not members
      </label>

      {error && <Alert tone="danger">{error}</Alert>}

      <button type="submit" disabled={busy} className="btn-primary">
        {busy && <Spinner className="h-4 w-4" />}
        Create group
      </button>
    </form>
  );
}

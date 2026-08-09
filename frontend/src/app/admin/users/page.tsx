'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { REGION_LABELS, formatDate } from '@/lib/format';
import type { MembershipTier, Pagination, Region, Role } from '@/lib/types';
import { Alert, Avatar, EmptyState, SectionHeading, Skeleton } from '@/components/ui';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  tier: MembershipTier;
  region: Region | null;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  _count: { bookings: number; reviews: number; photos: number };
}

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<Role | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ users: UserRow[]; pagination: Pagination }>('/admin/users', {
        query: { q: q || undefined, role: role === 'ALL' ? undefined : role, page, limit: 25 },
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [q, role, page]);

  useEffect(() => {
    // Debounce so typing in the search box does not fire a request per keystroke.
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  const update = async (id: string, patch: Partial<Pick<UserRow, 'role' | 'isActive' | 'tier'>>) => {
    setError(null);
    try {
      await api.patch(`/admin/users/${id}`, patch);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the user');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading title="Users" description="Roles, membership tier and account status." />

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search name or email…"
          aria-label="Search users"
          className="input max-w-xs"
        />
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as Role | 'ALL');
            setPage(1);
          }}
          aria-label="Filter by role"
          className="input w-auto"
        >
          <option value="ALL">All roles</option>
          <option value="USER">Users</option>
          <option value="GUIDE">Guides</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" message="Nothing matches that search." />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-basalt-200 bg-basalt-50 text-left">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-basalt-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-basalt-500">
                    Activity
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-basalt-500">
                    Role
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-basalt-500">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-basalt-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-basalt-100">
                {users.map((u) => {
                  const isMe = u.id === me?.id;
                  return (
                    <tr key={u.id} className={u.isActive ? 'hover:bg-basalt-50' : 'bg-red-50/50'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-basalt-900 dark:text-basalt-50">
                              {u.name}
                              {isMe && <span className="ml-1 text-xs text-basalt-400">(you)</span>}
                            </p>
                            <p className="truncate text-xs text-basalt-500">{u.email}</p>
                            <p className="text-xs text-basalt-400">
                              {u.region ? `${REGION_LABELS[u.region]} · ` : ''}
                              joined {formatDate(u.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs text-basalt-600 dark:text-basalt-300">
                        {u._count.bookings} bookings
                        <br />
                        {u._count.reviews} reviews · {u._count.photos} photos
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => void update(u.id, { role: e.target.value as Role })}
                          disabled={isMe}
                          aria-label={`Role for ${u.name}`}
                          className="input w-auto py-1 text-xs"
                        >
                          <option value="USER">User</option>
                          <option value="GUIDE">Guide</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={u.tier}
                          onChange={(e) =>
                            void update(u.id, { tier: e.target.value as MembershipTier })
                          }
                          aria-label={`Tier for ${u.name}`}
                          className="input w-auto py-1 text-xs"
                        >
                          <option value="FREE">Free</option>
                          <option value="PREMIUM">Premium</option>
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void update(u.id, { isActive: !u.isActive })}
                          disabled={isMe}
                          className={`chip ${
                            u.isActive
                              ? 'bg-forest-100 text-forest-800 ring-forest-200'
                              : 'bg-red-100 text-red-900 ring-red-200'
                          } ${isMe ? 'opacity-50' : 'hover:opacity-80'}`}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
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
                Page {pagination.page} of {pagination.pages} · {pagination.total} users
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

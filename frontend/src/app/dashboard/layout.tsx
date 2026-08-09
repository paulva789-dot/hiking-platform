'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Avatar, Spinner } from '@/components/ui';

const TABS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/favorites', label: 'Saved trails' },
  { href: '/dashboard/bookings', label: 'Bookings' },
  { href: '/dashboard/reviews', label: 'My reviews' },
  { href: '/dashboard/photos', label: 'My photos' },
  { href: '/dashboard/profile', label: 'Profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isPremium } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Client-side guard: these pages render nothing useful without a session.
  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${pathname}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="section flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-forest-700" />
      </div>
    );
  }

  return (
    <div className="bg-basalt-50 pb-20">
      <header className="border-b border-basalt-200 bg-white">
        <div className="section py-8">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={user.name} src={user.avatarUrl} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold text-basalt-900">{user.name}</h1>
                {isPremium && (
                  <span className="chip bg-amber-100 text-amber-900 ring-amber-200">Premium</span>
                )}
                {user.role === 'GUIDE' && (
                  <span className="chip bg-forest-100 text-forest-800 ring-forest-200">Guide</span>
                )}
              </div>
              <p className="text-sm text-basalt-500">{user.email}</p>
            </div>

            {!isPremium && (
              <Link href="/premium" className="btn-accent">
                Go Premium
              </Link>
            )}
          </div>

          <nav className="-mb-px mt-6 flex gap-1 overflow-x-auto" aria-label="Dashboard sections">
            {TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-forest-700 text-forest-800'
                      : 'border-transparent text-basalt-600 hover:border-basalt-300 hover:text-basalt-900'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="section py-8">{children}</div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Alert, Spinner } from '@/components/ui';

const TABS = [
  { href: '/admin', label: 'Analytics' },
  { href: '/admin/trails', label: 'Trails' },
  { href: '/admin/guides', label: 'Guide approvals' },
  { href: '/admin/moderation', label: 'Moderation' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/content', label: 'Content' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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

  // The API enforces this too; the client check just avoids a wall of 403s.
  if (user.role !== 'ADMIN') {
    return (
      <div className="section py-20">
        <Alert tone="danger" title="Administrators only">
          This console is restricted. If you believe you should have access, ask an existing
          administrator to change your role.
        </Alert>
        <Link href="/dashboard" className="btn-secondary mt-4">
          Back to my dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <header className="border-b border-basalt-200 bg-basalt-950 text-white">
        <div className="section py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold">Admin console</h1>
              <p className="text-sm text-basalt-600 dark:text-basalt-400">Signed in as {user.email}</p>
            </div>
            <Link
              href="/"
              className="btn bg-white/10 text-white ring-1 ring-inset ring-white/20 hover:bg-white/20"
            >
              View public site
            </Link>
          </div>

          <nav className="-mb-px mt-5 flex gap-1 overflow-x-auto" aria-label="Admin sections">
            {TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-white text-white'
                      : 'border-transparent text-basalt-600 dark:text-basalt-400 hover:border-basalt-600 hover:text-white'
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

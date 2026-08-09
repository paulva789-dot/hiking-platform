'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from './ui';

const NAV = [
  { href: '/trails', label: 'Trails' },
  { href: '/map', label: 'Map' },
  { href: '/guides', label: 'Guides' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/events', label: 'Events' },
  { href: '/groups', label: 'Groups' },
  { href: '/safety', label: 'Safety' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, guideProfile, isPremium, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Route changes should always leave both menus closed.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-basalt-200 bg-white/95 backdrop-blur">
      <div className="section flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-700 text-white" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 20h20L14 6l-3 5-2-3z" />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-basalt-900">
            Trek<span className="text-forest-700">Cameroon</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-forest-50 text-forest-800'
                  : 'text-basalt-600 hover:bg-basalt-100 hover:text-basalt-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-basalt-200" />
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-basalt-100"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                <span className="hidden text-sm font-medium text-basalt-800 sm:block">
                  {user.name.split(' ')[0]}
                </span>
                {isPremium && (
                  <span className="chip bg-amber-100 text-amber-900 ring-amber-200">Premium</span>
                )}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-basalt-200 bg-white py-1 shadow-lg"
                >
                  <div className="border-b border-basalt-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-basalt-900">{user.name}</p>
                    <p className="truncate text-xs text-basalt-500">{user.email}</p>
                  </div>
                  <MenuLink href="/dashboard">My dashboard</MenuLink>
                  <MenuLink href="/dashboard/favorites">Saved trails</MenuLink>
                  <MenuLink href="/dashboard/bookings">My bookings</MenuLink>
                  <MenuLink href="/dashboard/photos">My photos</MenuLink>
                  {(user.role === 'GUIDE' || guideProfile) && (
                    <MenuLink href="/guide">Guide workspace</MenuLink>
                  )}
                  {user.role === 'ADMIN' && <MenuLink href="/admin">Admin console</MenuLink>}
                  {!isPremium && (
                    <MenuLink href="/premium">
                      <span className="text-laterite-700">Go Premium</span>
                    </MenuLink>
                  )}
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="w-full border-t border-basalt-100 px-4 py-2.5 text-left text-sm text-basalt-700 hover:bg-basalt-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-ghost hidden sm:inline-flex">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary">
                Join free
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="btn-ghost px-2 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path
                strokeLinecap="round"
                d={mobileOpen ? 'M6 6l12 12M6 18L18 6' : 'M4 7h16M4 12h16M4 17h16'}
              />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-basalt-200 bg-white px-4 py-3 lg:hidden" aria-label="Mobile">
          <div className="grid grid-cols-2 gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(item.href) ? 'bg-forest-50 text-forest-800' : 'text-basalt-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {!user && (
            <Link href="/login" className="btn-secondary mt-3 w-full">
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} role="menuitem" className="block px-4 py-2.5 text-sm text-basalt-700 hover:bg-basalt-50">
      {children}
    </Link>
  );
}

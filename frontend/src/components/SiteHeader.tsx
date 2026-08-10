'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n/language-context';
import type { TranslationKey } from '@/lib/i18n/translations';
import { Avatar } from './ui';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoMark, LogoText } from './Logo';

const NAV: { href: string; key: TranslationKey }[] = [
  { href: '/trails', key: 'nav.trails' },
  { href: '/map', key: 'nav.map' },
  { href: '/sites', key: 'nav.sites' },
  { href: '/guides', key: 'nav.guides' },
  { href: '/gallery', key: 'nav.gallery' },
  { href: '/events', key: 'nav.events' },
  { href: '/groups', key: 'nav.groups' },
  { href: '/safety', key: 'nav.safety' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, guideProfile, isPremium, logout, loading } = useAuth();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Route changes should always leave both menus closed.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-basalt-200 bg-white/95 backdrop-blur dark:border-basalt-800 dark:bg-basalt-950/95">
      <div className="flag-bar" aria-hidden />
      <div className="section flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-700 text-white" aria-hidden>
            <LogoMark />
          </span>
          <LogoText className="font-display text-lg font-semibold tracking-tight text-basalt-900 dark:text-basalt-50" />
          <span className="flag-star ml-0.5" aria-hidden>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M12 1.5l2.9 6.6 7.1.7-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.7z" />
            </svg>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-forest-50 text-forest-800 dark:bg-forest-900/40 dark:text-forest-300'
                  : 'text-basalt-600 dark:text-basalt-300 hover:bg-basalt-100 hover:text-basalt-900 dark:text-basalt-400 dark:hover:bg-basalt-800 dark:hover:text-basalt-100'
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
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
                <span className="hidden text-sm font-medium text-basalt-800 dark:text-basalt-200 sm:block">
                  {user.name.split(' ')[0]}
                </span>
                {isPremium && (
                  <span className="chip bg-amber-100 text-amber-900 ring-amber-200">Premium</span>
                )}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-basalt-200 bg-white py-1 shadow-lg dark:border-basalt-800 dark:bg-basalt-900"
                >
                  <div className="border-b border-basalt-100 px-4 py-3 dark:border-basalt-800">
                    <p className="truncate text-sm font-semibold text-basalt-900 dark:text-basalt-50">{user.name}</p>
                    <p className="truncate text-xs text-basalt-500">{user.email}</p>
                  </div>
                  <MenuLink href="/dashboard">{t('nav.dashboard')}</MenuLink>
                  <MenuLink href="/dashboard/favorites">{t('nav.savedTrails')}</MenuLink>
                  <MenuLink href="/dashboard/bookings">{t('nav.myBookings')}</MenuLink>
                  <MenuLink href="/dashboard/photos">{t('nav.myPhotos')}</MenuLink>
                  {(user.role === 'GUIDE' || guideProfile) && (
                    <MenuLink href="/guide">{t('nav.guideWorkspace')}</MenuLink>
                  )}
                  {user.role === 'ADMIN' && <MenuLink href="/admin">{t('nav.adminConsole')}</MenuLink>}
                  {!isPremium && (
                    <MenuLink href="/premium">
                      <span className="text-laterite-700 dark:text-laterite-400">{t('nav.goPremium')}</span>
                    </MenuLink>
                  )}
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="w-full border-t border-basalt-100 px-4 py-2.5 text-left text-sm text-basalt-700 dark:text-basalt-300 hover:bg-basalt-50 dark:border-basalt-800 dark:text-basalt-300 dark:hover:bg-basalt-800"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-ghost hidden sm:inline-flex">
                {t('nav.signIn')}
              </Link>
              <Link href="/register" className="btn-primary">
                {t('nav.joinFree')}
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
        <nav
          className="border-t border-basalt-200 bg-white px-4 py-3 dark:border-basalt-800 dark:bg-basalt-950 lg:hidden"
          aria-label="Mobile"
        >
          <div className="grid grid-cols-2 gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(item.href)
                    ? 'bg-forest-50 text-forest-800 dark:bg-forest-900/40 dark:text-forest-300'
                    : 'text-basalt-700 dark:text-basalt-300 dark:text-basalt-300'
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
          {!user && (
            <Link href="/login" className="btn-secondary mt-3 w-full">
              {t('nav.signIn')}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="block px-4 py-2.5 text-sm text-basalt-700 dark:text-basalt-300 hover:bg-basalt-50 dark:text-basalt-300 dark:hover:bg-basalt-800"
    >
      {children}
    </Link>
  );
}

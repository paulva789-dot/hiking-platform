'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/language-context';
import { LogoMark, LogoText } from './Logo';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { href: '/trails', label: 'All trails' },
      { href: '/map', label: 'Interactive map' },
      { href: '/sites', label: 'Cameroon sites & history' },
      { href: '/trails?difficulty=EASY', label: 'Good first hikes' },
      { href: '/gallery', label: 'Photo gallery' },
    ],
  },
  {
    title: 'Plan',
    links: [
      { href: '/safety', label: 'Safety guidelines' },
      { href: '/guides', label: 'Find a guide' },
      { href: '/stay', label: 'Where to stay' },
      { href: '/gear', label: 'Gear checklist' },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: '/groups', label: 'Hiking groups' },
      { href: '/events', label: 'Events' },
      { href: '/register?guide=1', label: 'Become a guide' },
      { href: '/premium', label: 'Premium membership' },
    ],
  },
];

export function SiteFooter() {
  const { t } = useLanguage();
  const columnTitles: Record<string, string> = {
    Explore: t('footer.explore'),
    Plan: t('footer.plan'),
    Community: t('footer.community'),
  };

  return (
    <footer className="mt-20 border-t border-basalt-200 bg-forest-950 text-basalt-300">
      <div className="flag-bar" aria-hidden />
      <div className="section grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-600 text-white" aria-hidden>
              <LogoMark />
            </span>
            <LogoText className="font-display text-lg font-semibold text-white" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">{t('footer.tagline')}</p>
          <p className="mt-4 text-xs text-basalt-600 dark:text-basalt-400">{t('footer.emergency')}</p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {columnTitles[col.title]}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="section flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-basalt-600 dark:text-basalt-400">
          <p>© {new Date().getFullYear()} MongoTrek. {t('footer.rights')}</p>
          <p>{t('footer.mapCredit')}</p>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from 'next';
import { Bricolage_Grotesque, IBM_Plex_Mono, Public_Sans } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { LanguageProvider } from '@/lib/i18n/language-context';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-sans',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-display',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

/** Runs before hydration so the page never flashes the wrong theme. */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('trek-cameroon-theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

/** Same idea for language — sets <html lang> before hydration. */
const LOCALE_INIT_SCRIPT = `
(function () {
  try {
    var supported = ['en', 'fr', 'es', 'pt'];
    var stored = localStorage.getItem('trek-cameroon-locale');
    var locale = stored && supported.indexOf(stored) !== -1 ? stored : (navigator.language || 'en').slice(0, 2).toLowerCase();
    document.documentElement.lang = supported.indexOf(locale) !== -1 ? locale : 'en';
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL('https://trek-cameroon.vercel.app'),
  title: {
    default: 'Trek Cameroon — Hiking trails & sights in Cameroon, guides across Central Africa',
    template: '%s · Trek Cameroon',
  },
  description:
    'Correct, checked information on hiking in Cameroon: trails across all ten regions, real distances and durations, difficulty ratings that mean something, weather, safety guidance, and registered guides bookable across Cameroon and the wider CEMAC region.',
  keywords: [
    'Cameroon hiking',
    'Mount Cameroon',
    'Mount Oku',
    'Manengouba',
    'Ekom-Nkam',
    'Rhumsiki',
    'Dja reserve',
    'hiking guide Cameroon',
    'CEMAC tours',
    'Central Africa travel',
  ],
  openGraph: {
    title: 'Trek Cameroon',
    description: 'Hiking trails and sights across Cameroon, plus registered guides bookable across Central Africa.',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Trek Cameroon — Rhumsiki Peak' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trek Cameroon',
    description: 'Hiking trails and sights across Cameroon, plus registered guides bookable across Central Africa.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${bricolage.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: LOCALE_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col bg-basalt-50 dark:bg-basalt-950" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-forest-700 focus:px-4 focus:py-2 focus:text-white"
              >
                Skip to content
              </a>
              <SiteHeader />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

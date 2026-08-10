import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { LanguageProvider } from '@/lib/i18n/language-context';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

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
  title: {
    default: 'MongoTrek — Hiking trails, guides and sight-seeing across Cameroon & Central Africa',
    template: '%s · MongoTrek',
  },
  description:
    'Correct, checked information on hiking in Cameroon: destinations across all ten regions, real distances and durations, difficulty ratings that mean something, weather, safety guidance, and registered guides bookable across Cameroon and the wider CEMAC region.',
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
    title: 'MongoTrek',
    description: 'Hiking trails, registered guides and sight-seeing across Cameroon and Central Africa.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
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

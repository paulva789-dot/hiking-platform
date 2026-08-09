import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from '@/lib/auth-context';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: {
    default: 'Trek Cameroon — Hiking trails, guides and sight-seeing',
    template: '%s · Trek Cameroon',
  },
  description:
    'Correct, checked information on hiking in Cameroon: 12 destinations across all ten regions, real distances and durations, difficulty ratings that mean something, weather, safety guidance and registered local guides.',
  keywords: [
    'Cameroon hiking',
    'Mount Cameroon',
    'Mount Oku',
    'Manengouba',
    'Ekom-Nkam',
    'Rhumsiki',
    'Dja reserve',
    'hiking guide Cameroon',
  ],
  openGraph: {
    title: 'Trek Cameroon',
    description: 'Hiking trails, registered guides and sight-seeing across all ten regions of Cameroon.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
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
      </body>
    </html>
  );
}

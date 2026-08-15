import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import { CAMEROON_SITES } from '@/lib/cameroon-sites';
import type { TrailCard as TrailCardType } from '@/lib/types';
import { REGION_LABELS } from '@/lib/format';
import { CloudDrift, WaterShimmer } from '@/components/SceneOverlay';
import { TrailCard } from '@/components/TrailCard';
import { SectionHeading } from '@/components/ui';
import { Reveal } from '@/components/Reveal';

const SITE_URL = 'https://trek-cameroon.vercel.app';

type Params = Promise<{ slug: string }>;

function getSite(slug: string) {
  return CAMEROON_SITES.find((s) => s.slug === slug) ?? null;
}

export function generateStaticParams() {
  return CAMEROON_SITES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const site = getSite(slug);
  if (!site) return { title: 'Site not found' };

  return {
    title: site.name,
    description: site.teaser,
    openGraph: {
      title: site.name,
      description: site.teaser,
      images: [site.image],
    },
  };
}

export default async function SiteDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const site = getSite(slug);
  if (!site) notFound();

  const nearbyTrails = await serverFetch<{ trails: TrailCardType[] }>(
    `/trails?region=${site.regionKey}&limit=3`
  ).catch(() => ({ trails: [] }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: site.name,
    description: site.teaser,
    image: site.image,
    url: `${SITE_URL}/sites/${site.slug}`,
    geo: { '@type': 'GeoCoordinates', latitude: site.lat, longitude: site.lng },
    address: { '@type': 'PostalAddress', addressRegion: site.region, addressCountry: 'CM' },
  };

  return (
    <article className="pb-20">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ------------------------------------------------------------ hero */}
      <header className="relative bg-forest-950 text-white">
        <div className="absolute inset-0">
          <Image src={site.image} alt="" fill priority unoptimized className="object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/70 to-forest-950/40" />
          {site.sceneType === 'mountain' && <CloudDrift />}
          {site.sceneType === 'water' && <WaterShimmer />}
        </div>

        <div className="section relative pb-10 pt-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-basalt-300">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/sites" className="hover:text-white">
              Sites &amp; history
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/trails?region=${site.regionKey}`} className="hover:text-white">
              {REGION_LABELS[site.regionKey]}
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-basalt-300">
            <span className="chip bg-white/10 text-white ring-white/20">{site.region}</span>
            <span className="chip bg-white/10 text-white ring-white/20">
              {site.elevationM.toLocaleString()} m elevation
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {site.name}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-basalt-200">{site.teaser}</p>
        </div>
      </header>

      {/* ------------------------------------------------------------ body */}
      <div className="section mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <Reveal>
            <section>
              <SectionHeading title="History" />
              <p className="mt-3 leading-relaxed text-basalt-700 dark:text-basalt-300">{site.history}</p>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <SectionHeading
                eyebrow="Beyond the facts"
                title="Culture & traditions"
                description="A living tradition or belief tied to the place, distinct from its recorded history."
              />
              <p className="mt-3 rounded-lg bg-basalt-50 p-4 leading-relaxed text-basalt-700 ring-1 ring-inset ring-basalt-100 dark:bg-basalt-900 dark:text-basalt-300 dark:ring-basalt-800">
                {site.culture}
              </p>
            </section>
          </Reveal>

          <div className="flex items-center justify-between border-t border-basalt-200 pt-4 text-xs text-basalt-600 dark:border-basalt-800 dark:text-basalt-400">
            <span>Photo: {site.imageCredit}</span>
            <a
              href={site.wikipediaUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-forest-700 hover:underline"
            >
              Read more on Wikipedia →
            </a>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">
              At a glance
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-basalt-600 dark:text-basalt-300">Region</dt>
                <dd className="font-semibold text-basalt-900 dark:text-basalt-50">{site.region}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-basalt-600 dark:text-basalt-300">Elevation</dt>
                <dd className="font-semibold text-basalt-900 dark:text-basalt-50">
                  {site.elevationM.toLocaleString()} m
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-basalt-600 dark:text-basalt-300">Coordinates</dt>
                <dd className="font-semibold text-basalt-900 dark:text-basalt-50">
                  {site.lat.toFixed(3)}, {site.lng.toFixed(3)}
                </dd>
              </div>
            </dl>
            <Link href="/sites" className="btn-secondary mt-4 w-full justify-center">
              All sites on the map
            </Link>
          </div>
        </aside>
      </div>

      {/* ------------------------------------------------------- nearby trails */}
      {nearbyTrails.trails.length > 0 && (
        <div className="section mt-14">
          <SectionHeading
            eyebrow="Nearby"
            title={`Hike in ${REGION_LABELS[site.regionKey]}`}
            description="Trails in the same region as this site, with real distances, ascent and duration."
            action={
              <Link href={`/trails?region=${site.regionKey}`} className="btn-secondary">
                All trails here
              </Link>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {nearbyTrails.trails.map((trail) => (
              <TrailCard key={trail.id} trail={trail} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

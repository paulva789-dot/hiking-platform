import type { Metadata } from 'next';
import Image from 'next/image';
import { CameroonSitesMap } from '@/components/map/LazyMaps';
import { CAMEROON_SITES } from '@/lib/cameroon-sites';
import { CloudDrift, WaterShimmer } from '@/components/SceneOverlay';

export const metadata: Metadata = {
  title: 'Cameroon sites & history',
  description:
    'Volcanic peaks, crater lakes, royal palaces and rainforest reserves across Cameroon — with photos, locations and the history behind each one.',
};

export default function SitesPage() {
  const mapPoints = CAMEROON_SITES.map((s) => ({
    slug: s.slug,
    name: s.name,
    region: s.region,
    lat: s.lat,
    lng: s.lng,
    elevationM: s.elevationM,
    teaser: s.teaser,
  }));

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <div className="flag-bar" aria-hidden />

      <header className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-10">
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cameroon-green">
            <span
              className="h-2 w-3 rounded-[1px] bg-flag-flow-gradient bg-[length:200%_100%] animate-flag-flow"
              aria-hidden
            />
            Beyond the trailhead
          </p>
          <h1 className="font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            Cameroon sites &amp; history
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600 dark:text-basalt-300">
            Cameroon is nicknamed &ldquo;Africa in miniature&rdquo; because almost every landscape on the
            continent shows up somewhere within its borders — volcanic peaks, Sahelian savanna, rainforest,
            and a coastline of black sand. These are {CAMEROON_SITES.length} of its landmark sites, each with
            real coordinates, elevation, a short history and the cultural traditions tied to it, and its place
            on the map below.
          </p>
        </div>
      </header>

      <div className="section pt-8">
        <div className="overflow-hidden rounded-xl border border-basalt-200 shadow-sm">
          <CameroonSitesMap sites={mapPoints} height="480px" />
        </div>
        <p className="mt-2 text-xs text-basalt-500">
          Toggle Streets / Satellite in the top-right of the map, or use &ldquo;Zoom to my location&rdquo; to
          fly the satellite view in on wherever you are right now.
        </p>
      </div>

      <div className="section mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {CAMEROON_SITES.map((site) => (
          <article
            key={site.slug}
            id={site.slug}
            className="card scroll-mt-24 flex flex-col overflow-hidden transition-shadow hover:shadow-md animate-fade-up"
          >
            <div className="relative h-48 w-full shrink-0 overflow-hidden bg-basalt-200">
              <Image
                src={site.image}
                alt={site.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
                unoptimized
              />
              {site.sceneType === 'mountain' && <CloudDrift />}
              {site.sceneType === 'water' && <WaterShimmer />}
              <span className="flag-bar-static absolute inset-x-0 bottom-0" aria-hidden />
            </div>

            <div className="flex items-center justify-between border-b border-basalt-100 bg-basalt-50 px-5 py-2.5">
              <span className="chip bg-white text-basalt-700 dark:bg-basalt-900 dark:text-basalt-300 dark:ring-basalt-700 ring-basalt-200">{site.region}</span>
              <span className="chip bg-forest-50 text-forest-800 ring-forest-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 20h20L14 6l-3 5-2-3z" />
                </svg>
                {site.elevationM.toLocaleString()} m elevation
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h2 className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">{site.name}</h2>

              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-basalt-400">History</p>
              <p className="mt-1 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">{site.history}</p>

              <p className="mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cameroon-green">
                <span className="flag-star" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                    <path d="M12 1.5l2.9 6.6 7.1.7-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.7z" />
                  </svg>
                </span>
                Culture &amp; traditions
              </p>
              <p className="mt-1 flex-1 rounded-lg bg-basalt-50 p-3 text-sm leading-relaxed text-basalt-700 dark:text-basalt-300 ring-1 ring-inset ring-basalt-100">
                {site.culture}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-basalt-100 pt-3 text-xs">
                <span className="text-basalt-400">Photo: {site.imageCredit}</span>
                <a
                  href={site.wikipediaUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-semibold text-forest-700 hover:underline"
                >
                  Read more →
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

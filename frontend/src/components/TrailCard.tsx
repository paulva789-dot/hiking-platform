import Image from 'next/image';
import Link from 'next/link';
import type { TrailCard as TrailCardType } from '@/lib/types';
import {
  REGION_LABELS,
  formatDistance,
  formatDuration,
  trailFallbackImage,
} from '@/lib/format';
import { DifficultyBadge, Stars } from './ui';

export function TrailCard({ trail, priority = false }: { trail: TrailCardType; priority?: boolean }) {
  return (
    <Link
      href={`/trails/${trail.slug}`}
      className="group card overflow-hidden transition-shadow hover:shadow-md focus-visible:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-basalt-200">
        <Image
          src={trail.coverImage ?? trailFallbackImage(trail.difficulty)}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <DifficultyBadge difficulty={trail.difficulty} />
          {trail.permitRequired && (
            <span className="chip bg-white/95 text-basalt-800 ring-white/60">Permit</span>
          )}
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/90">
            {REGION_LABELS[trail.region]}
          </p>
          {trail.summitM && (
            <p className="text-xs font-semibold text-white/90">{trail.summitM.toLocaleString()} m</p>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-base font-semibold leading-snug text-basalt-900 group-hover:text-forest-800">
          {trail.name}
        </h3>
        <p className="mt-1 text-xs text-basalt-500">Nearest town: {trail.nearestTown}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-basalt-600">{trail.summary}</p>

        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-basalt-100 pt-3 text-center">
          <Metric label="Distance" value={formatDistance(trail.distanceKm)} />
          <Metric label="Time" value={formatDuration(trail.durationMinutes)} />
          <Metric label="Ascent" value={`${trail.elevationGainM.toLocaleString()} m`} />
        </dl>

        <div className="mt-3 flex items-center justify-between border-t border-basalt-100 pt-3">
          <Stars rating={trail.ratingAvg} count={trail.ratingCount} />
          <span className="text-xs font-semibold text-forest-700 group-hover:underline">Details →</span>
        </div>
      </div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-basalt-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-basalt-800">{value}</dd>
    </div>
  );
}

export function TrailCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-10 w-full" />
      </div>
    </div>
  );
}

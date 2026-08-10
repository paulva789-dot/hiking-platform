import { apiBaseUrl } from '@/lib/api';
import { REGION_LABELS, formatXAF } from '@/lib/format';
import type { Listing } from '@/lib/types';

/** Shared by the accommodation ("stay") and equipment ("gear") pages. */
export function ListingCard({ listing, ctaLabel }: { listing: Listing; ctaLabel: string }) {
  return (
    <article className="card flex flex-col overflow-hidden">
      {listing.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- partner images come from arbitrary hosts
        <img src={listing.imageUrl} alt="" className="h-40 w-full object-cover" loading="lazy" />
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5">
          {listing.featured && (
            <span className="chip bg-amber-100 text-amber-900 ring-amber-200">Recommended</span>
          )}
          {listing.region && (
            <span className="chip bg-forest-50 text-forest-800 ring-forest-200">
              {REGION_LABELS[listing.region]}
            </span>
          )}
        </div>

        <h2 className="mt-2 font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">{listing.name}</h2>
        {listing.town && <p className="text-xs text-basalt-600 dark:text-basalt-300">{listing.town}</p>}

        <p className="mt-2 flex-1 text-sm leading-relaxed text-basalt-600 dark:text-basalt-300">{listing.description}</p>

        <div className="mt-4 flex items-end justify-between border-t border-basalt-100 pt-4">
          <div>
            {listing.priceFromXAF !== null && listing.priceFromXAF !== undefined && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wide text-basalt-600 dark:text-basalt-400">From</p>
                <p className="font-display text-lg font-semibold text-basalt-900 dark:text-basalt-50">
                  {formatXAF(listing.priceFromXAF)}
                </p>
              </>
            )}
          </div>
          {/* Routed through the API so the affiliate click is attributed. */}
          <a
            href={`${apiBaseUrl}/content/listings/${listing.id}/go`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-accent text-xs"
          >
            {ctaLabel}
          </a>
        </div>

        {listing.partnerName && (
          <p className="mt-2 text-[10px] text-basalt-600 dark:text-basalt-400">Partner listing · {listing.partnerName}</p>
        )}
      </div>
    </article>
  );
}

import type { Metadata } from 'next';
import { serverFetch } from '@/lib/api';
import type { Listing } from '@/lib/types';
import { ListingCard } from '@/components/ListingCard';
import { EmptyState } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Where to stay',
  description:
    "Lodges, guesthouses, campsites and community homestays near Cameroon's hiking trailheads.",
};

export const revalidate = 600;

export default async function StayPage() {
  const { listings } = await serverFetch<{ listings: Listing[] }>(
    '/content/listings?kind=ACCOMMODATION'
  ).catch(() => ({ listings: [] as Listing[] }));

  return (
    <div className="bg-basalt-50 pb-20 dark:bg-basalt-950">
      <header className="border-b border-basalt-200 bg-white dark:border-basalt-800 dark:bg-basalt-900">
        <div className="section py-10">
          <h1 className="font-display text-3xl font-semibold text-basalt-900 dark:text-basalt-50 sm:text-4xl">
            Where to stay
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600 dark:text-basalt-300">
            Guesthouses, lodges, campsites and community homestays close to the trailheads. Booking
            through these links supports the platform at no extra cost to you — and in the case of
            the community homestays, funds the conservation projects that run them.
          </p>
        </div>
      </header>

      <div className="section py-8">
        {listings.length === 0 ? (
          <EmptyState
            title="No accommodation partners listed yet"
            message="Partner listings are managed from the admin console. Seed the database or add them there."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} ctaLabel="Check availability" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

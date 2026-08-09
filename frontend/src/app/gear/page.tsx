import type { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import type { Listing } from '@/lib/types';
import { ListingCard } from '@/components/ListingCard';
import { EmptyState } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Gear and kit checklist',
  description:
    'What to actually carry hiking in Cameroon: boots, water treatment, a bag rated for Hut 2, and the mistakes we see most often.',
};

export const revalidate = 600;

const CHECKLIST = [
  {
    title: 'Every hike, no exceptions',
    items: [
      'Waterproof shell — highland rain arrives without warning',
      'Warm layer, even on a hot morning',
      'Head torch with spare batteries',
      '2 L water minimum, plus treatment tablets or a filter',
      'More food than you plan to eat',
      'First aid kit with blister plasters and rehydration salts',
      'Whistle',
      'Charged phone and a power bank',
      'Cash in small notes',
    ],
  },
  {
    title: 'Add for anything rated Hard or Expert',
    items: [
      'Sleeping bag comfort-rated to 0 °C (Hut 2 gets to ~5 °C with wind)',
      'Boots with aggressive tread — wet rock is what actually injures people',
      'Trekking poles for the descents',
      '4 L water capacity for Mount Cameroon and the Far North',
      'Windproof layer for the Bamboutos ridge',
      'Mosquito net and full rain kit for the Dja',
    ],
  },
  {
    title: 'The mistakes we see most',
    items: [
      'A summer sleeping bag on Mount Cameroon — the most common one by far',
      'Smooth-soled trainers on the Ekom-Nkam rock stairway',
      'Relying on buying water at the trailhead in the dry season',
      'No warm layer because Buea was 28 °C at the start',
      'Starting a Far North walk after 10:00 in the hot season',
    ],
  },
];

export default async function GearPage() {
  const { listings } = await serverFetch<{ listings: Listing[] }>(
    '/content/listings?kind=EQUIPMENT'
  ).catch(() => ({ listings: [] as Listing[] }));

  return (
    <div className="bg-basalt-50 pb-20">
      <header className="border-b border-basalt-200 bg-white">
        <div className="section py-10">
          <h1 className="font-display text-3xl font-semibold text-basalt-900 sm:text-4xl">
            Gear and kit
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600">
            The checklist first, the shop second. Most of what goes wrong on these trails is a kit
            problem — a bag that is not warm enough, or boots with no grip on wet rock.
          </p>
        </div>
      </header>

      <div className="section py-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {CHECKLIST.map((block) => (
            <div key={block.title} className="card p-6">
              <h2 className="font-display text-lg font-semibold text-basalt-900">{block.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-basalt-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-basalt-900">Where to buy it</h2>
          <p className="mt-2 max-w-2xl text-sm text-basalt-600">
            Listings from partner retailers. We earn a commission on purchases made through these
            links, which costs you nothing and is how the trail information stays free.
          </p>

          <div className="mt-6">
            {listings.length === 0 ? (
              <EmptyState
                title="No gear listings yet"
                message="Equipment listings are managed from the admin console. Seed the database or add them there."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} ctaLabel="View" />
                ))}
              </div>
            )}
          </div>
        </section>

        <p className="mt-10 text-center text-sm text-basalt-600">
          Read the{' '}
          <Link href="/safety" className="font-semibold text-forest-700 hover:underline">
            full safety guidelines
          </Link>{' '}
          before you buy anything — they explain why each item is on the list.
        </p>
      </div>
    </div>
  );
}

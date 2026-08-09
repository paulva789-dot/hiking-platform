import type { Metadata } from 'next';
import { GalleryBrowser } from './GalleryBrowser';

export const metadata: Metadata = {
  title: 'Photo gallery',
  description:
    "Photographs of Cameroon's hiking destinations, uploaded by hikers and photographers. Landscape prints and drone footage available to licence.",
};

export default function GalleryPage() {
  return (
    <div className="bg-basalt-50 pb-20">
      <header className="border-b border-basalt-200 bg-white">
        <div className="section py-10">
          <h1 className="font-display text-3xl font-semibold text-basalt-900 sm:text-4xl">
            Gallery
          </h1>
          <p className="mt-2 max-w-2xl text-basalt-600">
            Cameroon&rsquo;s landscapes as hikers actually find them — volcanic summits, crater lakes,
            rainforest and the Kapsiki plain. Photographers can list images for licence; the
            platform takes a commission and the photographer keeps the rest.
          </p>
        </div>
      </header>

      <GalleryBrowser />
    </div>
  );
}

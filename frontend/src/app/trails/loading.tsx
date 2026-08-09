import { TrailCardSkeleton } from '@/components/TrailCard';

export default function TrailsLoading() {
  return (
    <div className="section py-12">
      <div className="skeleton mb-8 h-10 w-64" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <TrailCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

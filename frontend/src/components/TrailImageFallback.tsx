import type { Difficulty } from '@/lib/types';
import { DIFFICULTY_MAP_COLOR } from '@/lib/format';

/**
 * Cover for a trail with no photo yet — rendered locally rather than fetched
 * from a placeholder service. The previous approach (placehold.co) returned
 * an SVG, which next/image blocks from remote hosts by default, so it just
 * rendered as a blank grey box. This can't fail to load.
 */
export function TrailImageFallback({
  difficulty,
  className = '',
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: DIFFICULTY_MAP_COLOR[difficulty] }}
    >
      <div className="absolute inset-0 bg-contours-invert bg-repeat opacity-25" aria-hidden />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="relative h-10 w-10 text-white/70"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 20l6.5-13L13 15l2.5-5L22 20H2z" />
      </svg>
    </div>
  );
}

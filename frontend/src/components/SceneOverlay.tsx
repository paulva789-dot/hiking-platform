/**
 * Purely decorative CSS animation overlays for landmark photos. Drop inside a
 * `relative overflow-hidden` container over an <Image fill />. Both respect
 * prefers-reduced-motion via the `motion-reduce:hidden` utility.
 */

export function CloudDrift() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden>
      <span className="absolute left-0 top-[15%] h-8 w-32 animate-cloud-drift-slow rounded-full bg-white/50 blur-md" />
      <span className="absolute left-0 top-[35%] h-6 w-24 animate-cloud-drift-fast rounded-full bg-white/40 blur-md [animation-delay:-8s]" />
      <span className="absolute left-0 top-[8%] h-5 w-20 animate-cloud-drift-slow rounded-full bg-white/35 blur-sm [animation-delay:-20s]" />
    </div>
  );
}

export function WaterShimmer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden>
      <span className="absolute inset-y-0 -left-1/3 w-1/3 animate-water-glint bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 h-1/3 animate-water-bob bg-gradient-to-t from-sky-400/10 to-transparent" />
    </div>
  );
}

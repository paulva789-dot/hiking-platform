/**
 * MongoTrek brand mark. "Mongo" is the Bakweri/Duala word for "mountain" —
 * the same root behind Mount Cameroon's own name, Mongo ma Ndemi — chosen
 * when the platform grew from a Cameroon trail guide into a Central Africa
 * booking platform, so the mark needed to read as regional, not one-country.
 */
export function LogoMark({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="17.5" cy="6.5" r="2.1" fill="currentColor" opacity="0.85" />
      <path
        d="M1.5 19.5l4.6-8.2c.35-.62 1.24-.63 1.6-.02l2.1 3.55 3.5-6.3c.36-.64 1.28-.64 1.63.01l5.6 10.96H1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LogoText({ className = '' }: { className?: string }) {
  return (
    <span className={className}>
      Mongo<span className="text-forest-700">Trek</span>
    </span>
  );
}

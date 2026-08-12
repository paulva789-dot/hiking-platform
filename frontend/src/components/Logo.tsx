/**
 * Trek Cameroon brand mark, "Mongo" treatment: three overlapping peaks —
 * Bakweri/Duala "mongo" is the root word for "mountain" and half of Mount
 * Cameroon's own name, Mongo ma Ndemi — standing for the whole range this
 * platform covers, not one summit. Plum/forest/yellow instead of a literal
 * flag fill, with the star (still the flag's star) crowning the tallest peak.
 */
export function LogoMark({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M1 20 L9 5.5 L15 20 Z" fill="#743a54" opacity="0.55" />
      <path d="M6 20 L13 9 L19 20 Z" fill="#296549" opacity="0.75" />
      <path d="M10 20 L16 12 L23 20 Z" fill="#FCD116" opacity="0.9" />
      <path
        d="M9 3.2 L9.4 4.44 L10.71 4.44 L9.65 5.21 L10.06 6.46 L9 5.69 L7.94 6.46 L8.35 5.21 L7.29 4.44 L8.6 4.44 Z"
        fill="#FCD116"
        className="animate-star-twinkle"
      />
    </svg>
  );
}

export function LogoText({ className = '' }: { className?: string }) {
  return (
    <span className={className}>
      Trek <span className="text-cameroon-green">Cameroon</span>
    </span>
  );
}

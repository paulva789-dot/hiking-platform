export function LogoMark({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <defs>
        <clipPath id="trek-cameroon-mountain">
          <path d="M1.5 19.5l4.6-8.2c.35-.62 1.24-.63 1.6-.02l2.1 3.55 3.5-6.3c.36-.64 1.28-.64 1.63.01l5.6 10.96H1.5z" />
        </clipPath>
      </defs>
      <g clipPath="url(#trek-cameroon-mountain)">
        <rect x="0" y="0" width="7.5" height="24" fill="#007A5E" />
        <rect x="7.5" y="0" width="7.5" height="24" fill="#CE1126" />
        <rect x="15" y="0" width="9" height="24" fill="#FCD116" />
      </g>
      <path
        d="M15.6 3.6l0.45 1.38h1.45l-1.17.86.45 1.38-1.18-.86-1.18.86.45-1.38-1.17-.86h1.45z"
        fill="#FCD116"
        stroke="#3f2130"
        strokeWidth="0.35"
        strokeLinejoin="round"
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

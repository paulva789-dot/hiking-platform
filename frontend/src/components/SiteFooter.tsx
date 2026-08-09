import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { href: '/trails', label: 'All trails' },
      { href: '/map', label: 'Interactive map' },
      { href: '/trails?difficulty=EASY', label: 'Good first hikes' },
      { href: '/gallery', label: 'Photo gallery' },
    ],
  },
  {
    title: 'Plan',
    links: [
      { href: '/safety', label: 'Safety guidelines' },
      { href: '/guides', label: 'Find a guide' },
      { href: '/stay', label: 'Where to stay' },
      { href: '/gear', label: 'Gear checklist' },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: '/groups', label: 'Hiking groups' },
      { href: '/events', label: 'Events' },
      { href: '/register?guide=1', label: 'Become a guide' },
      { href: '/premium', label: 'Premium membership' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-basalt-200 bg-forest-950 text-basalt-300">
      <div className="section grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-600 text-white" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 20h20L14 6l-3 5-2-3z" />
              </svg>
            </span>
            <span className="font-display text-lg font-semibold text-white">
              Trek<span className="text-forest-400">Cameroon</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Honest, checked information about hiking in Cameroon — real distances, real times, real
            hazards, and the local guides who know the ground. From Mont Fébé before work to four
            days in the Dja.
          </p>
          <p className="mt-4 text-xs text-basalt-400">
            Emergency numbers in Cameroon — Police 117 · Fire 118 · Ambulance 119
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="section flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-basalt-400">
          <p>© {new Date().getFullYear()} Trek Cameroon. Trail data is community-checked, not a guarantee of safety.</p>
          <p>Maps © OpenStreetMap contributors · Weather by OpenWeather</p>
        </div>
      </div>
    </footer>
  );
}

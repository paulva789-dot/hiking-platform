'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { resolveTrailHazards, resolveTrailText, type TranslatableField } from '@/lib/i18n/trail-content';
import type { TrailTranslation } from '@/lib/types';

/** Inline text (summary, waterSources, permitInfo, gettingThere) — swaps to
 * the current locale's translation, falling back to the English value. */
export function TranslatedTrailText({
  english,
  translations,
  field,
}: {
  english: string | null;
  translations: TrailTranslation[];
  field: TranslatableField;
}) {
  const { locale } = useLanguage();
  return <>{resolveTrailText(english, translations, locale, field)}</>;
}

/** Multi-paragraph prose (the trail description), split on blank lines. */
export function TranslatedTrailProse({
  english,
  translations,
}: {
  english: string;
  translations: TrailTranslation[];
}) {
  const { locale } = useLanguage();
  const text = resolveTrailText(english, translations, locale, 'description') ?? english;
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </>
  );
}

export function TranslatedHazards({
  english,
  translations,
}: {
  english: string[];
  translations: TrailTranslation[];
}) {
  const { locale } = useLanguage();
  const hazards = resolveTrailHazards(english, translations, locale);
  return (
    <>
      {hazards.map((hazard) => (
        <li key={hazard} className="flex gap-2 text-sm text-red-900 dark:text-red-200">
          <span aria-hidden className="mt-0.5 shrink-0">
            ⚠
          </span>
          <span>{hazard}</span>
        </li>
      ))}
    </>
  );
}

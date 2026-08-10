'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import type { TranslationKey } from '@/lib/i18n/translations';

/**
 * Word-by-word fade-up reveal for a short, high-impact line — a hero
 * headline or section title. Deliberately not used on long body copy: a
 * paragraph staggering in word by word is slow to read, not "animated."
 */
export function AnimatedText({
  k,
  className = '',
  wordClassName = '',
  startDelay = 0,
  stagger = 0.045,
}: {
  k: TranslationKey;
  className?: string;
  wordClassName?: string;
  startDelay?: number;
  stagger?: number;
}) {
  const { t } = useLanguage();
  const words = t(k).split(' ');

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={`inline-block animate-fade-up motion-reduce:animate-none ${wordClassName}`}
          style={{ animationDelay: `${startDelay + i * stagger}s`, opacity: 0, animationFillMode: 'both' }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

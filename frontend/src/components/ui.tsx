import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ApprovalStatus, BookingStatus, Difficulty } from '@/lib/types';
import { DIFFICULTY_CLASSES, DIFFICULTY_LABELS } from '@/lib/format';

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`chip ${DIFFICULTY_CLASSES[difficulty]}`}>{DIFFICULTY_LABELS[difficulty]}</span>
  );
}

const STATUS_CLASSES: Record<ApprovalStatus | BookingStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-900 ring-amber-200',
  APPROVED: 'bg-forest-100 text-forest-800 ring-forest-200',
  REJECTED: 'bg-red-100 text-red-900 ring-red-200',
  CONFIRMED: 'bg-forest-100 text-forest-800 ring-forest-200',
  CANCELLED: 'bg-basalt-200 text-basalt-700 ring-basalt-300',
  COMPLETED: 'bg-blue-100 text-blue-900 ring-blue-200',
};

export function StatusBadge({ status }: { status: ApprovalStatus | BookingStatus }) {
  return (
    <span className={`chip ${STATUS_CLASSES[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function Stars({ rating, count }: { rating: number; count?: number }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1 text-sm" aria-label={`${rating.toFixed(1)} out of 5`}>
      <span className="flex text-amber-500" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} viewBox="0 0 20 20" className="h-4 w-4">
            <defs>
              <linearGradient id={`star-${i}-${rounded}`}>
                <stop offset={`${Math.max(0, Math.min(1, rounded - i + 1)) * 100}%`} stopColor="currentColor" />
                <stop offset={`${Math.max(0, Math.min(1, rounded - i + 1)) * 100}%`} stopColor="#e2e8f0" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#star-${i}-${rounded})`}
              d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.6 1-5.8L1.5 7.7l5.9-.9z"
            />
          </svg>
        ))}
      </span>
      <span className="font-semibold text-basalt-800">{rating > 0 ? rating.toFixed(1) : '—'}</span>
      {count !== undefined && <span className="text-basalt-500">({count})</span>}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-basalt-500">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-basalt-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-basalt-500">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="rounded-full bg-forest-100 p-3 text-forest-700" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 19l6-9 4 6 2-3 6 6H3z" />
          <circle cx="7" cy="6" r="2" />
        </svg>
      </div>
      <h3 className="font-display text-lg font-semibold text-basalt-900">{title}</h3>
      <p className="max-w-md text-sm text-basalt-600">{message}</p>
      {action && (
        <Link href={action.href} className="btn-primary mt-2">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warn' | 'danger' | 'success';
  title?: string;
  children: ReactNode;
}) {
  const tones = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-forest-200 bg-forest-50 text-forest-900',
  };
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`} role="alert">
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? 'mt-1' : ''}>{children}</div>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-forest-700">{eyebrow}</p>
        )}
        <h2 className="font-display text-2xl font-semibold text-basalt-900 sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-basalt-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  );
}

export function Skeleton({ className = 'h-4 w-full' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="chip bg-basalt-100 text-basalt-700 ring-basalt-200">{children}</span>
  );
}

export function Avatar({
  name,
  src,
  size = 'md',
}: {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg' };
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- avatars come from arbitrary Cloudinary paths
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />;
  }
  return (
    <span
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-forest-700 font-semibold text-white`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ALL_REGIONS, REGION_LABELS } from '@/lib/format';
import { Alert, Spinner } from '@/components/ui';

const RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[a-z]/.test(p), label: 'A lowercase letter' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'An uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'A number' },
];

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [asGuide, setAsGuide] = useState(params.get('guide') === '1');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const allRulesPass = RULES.every((r) => r.test(password));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register({
        name,
        email,
        password,
        phone: phone || undefined,
        region: region || undefined,
        asGuide,
      });
      router.push(asGuide ? '/guide' : '/dashboard');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.details?.map((d) => d.message).join('. ') ?? err.message)
          : 'Registration failed. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="section flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-semibold text-basalt-900 dark:text-basalt-50">
            {asGuide ? 'Apply as a guide' : 'Create your account'}
          </h1>
          <p className="mt-1.5 text-sm text-basalt-600 dark:text-basalt-300">
            {asGuide
              ? 'Register, then fill in your guide profile. We verify every guide before their tours go live — usually within a few days.'
              : 'Free. Save trails, write reviews, upload photos and book guided tours.'}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Full name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="input"
              />
              <ul className="mt-2 grid grid-cols-2 gap-1">
                {RULES.map((rule) => {
                  const pass = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        pass ? 'text-forest-700' : 'text-basalt-600 dark:text-basalt-300'
                      }`}
                    >
                      <span aria-hidden>{pass ? '✓' : '○'}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="label">
                  Phone <span className="font-normal text-basalt-600 dark:text-basalt-300">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237 6 XX XX XX XX"
                  autoComplete="tel"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="region" className="label">
                  Where are you based?
                </label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="input"
                >
                  <option value="">Prefer not to say</option>
                  {ALL_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {REGION_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-start gap-2.5 rounded-lg bg-basalt-50 p-3.5 text-sm text-basalt-700 dark:text-basalt-300">
              <input
                type="checkbox"
                checked={asGuide}
                onChange={(e) => setAsGuide(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-basalt-300 text-forest-700 focus:ring-forest-600"
              />
              <span>
                I am a hiking guide and want to list my services.
                <span className="mt-0.5 block text-xs text-basalt-600 dark:text-basalt-300">
                  You will complete a guide profile next — required skills (first aid, route-finding,
                  local knowledge) and necessities (ID, first-aid kit, mobile money account) are listed
                  there. Tours stay hidden until we verify it.
                </span>
              </span>
            </label>

            {error && <Alert tone="danger">{error}</Alert>}

            <button type="submit" disabled={busy || !allRulesPass} className="btn-primary w-full">
              {busy && <Spinner className="h-4 w-4" />}
              {asGuide ? 'Register and start my guide profile' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-basalt-600 dark:text-basalt-300">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-forest-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="section py-20 text-center text-basalt-600 dark:text-basalt-300">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}

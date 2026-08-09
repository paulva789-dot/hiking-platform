'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Alert, Spinner } from '@/components/ui';

const DEMO_ACCOUNTS = [
  { label: 'Hiker', email: 'hiker@example.cm', password: 'Hike@12345' },
  { label: 'Guide', email: 'guide.buea@example.cm', password: 'Hike@12345' },
  { label: 'Admin', email: 'admin@trekcameroon.cm', password: 'Admin@12345' },
];

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(email, password);
      // Admins almost always want the console; everyone else goes where they were headed.
      router.push(next !== '/dashboard' ? next : user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const useDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="section flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-semibold text-basalt-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-basalt-600">
            Sign in to save trails, book guides and upload photos.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>

            {error && <Alert tone="danger">{error}</Alert>}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy && <Spinner className="h-4 w-4" />}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-basalt-600">
            No account?{' '}
            <Link href="/register" className="font-semibold text-forest-700 hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-basalt-300 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-basalt-500">
            Demo accounts
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => useDemo(account)}
                className="btn-secondary text-xs"
              >
                {account.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-basalt-500">
            Available after running the database seed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="section py-20 text-center text-basalt-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

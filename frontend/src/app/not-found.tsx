import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="section flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl font-semibold text-forest-700">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-basalt-900">
        That path does not go anywhere
      </h1>
      <p className="mt-2 max-w-md text-basalt-600">
        The page you were looking for has moved or never existed. The trails, at least, are still
        where we left them.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/trails" className="btn-primary">
          Browse trails
        </Link>
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { formatTimeFromUnix } from '@/lib/format';
import type { Weather } from '@/lib/types';
import { Skeleton } from './ui';

const ADVICE_STYLES = {
  good: { box: 'border-forest-200 bg-forest-50 text-forest-900', label: 'Good to go' },
  caution: { box: 'border-amber-200 bg-amber-50 text-amber-900', label: 'Take care' },
  danger: { box: 'border-red-200 bg-red-50 text-red-900', label: 'Not advisable' },
} as const;

export function WeatherPanel({ lat, lng, trailName }: { lat: number; lng: number; trailName: string }) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    api
      .get<Weather>('/weather', { query: { lat, lng } })
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // A missing API key is a deployment gap, not a user error — say so plainly.
        setError(err instanceof ApiError ? err.message : 'Could not load the forecast');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="card space-y-3 p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="card p-5">
        <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">Trail weather</h3>
        <p className="mt-2 text-sm text-basalt-600 dark:text-basalt-300">{error ?? 'No forecast available.'}</p>
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Conditions on Cameroon&rsquo;s highland trails change fast. Carry a waterproof shell and a
          warm layer regardless of what any forecast says.
        </p>
      </div>
    );
  }

  const advice = ADVICE_STYLES[weather.advice.level];

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-basalt-100 p-5 pb-4">
        <div>
          <h3 className="font-display text-base font-semibold text-basalt-900 dark:text-basalt-50">Trail weather</h3>
          <p className="mt-0.5 text-xs text-basalt-600 dark:text-basalt-300">
            {weather.location || trailName} · updated{' '}
            {new Date(weather.fetchedAt).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        {weather.current.icon && (
          // eslint-disable-next-line @next/next/no-img-element -- OpenWeather serves fixed-size icons
          <img
            src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
            alt={weather.current.description}
            className="-my-2 h-14 w-14"
          />
        )}
      </div>

      <div className="p-5">
        <div className="flex items-end gap-3">
          <p className="font-display text-4xl font-semibold text-basalt-900 dark:text-basalt-50">
            {weather.current.tempC}°
          </p>
          <div className="pb-1">
            <p className="text-sm font-medium capitalize text-basalt-800 dark:text-basalt-200">
              {weather.current.description}
            </p>
            <p className="text-xs text-basalt-600 dark:text-basalt-300">Feels like {weather.current.feelsLikeC}°C</p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
          <Detail label="Wind" value={`${weather.current.windMs.toFixed(1)} m/s`} />
          <Detail label="Humidity" value={`${weather.current.humidity}%`} />
          <Detail
            label="Visibility"
            value={weather.current.visibilityM ? `${(weather.current.visibilityM / 1000).toFixed(1)} km` : '—'}
          />
          <Detail label="Sunrise" value={formatTimeFromUnix(weather.current.sunrise)} />
        </dl>

        <div className={`mt-4 rounded-lg border px-4 py-3 ${advice.box}`}>
          <p className="text-xs font-bold uppercase tracking-wide">{advice.label}</p>
          <p className="mt-1 text-sm leading-relaxed">{weather.advice.message}</p>
        </div>

        {weather.daily.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-basalt-600 dark:text-basalt-300">
              Next {weather.daily.length} days
            </p>
            <ul className="grid grid-cols-5 gap-1.5">
              {weather.daily.map((day) => (
                <li key={day.date} className="rounded-lg bg-basalt-50 p-2 text-center">
                  <p className="text-[10px] font-semibold uppercase text-basalt-600 dark:text-basalt-300">
                    {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                  </p>
                  {day.icon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                      alt={day.condition}
                      className="mx-auto h-8 w-8"
                    />
                  )}
                  <p className="text-xs font-semibold text-basalt-800 dark:text-basalt-200">{day.maxC}°</p>
                  <p className="text-[10px] text-basalt-600 dark:text-basalt-300">{day.minC}°</p>
                  {day.rainMm > 0 && (
                    <p className="text-[10px] font-medium text-blue-700">{day.rainMm} mm</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold uppercase tracking-wide text-basalt-600 dark:text-basalt-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-basalt-800 dark:text-basalt-200">{value}</dd>
    </div>
  );
}

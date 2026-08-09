import { Router } from 'express';
import { config } from '../config.js';
import { ApiError, asyncHandler } from '../lib/errors.js';
import { validate } from '../middleware/validate.js';
import { weatherQuery } from '../lib/schemas.js';

const router = Router();

// OpenWeather's free tier is rate-limited, and trailhead weather does not
// change minute to minute — so cache each coordinate for 15 minutes.
const TTL_MS = 15 * 60 * 1000;
const cache = new Map();

const cacheKey = (lat, lng) => `${lat.toFixed(3)},${lng.toFixed(3)}`;

const fromCache = (key) => {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.data;
};

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status === 401 ? 500 : 502, 'Weather service unavailable', body.slice(0, 200));
  }
  return res.json();
};

/** Turns a 3-hourly forecast list into one entry per day. */
const summariseDaily = (list) => {
  const days = new Map();

  for (const slot of list) {
    const day = slot.dt_txt.slice(0, 10);
    const entry = days.get(day) ?? {
      date: day,
      minC: Infinity,
      maxC: -Infinity,
      rainMm: 0,
      conditions: new Map(),
    };

    entry.minC = Math.min(entry.minC, slot.main.temp_min);
    entry.maxC = Math.max(entry.maxC, slot.main.temp_max);
    entry.rainMm += slot.rain?.['3h'] ?? 0;

    const label = slot.weather[0]?.main ?? 'Unknown';
    entry.conditions.set(label, (entry.conditions.get(label) ?? 0) + 1);
    entry.icon ??= slot.weather[0]?.icon;
    days.set(day, entry);
  }

  return [...days.values()].slice(0, 5).map((d) => ({
    date: d.date,
    minC: Math.round(d.minC),
    maxC: Math.round(d.maxC),
    rainMm: Number(d.rainMm.toFixed(1)),
    icon: d.icon,
    condition: [...d.conditions.entries()].sort((a, b) => b[1] - a[1])[0][0],
  }));
};

/**
 * Rain plus low visibility is the single biggest cause of trouble on
 * Cameroon's volcanic trails, so the API returns a plain-language verdict
 * rather than making the client interpret raw numbers.
 */
const hikingAdvice = (current) => {
  const wind = current.wind?.speed ?? 0;
  const visibility = current.visibility ?? 10000;
  const main = current.weather[0]?.main ?? '';

  if (['Thunderstorm', 'Tornado'].includes(main)) {
    return { level: 'danger', message: 'Thunderstorms in the area — do not start a summit attempt.' };
  }
  if (main === 'Rain' && wind > 10) {
    return { level: 'danger', message: 'Heavy rain with strong wind. Rock and mud become treacherous.' };
  }
  if (main === 'Rain' || main === 'Drizzle') {
    return { level: 'caution', message: 'Wet trail. Expect mud, slow going and low grip on rock.' };
  }
  if (visibility < 2000 || main === 'Fog' || main === 'Mist') {
    return { level: 'caution', message: 'Poor visibility. Stay with a guide and keep to the marked path.' };
  }
  if ((current.main?.temp ?? 25) > 34) {
    return { level: 'caution', message: 'Very hot. Carry at least 3 L of water and start before dawn.' };
  }
  return { level: 'good', message: 'Good conditions for hiking. Still carry rain gear — highlands change fast.' };
};

/** GET /api/weather?lat=&lng= — current conditions + 5-day outlook. */
router.get(
  '/',
  validate(weatherQuery, 'query'),
  asyncHandler(async (req, res) => {
    const { lat, lng } = req.query;

    if (!config.openWeatherKey) {
      throw new ApiError(503, 'Weather is not configured. Set OPENWEATHER_API_KEY on the server.');
    }

    const key = cacheKey(lat, lng);
    const cached = fromCache(key);
    if (cached) return res.json({ ...cached, cached: true });

    const base = 'https://api.openweathermap.org/data/2.5';
    const params = `lat=${lat}&lon=${lng}&units=metric&appid=${config.openWeatherKey}`;

    const [current, forecast] = await Promise.all([
      fetchJson(`${base}/weather?${params}`),
      fetchJson(`${base}/forecast?${params}`),
    ]);

    const payload = {
      location: current.name,
      current: {
        tempC: Math.round(current.main.temp),
        feelsLikeC: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        windMs: current.wind?.speed ?? 0,
        visibilityM: current.visibility ?? null,
        condition: current.weather[0]?.main,
        description: current.weather[0]?.description,
        icon: current.weather[0]?.icon,
        sunrise: current.sys?.sunrise,
        sunset: current.sys?.sunset,
      },
      advice: hikingAdvice(current),
      daily: summariseDaily(forecast.list ?? []),
      fetchedAt: new Date().toISOString(),
    };

    cache.set(key, { at: Date.now(), data: payload });
    res.json(payload);
  })
);

export default router;

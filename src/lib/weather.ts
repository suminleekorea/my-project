import type { CityWeather } from './types';

// WMO weather interpretation codes → emoji + label
function describe(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: '☀️', label: 'Clear' };
  if (code <= 2) return { emoji: '🌤️', label: 'Partly cloudy' };
  if (code === 3) return { emoji: '☁️', label: 'Overcast' };
  if (code <= 48) return { emoji: '🌫️', label: 'Fog' };
  if (code <= 57) return { emoji: '🌦️', label: 'Drizzle' };
  if (code <= 67) return { emoji: '🌧️', label: 'Rain' };
  if (code <= 77) return { emoji: '❄️', label: 'Snow' };
  if (code <= 82) return { emoji: '🌦️', label: 'Rain showers' };
  if (code <= 86) return { emoji: '🌨️', label: 'Snow showers' };
  return { emoji: '⛈️', label: 'Thunderstorm' };
}

const CITIES = [
  { name: 'Singapore', flag: '🇸🇬', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Seoul', flag: '🇰🇷', lat: 37.5665, lon: 126.978, tz: 'Asia/Seoul' },
];

export async function fetchWeather(): Promise<CityWeather[]> {
  const results = await Promise.allSettled(
    CITIES.map(async (c) => {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}` +
        `&current=temperature_2m,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max` +
        `&timezone=${encodeURIComponent(c.tz)}&forecast_days=1`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`weather ${c.name}: ${res.status}`);
      const data = await res.json();

      const code = data.daily?.weather_code?.[0] ?? data.current?.weather_code ?? 0;
      const { emoji, label } = describe(code);

      return {
        city: c.name,
        flag: c.flag,
        emoji,
        label,
        current: Math.round(data.current?.temperature_2m ?? 0),
        high: Math.round(data.daily?.temperature_2m_max?.[0] ?? 0),
        low: Math.round(data.daily?.temperature_2m_min?.[0] ?? 0),
        rainChance: data.daily?.precipitation_probability_max?.[0] ?? null,
      } satisfies CityWeather;
    }),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<CityWeather> => r.status === 'fulfilled')
    .map((r) => r.value);
}

export function formatWeather(weather: CityWeather[]): string {
  if (!weather.length) return '';
  return weather
    .map(
      (w) =>
        `${w.flag} *${w.city}*: ${w.emoji} ${w.label}, ${w.current}° (H:${w.high}° L:${w.low}°)` +
        `${w.rainChance != null ? ` · 🌂 ${w.rainChance}%` : ''}`,
    )
    .join('\n');
}

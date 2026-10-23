import { cacheLife, cacheTag } from "next/cache";
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun, Wind } from "lucide-react";
import site from "@/content/site.json";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";

type Wx = {
  current: { temperature_2m: number; apparent_temperature: number; weather_code: number; wind_speed_10m: number };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
};

async function getWeather(): Promise<Wx | null> {
  "use cache";
  cacheLife({ stale: 600, revalidate: 900, expire: 7200 });
  cacheTag("weather");
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${site.geo.lat}&longitude=${site.geo.lng}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBudapest&forecast_days=4`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return (await res.json()) as Wx;
  } catch {
    return null;
  }
}

function kind(code: number): keyof Dictionary["weather"]["codes"] {
  if (code === 0) return "clear";
  if (code <= 2) return "partly";
  if (code === 3) return "cloudy";
  if (code <= 48) return "fog";
  if (code <= 57) return "drizzle";
  if (code <= 67 || (code >= 80 && code <= 82)) return "rain";
  if (code <= 77 || code === 85 || code === 86) return "snow";
  return "storm";
}
const ICONS = { clear: Sun, partly: CloudSun, cloudy: Cloud, fog: CloudFog, drizzle: CloudDrizzle, rain: CloudRain, snow: CloudSnow, storm: CloudLightning };

/** Live conditions at the lake (Open-Meteo, no API key, cached for 15 minutes). */
export async function Weather({ locale, t }: { locale: Locale; t: Dictionary["weather"] }) {
  const wx = await getWeather();
  if (!wx) return null;
  const k = kind(wx.current.weather_code);
  const Icon = ICONS[k];
  const day = new Intl.DateTimeFormat(locale === "hu" ? "hu-HU" : "en-GB", { weekday: "short", timeZone: "Europe/Budapest" });
  return (
    <section aria-label={t.title} className="rounded-3xl bg-white/12 p-5 text-white ring-1 ring-white/25 backdrop-blur-md">
      <p className="text-xs font-extrabold uppercase tracking-widest text-white/75">{t.title}</p>
      <div className="mt-2 flex items-center gap-4">
        <Icon className="size-12 text-gold-400" aria-hidden="true" />
        <div>
          <p className="font-display text-4xl leading-none">{Math.round(wx.current.temperature_2m)}°C</p>
          <p className="text-sm text-white/85">
            {t.codes[k]} · {t.feelsLike} {Math.round(wx.current.apparent_temperature)}°
          </p>
        </div>
        <p className="ml-auto flex items-center gap-1 text-sm text-white/80">
          <Wind className="size-4" aria-hidden="true" />
          <span className="sr-only">{t.wind}:</span> {Math.round(wx.current.wind_speed_10m)} km/h
        </p>
      </div>
      <ul className="mt-4 grid grid-cols-3 gap-2 border-t border-white/20 pt-3 text-center text-sm" aria-label={t.forecast}>
        {wx.daily.time.slice(1, 4).map((d, i) => {
          const kk = kind(wx.daily.weather_code[i + 1]);
          const I = ICONS[kk];
          return (
            <li key={d}>
              <span className="block font-bold capitalize">{day.format(new Date(d + "T12:00:00"))}</span>
              <I className="mx-auto my-1 size-5" aria-label={t.codes[kk]} />
              <span>
                {Math.round(wx.daily.temperature_2m_max[i + 1])}° / <span className="text-white/70">{Math.round(wx.daily.temperature_2m_min[i + 1])}°</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

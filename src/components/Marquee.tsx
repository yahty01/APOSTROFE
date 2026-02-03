'use client';

import {useEffect, useMemo, useState} from 'react';

export type MarqueeSettings = {
  enabled: boolean;
  text_ru: string;
  text_en: string;
  speed: number | null;
  direction: string | null;
};

function pickText(settings: MarqueeSettings, locale: string) {
  return locale === 'ru' ? settings.text_ru : settings.text_en;
}

function normalizeDurationSeconds(speed: number | null | undefined) {
  const value = typeof speed === 'number' ? speed : null;
  if (!value || !Number.isFinite(value)) return 20;
  return Math.min(120, Math.max(6, value));
}

export function Marquee({
  initial,
  locale
}: {
  initial: MarqueeSettings;
  locale: string;
}) {
  const [settings, setSettings] = useState<MarqueeSettings>(initial);

  const durationSeconds = useMemo(
    () => normalizeDurationSeconds(settings.speed),
    [settings.speed]
  );

  const direction = settings.direction === 'right' ? 'right' : 'left';
  const text = pickText(settings, locale).trim();
  const style: React.CSSProperties & {
    '--marquee-duration': string;
    '--marquee-direction': string;
  } = {
    '--marquee-duration': `${durationSeconds}s`,
    '--marquee-direction': direction === 'right' ? 'reverse' : 'normal'
  };

  useEffect(() => {
    let isMounted = true;

    async function refetch() {
      try {
        const res = await fetch('/api/marquee', {cache: 'no-store'});
        if (!res.ok) return;
        const json = (await res.json()) as MarqueeSettings;
        if (!isMounted) return;
        setSettings(json);
      } catch {
        // ignore
      }
    }

    refetch();
    const interval = window.setInterval(refetch, 8000);

    function onFocus() {
      void refetch();
    }

    window.addEventListener('focus', onFocus);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  if (!settings.enabled || !text) return null;

  return (
    <div className="border-b border-black/10 bg-black text-white">
      <div className="marquee">
        <div className="marquee__inner" style={style}>
          <span className="marquee__content">{text}</span>
          <span className="marquee__content" aria-hidden>
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}

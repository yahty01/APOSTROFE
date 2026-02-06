'use client';

import {useEffect, useMemo, useState} from 'react';

export type MarqueeSettings = {
  enabled: boolean;
  text_ru: string;
  text_en: string;
  speed: number | null;
  direction: string | null;
};

const FALLBACK_TEXT = 'WE LICENSE IDENTITY';

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
  const rawText = pickText(settings, locale).trim();
  const text = rawText || FALLBACK_TEXT;
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

  if (!settings.enabled) return null;

  return (
    <div className="border-b ui-line bg-black text-white">
      <div className="marquee">
        <div className="marquee__inner" style={style}>
          <span className="marquee__content font-condensed uppercase tracking-[0.24em]">
            {text}
          </span>
          <span
            className="marquee__content font-condensed uppercase tracking-[0.24em]"
            aria-hidden
          >
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}

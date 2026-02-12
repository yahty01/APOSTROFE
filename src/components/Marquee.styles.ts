import type {CSSProperties} from 'react';

/**
 * Все классы, используемые в `Marquee.tsx`.
 * Вынесено отдельно, чтобы компонент не захламлялся Tailwind-строками и было проще править стили.
 */
export const marqueeClasses = {
  wrapper: 'border-y ui-line bg-black text-white',
  marquee: 'marquee',
  inner: 'marquee__inner',
  content: 'marquee__content font-tiny5 uppercase tracking-[0.24em]'
} as const;

type MarqueeVars = CSSProperties & {
  '--marquee-duration': string;
  '--marquee-direction': string;
};

/**
 * Строит CSS variables для анимации marquee.
 * Используется в `Marquee.tsx` для управления скоростью и направлением через inline style без генерации нового CSS.
 */
export function getMarqueeVars(
  durationSeconds: number,
  direction: 'left' | 'right'
): MarqueeVars {
  return {
    '--marquee-duration': `${durationSeconds}s`,
    '--marquee-direction': direction === 'right' ? 'reverse' : 'normal'
  };
}

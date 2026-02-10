'use client';

import {useRouter} from 'next/navigation';
import {useEffect, useRef, useTransition} from 'react';

import {useReportPending} from '@/lib/pending';
import {clearRouteIntent, setRouteIntent} from '@/lib/routeIntent';

function isPlainLeftClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  );
}

function closestAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest('a[href]');
  return anchor instanceof HTMLAnchorElement ? anchor : null;
}

/**
 * Глобальный репортинг pending для client-side навигации по внутренним ссылкам.
 * Нужен, чтобы лоудер появлялся моментально при клике по `next/link` и обычным `<a>`.
 */
export function NavigationPendingReporter() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  useReportPending(isPending);
  const wasPendingRef = useRef(false);

  useEffect(() => {
    if (wasPendingRef.current && !isPending) clearRouteIntent();
    wasPendingRef.current = isPending;
  }, [isPending]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!isPlainLeftClick(event)) return;

      const anchor = closestAnchor(event.target);
      if (!anchor) return;

      const target = (anchor.getAttribute('target') ?? '').trim();
      if (target && target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }

      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith('/api/')) return;
      if (anchor.hasAttribute('data-no-nav-intercept')) return;

      const lastSegment = url.pathname.split('/').pop() ?? '';
      // Не перехватываем "файловые" ссылки (например /terms.pdf), чтобы не ломать загрузки из /public.
      if (lastSegment.includes('.')) return;

      const currentKey = `${window.location.pathname}${window.location.search}`;
      const nextKey = `${url.pathname}${url.search}`;

      // Не перехватываем hash-only навигацию и клики по текущей странице.
      if (nextKey === currentKey) return;

      event.preventDefault();
      setRouteIntent(nextKey);
      startTransition(() => {
        router.push(`${url.pathname}${url.search}${url.hash}`);
      });
    }

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
    };
  }, [router, startTransition]);

  return null;
}

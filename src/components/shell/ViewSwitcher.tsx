'use client';

import {useEffect, useMemo} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';

type ViewMode = 'cards' | 'list';

function asViewMode(value: string | null): ViewMode | null {
  if (value === 'cards' || value === 'list') return value;
  return null;
}

function nextView(current: ViewMode): ViewMode {
  return current === 'cards' ? 'list' : 'cards';
}

export function ViewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = asViewMode(searchParams.get('view')) ?? 'cards';

  const url = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return (nextMode: ViewMode) => {
      sessionStorage.setItem('models_view', nextMode);
      params.set('view', nextMode);
      router.push(`${pathname}?${params.toString()}`);
    };
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (searchParams.get('view')) return;
    const stored = asViewMode(sessionStorage.getItem('models_view'));
    if (!stored) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', stored);
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const segmentBase =
    'flex h-10 items-center justify-center px-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]';

  const segmentActive = 'bg-black text-white hover:bg-black';

  return (
    <div className="inline-flex h-10 items-stretch gap-px border border-[color:var(--color-line)] bg-[var(--color-line)]">
      <button
        type="button"
        onClick={() => url('cards')}
        className={`${segmentBase} bg-[var(--color-paper)] ${view === 'cards' ? segmentActive : ''}`}
      >
        VIEW: CARDS
      </button>
      <button
        type="button"
        onClick={() => url('list')}
        className={`${segmentBase} bg-[var(--color-paper)] ${view === 'list' ? segmentActive : ''}`}
      >
        VIEW: LIST
      </button>
      <button
        type="button"
        onClick={() => url(nextView(view))}
        className={`${segmentBase} bg-[var(--color-paper)]`}
      >
        SWITCH
      </button>
    </div>
  );
}


'use client';

import {useTranslations} from 'next-intl';
import {usePathname, useSearchParams} from 'next/navigation';
import {useEffect, useSyncExternalStore} from 'react';

import {PageHeading} from '@/components/shell/PageHeading';
import {RouteContentSkeleton} from '@/components/shell/RouteContentSkeleton';
import {
  clearRouteIntent,
  getRouteIntentSnapshot,
  subscribeRouteIntent
} from '@/lib/routeIntent';

import {publicMainClasses} from './PublicMain.styles';

function buildKey(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname;
}

function extractPathname(key: string) {
  return key.split('?')[0] ?? key;
}

function isRegistryTopPage(pathname: string) {
  return (
    pathname === '/models' ||
    pathname === '/creators' ||
    pathname === '/generators' ||
    pathname === '/influencers'
  );
}

type Heading = {title: string; subtitle: string};

function useRegistryHeading(pathname: string): Heading | null {
  const tPublic = useTranslations('public');
  const tNav = useTranslations('nav');
  const comingSoon = tPublic('comingSoon');
  const comingSoonSubtitle = tPublic('registry.section', {status: comingSoon});

  function navTitle(key: 'creators' | 'generators' | 'influencers') {
    return `${tNav(key).toUpperCase()}’`;
  }

  if (pathname === '/models') {
    return {
      title: tPublic('catalogTitle'),
      subtitle: tPublic('catalogSubtitle')
    };
  }

  if (pathname === '/creators') {
    return {
      title: navTitle('creators'),
      subtitle: tPublic('registry.creatorsSubtitle')
    };
  }

  if (pathname === '/generators') {
    return {
      title: navTitle('generators'),
      subtitle: comingSoonSubtitle
    };
  }

  if (pathname === '/influencers') {
    return {
      title: navTitle('influencers'),
      subtitle: tPublic('registry.influencersSubtitle')
    };
  }

  return null;
}

/**
 * Public wrapper под `AppShell.main`.
 * Держит стабильную зону "title + description" под универсальной полоской загрузки,
 * и показывает скелет вместо контента во время навигации по реестрам.
 */
export function PublicMain({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const currentKey = buildKey(pathname, search);

  const intentKey = useSyncExternalStore(
    subscribeRouteIntent,
    getRouteIntentSnapshot,
    () => null
  );

  const activeKey = intentKey ?? currentKey;
  const activePathname = extractPathname(activeKey);

  const heading = useRegistryHeading(activePathname);
  const showSkeleton =
    Boolean(intentKey) && intentKey !== currentKey && isRegistryTopPage(activePathname);

  useEffect(() => {
    if (intentKey && intentKey === currentKey) clearRouteIntent();
  }, [intentKey, currentKey]);

  return (
    <div className={publicMainClasses.root}>
      {heading ? (
        <PageHeading title={heading.title} subtitle={heading.subtitle} />
      ) : null}
      {showSkeleton ? <RouteContentSkeleton /> : children}
    </div>
  );
}

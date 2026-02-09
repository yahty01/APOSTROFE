'use client';

import {useSyncExternalStore} from 'react';

import {getSnapshot, subscribe} from '@/lib/pending';

import {LoadingBar} from './RouteLoadingBar';

export function PendingLoadingBarHost() {
  const count = useSyncExternalStore(subscribe, getSnapshot, () => 0);
  if (count <= 0) return null;
  return <LoadingBar />;
}

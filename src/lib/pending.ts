'use client';

import {useEffect, useRef} from 'react';

type Listener = () => void;

let pendingCount = 0;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): number {
  return pendingCount;
}

export function beginPending(): () => void {
  pendingCount += 1;
  emit();

  let ended = false;
  return () => {
    if (ended) return;
    ended = true;

    pendingCount = Math.max(0, pendingCount - 1);

    emit();
  };
}

export function trackPending<T>(promise: Promise<T>): Promise<T> {
  const end = beginPending();
  return promise.finally(end);
}

/**
 * Мостит boolean `pending` (useTransition/useActionState/useFormStatus) в глобальный pending-counter.
 * Гарантирует, что decrement произойдёт ровно один раз (включая unmount).
 */
export function useReportPending(pending: boolean) {
  const endRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    if (pending && !endRef.current) {
      endRef.current = beginPending();
    }

    if (!pending && endRef.current) {
      endRef.current();
      endRef.current = null;
    }

    return () => {
      if (endRef.current) {
        endRef.current();
        endRef.current = null;
      }
    };
  }, [pending]);
}

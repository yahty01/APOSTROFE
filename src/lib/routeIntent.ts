'use client';

type Listener = () => void;

let intentKey: string | null = null;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeRouteIntent(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRouteIntentSnapshot(): string | null {
  return intentKey;
}

export function setRouteIntent(next: string | null) {
  const normalized = next?.trim() ? next : null;
  if (intentKey === normalized) return;
  intentKey = normalized;
  emit();
}

export function clearRouteIntent() {
  setRouteIntent(null);
}


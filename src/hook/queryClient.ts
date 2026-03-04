// Lightweight query client: pub/sub for invalidation + optional simple cache (not used heavily here)
type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

export function subscribeQuery(key: string, fn: Listener) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) listeners.delete(key);
  };
}

export function invalidateQuery(key: string) {
  const set = listeners.get(key);
  if (!set) return;
  // call listeners (do it async so doesn't block)
  set.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      // ignore
      console.error(e);
    }
  });
}
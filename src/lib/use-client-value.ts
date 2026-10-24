import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/**
 * A browser-only value: `server` during SSR and hydration, then `get()` on the client.
 * Avoids the extra render of a setState-in-useEffect. `get` must return a primitive (compared with Object.is).
 */
export function useClientValue<T>(get: () => T, server: T): T {
  return useSyncExternalStore(noSubscribe, get, () => server);
}

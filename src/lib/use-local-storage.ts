"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored !== null) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from a browser-only API after mount, needed to avoid an SSR/client mismatch
        setValue(JSON.parse(stored) as T);
      } catch {
        // Ignore corrupt stored value, keep initialValue.
      }
    }
  }, [key]);

  // Persists synchronously (not via a separate effect) so that a value
  // written by one component is immediately visible to any other
  // component reading the same key from localStorage right after —
  // e.g. Intro writes zenzy:name and flips zenzy:onboarded in the same
  // handler, and GreetingHeader (a different useLocalStorage instance)
  // mounts fresh right after and must see the name that was "just" set.
  const setAndPersist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        window.localStorage.setItem(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key]
  );

  return [value, setAndPersist] as const;
}

"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

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
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}

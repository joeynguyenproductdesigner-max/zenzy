"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { getTimeOfDayGreeting, greetingWithName } from "@/lib/greeting";

export function GreetingHeader() {
  const [name] = useLocalStorage<string>("zenzy:name", "");
  const [hour, setHour] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the browser clock after mount, needed to avoid an SSR/client mismatch
    setHour(new Date().getHours());
  }, []);

  if (hour === null) {
    // Tránh mismatch SSR/client vì giờ chào phụ thuộc giờ máy người dùng.
    return <div className="h-[96px] w-full" />;
  }

  const greeting = getTimeOfDayGreeting(hour);

  return (
    <div className="w-full text-center font-semibold text-[40px] leading-[1.2] text-white">
      <p>{greetingWithName(greeting, name || undefined)}</p>
      <p className="mt-1 text-[16px] leading-[1.2]">{greeting.subtitle}</p>
    </div>
  );
}

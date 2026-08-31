"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { getTimeOfDayGreeting, greetingWithName } from "@/lib/greeting";

export function GreetingHeader({
  welcomeBack = false,
}: {
  welcomeBack?: boolean;
}) {
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

  const timeGreeting = getTimeOfDayGreeting(hour);
  // Nếu vừa có 1 phiên dang dở đã hết hạn (>2 giờ), thay tiêu đề chào theo
  // giờ trong ngày bằng "Welcome back" — bỏ hẳn màn S5 riêng nhưng vẫn giữ
  // cảm giác chào lại người quen ngay trên màn chính.
  const greeting = welcomeBack
    ? { ...timeGreeting, title: "Welcome back" }
    : timeGreeting;

  return (
    <div className="w-full text-center font-semibold text-[48px] leading-[1.2] text-white">
      <p>{greetingWithName(greeting, name || undefined)}</p>
      <p className="mt-1 text-[18px] leading-[1.2]">{greeting.subtitle}</p>
    </div>
  );
}

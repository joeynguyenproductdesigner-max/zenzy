"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { getTimeOfDayGreeting, greetingWithName } from "@/lib/greeting";

export function GreetingHeader() {
  const [name, setName] = useLocalStorage<string>("zenzy:name", "");
  const [hour, setHour] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the browser clock after mount, needed to avoid an SSR/client mismatch
    setHour(new Date().getHours());
  }, []);

  if (hour === null) {
    // Tránh mismatch SSR/client vì giờ chào phụ thuộc giờ máy người dùng.
    return <div className="h-[96px] w-full" />;
  }

  const greeting = getTimeOfDayGreeting(hour);

  const submitName = () => {
    const trimmed = draft.trim().slice(0, 40);
    setName(trimmed);
    setEditing(false);
  };

  return (
    <div className="w-full text-center font-semibold text-[40px] leading-[1.2] text-white">
      <p>{greetingWithName(greeting, name || undefined)}</p>
      {editing ? (
        <p className="mt-1 text-[16px] font-normal">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitName()}
            onBlur={submitName}
            placeholder="Your name"
            className="w-40 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-center text-white outline-none placeholder:text-white/50"
          />
        </p>
      ) : (
        <p className="mt-1 text-[16px] leading-[1.2]">
          {greeting.subtitle}{" "}
          {!name && (
            <button
              type="button"
              onClick={() => {
                setDraft("");
                setEditing(true);
              }}
              className="text-white/60 underline decoration-dotted underline-offset-2 hover:text-white"
            >
              Add your name
            </button>
          )}
        </p>
      )}
    </div>
  );
}

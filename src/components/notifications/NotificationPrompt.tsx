"use client";

import { Bell } from "lucide-react";

export function NotificationPrompt({
  onEnable,
  onDismiss,
}: {
  onEnable: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="absolute left-1/2 top-1/2 z-20 flex w-[480px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-7 rounded-3xl border border-white/20 bg-black/50 p-10 shadow-[0_20px_40px_rgba(0,0,0,0.25)] backdrop-blur-[30px]">
      <div className="flex size-16 items-center justify-center rounded-[32px] border border-white/20 bg-white/[0.08] shadow-[0_8px_24px_rgba(94,59,238,0.2)] backdrop-blur-[12px]">
        <Bell className="size-7 text-white" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center text-white">
        <p className="text-2xl font-bold">Don&apos;t lose track of your breaks</p>
        <p className="text-base text-white/80">
          Turn on notifications so we can gently remind you
          <br />
          while you&apos;re working in another tab.
        </p>
      </div>
      <div className="flex w-full items-start justify-center gap-4">
        <button
          type="button"
          onClick={onDismiss}
          className="flex flex-1 items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-base font-medium text-white"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={onEnable}
          className="flex flex-1 items-center justify-center rounded-full bg-[#5e3bee] px-6 py-3.5 text-base font-semibold text-white"
        >
          Turn on reminders
        </button>
      </div>
    </div>
  );
}

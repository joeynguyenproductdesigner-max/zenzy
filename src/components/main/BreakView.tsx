"use client";

import { Lottie } from "lottie-react";
import { formatCountdown } from "@/lib/work-durations";
import eyesAnimation from "@/animations/eyes.json";

export function BreakView({
  remainingSeconds,
  onSkip,
}: {
  remainingSeconds: number;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex size-[120px] items-center justify-center rounded-[60px]">
        <Lottie src={eyesAnimation} loop autoplay className="size-20" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center text-white">
        <p className="text-[32px] font-semibold">Time to look away</p>
        <p className="text-[16px]">
          Focus on something 20 feet (6m) away until the timer ends.
        </p>
      </div>
      <p className="w-[640px] text-center text-[144px] font-black leading-[1.05] text-white">
        {formatCountdown(remainingSeconds)}
      </p>
      <button
        type="button"
        onClick={onSkip}
        className="w-[311px] rounded-full bg-[#5e3bee] px-6 py-3.5 text-[16px] font-semibold text-white"
      >
        Skip break
      </button>
    </div>
  );
}

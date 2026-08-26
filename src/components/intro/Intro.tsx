"use client";

import { useEffect, useState } from "react";
import { IntroGlow } from "./IntroGlow";
import { NameStep } from "./NameStep";

// Đúng timing đã chốt với PM: mỗi màn hiện 600ms rồi chuyển màn kế tiếp
// bằng crossfade opacity Linear 1000ms. Dừng auto-advance khi tới màn
// "Name" — màn này chờ người dùng nhập/bấm Start/Skip.
const HOLD_MS = 600;
const FADE_MS = 1000;

const AUTO_STEPS = ["welcome", "logo", "tagline"] as const;

export function Intro({
  onComplete,
}: {
  onComplete: (name: string) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const atName = stepIndex >= AUTO_STEPS.length;

  useEffect(() => {
    if (atName) return;
    const hold = setTimeout(() => setFading(true), HOLD_MS);
    return () => clearTimeout(hold);
  }, [stepIndex, atName]);

  useEffect(() => {
    if (!fading) return;
    const fade = setTimeout(() => {
      setStepIndex((i) => i + 1);
      setFading(false);
    }, FADE_MS);
    return () => clearTimeout(fade);
  }, [fading]);

  if (atName) {
    return <NameStep onDone={onComplete} />;
  }

  const step = AUTO_STEPS[stepIndex];

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-r from-[#1b1b1f] to-[#2a1b3d] transition-opacity ease-linear ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {step === "welcome" && (
        <>
          <IntroGlow className="-left-[220px] -top-[220px]" />
          <p className="w-[640px] text-center text-[32px] text-white">
            Welcome to
          </p>
        </>
      )}
      {step === "logo" && (
        <>
          <IntroGlow className="left-[140px] -top-[240px]" />
          <p className="w-[640px] text-center text-[80px] font-bold text-white">
            Zenzy
          </p>
        </>
      )}
      {step === "tagline" && (
        <>
          <IntroGlow className="left-[80px] top-[10px]" />
          <div className="flex w-[640px] flex-col items-center text-center">
            <p className="text-[80px] font-bold text-white">Zenzy</p>
            <p className="text-[24px] text-[#a0a5b5]">Zen for your eyes</p>
          </div>
        </>
      )}
    </div>
  );
}

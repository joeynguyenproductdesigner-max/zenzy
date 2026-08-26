"use client";

import { useEffect, useState } from "react";
import { IntroGlow } from "./IntroGlow";
import { NameStep } from "./NameStep";

// Đúng timing đã chốt với PM: mỗi màn hiện 600ms rồi chuyển màn kế tiếp
// bằng crossfade opacity Linear 1000ms. Dừng auto-advance khi tới màn
// "Name" — màn này chờ người dùng nhập/bấm Start/Skip.
//
// Nền (gradient) là 1 layer riêng, đứng yên xuyên suốt cả chuỗi Intro —
// chỉ layer content (chữ/glow/form) mới crossfade, để tránh giật/lag do
// tắt-bật cả màn hình mỗi lần chuyển bước.
const HOLD_MS = 600;
const FADE_MS = 1000;

const STEPS = ["welcome", "logo", "tagline", "name"] as const;

export function Intro({
  onComplete,
}: {
  onComplete: (name: string) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const step = STEPS[stepIndex];

  useEffect(() => {
    if (step === "name") return;
    const hold = setTimeout(() => setFading(true), HOLD_MS);
    return () => clearTimeout(hold);
  }, [step]);

  useEffect(() => {
    if (!fading) return;
    const fade = setTimeout(() => {
      setStepIndex((i) => i + 1);
      setFading(false);
    }, FADE_MS);
    return () => clearTimeout(fade);
  }, [fading]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-r from-[#1b1b1f] to-[#2a1b3d]">
      <div
        className={`flex flex-col items-center transition-opacity ease-linear ${
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
        {step === "name" && <NameStep onDone={onComplete} />}
      </div>
    </div>
  );
}

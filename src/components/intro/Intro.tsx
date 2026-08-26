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
//
// Riêng "Zenzy" (logo) -> "Zenzy" + tagline: không crossfade (chữ Zenzy
// không tắt đi), mà đẩy "Zenzy" lên bằng cách mở rộng chiều cao của dòng
// tagline bên dưới (CSS grid-rows 0fr -> 1fr), tagline fade-in cùng lúc.
const HOLD_MS = 600;
const FADE_MS = 1000;

const STEPS = ["welcome", "brand", "name"] as const;

export function Intro({
  onComplete,
}: {
  onComplete: (name: string) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [taglineShown, setTaglineShown] = useState(false);
  const step = STEPS[stepIndex];

  useEffect(() => {
    if (step !== "welcome") return;
    const hold = setTimeout(() => setFading(true), HOLD_MS);
    return () => clearTimeout(hold);
  }, [step]);

  useEffect(() => {
    if (step !== "brand") return;
    const reveal = setTimeout(() => setTaglineShown(true), HOLD_MS);
    return () => clearTimeout(reveal);
  }, [step]);

  useEffect(() => {
    if (step !== "brand" || !taglineShown) return;
    const hold = setTimeout(() => setFading(true), HOLD_MS);
    return () => clearTimeout(hold);
  }, [step, taglineShown]);

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
        {step === "brand" && (
          <>
            <IntroGlow className="left-[80px] top-[10px]" />
            <div className="flex w-[640px] flex-col items-center text-center">
              <p className="text-[80px] font-bold text-white">Zenzy</p>
              <div
                className="grid overflow-hidden transition-[grid-template-rows] ease-linear"
                style={{
                  transitionDuration: `${FADE_MS}ms`,
                  gridTemplateRows: taglineShown ? "1fr" : "0fr",
                }}
              >
                <div className="overflow-hidden">
                  <p
                    className="text-[24px] text-[#a0a5b5] transition-opacity ease-linear"
                    style={{
                      transitionDuration: `${FADE_MS}ms`,
                      opacity: taglineShown ? 1 : 0,
                    }}
                  >
                    Zen for your eyes
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {step === "name" && <NameStep onDone={onComplete} />}
      </div>
    </div>
  );
}

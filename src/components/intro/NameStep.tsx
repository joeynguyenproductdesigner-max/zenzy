"use client";

import { useState } from "react";
import { IntroGlow } from "./IntroGlow";

export function NameStep({
  onDone,
}: {
  onDone: (name: string) => void;
}) {
  const [name, setName] = useState("");

  const submit = () => onDone(name.trim().slice(0, 40));

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-10 bg-gradient-to-r from-[#1b1b1f] to-[#2a1b3d]">
      <IntroGlow className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      <p className="w-[640px] text-center text-[24px] text-[#a0a5b5]">
        Your name
      </p>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && name.trim() && submit()}
        placeholder=""
        className="w-[386px] rounded-full border border-white/20 bg-white/5 px-[60px] py-3 text-center text-[32px] text-white outline-none"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!name.trim()}
        className={`rounded-[24px] bg-[#5e3bee] px-10 py-3 text-[16px] font-bold text-white transition-opacity ${
          name.trim() ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        Start
      </button>
      <button
        type="button"
        onClick={() => onDone("")}
        className="absolute bottom-20 text-[16px] text-[#a0a5b5] underline"
      >
        I&apos;ll pass this time
      </button>
    </div>
  );
}

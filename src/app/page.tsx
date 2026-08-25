"use client";

import { useState } from "react";
import { ThemeDialog } from "@/components/dialog/ThemeDialog";
import { SoundDialog } from "@/components/dialog/SoundDialog";

// TODO(Sprint 2): các nút bấm này là chỗ đứng tạm cho HUD của Main screen.
// Khi Main screen được build, thay 2 nút này bằng icon "theme" và
// "audio-waveform" thật trong hud-bottom-right theo mockup Figma.
export default function Home() {
  const [themeOpen, setThemeOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-950 p-8 font-sans">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-zinc-50">Zenzy</h1>
        <p className="text-zinc-400">Zen for your eyes</p>
        <p className="mt-4 text-sm text-zinc-600">
          Sprint 1 preview — Dialog Themes / Sounds / Music
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => {
            setThemeOpen((v) => !v);
            setSoundOpen(false);
          }}
          className="rounded-full bg-[#5e3bee] px-5 py-2 text-sm font-medium text-white"
        >
          {themeOpen ? "Close Themes" : "Open Themes"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSoundOpen((v) => !v);
            setThemeOpen(false);
          }}
          className="rounded-full bg-[#5e3bee] px-5 py-2 text-sm font-medium text-white"
        >
          {soundOpen ? "Close Sounds/Music" : "Open Sounds/Music"}
        </button>
      </div>

      <ThemeDialog open={themeOpen} />
      <SoundDialog open={soundOpen} />
    </div>
  );
}

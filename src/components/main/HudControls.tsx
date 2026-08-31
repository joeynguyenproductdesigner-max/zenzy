"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ThemeIcon } from "@/icons/ThemeIcon";
import { MusicIcon } from "@/icons/MusicIcon";
import { MaximizeIcon } from "@/icons/MaximizeIcon";

// Khớp đúng "view-panel" trong Figma (node 8:72) — 2 lớp: khung ngoài (bg
// trắng 5%, viền trắng 30%, bo 12px, padding 4px) bọc 1 nút icon bo 8px
// bên trong. Riêng cho icon HUD nổi trên nền ảnh/video — không dùng chung
// DialogIconButton (SoundDialog) vì đó là khung khác trong dialog panel.
function HudIconButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[12px] border border-white/30 bg-white/5 p-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`flex items-center justify-center rounded-lg p-2 text-white transition ${
          active ? "bg-white/50" : "hover:bg-white/20"
        }`}
      >
        {children}
      </button>
    </div>
  );
}

export function HudControls({
  onToggleThemes,
  themesOpen,
  onToggleSounds,
  soundsOpen,
}: {
  onToggleThemes: () => void;
  themesOpen: boolean;
  onToggleSounds: () => void;
  soundsOpen: boolean;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <div className="absolute bottom-12 right-16 z-20 flex items-start gap-8">
      <div className="flex items-center gap-3">
        <HudIconButton
          label="Themes"
          active={themesOpen}
          onClick={onToggleThemes}
        >
          <ThemeIcon size={19.2} />
        </HudIconButton>
        <HudIconButton
          label="Sounds/Music"
          active={soundsOpen}
          onClick={onToggleSounds}
        >
          <MusicIcon size={19.2} />
        </HudIconButton>
      </div>
      <HudIconButton
        label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        active={fullscreen}
        onClick={toggleFullscreen}
      >
        <MaximizeIcon size={19.5} />
      </HudIconButton>
    </div>
  );
}

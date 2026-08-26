"use client";

import { AudioWaveform, Image as ImageIcon, Maximize } from "lucide-react";
import { useEffect, useState } from "react";
import { DialogIconButton } from "@/components/dialog/DialogPanel";

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
        <DialogIconButton
          label="Themes"
          active={themesOpen}
          onClick={onToggleThemes}
        >
          <ImageIcon size={19} strokeWidth={2} color="#FFFFFF" />
        </DialogIconButton>
        <DialogIconButton
          label="Sounds/Music"
          active={soundsOpen}
          onClick={onToggleSounds}
        >
          <AudioWaveform size={19} strokeWidth={2} color="#FFFFFF" />
        </DialogIconButton>
      </div>
      <DialogIconButton
        label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        active={fullscreen}
        onClick={toggleFullscreen}
      >
        <Maximize size={19} strokeWidth={2} color="#FFFFFF" />
      </DialogIconButton>
    </div>
  );
}

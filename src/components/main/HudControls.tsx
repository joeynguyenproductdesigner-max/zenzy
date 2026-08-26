"use client";

import { useEffect, useState } from "react";
import { DialogIconButton } from "@/components/dialog/DialogPanel";
import { ThemeIcon } from "@/icons/ThemeIcon";
import { MusicIcon } from "@/icons/MusicIcon";
import { MaximizeIcon } from "@/icons/MaximizeIcon";

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
          <ThemeIcon size={19.2} />
        </DialogIconButton>
        <DialogIconButton
          label="Sounds/Music"
          active={soundsOpen}
          onClick={onToggleSounds}
        >
          <MusicIcon size={24} />
        </DialogIconButton>
      </div>
      <DialogIconButton
        label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        active={fullscreen}
        onClick={toggleFullscreen}
      >
        <MaximizeIcon size={19.5} />
      </DialogIconButton>
    </div>
  );
}

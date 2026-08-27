"use client";

import Image from "next/image";
import { useState } from "react";
import { ThemeDialog } from "@/components/dialog/ThemeDialog";
import { SoundDialog } from "@/components/dialog/SoundDialog";
import { useLocalStorage } from "@/lib/use-local-storage";
import { useWorkSession } from "@/lib/use-work-session";
import { themeBackgrounds } from "../../../media-config";
import { GreetingHeader } from "./GreetingHeader";
import { ChronoView } from "./ChronoView";
import { WorkEndedPrompt } from "./WorkEndedPrompt";
import { BreakView } from "./BreakView";
import { HudControls } from "./HudControls";

export function MainScreen() {
  const [themeId, setThemeId] = useLocalStorage<string>(
    "zenzy:theme",
    themeBackgrounds[0].id
  );
  const [name] = useLocalStorage<string>("zenzy:name", "");
  const background =
    themeBackgrounds.find((t) => t.id === themeId) ?? themeBackgrounds[0];

  const session = useWorkSession();
  const [themesOpen, setThemesOpen] = useState(false);
  const [soundsOpen, setSoundsOpen] = useState(false);

  const showTabs = session.status !== "prompt" && session.status !== "break";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <Image
          src={background.url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-16 pt-12">
        <div className="flex flex-col items-center whitespace-nowrap text-white">
          <p className="text-[48px] font-black">Zenzy</p>
          <p className="text-[16px] text-white/80">Zen for your eyes</p>
        </div>
        <p className="whitespace-nowrap text-right text-[20px] font-medium italic text-white">
          &ldquo;A gentle reminder to rest your eyes.&rdquo;
        </p>
      </div>

      <div className="relative flex flex-col items-center gap-12">
        {showTabs && <GreetingHeader />}

        {(session.status === "ready" ||
          session.status === "working" ||
          session.status === "paused") && (
          <ChronoView
            status={session.status}
            workMinutes={session.workMinutes}
            remainingSeconds={session.remainingSeconds}
            onSelectDuration={session.selectDuration}
            onStart={session.start}
            onPause={session.pause}
            onResume={session.resume}
            onReset={session.reset}
          />
        )}

        {session.status === "prompt" && (
          <WorkEndedPrompt
            name={name || undefined}
            workMinutes={session.workMinutes}
            onSnooze={session.snooze}
            onTakeBreak={session.takeBreak}
          />
        )}

        {session.status === "break" && (
          <BreakView
            remainingSeconds={session.remainingSeconds}
            onSkip={session.skipBreak}
          />
        )}
      </div>

      {session.status === "break" && (
        <p className="absolute bottom-12 left-16 text-[16px] text-[#a0a5b5]">
          Based on the 20-20-20 rule — American Optometric Association
        </p>
      )}

      {/* Always mounted (never conditionally rendered on themesOpen/soundsOpen)
          so SoundDialog's <audio> elements and playback state survive the
          dialog being closed — only the backdrop's visibility/hit-testing
          toggles, not the dialogs themselves. */}
      <div
        className={`absolute inset-0 z-10 flex items-end justify-end pr-16 pb-[101.5px] ${
          themesOpen || soundsOpen
            ? "bg-black/40"
            : "pointer-events-none bg-transparent"
        }`}
        onClick={() => {
          setThemesOpen(false);
          setSoundsOpen(false);
        }}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <ThemeDialog
            open={themesOpen}
            selectedThemeId={themeId}
            onSelectTheme={setThemeId}
          />
          <SoundDialog open={soundsOpen} />
        </div>
      </div>

      <HudControls
        themesOpen={themesOpen}
        onToggleThemes={() => {
          setThemesOpen((v) => !v);
          setSoundsOpen(false);
        }}
        soundsOpen={soundsOpen}
        onToggleSounds={() => {
          setSoundsOpen((v) => !v);
          setThemesOpen(false);
        }}
      />
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ThemeDialog } from "@/components/dialog/ThemeDialog";
import { SoundDialog } from "@/components/dialog/SoundDialog";
import { NotificationPrompt } from "@/components/notifications/NotificationPrompt";
import { useLocalStorage } from "@/lib/use-local-storage";
import { useWorkSession } from "@/lib/use-work-session";
import { useEyeBreakNotifier } from "@/lib/use-eye-break-notifier";
import { usePictureInPicture } from "@/lib/use-picture-in-picture";
import { isNotificationSupported, isSafariOrIOS } from "@/lib/browser-support";
import { themeBackgrounds, kineticVisual } from "../../../media-config";
import { GreetingHeader } from "./GreetingHeader";
import { ChronoView } from "./ChronoView";
import { WorkEndedPrompt } from "./WorkEndedPrompt";
import { BreakView } from "./BreakView";
import { SessionRecoveryPrompt } from "./SessionRecoveryPrompt";
import { HudControls } from "./HudControls";
import { PipActiveNotice, PipPortal, type PipStatus } from "./PictureInPicture";
import type { SessionStatus } from "@/lib/use-work-session";

// PiP mirror 4 trạng thái có mockup Figma (ready/working/paused/prompt) —
// "break"/"recovery" không có mockup PiP nên tự đóng khi phiên vào 2
// trạng thái này (xem effect closePip bên dưới).
function isPipStatus(status: SessionStatus): status is PipStatus {
  return (
    status === "ready" ||
    status === "working" ||
    status === "paused" ||
    status === "prompt"
  );
}

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

  const [notifDismissed, setNotifDismissed] = useLocalStorage<boolean>(
    "zenzy:notif-prompt-dismissed",
    false
  );
  // Đọc sau mount để tránh mismatch SSR/client (phụ thuộc API trình duyệt).
  const [notifSupported, setNotifSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [safariWarning, setSafariWarning] = useState(false);

  useEffect(() => {
    const supported = isNotificationSupported();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of browser feature/permission after mount, needed to avoid an SSR/client mismatch
    setNotifSupported(supported);
    if (supported) setPermission(Notification.permission);
    setSafariWarning(!supported && isSafariOrIOS());
  }, []);

  // Chờ 3s sau khi bấm Start working mới hiện S0, thay vì hiện ngay ở màn
  // Ready — để người dùng thấy timer chạy thật rồi mới xin quyền.
  const [notifPromptDelayElapsed, setNotifPromptDelayElapsed] = useState(false);
  useEffect(() => {
    if (session.status !== "working") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting the delay gate when leaving "working" so a later restart re-runs the 3s wait, not derivable during render
      setNotifPromptDelayElapsed(false);
      return;
    }
    const timer = setTimeout(() => setNotifPromptDelayElapsed(true), 3000);
    return () => clearTimeout(timer);
  }, [session.status]);

  useEyeBreakNotifier({
    status: session.status,
    workMinutes: session.workMinutes,
    onSnooze: session.snooze,
    onTakeBreak: session.takeBreak,
  });

  const {
    supported: pipSupported,
    mode: pipMode,
    pipWindow,
    openPip,
    closePip,
    restorePip,
  } = usePictureInPicture();
  // PiP mirror ready/working/paused/prompt khi đã mở (đúng 4 frame Figma) —
  // chỉ đóng khi phiên rời sang trạng thái không có mockup PiP (break,
  // recovery), tránh cửa sổ nổi hiện nội dung không có thiết kế tương ứng.
  useEffect(() => {
    if (!isPipStatus(session.status)) {
      closePip();
    }
  }, [session.status, closePip]);

  const showNotifPrompt =
    session.status === "working" &&
    notifPromptDelayElapsed &&
    notifSupported &&
    permission === "default" &&
    !notifDismissed;

  const showTabs =
    session.status !== "prompt" &&
    session.status !== "break" &&
    session.status !== "recovery";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        {session.status === "break" ? (
          <video
            key={kineticVisual.url}
            src={kineticVisual.url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 size-full object-cover"
          />
        ) : background.type === "video" ? (
          <video
            key={background.url}
            src={background.url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <Image
            src={background.url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-16 pt-12">
        <button
          type="button"
          onClick={session.reset}
          aria-label="Reset to start"
          className="flex flex-col items-center whitespace-nowrap text-white"
        >
          <p className="text-[48px] leading-[56px] font-black">Zenzy</p>
          <p className="text-[16px] text-white/80">Zen for your eyes</p>
        </button>
        <p className="whitespace-nowrap text-right text-[24px] font-medium italic text-white">
          &ldquo;A gentle reminder to rest your eyes.&rdquo;
        </p>
      </div>

      <div className="relative flex flex-col items-center gap-12">
        {showTabs && <GreetingHeader welcomeBack={session.showWelcomeBack} />}

        {session.status === "recovery" && (
          <SessionRecoveryPrompt
            name={name || undefined}
            minutesLeft={session.recoveryMinutesLeft}
            onResume={session.resumeSession}
            onStartNew={session.dismissRecovery}
          />
        )}

        {isPipStatus(session.status) &&
          (pipMode ? (
            <PipActiveNotice onClose={closePip} />
          ) : session.status === "prompt" ? (
            <WorkEndedPrompt
              name={name || undefined}
              workMinutes={session.workMinutes}
              onSnooze={session.snooze}
              onTakeBreak={session.takeBreak}
            />
          ) : (
            <ChronoView
              status={session.status}
              workMinutes={session.workMinutes}
              remainingSeconds={session.remainingSeconds}
              onSelectDuration={session.selectDuration}
              onStart={session.start}
              onPause={session.pause}
              onResume={session.resume}
              onReset={session.reset}
              pipSupported={pipSupported}
              onOpenPip={openPip}
            />
          ))}

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

      {safariWarning && (
        <p className="absolute bottom-12 left-16 max-w-[400px] text-[14px] text-white/70">
          Safari/iOS limits background reminders — keep this tab open, or
          we&apos;ll flash the tab title when it&apos;s time to rest.
        </p>
      )}

      {showNotifPrompt && (
        <NotificationPrompt
          onDismiss={() => setNotifDismissed(true)}
          onEnable={() => {
            Notification.requestPermission().then((result) => {
              setPermission(result);
              setNotifDismissed(true);
              if (result === "granted") {
                navigator.serviceWorker
                  .register("/sw.js")
                  .catch((err) =>
                    console.error("[Zenzy] service worker registration failed", err)
                  );
              }
            });
          }}
        />
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

      {pipWindow && isPipStatus(session.status) && (
        <PipPortal
          pipWindow={pipWindow}
          status={session.status}
          remainingSeconds={session.remainingSeconds}
          backgroundUrl={background.url}
          backgroundType={background.type}
          onStart={session.start}
          onPauseResume={session.status === "paused" ? session.resume : session.pause}
          onReset={session.reset}
          onSnooze={session.snooze}
          onTakeBreak={session.takeBreak}
          onRestore={restorePip}
          onClose={closePip}
        />
      )}
    </div>
  );
}

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
import { useAutoPipFallback } from "@/lib/use-auto-pip-fallback";
import {
  isNotificationSupported,
  isSafariOrIOS,
  isArcBrowser,
} from "@/lib/browser-support";
import { themeBackgrounds, kineticVisual } from "../../../media-config";
import { GreetingHeader } from "./GreetingHeader";
import { ChronoView } from "./ChronoView";
import { WorkEndedPrompt } from "./WorkEndedPrompt";
import { BreakView } from "./BreakView";
import { SessionRecoveryPrompt } from "./SessionRecoveryPrompt";
import { HudControls } from "./HudControls";
import { PipActiveNotice, PipPortal } from "./PictureInPicture";

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
  // Đọc sau mount vì phụ thuộc CSS custom property Arc tự inject (chỉ có
  // sau khi trang render xong), tránh mismatch SSR/client.
  const [isArc, setIsArc] = useState(false);

  useEffect(() => {
    const supported = isNotificationSupported();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of browser feature/permission after mount, needed to avoid an SSR/client mismatch
    setNotifSupported(supported);
    if (supported) setPermission(Notification.permission);
    setSafariWarning(!supported && isSafariOrIOS());
    setIsArc(isArcBrowser());
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
    pipWindow,
    openPip,
    closePip,
  } = usePictureInPicture();
  // PiP chỉ hiển thị countdown working/paused — session rời 2 trạng thái
  // này (hết giờ, reset, vào break...) thì đóng PiP luôn, tránh cửa sổ nổi
  // hiện nội dung không còn khớp trạng thái thật.
  useEffect(() => {
    if (session.status !== "working" && session.status !== "paused") {
      closePip();
    }
  }, [session.status, closePip]);

  // Lưới an toàn: nếu quên bấm nút PiP trước khi rời tab, video ẩn này tự
  // nổi lên thay (mất nút Reset, chỉ còn play/pause gốc). Chỉ bật khi
  // Document PiP CHƯA mở thủ công, tránh 2 cửa sổ nổi cùng lúc.
  const { canvasRef: fallbackCanvasRef, videoRef: fallbackVideoRef } =
    useAutoPipFallback({
      active:
        (session.status === "working" || session.status === "paused") &&
        !pipWindow,
      status: session.status === "paused" ? "paused" : "working",
      remainingSeconds: session.remainingSeconds,
      backgroundUrl: background.url,
      onPause: session.pause,
      onResume: session.resume,
    });

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
        <div className="flex flex-col items-center whitespace-nowrap text-white">
          <p className="text-[48px] font-black">Zenzy</p>
          <p className="text-[16px] text-white/80">Zen for your eyes</p>
        </div>
        <p className="whitespace-nowrap text-right text-[20px] font-medium italic text-white">
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

        {(session.status === "ready" ||
          session.status === "working" ||
          session.status === "paused") &&
          (pipWindow ? (
            <PipActiveNotice onClose={closePip} />
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
              // Arc có API documentPictureInPicture nhưng không mở cửa sổ
              // nổi độc lập thật (dính theo tab, chuyển tab là biến mất) —
              // ẩn nút thay vì hiện ra rồi hoạt động sai. Lưới an toàn
              // (video auto-PiP) vẫn chạy ngầm bình thường trên Arc.
              pipSupported={pipSupported && !isArc}
              onOpenPip={openPip}
            />
          ))}

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
                navigator.serviceWorker.register("/sw.js").catch(() => {});
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

      {pipWindow &&
        (session.status === "working" || session.status === "paused") && (
          <PipPortal
            pipWindow={pipWindow}
            status={session.status}
            remainingSeconds={session.remainingSeconds}
            backgroundUrl={background.url}
            onPauseResume={
              session.status === "paused" ? session.resume : session.pause
            }
            onReset={session.reset}
          />
        )}

      {/* Nguồn cho lưới an toàn auto-PiP — ẩn hẳn, chỉ tự nổi lên khi
          Document PiP chưa mở thủ công (xem useAutoPipFallback ở trên). */}
      <canvas
        ref={fallbackCanvasRef}
        width={360}
        height={230}
        className="hidden"
      />
      <video ref={fallbackVideoRef} muted playsInline className="hidden" />
    </div>
  );
}

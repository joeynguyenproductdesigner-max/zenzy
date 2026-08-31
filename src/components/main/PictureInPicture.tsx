import { createPortal } from "react-dom";
import { formatCountdown } from "@/lib/work-durations";
import { RefreshCwIcon } from "@/icons/RefreshCwIcon";

// Trạng thái mà cửa sổ Document PiP mirror được — khớp 3 frame Figma
// (Chưa start / Đang chạy / Khi đến giờ nghỉ mắt). "break" không có
// mockup PiP riêng nên PiP tự đóng khi phiên vào break (xem MainScreen).
export type PipStatus = "ready" | "working" | "paused" | "prompt";

// Panel hiện trên tab chính khi PiP đang mở — thay chỗ ChronoView, vì lúc
// này điều khiển thật đang nằm ở cửa sổ nổi.
export function PipActiveNotice({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex w-[640px] flex-col items-center gap-6 text-center text-white">
      <p className="text-[32px] font-semibold">
        Zenzy is running in Picture-in-Picture
      </p>
      <p className="text-[16px] text-white/80">
        Close the floating window to control it from this tab again.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-white/40 bg-white/20 px-9 py-3 text-[16px] font-bold text-white hover:bg-white/30"
      >
        Close Picture-in-Picture
      </button>
    </div>
  );
}

// Nội dung render vào document của cửa sổ Document PiP qua React portal —
// cùng cây component với MainScreen nên state (countdown, status) luôn
// đồng bộ. Chỉ Chrome/Edge dùng được PiP (CLAUDE.md quyết định #2) — Arc
// không có nút PiP (xem use-picture-in-picture.ts).
function PipContent({
  status,
  remainingSeconds,
  backgroundUrl,
  backgroundType,
  onStart,
  onPauseResume,
  onReset,
  onSnooze,
  onTakeBreak,
}: {
  status: PipStatus;
  remainingSeconds: number;
  backgroundUrl: string;
  backgroundType?: "image" | "video";
  onStart: () => void;
  onPauseResume: () => void;
  onReset: () => void;
  onSnooze: () => void;
  onTakeBreak: () => void;
}) {
  return (
    <div className="relative flex size-full min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-[#14101f] px-6 py-4">
      {/* next/image không dùng được — nội dung này render vào document của
          cửa sổ PiP (khác document/window với trang chính) qua portal. */}
      {backgroundType === "video" ? (
        <video
          key={backgroundUrl}
          src={backgroundUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundUrl}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/40" />

      {status === "prompt" ? (
        <div className="relative flex flex-col items-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-[32px] border border-white/20 bg-white/[0.08] shadow-[0_8px_24px_rgba(94,59,238,0.2)] backdrop-blur-[12px]">
            <p className="text-[34px]">👀</p>
          </div>
          <p className="text-center text-[24px] font-bold text-white">
            Time to rest your eyes
          </p>
          <div className="flex h-[47px] w-full items-center gap-4">
            <button
              type="button"
              onClick={onSnooze}
              className="flex flex-1 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-[14px] font-medium text-white"
            >
              Snooze 5 min
            </button>
            <button
              type="button"
              onClick={onTakeBreak}
              className="flex flex-1 items-center justify-center rounded-full bg-[#5e3bee] px-6 text-[14px] font-medium text-white"
            >
              Take a break
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center gap-4">
          <p className="text-[72px] font-black leading-none text-white">
            {formatCountdown(remainingSeconds)}
          </p>
          <div className="flex items-center gap-4">
            {status === "ready" && (
              <button
                type="button"
                onClick={onStart}
                className="rounded-full bg-[#5e3bee] px-9 py-3 text-[14px] font-medium text-white"
              >
                Start working
              </button>
            )}
            {status === "working" && (
              <button
                type="button"
                onClick={onPauseResume}
                className="rounded-full bg-[#c2b4fb] px-9 py-3 text-[14px] font-medium text-[#5e3bee]"
              >
                Pause
              </button>
            )}
            {status === "paused" && (
              <button
                type="button"
                onClick={onPauseResume}
                className="rounded-full bg-[#5e3bee] px-9 py-3 text-[14px] font-medium text-white"
              >
                Continue
              </button>
            )}
            <button
              type="button"
              onClick={onReset}
              aria-label="Reset"
              className="flex size-11 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white hover:bg-white/30"
            >
              <RefreshCwIcon size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PipPortal({
  pipWindow,
  ...contentProps
}: {
  pipWindow: Window;
  status: PipStatus;
  remainingSeconds: number;
  backgroundUrl: string;
  backgroundType?: "image" | "video";
  onStart: () => void;
  onPauseResume: () => void;
  onReset: () => void;
  onSnooze: () => void;
  onTakeBreak: () => void;
}) {
  return createPortal(<PipContent {...contentProps} />, pipWindow.document.body);
}

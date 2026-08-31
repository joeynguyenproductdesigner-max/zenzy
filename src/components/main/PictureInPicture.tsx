import { createPortal } from "react-dom";
import { forwardRef } from "react";
import { formatCountdown } from "@/lib/work-durations";
import type { SessionStatus } from "@/lib/use-work-session";
import type { PipMode } from "@/lib/use-picture-in-picture";
import { RefreshCwIcon } from "@/icons/RefreshCwIcon";

// Panel hiện trên tab chính khi PiP đang mở — thay chỗ ChronoView, vì lúc
// này điều khiển thật đang nằm ở cửa sổ nổi. Nhánh video (Arc) không có nút
// Reset trong cửa sổ PiP (giới hạn của video PiP — chỉ browser tự cho
// play/pause), nên ghi chú riêng để biết quay lại đây mà reset.
export function PipActiveNotice({
  mode,
  onClose,
}: {
  mode: PipMode;
  onClose: () => void;
}) {
  return (
    <div className="flex w-[640px] flex-col items-center gap-6 text-center text-white">
      <p className="text-[32px] font-semibold">
        Zenzy is running in Picture-in-Picture
      </p>
      <p className="text-[16px] text-white/80">
        {mode === "video"
          ? "Close the floating window to reset or control it from this tab again."
          : "Close the floating window to control it from this tab again."}
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
// đồng bộ. Chỉ dùng cho nhánh "document" (Chrome/Edge) — nhánh "video"
// (Arc) không có DOM riêng, nội dung của nó được vẽ bằng canvas.
function PipContent({
  status,
  remainingSeconds,
  backgroundUrl,
  onPauseResume,
  onReset,
}: {
  status: Extract<SessionStatus, "working" | "paused">;
  remainingSeconds: number;
  backgroundUrl: string;
  onPauseResume: () => void;
  onReset: () => void;
}) {
  return (
    <div className="relative flex size-full min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-[#14101f]">
      {/* next/image không dùng được — nội dung này render vào document của
          cửa sổ PiP (khác document/window với trang chính) qua portal. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backgroundUrl}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative flex flex-col items-center gap-4">
        <p className="text-[72px] font-black leading-none text-white">
          {formatCountdown(remainingSeconds)}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPauseResume}
            className="rounded-full bg-[#5e3bee] px-8 py-2.5 text-[14px] font-medium text-white"
          >
            {status === "paused" ? "Continue" : "Pause"}
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset"
            className="flex size-9 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white hover:bg-white/30"
          >
            <RefreshCwIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PipPortal({
  pipWindow,
  ...contentProps
}: {
  pipWindow: Window;
  status: Extract<SessionStatus, "working" | "paused">;
  remainingSeconds: number;
  backgroundUrl: string;
  onPauseResume: () => void;
  onReset: () => void;
}) {
  return createPortal(<PipContent {...contentProps} />, pipWindow.document.body);
}

// Canvas + video ẩn dùng làm nguồn cho nhánh video PiP (Arc) — luôn mounted
// (không chỉ khi mode === "video") để usePictureInPicture có ref sẵn sàng
// ngay trong lúc xử lý click mở PiP, không phải đợi render lại trước.
export const HiddenVideoPipSource = forwardRef<
  HTMLVideoElement,
  { canvasRef: React.RefObject<HTMLCanvasElement | null> }
>(function HiddenVideoPipSource({ canvasRef }, videoRef) {
  return (
    <div aria-hidden className="absolute size-0 overflow-hidden">
      <canvas ref={canvasRef} width={360} height={230} />
      <video ref={videoRef} playsInline muted />
    </div>
  );
});

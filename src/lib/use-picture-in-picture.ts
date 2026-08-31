"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatCountdown } from "./work-durations";
import { isArcBrowser } from "./browser-support";

// Document Picture-in-Picture chưa có trong lib.dom.d.ts (API còn draft,
// CLAUDE.md quyết định #2 — chỉ Chrome/Edge dùng nhánh này).
interface DocumentPictureInPicture {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
  window: Window | null;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

const DOC_PIP_WIDTH = 360;
const DOC_PIP_HEIGHT = 232;
const VIDEO_PIP_WIDTH = 360;
const VIDEO_PIP_HEIGHT = 230;

export type PipMode = "document" | "video" | null;

// Copy các stylesheet của trang chính sang document của cửa sổ Document PiP
// — cửa sổ này có DOM/CSSOM riêng nên class Tailwind sẽ không render nếu
// không copy.
function copyStylesheets(pip: Window) {
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      if (sheet.href) {
        const link = pip.document.createElement("link");
        link.rel = "stylesheet";
        link.href = sheet.href;
        pip.document.head.appendChild(link);
      } else if (sheet.cssRules) {
        const style = pip.document.createElement("style");
        style.textContent = Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
        pip.document.head.appendChild(style);
      }
    } catch {
      // Stylesheet cross-origin không đọc được cssRules — bỏ qua.
    }
  });
}

// Vẽ lại khung hình đồng hồ lên canvas cho nhánh video PiP (Arc) — cửa sổ
// video PiP không có DOM/CSS riêng như Document PiP, nên phải tự vẽ.
function drawVideoPipFrame(
  ctx: CanvasRenderingContext2D,
  remainingSeconds: number,
  paused: boolean
) {
  ctx.clearRect(0, 0, VIDEO_PIP_WIDTH, VIDEO_PIP_HEIGHT);
  ctx.fillStyle = "#14101f";
  ctx.fillRect(0, 0, VIDEO_PIP_WIDTH, VIDEO_PIP_HEIGHT);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 64px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    formatCountdown(remainingSeconds),
    VIDEO_PIP_WIDTH / 2,
    VIDEO_PIP_HEIGHT / 2 - 10
  );

  ctx.font = "600 16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillText(
    paused ? "Paused — tap play to continue" : "Zenzy · focusing",
    VIDEO_PIP_WIDTH / 2,
    VIDEO_PIP_HEIGHT / 2 + 45
  );
}

// Hook hợp nhất cho PiP (Sprint 7). Chỉ MỘT nhánh chạy tại một thời điểm,
// và nhánh đó chỉ được chọn/khởi động ngay trong lúc xử lý click của
// openPip — không có gì (auto-safety-net, detect trình duyệt) chạy nền từ
// lúc mount. Đây là điểm khác biệt cố ý so với các lần thử Sprint 7 trước
// (xem PLAN): chạy 2 hệ thống PiP song song + detect Arc lúc mount là
// nguồn gây bất ổn chính, không phải Document PiP hay video PiP tự nó lỗi.
export function usePictureInPicture({
  status,
  remainingSeconds,
  onPause,
  onResume,
}: {
  status: "working" | "paused";
  remainingSeconds: number;
  onPause: () => void;
  onResume: () => void;
}) {
  const [supported, setSupported] = useState(false);
  const [mode, setMode] = useState<PipMode>(null);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const latestRef = useRef({ status, remainingSeconds, onPause, onResume });
  useEffect(() => {
    latestRef.current = { status, remainingSeconds, onPause, onResume };
  }, [status, remainingSeconds, onPause, onResume]);

  useEffect(() => {
    const hasDocumentPip = "documentPictureInPicture" in window;
    const hasVideoPip =
      "pictureInPictureEnabled" in document && document.pictureInPictureEnabled;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time feature detection after mount, needed to avoid an SSR/client mismatch
    setSupported(hasDocumentPip || hasVideoPip);
  }, []);

  const closePip = useCallback(() => {
    if (mode === "document") {
      window.documentPictureInPicture?.window?.close();
    } else if (mode === "video" && document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }
  }, [mode]);

  const openDocumentPip = useCallback(async () => {
    if (!window.documentPictureInPicture) return;
    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: DOC_PIP_WIDTH,
        height: DOC_PIP_HEIGHT,
      });
      copyStylesheets(pip);
      pip.addEventListener(
        "pagehide",
        () => {
          setPipWindow(null);
          setMode(null);
        },
        { once: true }
      );
      setPipWindow(pip);
      setMode("document");
    } catch (err) {
      // Trình duyệt báo hỗ trợ nhưng vẫn có thể từ chối mở cửa sổ thật —
      // không để lỗi rơi ra ngoài làm crash UI, chỉ log lại.
      console.error("[Zenzy] documentPictureInPicture.requestWindow failed", err);
    }
  }, []);

  const openVideoPip = useCallback(async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawVideoPipFrame(ctx, latestRef.current.remainingSeconds, status === "paused");

    if (!video.srcObject) {
      const stream = canvas.captureStream();
      video.srcObject = stream;
      video.muted = true;
      await video.play().catch(() => {});
    }

    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () =>
        latestRef.current.onResume()
      );
      navigator.mediaSession.setActionHandler("pause", () =>
        latestRef.current.onPause()
      );
    }

    try {
      // Gọi trực tiếp trong handler click (gesture thật) — không dùng
      // autoPictureInPicture, nên không cần safety-net chạy nền chờ sẵn.
      await video.requestPictureInPicture();
      setMode("video");
    } catch (err) {
      console.error("[Zenzy] video requestPictureInPicture failed", err);
    }
  }, [status]);

  const openPip = useCallback(() => {
    const hasDocumentPip = "documentPictureInPicture" in window;
    if (hasDocumentPip && !isArcBrowser()) {
      openDocumentPip();
    } else {
      openVideoPip();
    }
  }, [openDocumentPip, openVideoPip]);

  // Đóng PiP tự động khi người dùng quay lại tab Zenzy — PiP chỉ có ý
  // nghĩa khi đang ở tab khác.
  useEffect(() => {
    if (!mode) return;
    const onVisibilityChange = () => {
      if (!document.hidden) closePip();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [mode, closePip]);

  // Nhánh video PiP: vẽ lại canvas mỗi khi countdown/trạng thái đổi trong
  // lúc cửa sổ đang mở (nhịp 1 giây, khớp countdown — không ép 30fps).
  useEffect(() => {
    if (mode !== "video") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawVideoPipFrame(ctx, remainingSeconds, status === "paused");
  }, [mode, remainingSeconds, status]);

  // Dọn dẹp khi video PiP đóng bằng nút "x" của trình duyệt (không qua
  // closePip()) — mediaSession handler và mode state cần reset theo.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLeavePip = () => {
      setMode((current) => (current === "video" ? null : current));
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      }
    };
    video.addEventListener("leavepictureinpicture", onLeavePip);
    return () => video.removeEventListener("leavepictureinpicture", onLeavePip);
  }, []);

  return { supported, mode, pipWindow, videoRef, canvasRef, openPip, closePip };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatCountdown } from "./work-durations";

// autoPictureInPicture chưa có trong lib.dom.d.ts (thuộc tính còn khá mới —
// cho phép trình duyệt tự bật PiP khi tab bị ẩn, đúng đặc tả HTMLVideoElement).
declare global {
  interface HTMLVideoElement {
    autoPictureInPicture: boolean;
  }
}

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 230;

interface DrawState {
  remainingSeconds: number;
  paused: boolean;
  backgroundUrl: string;
}

// Vẽ lại khung hình đồng hồ lên canvas — đây là nội dung sẽ hiện trong cửa
// sổ PiP (dạng video, không phải DOM/CSS như Document PiP), nên phải tự vẽ
// bằng Canvas 2D API thay vì dùng class Tailwind.
function draw(
  ctx: CanvasRenderingContext2D,
  { remainingSeconds, paused, backgroundUrl }: DrawState,
  bgImage: HTMLImageElement | null
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (bgImage && bgImage.src === backgroundUrl && bgImage.complete) {
    const scale = Math.max(
      CANVAS_WIDTH / bgImage.width,
      CANVAS_HEIGHT / bgImage.height
    );
    const w = bgImage.width * scale;
    const h = bgImage.height * scale;
    ctx.drawImage(
      bgImage,
      (CANVAS_WIDTH - w) / 2,
      (CANVAS_HEIGHT - h) / 2,
      w,
      h
    );
  } else {
    ctx.fillStyle = "#14101f";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 64px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    formatCountdown(remainingSeconds),
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2 - 10
  );

  ctx.font = "600 16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillText(
    paused ? "Paused — tap play to continue" : "Zenzy · focusing",
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2 + 45
  );
}

export function useAutoPip({
  active,
  status,
  remainingSeconds,
  backgroundUrl,
  onPause,
  onResume,
}: {
  // active: có nên bật auto-PiP (chỉ khi đang working/paused).
  active: boolean;
  status: "working" | "paused";
  remainingSeconds: number;
  backgroundUrl: string;
  onPause: () => void;
  onResume: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const [supported, setSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Giữ state mới nhất trong ref để dùng trong media session action handler
  // (đăng ký 1 lần, không muốn re-run mỗi khi status/remainingSeconds đổi).
  const latestRef = useRef({ status, remainingSeconds, backgroundUrl, onPause, onResume });
  useEffect(() => {
    latestRef.current = { status, remainingSeconds, backgroundUrl, onPause, onResume };
  }, [status, remainingSeconds, backgroundUrl, onPause, onResume]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time feature detection after mount, needed to avoid an SSR/client mismatch
    setSupported(
      typeof document !== "undefined" &&
        document.pictureInPictureEnabled === true &&
        typeof HTMLVideoElement !== "undefined" &&
        "requestPictureInPicture" in HTMLVideoElement.prototype
    );
  }, []);

  // Setup canvas → captureStream → video 1 lần khi component mount, và dọn
  // dẹp khi unmount. Việc bật/tắt auto-PiP theo trạng thái làm ở effect khác.
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    draw(ctx, { ...latestRef.current, paused: latestRef.current.status === "paused" }, null);

    const stream = canvas.captureStream();
    video.srcObject = stream;
    video.muted = true;
    video.play().catch(() => {});

    const onEnter = () => setIsActive(true);
    const onLeave = () => setIsActive(false);
    video.addEventListener("enterpictureinpicture", onEnter);
    video.addEventListener("leavepictureinpicture", onLeave);

    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () =>
        latestRef.current.onResume()
      );
      navigator.mediaSession.setActionHandler("pause", () =>
        latestRef.current.onPause()
      );
    }

    return () => {
      video.removeEventListener("enterpictureinpicture", onEnter);
      video.removeEventListener("leavepictureinpicture", onLeave);
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      }
      video.srcObject = null;
    };
  }, []);

  // Load lại ảnh nền khi đổi theme, rồi vẽ lại canvas mỗi khi countdown/trạng
  // thái/ảnh nền đổi.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (bgImageRef.current?.src !== backgroundUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = backgroundUrl;
      img.onload = () => draw(ctx, { remainingSeconds, paused: status === "paused", backgroundUrl }, img);
      bgImageRef.current = img;
    }

    draw(
      ctx,
      { remainingSeconds, paused: status === "paused", backgroundUrl },
      bgImageRef.current
    );
  }, [remainingSeconds, status, backgroundUrl]);

  // Chỉ bật cờ auto-PiP khi phiên đang working/paused — rời 2 trạng thái
  // này thì tắt cờ và thoát PiP nếu đang mở, để cửa sổ nổi không còn hiện
  // countdown đã hết ý nghĩa.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.autoPictureInPicture = active;
    if (!active && document.pictureInPictureElement === video) {
      document.exitPictureInPicture().catch(() => {});
    }
  }, [active]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement === video) {
      document.exitPictureInPicture().catch(() => {});
    } else {
      video.requestPictureInPicture().catch((err) => {
        console.error("[Zenzy] requestPictureInPicture failed", err);
      });
    }
  }, []);

  return { canvasRef, videoRef, supported, isActive, toggle };
}

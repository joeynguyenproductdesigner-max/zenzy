"use client";

import { useEffect, useRef } from "react";
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

// Vẽ lại khung hình đồng hồ lên canvas — nội dung của cửa sổ PiP dạng video
// (khác Document PiP, không có DOM/CSS), nên phải tự vẽ bằng Canvas 2D API.
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

// Lưới an toàn cho nút PiP thủ công (use-picture-in-picture.ts): nếu người
// dùng quên bấm nút PiP rồi mới chuyển tab, cửa sổ Document PiP (đủ nút,
// đúng Figma) không có cách nào tự mở — API đó bắt buộc user gesture đúng
// lúc gọi, `visibilitychange` không tính là gesture. Video PiP thì được
// trình duyệt miễn trừ quy định này (`autoPictureInPicture`), nên hook này
// chạy ngầm một video ẩn chỉ để tự nổi lên khi thật sự cần — đổi lại chỉ có
// countdown + play/pause gốc trình duyệt, không có nút Reset.
export function useAutoPipFallback({
  active,
  status,
  remainingSeconds,
  backgroundUrl,
  onPause,
  onResume,
}: {
  // active: có nên bật lưới an toàn — false khi Document PiP đang mở thủ
  // công (tránh 2 cửa sổ nổi cùng lúc) hoặc phiên không ở working/paused.
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

  const latestRef = useRef({ onPause, onResume });
  useEffect(() => {
    latestRef.current = { onPause, onResume };
  }, [onPause, onResume]);

  // Setup canvas → captureStream → video 1 lần khi mount, dọn dẹp khi unmount.
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ép khung hình cố định 30fps thay vì mặc định "chỉ phát khi canvas đổi"
    // (canvas của mình chỉ vẽ lại 1 lần/giây theo nhịp đếm ngược) — video
    // phát thưa có thể khiến Chrome không coi đây là media "đang phát" đủ
    // liên tục để tự kích hoạt auto-PiP lúc ẩn tab.
    const stream = canvas.captureStream(30);
    video.srcObject = stream;
    video.muted = true;
    video.play().catch(() => {});

    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () =>
        latestRef.current.onResume()
      );
      navigator.mediaSession.setActionHandler("pause", () =>
        latestRef.current.onPause()
      );
    }

    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      }
      video.srcObject = null;
    };
  }, []);

  // Load lại ảnh nền khi đổi theme, vẽ lại canvas mỗi khi countdown/trạng
  // thái/ảnh nền đổi.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (bgImageRef.current?.src !== backgroundUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = backgroundUrl;
      img.onload = () =>
        draw(ctx, { remainingSeconds, paused: status === "paused", backgroundUrl }, img);
      bgImageRef.current = img;
    }

    draw(
      ctx,
      { remainingSeconds, paused: status === "paused", backgroundUrl },
      bgImageRef.current
    );
  }, [remainingSeconds, status, backgroundUrl]);

  // Chỉ bật autoPictureInPicture khi active=true (working/paused VÀ Document
  // PiP chưa mở thủ công). Tắt thì thoát PiP nếu đang nổi do lưới an toàn.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.autoPictureInPicture = active;
    if (!active && document.pictureInPictureElement === video) {
      document.exitPictureInPicture().catch(() => {});
    }
  }, [active]);

  return { canvasRef, videoRef };
}

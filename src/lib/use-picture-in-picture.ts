"use client";

import { useCallback, useEffect, useState } from "react";

// Document Picture-in-Picture chưa có trong lib.dom.d.ts (API còn draft,
// CLAUDE.md quyết định #2 — chỉ Chrome/Edge hỗ trợ).
interface DocumentPictureInPicture {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
  window: Window | null;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

const PIP_WIDTH = 360;
const PIP_HEIGHT = 232;

// Copy các stylesheet của trang chính sang document của cửa sổ PiP — cửa sổ
// này có DOM/CSSOM riêng nên class Tailwind sẽ không render nếu không copy.
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

export function usePictureInPicture() {
  const [supported, setSupported] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time feature detection after mount, needed to avoid an SSR/client mismatch
    setSupported(
      typeof window !== "undefined" && "documentPictureInPicture" in window
    );
  }, []);

  const openPip = useCallback(async () => {
    if (!window.documentPictureInPicture) return;
    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: PIP_WIDTH,
        height: PIP_HEIGHT,
      });
      copyStylesheets(pip);
      pip.addEventListener("pagehide", () => setPipWindow(null), {
        once: true,
      });
      setPipWindow(pip);
    } catch (err) {
      // Trình duyệt báo hỗ trợ nhưng vẫn có thể từ chối mở cửa sổ thật (ví
      // dụ hệ điều hành/trình duyệt chặn tạo window) — không để lỗi rơi ra
      // ngoài làm crash UI, chỉ log lại và giữ nguyên trạng thái chưa mở.
      console.error("[Zenzy] documentPictureInPicture.requestWindow failed", err);
    }
  }, []);

  const closePip = useCallback(() => {
    window.documentPictureInPicture?.window?.close();
  }, []);

  // Đóng PiP tự động khi người dùng bấm quay lại tab Zenzy — PiP chỉ có ý
  // nghĩa khi đang ở tab khác, quay lại tab chính thì không cần nữa.
  useEffect(() => {
    if (!pipWindow) return;
    const onVisibilityChange = () => {
      if (!document.hidden) closePip();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [pipWindow, closePip]);

  return { supported, pipWindow, openPip, closePip };
}

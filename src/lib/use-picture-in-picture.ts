"use client";

import { useCallback, useEffect, useState } from "react";
import { isArcBrowser } from "./browser-support";

// Document Picture-in-Picture chưa có trong lib.dom.d.ts (API còn draft,
// CLAUDE.md quyết định #2 — chỉ Chrome/Edge dùng PiP).
interface DocumentPictureInPicture {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
  window: Window | null;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

const DOC_PIP_WIDTH = 380;
const DOC_PIP_HEIGHT = 280;

export type PipMode = "document" | null;

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

// PiP (Sprint 7) — chỉ Document Picture-in-Picture, chỉ Chrome/Edge thật.
// Arc có implement documentPictureInPicture nhưng cửa sổ đó chỉ là overlay
// dính theo tab (biến mất khi đổi tab) — không có ý nghĩa gì với PiP, và
// video-PiP thay thế (đã thử) chỉ cho countdown/play-pause, không tương
// tác được (Start/Reset/Snooze/Take a break) — Joey quyết định bỏ hẳn PiP
// trên Arc thay vì giữ bản rút gọn. Arc vì vậy coi như "không hỗ trợ",
// giống mọi trình duyệt khác không có documentPictureInPicture: ẩn icon,
// không hiện lỗi.
export function usePictureInPicture() {
  const [supported, setSupported] = useState(false);
  const [mode, setMode] = useState<PipMode>(null);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  useEffect(() => {
    const hasDocumentPip = "documentPictureInPicture" in window;
    const check = () => {
      setSupported(hasDocumentPip && !isArcBrowser());
    };
    check();

    // Arc inject CSS var dùng để detect (--arc-palette-title) một lúc sau
    // khi trang load, không phải ngay lúc mount — bản Sprint 7 trước cũng
    // gặp đúng race này. Thay vì đoán 1 mốc thời gian cố định (dễ sai nếu
    // Arc chậm hơn dự đoán), theo dõi trực tiếp lúc <head>/<html> đổi —
    // đúng lúc Arc chèn CSS — và re-check ngay khi đó. Chỉ theo dõi trong
    // 5s đầu sau mount rồi ngắt hẳn, không phải observer chạy nền vô thời hạn.
    const observer = new MutationObserver(check);
    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    const stopTimer = setTimeout(() => observer.disconnect(), 5000);

    return () => {
      observer.disconnect();
      clearTimeout(stopTimer);
    };
  }, []);

  const closePip = useCallback(() => {
    window.documentPictureInPicture?.window?.close();
  }, []);

  const openPip = useCallback(async () => {
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

  return { supported, mode, pipWindow, openPip, closePip };
}

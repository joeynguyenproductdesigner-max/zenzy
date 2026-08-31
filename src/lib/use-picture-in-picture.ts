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

    // Arc set CSS var dùng để detect (--arc-palette-title) một lúc sau khi
    // trang load, không phải ngay lúc mount — đã xác nhận thực tế trên Arc
    // (biến có tồn tại khi kiểm tra tay ngay sau đó, nhưng check đầu tiên
    // lúc mount thì chưa). Từng thử MutationObserver theo dõi DOM đổi
    // nhưng không bắt được — Arc nhiều khả năng set biến này ở tầng nội bộ
    // trình duyệt, không qua thao tác DOM nào quan sát được. Poll định kỳ
    // thay vì chờ mutation: không phụ thuộc CÁCH Arc set biến, chỉ cần đọc
    // lại giá trị. Bounded trong 3s đầu, không phải vòng lặp chạy nền mãi.
    const interval = setInterval(check, 200);
    const stopTimer = setTimeout(() => clearInterval(interval), 3000);

    return () => {
      clearInterval(interval);
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

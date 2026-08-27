"use client";

import { useEffect, useRef } from "react";
import type { SessionStatus } from "./use-work-session";
import { isNotificationSupported } from "./browser-support";

const SW_URL = "/sw.js";
const NOTIFICATION_TAG = "zenzy-eye-break";
const TITLE_FLASH_MS = 1000;

export function useEyeBreakNotifier({
  status,
  workMinutes,
  onSnooze,
  onTakeBreak,
}: {
  status: SessionStatus;
  workMinutes: number;
  onSnooze: () => void;
  onTakeBreak: () => void;
}) {
  const hiddenRef = useRef(false);

  useEffect(() => {
    const onVisibilityChange = () => {
      hiddenRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    hiddenRef.current = document.hidden;
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // Đăng ký lại mỗi lần mount nếu đã granted — register() idempotent với
  // cùng 1 URL, an toàn gọi lại, không tốn gì nếu đã đăng ký từ trước.
  useEffect(() => {
    if (!isNotificationSupported()) return;
    if (Notification.permission !== "granted") return;
    navigator.serviceWorker.register(SW_URL).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isNotificationSupported()) return;

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "zenzy-notification-action") return;
      if (event.data.action === "snooze-5") onSnooze();
      else if (event.data.action === "take-break") onTakeBreak();
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [onSnooze, onTakeBreak]);

  // Title-flash fallback cho Safari/iOS (CLAUDE.md, quyết định #4).
  useEffect(() => {
    if (status !== "prompt") return;
    if (isNotificationSupported()) return;
    if (!hiddenRef.current) return;

    const originalTitle = document.title;
    let showingAlert = false;
    const interval = setInterval(() => {
      showingAlert = !showingAlert;
      document.title = showingAlert ? "👀 Time to rest your eyes" : originalTitle;
    }, TITLE_FLASH_MS);

    return () => {
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, [status]);

  // Notification hệ thống — chỉ khi được hỗ trợ + đã granted + tab đang ẩn.
  // TODO(Sprint 7 — PiP): nếu PiP đang mở, update nội dung PiP ở đây thay vì
  // bắn notification hệ thống (kịch bản 2 trong 3 kịch bản notification).
  useEffect(() => {
    if (status !== "prompt") return;
    if (!isNotificationSupported()) return;
    if (Notification.permission !== "granted") return;
    if (!hiddenRef.current) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("Time to rest your eyes", {
        body: `You've focused for ${workMinutes} minutes. A short break helps.`,
        tag: NOTIFICATION_TAG,
        requireInteraction: true,
        // @ts-expect-error -- actions is valid on ServiceWorkerRegistration.showNotification but missing from the lib.dom NotificationOptions type
        actions: [
          { action: "snooze-5", title: "Snooze 5 min" },
          { action: "take-break", title: "Take a break" },
        ],
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- workMinutes chỉ dùng để soạn nội dung, không cần re-run khi đổi giữa chừng
  }, [status]);
}

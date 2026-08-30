// Feature/browser detection cho luồng thông báo (Sprint 3).
// Không dựng push server — chỉ dùng Notification API + Service Worker
// theo đúng quyết định kỹ thuật ở CLAUDE.md.

export function isNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

// Safari/iOS không hỗ trợ Notification API cho tab thường (chỉ PWA cài lên
// home screen mới có, từ iOS 16.4) — dùng để hiện cảnh báo giới hạn riêng,
// tách khỏi isNotificationSupported() vì Safari desktop thực ra có hỗ trợ.
export function isSafariOrIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  return isIOS || isSafari;
}

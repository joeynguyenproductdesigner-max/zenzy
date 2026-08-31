// Feature/browser detection cho luồng thông báo (Sprint 3) và PiP (Sprint 7).
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

// Arc tự nhận là Chrome qua User-Agent (không có cách detect chính thức),
// nên dò qua CSS custom property riêng mà Arc tự inject vào mọi trang
// (--arc-palette-title) — kỹ thuật cộng đồng hay dùng, không phải API
// chính thức, có thể lỗi nếu Arc đổi cách implement sau này.
// Gọi hàm này on-demand (lúc user bấm nút PiP), KHÔNG lúc mount — Arc chỉ
// inject var này sau khi trang đã load một lúc, nên detect lúc mount từng
// cần retry theo thời gian (nguồn bất ổn ở các lần thử Sprint 7 trước).
// Lúc user đã bấm nút thì trang chắc chắn đã load xong lâu rồi, không cần
// retry nữa.
export function isArcBrowser(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--arc-palette-title")
      .trim() !== ""
  );
}

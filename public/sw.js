// Zenzy service worker — chỉ lo 1 việc: xử lý click vào action button của
// notification nhắc nghỉ mắt, rồi báo lại cho tab Zenzy đang mở. Không có
// cache/offline logic vì không ai yêu cầu (không server, không cần backend).

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action || "open";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const existing = clientsList[0];
      if (existing) {
        existing.postMessage({ type: "zenzy-notification-action", action });
        await existing.focus();
      } else {
        const newClient = await self.clients.openWindow("/");
        if (newClient) {
          newClient.postMessage({ type: "zenzy-notification-action", action });
        }
      }
    })()
  );
});

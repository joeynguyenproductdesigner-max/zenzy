# Zenzy — Project Context for Claude Code

Đây là file ngữ cảnh cho Claude Code khi build sản phẩm Zenzy. Đọc file này trước khi bắt đầu bất kỳ task nào.

## Sản phẩm

**Zenzy** — website nghỉ mắt cho dân văn phòng Việt Nam. Định vị: "sức khỏe mắt có căn cứ khoa học" làm trục chính, trong lớp vỏ trải nghiệm thư giãn thẩm mỹ (khác Flocus — chỉ đẹp, không có yếu tố y khoa; khác EyeLeo — đúng y khoa nhưng khô khan).

- Slogan (EN): "Zen for your eyes"
- Slogan (VN): "Nghỉ mắt, đúng lúc, đúng cách"
- Ngôn ngữ UI: tiếng Anh (theo đúng mockup Figma hiện tại). Tiếng Việt để Phase 2.
- Nguyên tắc xuyên suốt: **không ép buộc** — mọi cơ chế nhắc nghỉ đều cho phép snooze/skip, ngôn ngữ UX luôn nhẹ nhàng, không dùng giọng điệu ép năng suất.

## Roadmap (Giai đoạn 7, v3 — đã duyệt vai trò C) — ĐÃ HOÀN THÀNH CẢ 9 SPRINT (31/08/2026)

9 sprint, ~8 tuần (nhịp 20 giờ/tuần), đã gồm 1 tuần buffer sau sprint rủi ro kỹ thuật cao nhất:

| Sprint | Nội dung | FR | Trạng thái |
|---|---|---|---|
| 0 | Setup Next.js + Tailwind + Vercel | Nền tảng | ✅ Xong |
| 1 | Dialog Themes + Sounds/Music (đẩy sớm) | FR-05, FR-06 | ✅ Xong |
| 2 | Main screen 3 trạng thái + time-tabs + câu chào | FR-01, FR-02, FR-08 | ✅ Xong |
| 3 | S0 + Service Worker + S3 (3 kịch bản notification) | FR-03 | ✅ Xong |
| 4 | **[BUFFER]** dự phòng rủi ro Sprint 3 | — | Không cần dùng tới |
| 5 | S4 — màn hình nghỉ mắt (video kinetic) | FR-04 | ✅ Xong |
| 6 | S5 — session recovery | — | ✅ Xong |
| 7 | PiP widget | FR-09 | ✅ Xong (Chrome/Edge; Arc không hỗ trợ, xem quyết định #2) |
| 8 | QA đa trình duyệt | NFR-04 | ✅ Xong phần tự động hoá được (xem "Việc còn mở") |

**Build từng sprint một, không nhảy cóc** — xác nhận xong 1 sprint (chạy thử được, đúng deliverable) mới sang sprint kế tiếp. Đã áp dụng đúng nguyên tắc này xuyên suốt — mọi sprint đều test/verify trước khi qua sprint kế.

## Media Assets — dùng `media-config.ts`, KHÔNG hard-code link

Toàn bộ URL ảnh/âm thanh/video (Cloudinary) đã có sẵn trong file `media-config.ts` đi kèm cùng thư mục project này. Khi code bất kỳ phần nào cần media (Themes, Sounds/Music, video S4), **import từ file này**, không tự bịa hoặc hard-code URL rải rác trong component.

- Toàn bộ URL **ẢNH** đã có `f_auto,q_auto` để Cloudinary tự tối ưu định dạng/dung lượng theo trình duyệt — không cần thêm transform khác trừ khi có lý do cụ thể.
- ⚠️ **URL VIDEO (.mp4) KHÔNG BAO GIỜ được thêm `f_auto,q_auto`** — khiến video không phát được (màn hình xám), xác nhận với Joey 28/08/2026 (kineticVisual) rồi lặp lại y hệt trên 9 theme video 31/08/2026 (vì fix trước đó bị một commit sau ghi đè, không phải do sửa lại — xem `git log -- media-config.ts`). Đã có `npm run build` tự chạy `scripts/check-media-config.js` chặn lỗi này tái diễn (build fail ngay nếu ai thêm `f_auto` vào url video) — xem cảnh báo đầu `media-config.ts`.
- Video kinetic visual (S4) chỉ có 1 URL duy nhất (`kineticVisual.url`, định dạng mp4 gốc, không transform), **không cần** tự tạo thêm bản `.webm` riêng như ghi chú kỹ thuật ban đầu ở Giai đoạn 6.
- 9 ảnh Themes hiện tại theo hướng **anime/cartoon** (văn phòng, nội thất nhà, phong cảnh mặt trăng) — đã xác nhận với Joey (25/08/2026), khác với mô tả gốc ở BRD/PRD (rừng, biển, mưa, quán cà phê). Đây là quyết định có chủ đích, không phải lỗi.

## Figma

File key: `YP7Ado9WkcgCRYXo1bvgmt`

Khi build từng màn hình, **dùng link riêng (copy link to selection) của đúng frame đang code**, không chỉ dùng link file chung — tránh Figma MCP đọc nhầm design token từ frame khác. Luôn dùng `get_design_context` để lấy đúng màu/spacing/radius/font, không đoán.

## Tech Stack (đã chốt ở Giai đoạn 6)

- **Framework:** Next.js (React) + Tailwind CSS
- **Hosting:** Vercel — subdomain miễn phí (chưa cần domain riêng)
- **Backend/Database:** KHÔNG CÓ — không đăng nhập, mọi state lưu ở `localStorage`
- **Media (audio/video):** Cloudinary (free tier) — xem mục "Media Assets" ở trên, nhúng qua `media-config.ts`

**⚠️ Deploy: KHÔNG bao giờ chạy `vercel --prod` (hay `vercel deploy`) thủ công từ máy local.** Project đã nối GitHub — mọi commit push lên `main` được Vercel tự build & deploy production. Lệnh CLI thủ công upload thẳng code trong thư mục máy tại thời điểm chạy, bỏ qua GitHub — nếu máy đó đang chậm hơn `origin/main` (rất dễ xảy ra), nó sẽ **ghi đè production về bản cũ hơn** dù GitHub vẫn đúng (đã xảy ra thật 03/09/2026, khiến mọi thay đổi cỡ chữ + theme video "biến mất" khỏi production dù code trên GitHub vẫn đủ). Cách deploy đúng duy nhất: `git push origin main`, không cần chạy `vercel` thủ công.

## Các quyết định kỹ thuật quan trọng — không tự ý đổi khi code

1. **Web Push Notification KHÔNG cần server.** Chỉ dùng `Notification.requestPermission()` + Service Worker + `registration.showNotification()`. Không dựng push server, không cần VAPID key.
2. **PiP dùng Document Picture-in-Picture API** (`document.documentPictureInPicture`), **chỉ Chrome/Edge thật**. Cửa sổ nổi custom React/DOM (portal), mirror đủ 4 trạng thái có mockup Figma (ready/working/paused/prompt) — có header (nút thu-về-tab, tên, đóng), Start/Pause/Continue/Reset/Snooze/Take a break bấm được ngay trong cửa sổ. **Arc** đã thử 1 nhánh rút gọn qua video PiP (`canvas.captureStream()` → `<video>.requestPictureInPicture()`) nhưng không tương tác được (chỉ play/pause gốc trình duyệt, không có Reset/Snooze/Take a break) — Joey quyết định (31/08/2026) **bỏ hẳn PiP trên Arc** thay vì giữ bản rút gọn, coi Arc như mọi trình duyệt không hỗ trợ: ẩn icon, không hiện lỗi. Lý do gốc Arc không dùng được Document PiP thật: implement của Arc chỉ là overlay dính theo tab (biến mất khi đổi tab), không phải cửa sổ nổi độc lập — nếu Arc tự sửa việc này sau này thì có thể bỏ hẳn nhánh loại-trừ và cho Arc dùng chung Document PiP. Chỉ mở PiP **một lần duy nhất trong handler click** — không auto-trigger, không chạy nhiều nhánh song song (nguyên nhân chính khiến 6 lần thử Sprint 7 trước bất ổn, xem `git log` commit `a8f0525`).
3. **Session recovery (S5):** lưu timestamp đóng tab vào `localStorage`. Nếu mở lại sau > **2 giờ**, tự ẩn nút "Resume session", chỉ hiện "Start new".
4. **Fallback Safari/iOS:** không có action button trong notification, không có PiP → dùng nhấp nháy `document.title` làm tín hiệu dự phòng, cảnh báo giới hạn ngay từ Main screen khi phát hiện Safari/iOS.
5. **Icon "maximize"** trên Main/S4 → dùng Fullscreen API chuẩn (`document.requestFullscreen()`).
6. **Kinetic visual (S4):** video loop, muted, autoplay — URL lấy từ `media-config.ts` (`kineticVisual.url`), không hard-code.
7. **Mốc thời gian làm việc sâu:** 5 lựa chọn 20/45/60/90/120 phút, mặc định 60. Thời gian nghỉ tính tỷ lệ theo bảng ở Giai đoạn 2 (không cố định 1 mức nghỉ cho mọi mốc).
8. **Nguồn trích dẫn y khoa:** chỉ dùng American Optometric Association (AOA — nguồn chính) và American Academy of Ophthalmology (AAO — nguồn phụ). Không tự bịa số liệu y khoa.
9. **Chỉ desktop, không cần responsive mobile.** Joey xác nhận (31/08/2026, lúc QA Sprint 8) — UI dùng px cố định lớn theo đúng canvas Figma gốc (1440×960), vỡ layout ở viewport nhỏ là có chủ đích, không phải bug. Đối tượng dùng Zenzy đang ngồi máy tính, không phải điện thoại. Không tự ý thêm breakpoint/responsive trừ khi Joey đổi ý.

## 6 màn hình / thành phần chính

| Mã | Tên | Trạng thái |
|---|---|---|
| S0 | Xin quyền thông báo | ✅ Đã build, đã test |
| Main | Màn hình chính (Sẵn sàng / Đang làm việc / Đang nghỉ) | ✅ Đã build, đã test |
| PiP | Khung đồng hồ nổi | ✅ Đã build (Chrome/Edge), đã test |
| Dialog | Themes / Sounds / Music | ✅ Đã build, đã test — Themes giờ có cả video (9 video + 4 ảnh) |
| S3 | Thông báo đẩy (3 kịch bản) | ✅ Đã build, đã test |
| S4 | Màn hình nghỉ mắt | ✅ Đã build, đã test — icon mắt là Lottie animation |
| S5 | Tiếp tục phiên cũ | ✅ Đã build, đã test |

## Việc còn mở

- Đã hoàn thành cả 9 sprint theo roadmap. Sprint 8 (QA) đã tự test được trong sandbox: toàn luồng chính không lỗi console, keyboard accessibility ok, session recovery đúng cả 2 nhánh (<2h/>2h).
- **Còn cần Joey tự verify trên trình duyệt/thiết bị thật** (sandbox chỉ có 1 Chromium): Safari desktop (đặc biệt cảnh báo giới hạn notification, quyết định #4), Arc (PiP đã ẩn đúng chưa), Firefox nếu cần hỗ trợ, Chrome/Edge thật (PiP style).
- Production: `https://zenzy-seven.vercel.app` (hoặc domain mới nếu Joey đã đổi) — Deployment Protection đã tắt, public, có thể gửi người khác trải nghiệm.
- Không còn việc chặn tiến độ khác. Asset media (ảnh/âm thanh/video) đã đầy đủ trong `media-config.ts`.

## Tài liệu tham khảo đầy đủ

Xem thêm các file trong project: Giai đoạn 1–7 (Discovery, Market Research, BRD v3, PRD, UX Flow v3, Technical Planning, Roadmap & Sprint Planning v3) — mỗi file có đầy đủ lý do đằng sau từng quyết định, tránh hỏi lại PM những gì đã chốt.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

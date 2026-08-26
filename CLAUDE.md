# Zenzy — Project Context for Claude Code

Đây là file ngữ cảnh cho Claude Code khi build sản phẩm Zenzy. Đọc file này trước khi bắt đầu bất kỳ task nào.

## Sản phẩm

**Zenzy** — website nghỉ mắt cho dân văn phòng Việt Nam. Định vị: "sức khỏe mắt có căn cứ khoa học" làm trục chính, trong lớp vỏ trải nghiệm thư giãn thẩm mỹ (khác Flocus — chỉ đẹp, không có yếu tố y khoa; khác EyeLeo — đúng y khoa nhưng khô khan).

- Slogan (EN): "Zen for your eyes"
- Slogan (VN): "Nghỉ mắt, đúng lúc, đúng cách"
- Ngôn ngữ UI: tiếng Anh (theo đúng mockup Figma hiện tại). Tiếng Việt để Phase 2.
- Nguyên tắc xuyên suốt: **không ép buộc** — mọi cơ chế nhắc nghỉ đều cho phép snooze/skip, ngôn ngữ UX luôn nhẹ nhàng, không dùng giọng điệu ép năng suất.

## Roadmap (Giai đoạn 7, v3 — đã duyệt vai trò C)

9 sprint, ~8 tuần (nhịp 20 giờ/tuần), đã gồm 1 tuần buffer sau sprint rủi ro kỹ thuật cao nhất:

| Sprint | Nội dung | FR |
|---|---|---|
| 0 | Setup Next.js + Tailwind + Vercel | Nền tảng |
| 1 | Dialog Themes + Sounds/Music (đẩy sớm) | FR-05, FR-06 |
| 2 | Main screen 3 trạng thái + time-tabs + câu chào | FR-01, FR-02, FR-08 |
| 3 | S0 + Service Worker + S3 (3 kịch bản notification) | FR-03 |
| 4 | **[BUFFER]** dự phòng rủi ro Sprint 3 | — |
| 5 | S4 — màn hình nghỉ mắt (video kinetic) | FR-04 |
| 6 | S5 — session recovery | — |
| 7 | PiP widget | FR-09 |
| 8 | QA đa trình duyệt | NFR-04 |

**Build từng sprint một, không nhảy cóc** — xác nhận xong 1 sprint (chạy thử được, đúng deliverable) mới sang sprint kế tiếp.

## Media Assets — dùng `media-config.ts`, KHÔNG hard-code link

Toàn bộ URL ảnh/âm thanh/video (Cloudinary) đã có sẵn trong file `media-config.ts` đi kèm cùng thư mục project này. Khi code bất kỳ phần nào cần media (Themes, Sounds/Music, video S4), **import từ file này**, không tự bịa hoặc hard-code URL rải rác trong component.

- Toàn bộ URL đã có `f_auto,q_auto` để Cloudinary tự tối ưu định dạng/dung lượng theo trình duyệt — không cần thêm transform khác trừ khi có lý do cụ thể.
- Video kinetic visual (S4) chỉ có 1 URL duy nhất (`kineticVisual.url`, định dạng mp4 gốc) — nhờ `f_auto`, Cloudinary tự phục vụ đúng định dạng theo trình duyệt, **không cần** tự tạo thêm bản `.webm` riêng như ghi chú kỹ thuật ban đầu ở Giai đoạn 6.
- 9 ảnh Themes hiện tại theo hướng **anime/cartoon** (văn phòng, nội thất nhà, phong cảnh mặt trăng) — đã xác nhận với Joey (25/08/2026), khác với mô tả gốc ở BRD/PRD (rừng, biển, mưa, quán cà phê). Đây là quyết định có chủ đích, không phải lỗi.

## Figma

File key: `YP7Ado9WkcgCRYXo1bvgmt`

Khi build từng màn hình, **dùng link riêng (copy link to selection) của đúng frame đang code**, không chỉ dùng link file chung — tránh Figma MCP đọc nhầm design token từ frame khác. Luôn dùng `get_design_context` để lấy đúng màu/spacing/radius/font, không đoán.

## Tech Stack (đã chốt ở Giai đoạn 6)

- **Framework:** Next.js (React) + Tailwind CSS
- **Hosting:** Vercel — subdomain miễn phí (chưa cần domain riêng)
- **Backend/Database:** KHÔNG CÓ — không đăng nhập, mọi state lưu ở `localStorage`
- **Media (audio/video):** Cloudinary (free tier) — xem mục "Media Assets" ở trên, nhúng qua `media-config.ts`

## Các quyết định kỹ thuật quan trọng — không tự ý đổi khi code

1. **Web Push Notification KHÔNG cần server.** Chỉ dùng `Notification.requestPermission()` + Service Worker + `registration.showNotification()`. Không dựng push server, không cần VAPID key.
2. **PiP dùng Document Picture-in-Picture API** (`document.documentPictureInPicture`). Chỉ Chrome/Edge hỗ trợ — nếu trình duyệt không hỗ trợ, ẩn icon PiP, không hiện lỗi.
3. **Session recovery (S5):** lưu timestamp đóng tab vào `localStorage`. Nếu mở lại sau > **2 giờ**, tự ẩn nút "Resume session", chỉ hiện "Start new".
4. **Fallback Safari/iOS:** không có action button trong notification, không có PiP → dùng nhấp nháy `document.title` làm tín hiệu dự phòng, cảnh báo giới hạn ngay từ Main screen khi phát hiện Safari/iOS.
5. **Icon "maximize"** trên Main/S4 → dùng Fullscreen API chuẩn (`document.requestFullscreen()`).
6. **Kinetic visual (S4):** video loop, muted, autoplay — URL lấy từ `media-config.ts` (`kineticVisual.url`), không hard-code.
7. **Mốc thời gian làm việc sâu:** 5 lựa chọn 20/45/60/90/120 phút, mặc định 60. Thời gian nghỉ tính tỷ lệ theo bảng ở Giai đoạn 2 (không cố định 1 mức nghỉ cho mọi mốc).
8. **Nguồn trích dẫn y khoa:** chỉ dùng American Optometric Association (AOA — nguồn chính) và American Academy of Ophthalmology (AAO — nguồn phụ). Không tự bịa số liệu y khoa.

## 6 màn hình / thành phần chính

| Mã | Tên | Trạng thái |
|---|---|---|
| S0 | Xin quyền thông báo | Có mockup Figma |
| Main | Màn hình chính (Sẵn sàng / Đang làm việc / Đang nghỉ) | Có mockup Figma |
| PiP | Khung đồng hồ nổi | Có mockup Figma |
| Dialog | Themes / Sounds / Music | Có mockup Figma + media đã sẵn sàng (`media-config.ts`) |
| S3 | Thông báo đẩy (3 kịch bản) | Có mockup Figma |
| S4 | Màn hình nghỉ mắt | Có mockup Figma + video đã sẵn sàng (`media-config.ts`) |
| S5 | Tiếp tục phiên cũ | Có mockup Figma |

## Việc còn mở

- Không còn việc chặn tiến độ. Asset media (ảnh/âm thanh/video) đã đầy đủ trong `media-config.ts` — mục "Việc còn mở" ở bản CLAUDE.md trước đó (link asset video, danh sách âm thanh) đã được giải quyết (25/08/2026).
- Timeline dự án hiện là **~8 tuần** (BRD v3, đã gồm buffer) — nếu Sprint 3 (Service Worker/Notification) trượt tiến độ quá phần buffer, cần báo lại PM để cân nhắc cắt giảm phạm vi thay vì âm thầm kéo dài.

## Tài liệu tham khảo đầy đủ

Xem thêm các file trong project: Giai đoạn 1–7 (Discovery, Market Research, BRD v3, PRD, UX Flow v3, Technical Planning, Roadmap & Sprint Planning v3) — mỗi file có đầy đủ lý do đằng sau từng quyết định, tránh hỏi lại PM những gì đã chốt.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

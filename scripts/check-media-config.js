// Chặn lại đúng lỗi đã xảy ra 2 lần: ai đó thêm f_auto,q_auto vào URL video
// (.mp4) trong media-config.ts, khiến video không phát được (màn hình xám) —
// xem cảnh báo ở đầu media-config.ts. Chạy tự động trước "npm run build"
// (xem "prebuild" trong package.json) nên build local lẫn trên Vercel đều
// fail ngay nếu lỗi này tái diễn, thay vì âm thầm lên production.
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "media-config.ts");
const content = fs.readFileSync(filePath, "utf8");

const badLines = content
  .split("\n")
  .map((line, i) => ({ line, number: i + 1 }))
  .filter(({ line }) => /f_auto/.test(line) && /\.mp4"/.test(line));

if (badLines.length > 0) {
  console.error(
    "\n✖ media-config.ts: phát hiện f_auto,q_auto trên URL video (.mp4) — sẽ khiến video không phát được (màn hình xám).\n" +
      "  f_auto chỉ dùng cho ảnh (posterUrl, theme ảnh tĩnh), không dùng cho url video.\n"
  );
  for (const { line, number } of badLines) {
    console.error(`  media-config.ts:${number}: ${line.trim()}`);
  }
  console.error("\n  Xem cảnh báo ở đầu media-config.ts để biết chi tiết.\n");
  process.exit(1);
}

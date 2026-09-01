import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icon khi lưu Zenzy ra màn hình chính iOS/iPadOS (Add to Home Screen) —
// cùng chữ "Z" trên nền tím thương hiệu, chỉ khác kích thước theo chuẩn Apple.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#5e3bee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 120,
          fontWeight: 900,
          color: "white",
        }}
      >
        Z
      </div>
    ),
    { ...size }
  );
}

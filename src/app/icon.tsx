import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon riêng của Zenzy — thay icon tam giác mặc định của Next.js.
// Chữ "Z" trên nền tím thương hiệu (#5e3bee, màu nút chính xuyên suốt app).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#5e3bee",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
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

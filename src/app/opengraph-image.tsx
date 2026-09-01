import { ImageResponse } from "next/og";
import { themeBackgrounds } from "../../media-config";

export const alt = "Zenzy — Zen for your eyes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dùng poster (ảnh tĩnh) của theme mặc định làm nền — theme mặc định hiện
// là video (Cozy Cabin Rainy Day), ImageResponse/Satori chỉ render được
// ảnh tĩnh nên phải dùng posterUrl thay vì url gốc.
export default async function Image() {
  const defaultTheme = themeBackgrounds[0];
  const backgroundUrl = defaultTheme.posterUrl ?? defaultTheme.url;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
        }}
      >
        <img
          src={backgroundUrl}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            padding: "0 90px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 104,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            Zenzy
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: "rgba(255,255,255,0.85)",
              marginTop: 12,
            }}
          >
            Zen for your eyes
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.7)",
              marginTop: 36,
            }}
          >
            Nghỉ mắt, đúng lúc, đúng cách.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

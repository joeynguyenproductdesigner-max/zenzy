import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Degular Demo — font chính theo Figma. File hiện dùng để dev/preview
// (license đi kèm chỉ ghi "Personal Use Only" từ befonts.com, không phải
// bản license thương mại chính chủ OhNoType Co) — PM cần mua license
// thương mại trước khi deploy bản public thật.
const degular = localFont({
  src: [
    { path: "../fonts/degular/DegularDemo-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/degular/DegularDemo-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/degular/DegularDemo-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../fonts/degular/DegularDemo-Semibold.otf", weight: "600", style: "normal" },
    { path: "../fonts/degular/DegularDemo-Bold.otf", weight: "700", style: "normal" },
    { path: "../fonts/degular/DegularDemo-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-degular",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zenzy — Zen for your eyes",
  description: "Nghỉ mắt, đúng lúc, đúng cách",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${degular.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

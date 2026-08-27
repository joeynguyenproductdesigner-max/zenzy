"use client";

import Image from "next/image";
import { themeBackgrounds } from "../../../media-config";
import { DialogPanel } from "./DialogPanel";

export function ThemeDialog({
  open,
  selectedThemeId,
  onSelectTheme,
}: {
  open: boolean;
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
}) {
  if (!open) return null;

  return (
    <DialogPanel>
      <p className="text-[32px] font-black text-white">Themes</p>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-x-3 gap-y-4 overflow-y-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {themeBackgrounds.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onSelectTheme(theme.id)}
            className="flex flex-col gap-2 text-left"
          >
            <div
              className={`rounded-xl transition ${
                selectedThemeId === theme.id ? "ring-2 ring-[#5e3bee]" : ""
              }`}
            >
              <div className="relative h-[135px] w-full overflow-hidden rounded-xl bg-white/5">
                <Image
                  src={theme.url}
                  alt={theme.name}
                  fill
                  sizes="(max-width: 727px) 45vw, 318px"
                  className="object-cover"
                />
              </div>
            </div>
            <p className="truncate text-[13px] font-semibold text-white">
              {theme.name}
            </p>
          </button>
        ))}
      </div>
    </DialogPanel>
  );
}

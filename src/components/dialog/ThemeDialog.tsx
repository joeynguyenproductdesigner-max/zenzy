"use client";

import Image from "next/image";
import { themeBackgrounds } from "../../../media-config";
import { useLocalStorage } from "@/lib/use-local-storage";
import { DialogPanel } from "./DialogPanel";

export function ThemeDialog({ open }: { open: boolean }) {
  const [selectedThemeId, setSelectedThemeId] = useLocalStorage<string>(
    "zenzy:theme",
    themeBackgrounds[0].id
  );

  if (!open) return null;

  return (
    <DialogPanel>
      <p className="text-[32px] font-black text-white">Themes</p>
      <div className="grid max-h-[600px] grid-cols-2 gap-x-3 gap-y-4 overflow-y-auto pr-1">
        {themeBackgrounds.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => setSelectedThemeId(theme.id)}
            className={`flex flex-col gap-2 rounded-xl text-left transition ${
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
            <p className="truncate text-[13px] font-semibold text-white">
              {theme.name}
            </p>
          </button>
        ))}
      </div>
    </DialogPanel>
  );
}

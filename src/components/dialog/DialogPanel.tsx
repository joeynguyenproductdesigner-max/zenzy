import type { ReactNode } from "react";

export function DialogPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[580px] w-[727px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-232px)] flex-col gap-6 rounded-[20px] border border-white/20 bg-black/50 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.25)] backdrop-blur-[30px]">
      {children}
    </div>
  );
}

export function DialogIconButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center rounded-lg border border-white/40 p-2 text-white transition ${
        active ? "bg-white/50" : "bg-white/20 hover:bg-white/30"
      }`}
    >
      {children}
    </button>
  );
}

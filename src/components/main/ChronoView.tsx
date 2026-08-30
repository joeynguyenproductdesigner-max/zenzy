import { TimeTabs } from "./TimeTabs";
import { formatCountdown } from "@/lib/work-durations";
import type { SessionStatus } from "@/lib/use-work-session";
import { RefreshCwIcon } from "@/icons/RefreshCwIcon";
import { PictureInPictureIcon } from "@/icons/PictureInPictureIcon";

export function ChronoView({
  status,
  workMinutes,
  remainingSeconds,
  onSelectDuration,
  onStart,
  onPause,
  onResume,
  onReset,
  pipSupported,
  pipActive,
  onTogglePip,
}: {
  status: Extract<SessionStatus, "ready" | "working" | "paused">;
  workMinutes: number;
  remainingSeconds: number;
  onSelectDuration: (minutes: number) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  pipSupported: boolean;
  pipActive: boolean;
  onTogglePip: () => void;
}) {
  const running = status !== "ready";

  return (
    <div className="flex w-[640px] flex-col items-center gap-6">
      <TimeTabs
        selectedMinutes={workMinutes}
        onSelect={onSelectDuration}
        disabled={running}
      />
      <p className="w-full text-center text-[144px] font-black leading-[1.05] text-white">
        {formatCountdown(remainingSeconds)}
      </p>
      <div className="flex items-center gap-4">
        {status === "ready" && (
          <button
            type="button"
            onClick={onStart}
            className="rounded-[24px] bg-[#5e3bee] px-9 py-3 text-[16px] font-bold text-white"
          >
            Start working
          </button>
        )}
        {status === "working" && (
          <button
            type="button"
            onClick={onPause}
            className="w-[179px] rounded-[24px] bg-[#c2b4fb] px-9 py-3 text-[16px] font-bold text-[#5e3bee]"
          >
            Pause
          </button>
        )}
        {status === "paused" && (
          <button
            type="button"
            onClick={onResume}
            className="w-[179px] rounded-[24px] bg-[#5e3bee] px-9 py-3 text-[16px] font-bold text-white"
          >
            Continue
          </button>
        )}
        {running && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset"
            className="flex size-11 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white hover:bg-white/30"
          >
            <RefreshCwIcon size={16} />
          </button>
        )}
        {pipSupported && running && (
          <button
            type="button"
            onClick={onTogglePip}
            aria-label="Picture in picture"
            title={
              pipActive
                ? "Picture in picture is on — switching tabs floats it, coming back closes it"
                : "Picture in picture"
            }
            className={`flex size-11 items-center justify-center rounded-full border text-white ${
              pipActive
                ? "border-[#5e3bee] bg-[#5e3bee]"
                : "border-white/40 bg-white/20 hover:bg-white/30"
            }`}
          >
            <PictureInPictureIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

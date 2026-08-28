import { ClockIcon } from "@/icons/ClockIcon";

export function SessionRecoveryPrompt({
  name,
  minutesLeft,
  onResume,
  onStartNew,
}: {
  name?: string;
  minutesLeft: number;
  onResume: () => void;
  onStartNew: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex size-[120px] items-center justify-center rounded-[60px] border-[1.875px] border-white/20 bg-white/[0.08] shadow-[0_15px_45px_rgba(94,59,238,0.2)] backdrop-blur-[22.5px]">
        <ClockIcon size={52.5} />
      </div>
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-1 text-center text-white">
          <p className="text-[40px] font-bold">
            Welcome back{name ? `, ${name}` : ""} 👋
          </p>
          <p className="w-[506px] text-[24px]">
            You had {minutesLeft} minute{minutesLeft === 1 ? "" : "s"} left in
            your last session.
            <br />
            Want to pick up where you left off?
          </p>
        </div>
        <div className="flex h-[47px] w-full items-start justify-center gap-4">
          <button
            type="button"
            onClick={onStartNew}
            className="flex flex-1 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-[16px] font-medium text-white"
          >
            Start new
          </button>
          <button
            type="button"
            onClick={onResume}
            className="flex flex-1 items-center justify-center rounded-full bg-[#5e3bee] px-6 py-3.5 text-[16px] font-semibold text-white"
          >
            Resume session
          </button>
        </div>
      </div>
    </div>
  );
}

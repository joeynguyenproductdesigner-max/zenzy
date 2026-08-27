export function WorkEndedPrompt({
  name,
  workMinutes,
  onSnooze,
  onTakeBreak,
}: {
  name?: string;
  workMinutes: number;
  onSnooze: () => void;
  onTakeBreak: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex size-[120px] items-center justify-center rounded-[60px] border-[1.875px] border-white/20 bg-white/[0.08] shadow-[0_15px_45px_rgba(94,59,238,0.2)] backdrop-blur-[22.5px]">
        <p className="text-[64px]">👀</p>
      </div>
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-1 text-center text-white">
          <p className="text-[40px] font-bold">
            {name ? `Hey ${name}, time` : "Time"} to rest your eyes
          </p>
          <p className="text-[24px]">
            You&apos;ve been focused for {workMinutes} minutes.
            <br />
            Let&apos;s give your eyes a short break.
          </p>
        </div>
        <div className="flex h-[47px] w-full items-start justify-center gap-4">
          <button
            type="button"
            onClick={onSnooze}
            className="flex flex-1 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-[16px] font-medium text-white"
          >
            Snooze 5 min
          </button>
          <button
            type="button"
            onClick={onTakeBreak}
            className="flex flex-1 items-center justify-center rounded-full bg-[#5e3bee] px-6 py-3.5 text-[16px] font-semibold text-white"
          >
            Take a break
          </button>
        </div>
      </div>
    </div>
  );
}

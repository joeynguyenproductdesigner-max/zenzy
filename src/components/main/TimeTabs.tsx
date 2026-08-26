import { WORK_DURATIONS } from "@/lib/work-durations";

export function TimeTabs({
  selectedMinutes,
  onSelect,
  disabled,
}: {
  selectedMinutes: number;
  onSelect: (minutes: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {WORK_DURATIONS.map(({ minutes }) => {
        const active = minutes === selectedMinutes;
        return (
          <button
            key={minutes}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(minutes)}
            className={`rounded-[20px] px-4 py-2 text-[16px] whitespace-nowrap transition ${
              active
                ? "bg-[#5e3bee] font-semibold text-white"
                : "border border-white/20 bg-white/10 text-white disabled:opacity-70"
            } ${disabled && !active ? "cursor-not-allowed" : ""}`}
          >
            {minutes} mins
          </button>
        );
      })}
    </div>
  );
}

// Mốc thời gian làm việc sâu + thời gian nghỉ tương ứng.
// Bảng gốc (Giai đoạn 2, mục 3.2) cho khoảng thời gian nghỉ ở 45/90/120 phút;
// đã chốt với PM lấy cận dưới của khoảng: 30s / 3 phút / 5 phút.
export interface WorkDurationOption {
  minutes: number;
  breakSeconds: number;
}

export const WORK_DURATIONS: WorkDurationOption[] = [
  { minutes: 20, breakSeconds: 20 },
  { minutes: 45, breakSeconds: 30 },
  { minutes: 60, breakSeconds: 60 },
  { minutes: 90, breakSeconds: 3 * 60 },
  { minutes: 120, breakSeconds: 5 * 60 },
];

export const DEFAULT_WORK_MINUTES = 60;

export function breakSecondsFor(minutes: number): number {
  return (
    WORK_DURATIONS.find((option) => option.minutes === minutes)
      ?.breakSeconds ?? 60
  );
}

export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const mm = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const ss = (clamped % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "./use-local-storage";
import { DEFAULT_WORK_MINUTES, breakSecondsFor } from "./work-durations";

export type SessionStatus =
  | "ready"
  | "working"
  | "paused"
  | "prompt"
  | "break";

const SNOOZE_SECONDS = 5 * 60;

export function useWorkSession() {
  const [workMinutes, setWorkMinutes] = useLocalStorage<number>(
    "zenzy:work-duration",
    DEFAULT_WORK_MINUTES
  );
  const [status, setStatus] = useState<SessionStatus>("ready");
  const [remainingSeconds, setRemainingSeconds] = useState(
    workMinutes * 60
  );
  const tickingRef = useRef<SessionStatus>(status);
  useEffect(() => {
    tickingRef.current = status;
  }, [status]);

  // Đổi mốc thời gian khi đang ở trạng thái Sẵn sàng thì đồng bộ lại countdown hiển thị.
  useEffect(() => {
    if (status === "ready") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing the displayed countdown to the newly picked duration, not a value derivable during render
      setRemainingSeconds(workMinutes * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ đồng bộ khi workMinutes đổi, không phải khi status đổi
  }, [workMinutes]);

  // Đếm theo mốc thời gian thực (Date.now()) thay vì trừ 1 giây mỗi tick.
  // Trình duyệt (kể cả Arc) chủ động làm chậm/bỏ tick của setInterval khi
  // tab chạy nền để tiết kiệm pin — nếu đếm kiểu "mỗi tick trừ 1" thì số
  // hiển thị bị sai/đứng lại, và vì không bao giờ thật sự chạm mốc 0 nên
  // không bao giờ chuyển sang "prompt" → notification không bao giờ bắn.
  // Tính lại theo mốc kết thúc thật thì dù tick có bị trễ/thưa, lần nó
  // chạy lại vẫn tính đúng đã trôi bao nhiêu giây.
  useEffect(() => {
    if (status !== "working" && status !== "break") return;

    const endTime = Date.now() + remainingSeconds * 1000;

    const tick = () => {
      const secondsLeft = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);
      if (secondsLeft <= 0) {
        if (tickingRef.current === "working") {
          setStatus("prompt");
        } else {
          setStatus("ready");
          setRemainingSeconds(workMinutes * 60);
        }
      }
    };

    const interval = setInterval(tick, 1000);
    // Cập nhật ngay khi tab active lại, không cần chờ tick kế tiếp.
    const onVisibilityChange = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ muốn chốt mốc kết thúc mới khi CHUYỂN status (start/resume/snooze/takeBreak), không phải mỗi khi remainingSeconds tự đếm xuống bên trong chính effect này
  }, [status, workMinutes]);

  const selectDuration = useCallback(
    (minutes: number) => {
      if (status !== "ready") return;
      setWorkMinutes(minutes);
    },
    [status, setWorkMinutes]
  );

  const start = useCallback(() => setStatus("working"), []);
  const pause = useCallback(() => setStatus("paused"), []);
  const resume = useCallback(() => setStatus("working"), []);
  const reset = useCallback(() => {
    setStatus("ready");
    setRemainingSeconds(workMinutes * 60);
  }, [workMinutes]);
  const snooze = useCallback(() => {
    setRemainingSeconds(SNOOZE_SECONDS);
    setStatus("working");
  }, []);
  const takeBreak = useCallback(() => {
    setRemainingSeconds(breakSecondsFor(workMinutes));
    setStatus("break");
  }, [workMinutes]);
  const skipBreak = useCallback(() => {
    setStatus("ready");
    setRemainingSeconds(workMinutes * 60);
  }, [workMinutes]);

  return {
    status,
    workMinutes,
    remainingSeconds,
    selectDuration,
    start,
    pause,
    resume,
    reset,
    snooze,
    takeBreak,
    skipBreak,
  };
}

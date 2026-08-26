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

  useEffect(() => {
    if (status !== "working" && status !== "break") return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (tickingRef.current === "working") {
            setStatus("prompt");
          } else {
            setStatus("ready");
            return workMinutes * 60;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
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

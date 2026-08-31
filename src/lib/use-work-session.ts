"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "./use-local-storage";
import { DEFAULT_WORK_MINUTES, breakSecondsFor } from "./work-durations";

export type SessionStatus =
  | "recovery"
  | "ready"
  | "working"
  | "paused"
  | "prompt"
  | "break";

const SNOOZE_SECONDS = 5 * 60;

// Session recovery (CLAUDE.md quyết định #3): lưu lại phiên đang dang dở khi
// tab bị ẩn/đóng, để hỏi resume nếu mở lại trong vòng 2 giờ.
const RECOVERY_KEY = "zenzy:session-recovery";
const RECOVERY_WINDOW_MS = 2 * 60 * 60 * 1000;

interface RecoverySnapshot {
  closedAt: number;
  workMinutes: number;
  remainingSeconds: number;
}

function readRecovery(): RecoverySnapshot | null {
  try {
    const raw = window.localStorage.getItem(RECOVERY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RecoverySnapshot;
  } catch {
    return null;
  }
}

function clearRecovery() {
  try {
    window.localStorage.removeItem(RECOVERY_KEY);
  } catch {
    // Ignore storage errors (e.g. private mode).
  }
}

export function useWorkSession() {
  const [workMinutes, setWorkMinutes] = useLocalStorage<number>(
    "zenzy:work-duration",
    DEFAULT_WORK_MINUTES
  );
  const [status, setStatus] = useState<SessionStatus>("ready");
  const [remainingSeconds, setRemainingSeconds] = useState(
    workMinutes * 60
  );
  const [recovery, setRecovery] = useState<RecoverySnapshot | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const tickingRef = useRef<SessionStatus>(status);
  useEffect(() => {
    tickingRef.current = status;
  }, [status]);

  // Phát hiện phiên dang dở ngay khi mount (chỉ chạy client — tránh mismatch SSR).
  useEffect(() => {
    const snapshot = readRecovery();
    if (snapshot && Date.now() - snapshot.closedAt <= RECOVERY_WINDOW_MS) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of localStorage after mount, needed to avoid an SSR/client mismatch
      setRecovery(snapshot);
      setStatus("recovery");
    } else {
      // Quá 2 giờ (hoặc không có phiên dang dở nào): bỏ hẳn màn S5, vào
      // thẳng màn chính — chỉ đổi câu chào thành "Welcome back" nếu trước đó
      // có phiên đã hết hạn, để vẫn giữ cảm giác "chào lại người quen".
      if (snapshot) setShowWelcomeBack(true);
      clearRecovery();
    }
  }, []);

  // Lưu snapshot khi tab bị ẩn/đóng trong lúc đang "working"/"paused" — dùng
  // ref để đăng ký listener đúng 1 lần, không phải mỗi khi remainingSeconds
  // đổi (tick mỗi giây).
  const latestSessionRef = useRef({ status, workMinutes, remainingSeconds });
  useEffect(() => {
    latestSessionRef.current = { status, workMinutes, remainingSeconds };
  }, [status, workMinutes, remainingSeconds]);

  useEffect(() => {
    const save = () => {
      const current = latestSessionRef.current;
      if (current.status !== "working" && current.status !== "paused") return;
      try {
        window.localStorage.setItem(
          RECOVERY_KEY,
          JSON.stringify({
            closedAt: Date.now(),
            workMinutes: current.workMinutes,
            remainingSeconds: current.remainingSeconds,
          })
        );
      } catch {
        // Ignore storage errors (e.g. private mode).
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden) save();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", save);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", save);
    };
  }, []);

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
          clearRecovery();
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
    clearRecovery();
    setStatus("ready");
    setRemainingSeconds(workMinutes * 60);
  }, [workMinutes]);
  // Khác reset() ở chỗ đưa cả workMinutes về mặc định gốc (60), không giữ
  // mốc thời gian người dùng đã chọn trước đó — dùng cho nút "về lại từ
  // đầu" (logo Zenzy), không phải nút Reset thường trong ChronoView/PiP.
  const resetToDefault = useCallback(() => {
    clearRecovery();
    setStatus("ready");
    setWorkMinutes(DEFAULT_WORK_MINUTES);
    setRemainingSeconds(DEFAULT_WORK_MINUTES * 60);
  }, [setWorkMinutes]);
  const resumeSession = useCallback(() => {
    if (!recovery) return;
    clearRecovery();
    setWorkMinutes(recovery.workMinutes);
    setRemainingSeconds(recovery.remainingSeconds);
    setRecovery(null);
    setStatus("working");
  }, [recovery, setWorkMinutes]);
  const dismissRecovery = useCallback(() => {
    clearRecovery();
    setRecovery(null);
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
    recoveryMinutesLeft: recovery
      ? Math.ceil(recovery.remainingSeconds / 60)
      : 0,
    showWelcomeBack,
    selectDuration,
    start,
    pause,
    resume,
    reset,
    resetToDefault,
    snooze,
    takeBreak,
    skipBreak,
    resumeSession,
    dismissRecovery,
  };
}

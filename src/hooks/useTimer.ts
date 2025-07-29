import { usePomodoroStore } from "@/store/pomodoroStore";
import { useCallback, useEffect } from "react";

const DURATIONS = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
} as const;

export function useTimer(): void {
  const { time, mode, isRunning, setTime, setMode, setCycle, cycle } = usePomodoroStore();

  const switchMode = useCallback((): void => {
    if (mode === "focus") {
      const newCycle = cycle + 1;
      setCycle(newCycle);

      if (newCycle % 4 === 0) {
        setMode("long_break");
        setTime(DURATIONS.long_break);
      } else {
        setMode("short_break");
        setTime(DURATIONS.short_break);
      }
    } else {
      setMode("focus");
      setTime(DURATIONS.focus);
    }
  }, [mode, cycle, setMode, setTime, setCycle]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          switchMode();
          return DURATIONS[mode === "focus" ? "short_break" : "focus"];
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, setTime, switchMode, mode]);
}

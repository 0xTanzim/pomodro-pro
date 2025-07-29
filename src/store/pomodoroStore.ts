import { create } from "zustand";

export type PomodoroMode = "focus" | "short_break" | "long_break";

interface PomodoroState {
  time: number;
  mode: PomodoroMode;
  isRunning: boolean;
  cycle: number;
  setTime: (time: number) => void;
  setMode: (mode: PomodoroMode) => void;
  setIsRunning: (isRunning: boolean) => void;
  setCycle: (cycle: number) => void;
  reset: () => void;
}

export const usePomodoroStore = create<PomodoroState>((set) => ({
  time: 25 * 60,
  mode: "focus",
  isRunning: false,
  cycle: 0,
  setTime: (time: number): void => set({ time }),
  setMode: (mode: PomodoroMode): void => set({ mode }),
  setIsRunning: (isRunning: boolean): void => set({ isRunning }),
  setCycle: (cycle: number): void => set({ cycle }),
  reset: (): void => set({ time: 25 * 60, mode: "focus", isRunning: false, cycle: 0 }),
}));

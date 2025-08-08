export type TimerMode = 'focus' | 'short_break' | 'long_break';

export interface TimerState {
  time: number;
  isRunning: boolean;
  mode: TimerMode;
  cycle: number;
  todos: Todo[];
  pomodoros: number;
  focusSeconds: number;
  totalFocusTime: number;
  dailyGoal: number;
  streak: number;
  selectedTaskId?: string | null;
  // Stores per-task paused remaining time (in seconds) for focus sessions
  pausedTaskTimes?: Record<string, number>;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  estimatedPomodoros: number;
  completedPomodoros: number;
}

export interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
  sound: boolean;
}

export const DEFAULT_TIMER_STATE: TimerState = {
  time: 25 * 60,
  isRunning: false,
  mode: 'focus',
  cycle: 0,
  todos: [],
  pomodoros: 0,
  focusSeconds: 0,
  totalFocusTime: 0,
  dailyGoal: 8 * 60 * 60, // 8 hours in seconds
  streak: 0,
  pausedTaskTimes: {},
};

export const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 10 * 60,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  notifications: true,
  sound: true,
};

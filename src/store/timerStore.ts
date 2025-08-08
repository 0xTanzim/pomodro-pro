import type { Task } from '@/features/tasks/types/task';
import {
  addStorageListener,
  getFromStorage,
  setToStorage,
} from '@/lib/chromeStorage';
import {
  DEFAULT_SETTINGS,
  DEFAULT_TIMER_STATE,
  TimerSettings,
  TimerState,
} from '@/types/timer';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface TimerStore {
  state: TimerState | null;
  settings: TimerSettings | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadState: () => Promise<void>;
  loadSettings: () => Promise<void>;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  skipBreak: () => Promise<void>;
  updateSettings: (settings: Partial<TimerSettings>) => Promise<void>;
  setSelectedTask: (taskId: string | null) => Promise<void>;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, text: string) => Promise<void>;
  setDailyGoal: (goal: number) => Promise<void>;
}

// Debounce function to prevent excessive storage updates
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export const useTimerStore = create<TimerStore>()(
  subscribeWithSelector((set, get) => ({
    state: null,
    settings: null,
    isLoading: true,
    error: null,

    loadSettings: async () => {
      try {
        const settings = await getFromStorage<TimerSettings>(
          'timerSettings',
          'sync'
        );
        const finalSettings = settings || DEFAULT_SETTINGS;
        set({ settings: finalSettings });

        // Update timer state if settings changed and timer is not running
        const { state } = get();
        if (state && !state.isRunning) {
          const newState = { ...state };

          // Update time based on current mode and settings
          switch (state.mode) {
            case 'focus':
              newState.time = finalSettings.focusDuration;
              break;
            case 'short_break':
              newState.time = finalSettings.shortBreakDuration;
              break;
            case 'long_break':
              newState.time = finalSettings.longBreakDuration;
              break;
          }

          await setToStorage('timerState', newState);
          set({ state: newState });
        }
      } catch (error) {
        console.error('Error loading timer settings:', error);
        set({ settings: DEFAULT_SETTINGS });
      }
    },

    loadState: async () => {
      try {
        set({ isLoading: true, error: null });

        // Load settings first
        await get().loadSettings();

        // Get state from background script
        const state = await new Promise<TimerState>((resolve) => {
          chrome.runtime.sendMessage(
            { type: 'GET_TIMER_STATE' },
            (response) => {
              resolve(response || DEFAULT_TIMER_STATE);
            }
          );
        });

        set({ state, isLoading: false });

        // Ensure state.time matches current settings or selected task duration when idle
        const currentSettings = get().settings || DEFAULT_SETTINGS;
        if (!state.isRunning) {
          let expected = currentSettings.focusDuration;
          if (state.mode === 'short_break')
            expected = currentSettings.shortBreakDuration;
          if (state.mode === 'long_break')
            expected = currentSettings.longBreakDuration;
          if (state.mode === 'focus' && state.selectedTaskId) {
            // Prefer previously paused time for selected task if available
            const pausedMap = state.pausedTaskTimes || {};
            const pausedTime = pausedMap[state.selectedTaskId];
            if (typeof pausedTime === 'number' && pausedTime > 0) {
              expected = pausedTime;
            } else {
              const tasks =
                (await getFromStorage<Task[]>('tasks', 'sync')) || [];
              const selected = tasks.find((t) => t.id === state.selectedTaskId);
              if (selected?.pomodoroDuration && selected.pomodoroDuration > 0) {
                expected = selected.pomodoroDuration * 60;
              }
            }
          } else if (state.selectedTaskId && state.mode !== 'focus') {
            // Respect per-task break durations
            const tasks = (await getFromStorage<Task[]>('tasks', 'sync')) || [];
            const selected = tasks.find((t) => t.id === state.selectedTaskId);
            if (selected) {
              if (state.mode === 'short_break' && selected.shortBreakDuration) {
                expected = selected.shortBreakDuration * 60;
              }
              if (state.mode === 'long_break' && selected.longBreakDuration) {
                expected = selected.longBreakDuration * 60;
              }
            }
          }
          if (state.time !== expected) {
            const adjusted = { ...state, time: expected };
            await setToStorage('timerState', adjusted);
            set({ state: adjusted });
          }
        }

        // Listen for storage changes with debouncing
        const debouncedSetState = debounce((newState: TimerState) => {
          set({ state: newState });
        }, 100);

        addStorageListener((changes, area) => {
          if (area === 'local' && changes.timerState) {
            debouncedSetState(changes.timerState.newValue);
          }
          if (area === 'sync' && changes.timerSettings) {
            get().loadSettings();
          }
        });
      } catch (error) {
        set({ error: 'Failed to load timer state', isLoading: false });
        console.error('Error loading timer state:', error);
      }
    },

    updateSettings: async (newSettings: Partial<TimerSettings>) => {
      try {
        const { settings } = get();
        if (!settings) return;

        const updatedSettings = { ...settings, ...newSettings };
        await setToStorage('timerSettings', updatedSettings, 'sync');
        set({ settings: updatedSettings });

        // Update timer state if duration changed and timer is not running
        const { state } = get();
        if (state && !state.isRunning) {
          const newState = { ...state };

          // Update time based on current mode and new settings
          switch (state.mode) {
            case 'focus':
              if (newSettings.focusDuration) {
                newState.time = newSettings.focusDuration;
              }
              break;
            case 'short_break':
              if (newSettings.shortBreakDuration) {
                newState.time = newSettings.shortBreakDuration;
              }
              break;
            case 'long_break':
              if (newSettings.longBreakDuration) {
                newState.time = newSettings.longBreakDuration;
              }
              break;
          }

          await setToStorage('timerState', newState);
          set({ state: newState });
        }
      } catch (error) {
        set({ error: 'Failed to update settings' });
        console.error('Error updating settings:', error);
      }
    },

    setSelectedTask: async (taskId: string | null) => {
      try {
        const { state, settings } = get();
        if (!state) return;

        const wasRunning = state.isRunning;
        let newState = { ...state, selectedTaskId: taskId };

        // If switching tasks while a timer is running in focus mode,
        // pause current task and store remaining time, then resume on the newly selected task
        if (wasRunning && state.mode === 'focus' && state.selectedTaskId) {
          const pausedMap = { ...(state.pausedTaskTimes || {}) };
          pausedMap[state.selectedTaskId] = state.time;
          newState = {
            ...newState,
            pausedTaskTimes: pausedMap,
          };
        }

        // Determine next time for the selected task depending on mode
        const pausedMap = newState.pausedTaskTimes || {};
        if (newState.mode === 'focus') {
          let nextTime =
            (taskId ? pausedMap[taskId] : undefined) ??
            (settings?.focusDuration || DEFAULT_SETTINGS.focusDuration);
          if (taskId && pausedMap[taskId] == null) {
            const tasks = (await getFromStorage<Task[]>('tasks', 'sync')) || [];
            const selected = tasks.find((t) => t.id === taskId);
            if (selected?.pomodoroDuration && selected.pomodoroDuration > 0) {
              nextTime = selected.pomodoroDuration * 60;
            }
          }
          newState = { ...newState, time: nextTime };
        } else if (taskId && newState.mode !== 'focus') {
          const tasks = (await getFromStorage<Task[]>('tasks', 'sync')) || [];
          const selected = tasks.find((t) => t.id === taskId);
          if (selected) {
            if (
              newState.mode === 'short_break' &&
              selected.shortBreakDuration
            ) {
              newState = {
                ...newState,
                time: selected.shortBreakDuration * 60,
              };
            }
            if (newState.mode === 'long_break' && selected.longBreakDuration) {
              newState = { ...newState, time: selected.longBreakDuration * 60 };
            }
          }
        }

        // Always pause after switching task selection to avoid collisions.
        // User must explicitly press Start to run the selected task.
        newState = { ...newState, isRunning: false };

        await setToStorage('timerState', newState);
        set({ state: newState });
      } catch (error) {
        set({ error: 'Failed to set selected task' });
        console.error('Error setting selected task:', error);
      }
    },

    startTimer: async () => {
      try {
        const { state } = get();
        if (!state) return;
        const newState = { ...state, isRunning: true };

        // Update local state immediately for responsive UI
        set({ state: newState });

        // Update storage with debouncing
        const debouncedStorageUpdate = debounce(async () => {
          await setToStorage('timerState', newState)
            .then(() =>
              console.log(
                '[Popup] Timer started, state set in storage',
                newState
              )
            )
            .catch((err) =>
              console.error(
                '[Popup] Error setting timerState in storage (start)',
                err
              )
            );
        }, 50);

        debouncedStorageUpdate();
      } catch (error) {
        set({ error: 'Failed to start timer' });
        console.error('Error starting timer:', error);
      }
    },

    pauseTimer: async () => {
      try {
        const { state } = get();
        if (!state) return;
        // If pausing during focus with a selected task, remember remaining time for that task
        let newState = { ...state, isRunning: false };
        if (state.mode === 'focus' && state.selectedTaskId) {
          const pausedMap = { ...(state.pausedTaskTimes || {}) };
          pausedMap[state.selectedTaskId] = state.time;
          newState = { ...newState, pausedTaskTimes: pausedMap };
        }

        // Update local state immediately for responsive UI
        set({ state: newState });

        // Update storage with debouncing
        const debouncedStorageUpdate = debounce(async () => {
          await setToStorage('timerState', newState)
            .then(() =>
              console.log(
                '[Popup] Timer paused, state set in storage',
                newState
              )
            )
            .catch((err) =>
              console.error(
                '[Popup] Error setting timerState in storage (pause)',
                err
              )
            );
        }, 50);

        debouncedStorageUpdate();
      } catch (error) {
        set({ error: 'Failed to pause timer' });
        console.error('Error pausing timer:', error);
      }
    },

    resetTimer: async () => {
      try {
        const { settings } = get();
        const focusDuration =
          settings?.focusDuration || DEFAULT_SETTINGS.focusDuration;

        await new Promise<void>((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: 'RESET_TIMER',
              focusDuration,
            },
            () => {
              resolve();
            }
          );
        });

        // Reload state after reset
        await get().loadState();
      } catch (error) {
        set({ error: 'Failed to reset timer' });
        console.error('Error resetting timer:', error);
      }
    },

    // Skip current break and jump to focus mode immediately
    skipBreak: async () => {
      try {
        const { state } = get();
        if (!state) return;
        if (state.mode === 'focus') return; // Only skip when on a break

        let nextTime: number | null = null;
        if (state.selectedTaskId) {
          const tasks = (await getFromStorage<Task[]>('tasks', 'sync')) || [];
          const selected = tasks.find((t) => t.id === state.selectedTaskId);
          if (selected?.pomodoroDuration && selected.pomodoroDuration > 0) {
            nextTime = selected.pomodoroDuration * 60;
          }
        }
        const settings =
          (await getFromStorage<TimerSettings>('timerSettings', 'sync')) ||
          DEFAULT_SETTINGS;
        if (!nextTime) {
          nextTime = settings.focusDuration;
        }

        const newState: TimerState = {
          ...state,
          mode: 'focus',
          time: nextTime,
          isRunning: false,
        };
        await setToStorage('timerState', newState);
        set({ state: newState });
      } catch (error) {
        set({ error: 'Failed to skip break' });
        console.error('Error skipping break:', error);
      }
    },

    addTodo: async (text: string) => {
      try {
        const { state } = get();
        if (!state) return;

        const newTodo = {
          id: Date.now().toString(),
          text: text.trim(),
          completed: false,
          createdAt: new Date(),
          estimatedPomodoros: 1,
          completedPomodoros: 0,
        };

        const newState = {
          ...state,
          todos: [...state.todos, newTodo],
        };

        await setToStorage('timerState', newState);
        set({ state: newState });
      } catch (error) {
        set({ error: 'Failed to add todo' });
        console.error('Error adding todo:', error);
      }
    },

    toggleTodo: async (id: string) => {
      try {
        const { state } = get();
        if (!state) return;

        const newState = {
          ...state,
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed: !todo.completed,
                  completedAt: !todo.completed ? new Date() : undefined,
                }
              : todo
          ),
        };

        await setToStorage('timerState', newState);
        set({ state: newState });
      } catch (error) {
        set({ error: 'Failed to toggle todo' });
        console.error('Error toggling todo:', error);
      }
    },

    deleteTodo: async (id: string) => {
      try {
        const { state } = get();
        if (!state) return;

        const newState = {
          ...state,
          todos: state.todos.filter((todo) => todo.id !== id),
        };

        await setToStorage('timerState', newState);
        set({ state: newState });
      } catch (error) {
        set({ error: 'Failed to delete todo' });
        console.error('Error deleting todo:', error);
      }
    },

    updateTodo: async (id: string, text: string) => {
      try {
        const { state } = get();
        if (!state) return;

        const newState = {
          ...state,
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, text: text.trim() } : todo
          ),
        };

        await setToStorage('timerState', newState);
        set({ state: newState });
      } catch (error) {
        set({ error: 'Failed to update todo' });
        console.error('Error updating todo:', error);
      }
    },

    setDailyGoal: async (goal: number) => {
      try {
        const { state } = get();
        if (!state) return;

        const newState = { ...state, dailyGoal: goal };
        await setToStorage('timerState', newState);
        set({ state: newState });
      } catch (error) {
        set({ error: 'Failed to set daily goal' });
        console.error('Error setting daily goal:', error);
      }
    },
  }))
);

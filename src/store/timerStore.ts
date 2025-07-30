import { addStorageListener, setToStorage } from "@/lib/chromeStorage";
import { DEFAULT_TIMER_STATE, TimerState } from "@/types/timer";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface TimerStore {
  state: TimerState | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadState: () => Promise<void>;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
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
    isLoading: true,
    error: null,

    loadState: async () => {
      try {
        set({ isLoading: true, error: null });

        // Get state from background script
        const state = await new Promise<TimerState>((resolve) => {
          chrome.runtime.sendMessage({ type: "GET_TIMER_STATE" }, (response) => {
            resolve(response || DEFAULT_TIMER_STATE);
          });
        });

        set({ state, isLoading: false });

        // Listen for storage changes with debouncing
        const debouncedSetState = debounce((newState: TimerState) => {
          set({ state: newState });
        }, 100);

        const unsubscribe = addStorageListener((changes, area) => {
          if (area === "local" && changes.timerState) {
            debouncedSetState(changes.timerState.newValue);
          }
        });

        return unsubscribe;
      } catch (error) {
        set({ error: "Failed to load timer state", isLoading: false });
        console.error("Error loading timer state:", error);
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
          await setToStorage("timerState", newState)
            .then(() => console.log("[Popup] Timer started, state set in storage", newState))
            .catch((err) => console.error("[Popup] Error setting timerState in storage (start)", err));
        }, 50);

        debouncedStorageUpdate();
      } catch (error) {
        set({ error: "Failed to start timer" });
        console.error("Error starting timer:", error);
      }
    },

    pauseTimer: async () => {
      try {
        const { state } = get();
        if (!state) return;
        const newState = { ...state, isRunning: false };

        // Update local state immediately for responsive UI
        set({ state: newState });

        // Update storage with debouncing
        const debouncedStorageUpdate = debounce(async () => {
          await setToStorage("timerState", newState)
            .then(() => console.log("[Popup] Timer paused, state set in storage", newState))
            .catch((err) => console.error("[Popup] Error setting timerState in storage (pause)", err));
        }, 50);

        debouncedStorageUpdate();
      } catch (error) {
        set({ error: "Failed to pause timer" });
        console.error("Error pausing timer:", error);
      }
    },

    resetTimer: async () => {
      try {
        await new Promise<void>((resolve) => {
          chrome.runtime.sendMessage({ type: "RESET_TIMER" }, () => {
            resolve();
          });
        });

        // Reload state after reset
        await get().loadState();
      } catch (error) {
        set({ error: "Failed to reset timer" });
        console.error("Error resetting timer:", error);
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

        await setToStorage("timerState", newState);
        set({ state: newState });
      } catch (error) {
        set({ error: "Failed to add todo" });
        console.error("Error adding todo:", error);
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

        await setToStorage("timerState", newState);
        set({ state: newState });
      } catch (error) {
        set({ error: "Failed to toggle todo" });
        console.error("Error toggling todo:", error);
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

        await setToStorage("timerState", newState);
        set({ state: newState });
      } catch (error) {
        set({ error: "Failed to delete todo" });
        console.error("Error deleting todo:", error);
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

        await setToStorage("timerState", newState);
        set({ state: newState });
      } catch (error) {
        set({ error: "Failed to update todo" });
        console.error("Error updating todo:", error);
      }
    },

    setDailyGoal: async (goal: number) => {
      try {
        const { state } = get();
        if (!state) return;

        const newState = { ...state, dailyGoal: goal };
        await setToStorage("timerState", newState);
        set({ state: newState });
      } catch (error) {
        set({ error: "Failed to set daily goal" });
        console.error("Error setting daily goal:", error);
      }
    },
  }))
);

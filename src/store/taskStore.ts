import { type Task, type TaskFilters, type TaskFormData } from "@/types/task";
import { create } from "zustand";

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  addTask: (taskData: TaskFormData) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilters: (filters: TaskFilters) => void;
  getFilteredTasks: () => Task[];
  loadTasks: () => Promise<void>;
  saveTasks: () => Promise<void>;
}

const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filters: {},

  addTask: (taskData: TaskFormData): void => {
    const newTask: Task = {
      id: generateId(),
      name: taskData.name,
      completed: false,
      priority: taskData.priority,
      tags: taskData.tags,
      createdAt: new Date(),
      pomodorosCompleted: 0,
      estimatedPomodoros: taskData.estimatedPomodoros,
    };

    set((state) => ({ tasks: [...state.tasks, newTask] }));
    get().saveTasks();
  },

  updateTask: (id: string, updates: Partial<Task>): void => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
    get().saveTasks();
  },

  deleteTask: (id: string): void => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
    get().saveTasks();
  },

  toggleTask: (id: string): void => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined,
            }
          : task
      ),
    }));
    get().saveTasks();
  },

  setFilters: (filters: TaskFilters): void => {
    set({ filters });
  },

  getFilteredTasks: (): Task[] => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      if (filters.completed !== undefined && task.completed !== filters.completed) {
        return false;
      }
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      if (filters.tags && filters.tags.length > 0) {
        return filters.tags.some((tag) => task.tags.includes(tag));
      }
      return true;
    });
  },

  loadTasks: async (): Promise<void> => {
    try {
      const result = await chrome.storage.sync.get(["tasks"]);
      const tasks = result.tasks || [];
      set({ tasks });
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  },

  saveTasks: async (): Promise<void> => {
    try {
      await chrome.storage.sync.set({ tasks: get().tasks });
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  },
}));

import { DailyAchievement, Task, TaskStats } from '../types/task';

export class TaskService {
  private static readonly TASKS_KEY = 'tasks';
  private static readonly TASK_STATS_KEY = 'taskStats';
  private static readonly DAILY_ACHIEVEMENTS_KEY = 'dailyAchievements';

  // Load priorities and projects from settings
  static async getPriorities(): Promise<{ id: string; name: string; color: string }[]> {
    try {
      const result = await chrome.storage.sync.get(['priorities']);
      return result.priorities || [
        { id: '1', name: 'High', color: '#ef4444' },
        { id: '2', name: 'Medium', color: '#f97316' },
        { id: '3', name: 'Low', color: '#10b981' },
      ];
    } catch (error) {
      console.error('Failed to load priorities:', error);
      return [
        { id: '1', name: 'High', color: '#ef4444' },
        { id: '2', name: 'Medium', color: '#f97316' },
        { id: '3', name: 'Low', color: '#10b981' },
      ];
    }
  }

  static async getProjects(): Promise<{ id: string; name: string; color: string }[]> {
    try {
      const result = await chrome.storage.sync.get(['projects']);
      return result.projects || [
        { id: '1', name: 'Work', color: '#3b82f6' },
        { id: '2', name: 'Personal', color: '#8b5cf6' },
        { id: '3', name: 'Study', color: '#06b6d4' },
      ];
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [
        { id: '1', name: 'Work', color: '#3b82f6' },
        { id: '2', name: 'Personal', color: '#8b5cf6' },
        { id: '3', name: 'Study', color: '#06b6d4' },
      ];
    }
  }

  static async getTasks(): Promise<Task[]> {
    try {
      const result = await chrome.storage.local.get([this.TASKS_KEY]);
      return result[this.TASKS_KEY] || [];
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  }

  static async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.TASKS_KEY]: tasks });
    } catch (error) {
      console.error('Failed to save tasks:', error);
      throw error;
    }
  }

  static async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    await this.saveTasks(tasks);
    return newTask;
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) return null;

    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    await this.saveTasks(tasks);
    return updatedTask;
  }

  static async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);

    if (filteredTasks.length === tasks.length) return false;

    await this.saveTasks(filteredTasks);
    return true;
  }

  static async toggleTaskCompletion(id: string): Promise<Task | null> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) return null;

    const task = tasks[taskIndex];
    const updatedTask: Task = {
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    await this.saveTasks(tasks);
    return updatedTask;
  }

  static async getTaskStats(): Promise<TaskStats> {
    try {
      const result = await chrome.storage.local.get([this.TASK_STATS_KEY]);
      return result[this.TASK_STATS_KEY] || {
        totalTasks: 0,
        completedTasks: 0,
        totalPomodoros: 0,
        totalFocusTime: 0,
        averageTaskDuration: 0,
      };
    } catch (error) {
      console.error('Failed to get task stats:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalPomodoros: 0,
        totalFocusTime: 0,
        averageTaskDuration: 0,
      };
    }
  }

  static async updateTaskStats(stats: Partial<TaskStats>): Promise<void> {
    try {
      const currentStats = await this.getTaskStats();
      const updatedStats = { ...currentStats, ...stats };
      await chrome.storage.local.set({ [this.TASK_STATS_KEY]: updatedStats });
    } catch (error) {
      console.error('Failed to update task stats:', error);
    }
  }

  static async getDailyAchievements(): Promise<DailyAchievement[]> {
    try {
      const result = await chrome.storage.local.get([this.DAILY_ACHIEVEMENTS_KEY]);
      return result[this.DAILY_ACHIEVEMENTS_KEY] || [];
    } catch (error) {
      console.error('Failed to get daily achievements:', error);
      return [];
    }
  }

  static async addDailyAchievement(achievement: Omit<DailyAchievement, 'id' | 'date'>): Promise<DailyAchievement> {
    const achievements = await this.getDailyAchievements();
    const newAchievement: DailyAchievement = {
      ...achievement,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    achievements.push(newAchievement);
    await chrome.storage.local.set({ [this.DAILY_ACHIEVEMENTS_KEY]: achievements });
    return newAchievement;
  }

  static async getTasksByFilter(filter: 'all' | 'today' | 'pending' | 'completed'): Promise<Task[]> {
    const tasks = await this.getTasks();
    const today = new Date().toDateString();

    switch (filter) {
      case 'today':
        return tasks.filter(task => {
          const taskDate = new Date(task.createdAt).toDateString();
          return taskDate === today;
        });
      case 'pending':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  }

  // Initialize with sample data if no tasks exist
  static async initializeSampleData(): Promise<void> {
    const tasks = await this.getTasks();
    if (tasks.length === 0) {
      const sampleTasks: Task[] = [
        {
          id: '1',
          title: 'Complete project proposal',
          description: 'Write and submit the quarterly project proposal',
          priority: 'High',
          project: 'Work',
          pomodoroCount: 4,
          completedPomodoros: 0,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          reminder: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          repeat: 'none',
          tags: ['urgent', 'proposal'],
          attachments: [],
          notes: 'Important for Q4 planning',
          completed: false,
          color: '#ef4444',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Learn React hooks',
          description: 'Study advanced React hooks and patterns',
          priority: 'Medium',
          project: 'Study',
          pomodoroCount: 6,
          completedPomodoros: 2,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          reminder: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
          repeat: 'weekly',
          tags: ['react', 'learning'],
          attachments: [],
          notes: 'Focus on useCallback and useMemo',
          completed: false,
          color: '#3b82f6',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      await this.saveTasks(sampleTasks);
    }
  }
}

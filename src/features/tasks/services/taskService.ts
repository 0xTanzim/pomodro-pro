import { DailyAchievement, Task, TaskStats } from '../types/task';

export class TaskService {
  private static readonly TASKS_KEY = 'tasks';
  private static readonly TASK_STATS_KEY = 'taskStats';
  private static readonly DAILY_ACHIEVEMENTS_KEY = 'dailyAchievements';

  // Load priorities and projects from settings
  static async getPriorities(): Promise<
    { id: string; name: string; color: string }[]
  > {
    try {
      const result = await chrome.storage.sync.get(['priorities']);
      return (
        result.priorities || [
          { id: '1', name: 'High', color: '#ef4444' },
          { id: '2', name: 'Medium', color: '#f97316' },
          { id: '3', name: 'Low', color: '#10b981' },
        ]
      );
    } catch (error) {
      console.error('Failed to load priorities:', error);
      return [
        { id: '1', name: 'High', color: '#ef4444' },
        { id: '2', name: 'Medium', color: '#f97316' },
        { id: '3', name: 'Low', color: '#10b981' },
      ];
    }
  }

  static async getProjects(): Promise<
    { id: string; name: string; color: string }[]
  > {
    try {
      const result = await chrome.storage.sync.get(['projects']);
      return (
        result.projects || [
          { id: '1', name: 'Work', color: '#3b82f6' },
          { id: '2', name: 'Personal', color: '#8b5cf6' },
          { id: '3', name: 'Study', color: '#06b6d4' },
        ]
      );
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
      const result = await chrome.storage.sync.get([this.TASKS_KEY]);
      return result[this.TASKS_KEY] || [];
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  }

  static async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await chrome.storage.sync.set({ [this.TASKS_KEY]: tasks });
    } catch (error) {
      console.error('Failed to save tasks:', error);
      throw error;
    }
  }

  // Smart storage management for completed tasks
  static async cleanupCompletedTasks(): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const completedTasks = tasks.filter((task) => task.completed);

      // Remove completed tasks older than 30 days
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const updatedTasks = tasks.filter((task) => {
        if (!task.completed) return true;
        if (!task.completedAt) return true;
        return new Date(task.completedAt).getTime() >= cutoff;
      });

      if (updatedTasks.length !== tasks.length) {
        await this.saveTasks(updatedTasks);
      }
    } catch (error) {
      console.error('Failed to cleanup completed tasks:', error);
    }
  }

  // Edge case handling for task operations
  static async validateTaskData(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate required fields
    if (!taskData.title || taskData.title.trim().length === 0) {
      errors.push('Task title is required');
    }

    if (taskData.title && taskData.title.length > 200) {
      errors.push('Task title must be less than 200 characters');
    }

    if (!taskData.project || taskData.project.trim().length === 0) {
      errors.push('Project is required');
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(taskData.priority)) {
      errors.push('Invalid priority level');
    }

    // Validate pomodoro count
    if (taskData.pomodoroCount < 1 || taskData.pomodoroCount > 50) {
      errors.push('Pomodoro count must be between 1 and 50');
    }

    // Validate due date
    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.push('Invalid due date format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Check daily limit before adding task
  static async checkDailyLimit(): Promise<{
    canAdd: boolean;
    currentCount: number;
    limit: number;
  }> {
    const DAILY_LIMIT = 30;
    const tasks = await this.getTasks();
    const today = new Date().toISOString().split('T')[0];

    const todayTasks = tasks.filter((task) => {
      const taskCreatedToday = task.createdAt.split('T')[0] === today;
      return taskCreatedToday;
    });

    return {
      canAdd: todayTasks.length < DAILY_LIMIT,
      currentCount: todayTasks.length,
      limit: DAILY_LIMIT,
    };
  }

  // Handle overdue tasks
  static async getOverdueTasks(): Promise<Task[]> {
    const tasks = await this.getTasks();
    const today = new Date().toISOString().split('T')[0];

    return tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;
      return task.dueDate < today;
    });
  }

  // Get tasks by date range
  static async getTasksByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Task[]> {
    const tasks = await this.getTasks();

    return tasks.filter((task) => {
      const taskDate = task.createdAt.split('T')[0];
      return taskDate >= startDate && taskDate <= endDate;
    });
  }

  // Get task statistics
  static async getTaskStatistics(): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    todayCreated: number;
    thisWeekCreated: number;
  }> {
    const tasks = await this.getTasks();
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const completed = tasks.filter((task) => task.completed).length;
    const pending = tasks.filter((task) => !task.completed).length;
    const overdue = (await this.getOverdueTasks()).length;
    const todayCreated = tasks.filter(
      (task) => task.createdAt.split('T')[0] === today
    ).length;
    const thisWeekCreated = tasks.filter(
      (task) => task.createdAt.split('T')[0] >= weekAgo
    ).length;

    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      todayCreated,
      thisWeekCreated,
    };
  }

  // Enhanced addTask with validation
  static async addTask(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    try {
      // Validate task data
      const validationResult = await this.validateTaskData(taskData);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      // Check daily limit
      const dailyLimitResult = await this.checkDailyLimit();
      if (!dailyLimitResult.canAdd) {
        throw new Error(
          `Daily task limit reached (${dailyLimitResult.currentCount}/${dailyLimitResult.limit})`
        );
      }

      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Provide sensible defaults if durations are missing
        pomodoroDuration: Number.isFinite(taskData.pomodoroDuration)
          ? (taskData.pomodoroDuration as number)
          : 25,
        shortBreakDuration: Number.isFinite(taskData.shortBreakDuration)
          ? (taskData.shortBreakDuration as number)
          : 5,
        longBreakDuration: Number.isFinite(taskData.longBreakDuration)
          ? (taskData.longBreakDuration as number)
          : 10,
      };

      const tasks = await this.getTasks();
      tasks.push(newTask);

      await this.saveTasks(tasks);
      await this.cleanupCompletedTasks();

      console.log('Task added successfully:', newTask.title);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  // Enhanced updateTask with validation
  static async updateTask(
    id: string,
    updates: Partial<Task>
  ): Promise<Task | null> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) return null;

    // Validate updates if title is being changed
    if (updates.title !== undefined) {
      const validation = await this.validateTaskData({
        ...tasks[taskIndex],
        ...updates,
      });
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

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
    const filteredTasks = tasks.filter((task) => task.id !== id);

    if (filteredTasks.length === tasks.length) return false;

    await this.saveTasks(filteredTasks);
    return true;
  }

  // Enhanced toggleTaskCompletion with timestamp
  static async toggleTaskCompletion(id: string): Promise<Task | null> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) return null;

    const task = tasks[taskIndex];
    const updatedTask: Task = {
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    await this.saveTasks(tasks);
    return updatedTask;
  }

  static async getTaskStats(): Promise<TaskStats> {
    try {
      const tasks = await this.getTasks();
      const completedTasks = tasks.filter((task) => task.completed);
      const pendingTasks = tasks.filter((task) => !task.completed);

      const totalPomodoros = tasks.reduce(
        (sum, task) => sum + task.completedPomodoros,
        0
      );
      const totalHours = Math.floor((totalPomodoros * 25) / 60); // 25 minutes per pomodoro
      const totalMinutes = (totalPomodoros * 25) % 60;

      return {
        totalPomodoroHours: `${totalHours}h ${totalMinutes}m`,
        elapsedTime: `${totalHours}h ${totalMinutes}m`,
        tasksWaiting: pendingTasks.length,
        tasksCompleted: completedTasks.length,
        focusTime: `${totalHours}h ${totalMinutes}m`,
      };
    } catch (error) {
      console.error('Failed to get task stats:', error);
      return {
        totalPomodoroHours: '0h 0m',
        elapsedTime: '0h 0m',
        tasksWaiting: 0,
        tasksCompleted: 0,
        focusTime: '0h 0m',
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
      const result = await chrome.storage.local.get([
        this.DAILY_ACHIEVEMENTS_KEY,
      ]);
      return result[this.DAILY_ACHIEVEMENTS_KEY] || [];
    } catch (error) {
      console.error('Failed to get daily achievements:', error);
      return [];
    }
  }

  static async addDailyAchievement(
    achievement: Omit<DailyAchievement, 'date'>
  ): Promise<DailyAchievement> {
    const achievements = await this.getDailyAchievements();
    const newAchievement: DailyAchievement = {
      ...achievement,
      date: new Date().toISOString(),
    };

    achievements.push(newAchievement);
    await chrome.storage.local.set({
      [this.DAILY_ACHIEVEMENTS_KEY]: achievements,
    });
    return newAchievement;
  }

  static async getTasksByFilter(
    filter: 'all' | 'today' | 'pending' | 'completed'
  ): Promise<Task[]> {
    const tasks = await this.getTasks();
    const today = new Date().toISOString().split('T')[0];
    const cutoff3Days = Date.now() - 3 * 24 * 60 * 60 * 1000;

    switch (filter) {
      case 'today':
        return tasks.filter((task) => {
          const taskCreatedToday = task.createdAt.split('T')[0] === today;
          const taskDueToday = task.dueDate && task.dueDate === today;
          return taskCreatedToday || taskDueToday;
        });
      case 'pending':
        return tasks.filter((task) => !task.completed).slice(0, 100);
      case 'completed':
        return tasks
          .filter(
            (task) =>
              task.completed &&
              task.completedAt &&
              new Date(task.completedAt).getTime() >= cutoff3Days
          )
          .slice(0, 90); // up to last 3 days, capped
      default:
        return tasks.slice(0, 100);
    }
  }
}

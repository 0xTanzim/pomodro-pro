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

  // Smart storage management for completed tasks
  static async cleanupCompletedTasks(): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const completedTasks = tasks.filter((task) => task.completed);

      // Keep only last 100 completed tasks to prevent storage bloat
      if (completedTasks.length > 100) {
        // Sort by completion date (newest first)
        const sortedCompleted = completedTasks.sort((a, b) => {
          const aDate = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const bDate = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return bDate - aDate;
        });

        // Keep only the 100 most recent completed tasks
        const tasksToKeep = sortedCompleted.slice(0, 100);
        const tasksToRemove = sortedCompleted.slice(100);

        // Remove old completed tasks
        const updatedTasks = tasks.filter(
          (task) =>
            !task.completed ||
            tasksToKeep.some((keepTask) => keepTask.id === task.id)
        );

        await this.saveTasks(updatedTasks);

        console.log(`Cleaned up ${tasksToRemove.length} old completed tasks`);
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
    // Validate task data
    const validation = await this.validateTaskData(taskData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Check daily limit
    const dailyLimit = await this.checkDailyLimit();
    if (!dailyLimit.canAdd) {
      throw new Error(
        `Daily limit reached: ${dailyLimit.currentCount}/${dailyLimit.limit} tasks`
      );
    }

    const tasks = await this.getTasks();
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    await this.saveTasks(tasks);

    // Auto-cleanup completed tasks to prevent storage bloat
    await this.cleanupCompletedTasks();

    return newTask;
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
      completedAt: !task.completed ? new Date().toISOString() : null,
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
    achievement: Omit<DailyAchievement, 'id' | 'date'>
  ): Promise<DailyAchievement> {
    const achievements = await this.getDailyAchievements();
    const newAchievement: DailyAchievement = {
      ...achievement,
      id: Date.now().toString(),
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

    switch (filter) {
      case 'today':
        return tasks.filter((task) => {
          const taskCreatedToday = task.createdAt.split('T')[0] === today;
          const taskDueToday = task.dueDate && task.dueDate === today;
          return taskCreatedToday || taskDueToday;
        });
      case 'pending':
        return tasks.filter((task) => !task.completed);
      case 'completed':
        return tasks.filter((task) => task.completed);
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
          reminder: new Date(
            Date.now() + 6 * 24 * 60 * 60 * 1000
          ).toISOString(),
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
          dueDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
          reminder: new Date(
            Date.now() + 12 * 24 * 60 * 60 * 1000
          ).toISOString(),
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

  // Create sample analytics data for testing
  static async createSampleAnalyticsData(): Promise<void> {
    const tasks = await this.getTasks();

    // If we already have tasks, don't create sample data
    if (tasks.length > 0) return;

    const sampleTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // Today's tasks
      {
        title: 'Complete project proposal',
        priority: 'high',
        project: 'Work',
        pomodoroCount: 4,
        completedPomodoros: 3,
        tags: ['urgent', 'proposal'],
        attachments: [],
        completed: true,
        completedAt: new Date().toISOString(),
        dueDate: new Date().toISOString().split('T')[0],
      },
      {
        title: 'Review code changes',
        priority: 'medium',
        project: 'Work',
        pomodoroCount: 2,
        completedPomodoros: 2,
        tags: ['code', 'review'],
        attachments: [],
        completed: true,
        completedAt: new Date().toISOString(),
        dueDate: new Date().toISOString().split('T')[0],
      },
      {
        title: 'Plan weekly goals',
        priority: 'low',
        project: 'Personal',
        pomodoroCount: 1,
        completedPomodoros: 1,
        tags: ['planning'],
        attachments: [],
        completed: true,
        completedAt: new Date().toISOString(),
        dueDate: new Date().toISOString().split('T')[0],
      },
      // Yesterday's tasks
      {
        title: 'Design user interface',
        priority: 'high',
        project: 'Work',
        pomodoroCount: 6,
        completedPomodoros: 4,
        tags: ['design', 'ui'],
        attachments: [],
        completed: true,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
      {
        title: 'Write documentation',
        priority: 'medium',
        project: 'Work',
        pomodoroCount: 3,
        completedPomodoros: 2,
        tags: ['documentation'],
        attachments: [],
        completed: true,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
      // This week's tasks
      {
        title: 'Learn new framework',
        priority: 'medium',
        project: 'Study',
        pomodoroCount: 8,
        completedPomodoros: 6,
        tags: ['learning', 'framework'],
        attachments: [],
        completed: true,
        completedAt: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
      {
        title: 'Exercise routine',
        priority: 'low',
        project: 'Personal',
        pomodoroCount: 2,
        completedPomodoros: 2,
        tags: ['health', 'exercise'],
        attachments: [],
        completed: true,
        completedAt: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
      // Pending tasks
      {
        title: 'Finish project presentation',
        priority: 'urgent',
        project: 'Work',
        pomodoroCount: 5,
        completedPomodoros: 0,
        tags: ['presentation', 'urgent'],
        attachments: [],
        completed: false,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
      {
        title: 'Read technical book',
        priority: 'medium',
        project: 'Study',
        pomodoroCount: 4,
        completedPomodoros: 0,
        tags: ['reading', 'technical'],
        attachments: [],
        completed: false,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
    ];

    // Add all sample tasks
    for (const task of sampleTasks) {
      await this.addTask(task);
    }

    console.log('Sample analytics data created successfully!');
  }
}

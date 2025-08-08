import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Task } from '../../types/task';
import { TaskService } from '../taskService';

// Mock Chrome API
global.chrome = {
  storage: {
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn(),
    },
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
} as any;

describe('TaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateTaskData', () => {
    it('validates valid task data', async () => {
      const validTask = {
        title: 'Test Task',
        description: 'Test description',
        completed: false,
        priority: 'high' as const,
        project: 'Work',
        pomodoroCount: 4,
        completedPomodoros: 0,
        tags: [],
        attachments: [],
        color: '#ef4444',
      };

      const result = await TaskService.validateTaskData(validTask);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates missing title', async () => {
      const invalidTask = {
        title: '',
        description: 'Test description',
        completed: false,
        priority: 'high' as const,
        project: 'Work',
        pomodoroCount: 4,
        completedPomodoros: 0,
        tags: [],
        attachments: [],
        color: '#ef4444',
      };

      const result = await TaskService.validateTaskData(invalidTask);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Task title is required');
    });

    it('validates title length', async () => {
      const invalidTask = {
        title: 'a'.repeat(201), // Too long
        description: 'Test description',
        completed: false,
        priority: 'high' as const,
        project: 'Work',
        pomodoroCount: 4,
        completedPomodoros: 0,
        tags: [],
        attachments: [],
        color: '#ef4444',
      };

      const result = await TaskService.validateTaskData(invalidTask);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Task title must be less than 200 characters'
      );
    });

    it('validates missing project', async () => {
      const invalidTask = {
        title: 'Test Task',
        description: 'Test description',
        completed: false,
        priority: 'high' as const,
        project: '',
        pomodoroCount: 4,
        completedPomodoros: 0,
        tags: [],
        attachments: [],
        color: '#ef4444',
      };

      const result = await TaskService.validateTaskData(invalidTask);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Project is required');
    });

    it('validates invalid priority', async () => {
      const invalidTask = {
        title: 'Test Task',
        description: 'Test description',
        completed: false,
        priority: 'invalid' as any,
        project: 'Work',
        pomodoroCount: 4,
        completedPomodoros: 0,
        tags: [],
        attachments: [],
        color: '#ef4444',
      };

      const result = await TaskService.validateTaskData(invalidTask);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid priority level');
    });

    it('validates pomodoro count range', async () => {
      const invalidTask = {
        title: 'Test Task',
        description: 'Test description',
        completed: false,
        priority: 'high' as const,
        project: 'Work',
        pomodoroCount: 0, // Invalid
        completedPomodoros: 0,
        tags: [],
        attachments: [],
        color: '#ef4444',
      };

      const result = await TaskService.validateTaskData(invalidTask);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Pomodoro count must be between 1 and 50'
      );
    });

    it('validates due date format', async () => {
      const invalidTask = {
        title: 'Test Task',
        description: 'Test description',
        completed: false,
        priority: 'high' as const,
        project: 'Work',
        pomodoroCount: 4,
        completedPomodoros: 0,
        dueDate: 'invalid-date',
        tags: [],
        attachments: [],
        color: '#ef4444',
      };

      const result = await TaskService.validateTaskData(invalidTask);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid due date format');
    });
  });

  describe('checkDailyLimit', () => {
    it('returns correct daily limit status', async () => {
      // Mock tasks for today
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          completed: false,
          priority: 'high',
          project: 'Work',
          pomodoroCount: 4,
          completedPomodoros: 0,
          tags: [],
          attachments: [],
          createdAt: new Date().toISOString(),
          color: '#ef4444',
        },
        {
          id: '2',
          title: 'Task 2',
          completed: false,
          priority: 'medium',
          project: 'Work',
          pomodoroCount: 2,
          completedPomodoros: 0,
          tags: [],
          attachments: [],
          createdAt: new Date().toISOString(),
          color: '#f97316',
        },
      ];

      // Mock chrome.storage.sync.get to return our test tasks
      (chrome.storage.sync.get as any).mockResolvedValue({ tasks: mockTasks });

      const result = await TaskService.checkDailyLimit();
      expect(result.canAdd).toBe(true);
      expect(result.currentCount).toBe(2);
      expect(result.limit).toBe(30);
    });

    it('handles daily limit reached', async () => {
      // Create 30 tasks for today
      const mockTasks: Task[] = Array.from({ length: 30 }, (_, i) => ({
        id: i.toString(),
        title: `Task ${i}`,
        completed: false,
        priority: 'high',
        project: 'Work',
        pomodoroCount: 4,
        completedPomodoros: 0,
        tags: [],
        attachments: [],
        createdAt: new Date().toISOString(),
        color: '#ef4444',
      }));

      (chrome.storage.sync.get as any).mockResolvedValue({ tasks: mockTasks });

      const result = await TaskService.checkDailyLimit();
      expect(result.canAdd).toBe(false);
      expect(result.currentCount).toBe(30);
      expect(result.limit).toBe(30);
    });
  });

  describe('getOverdueTasks', () => {
    it('returns overdue tasks correctly', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Overdue Task',
          completed: false,
          priority: 'high',
          project: 'Work',
          pomodoroCount: 4,
          completedPomodoros: 0,
          dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          tags: [],
          attachments: [],
          createdAt: new Date().toISOString(),
          color: '#ef4444',
        },
        {
          id: '2',
          title: 'Not Overdue Task',
          completed: false,
          priority: 'medium',
          project: 'Work',
          pomodoroCount: 2,
          completedPomodoros: 0,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          tags: [],
          attachments: [],
          createdAt: new Date().toISOString(),
          color: '#f97316',
        },
      ];

      (chrome.storage.sync.get as any).mockResolvedValue({ tasks: mockTasks });

      const overdueTasks = await TaskService.getOverdueTasks();
      expect(overdueTasks).toHaveLength(1);
      expect(overdueTasks[0].title).toBe('Overdue Task');
    });

    it('excludes completed tasks from overdue', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Completed Overdue Task',
          completed: true,
          priority: 'high',
          project: 'Work',
          pomodoroCount: 4,
          completedPomodoros: 4,
          dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          tags: [],
          attachments: [],
          createdAt: new Date().toISOString(),
          color: '#ef4444',
        },
      ];

      (chrome.storage.sync.get as any).mockResolvedValue({ tasks: mockTasks });

      const overdueTasks = await TaskService.getOverdueTasks();
      expect(overdueTasks).toHaveLength(0);
    });
  });

  describe('getTaskStatistics', () => {
    it('returns correct statistics', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Completed Task',
          completed: true,
          priority: 'high',
          project: 'Work',
          pomodoroCount: 4,
          completedPomodoros: 4,
          tags: [],
          attachments: [],
          createdAt: new Date().toISOString(),
          color: '#ef4444',
        },
        {
          id: '2',
          title: 'Pending Task',
          completed: false,
          priority: 'medium',
          project: 'Work',
          pomodoroCount: 2,
          completedPomodoros: 0,
          tags: [],
          attachments: [],
          createdAt: new Date().toISOString(),
          color: '#f97316',
        },
      ];

      (chrome.storage.sync.get as any).mockResolvedValue({ tasks: mockTasks });

      const stats = await TaskService.getTaskStatistics();
      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.overdue).toBe(0);
      expect(stats.todayCreated).toBe(2);
      expect(stats.thisWeekCreated).toBe(2);
    });
  });
});

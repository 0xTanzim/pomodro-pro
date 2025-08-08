import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsService } from '../services/analyticsService';

// Mock chrome.storage
const mockStorage = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
  },
  sync: {
    get: vi.fn(),
    set: vi.fn(),
  },
};

// Mock chrome global
global.chrome = {
  storage: mockStorage,
} as any;

// Mock TaskService
vi.mock('../../tasks/services/taskService', () => ({
  TaskService: {
    getTasks: vi.fn().mockResolvedValue([]),
  },
}));

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    analyticsService = AnalyticsService.getInstance();
    vi.clearAllMocks();
  });

  describe('getTaskChartData', () => {
    it('should return weekly data with 7 days', async () => {
      // Mock empty pomodoro log
      mockStorage.local.get.mockResolvedValue({ pomodoroLog: [] });

      const result = await analyticsService.getTaskChartData('week');

      expect(result).toHaveLength(7);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('focusTime');
      expect(result[0]).toHaveProperty('pomodoros');
      expect(result[0]).toHaveProperty('tasks');
      expect(result[0]).toHaveProperty('projects');
    });

    it('should return biweekly data with 14 days', async () => {
      mockStorage.local.get.mockResolvedValue({ pomodoroLog: [] });

      const result = await analyticsService.getTaskChartData('biweekly');

      expect(result).toHaveLength(14);
    });

    it('should return monthly data with 30 days', async () => {
      mockStorage.local.get.mockResolvedValue({ pomodoroLog: [] });

      const result = await analyticsService.getTaskChartData('month');

      expect(result).toHaveLength(30);
    });

    it('should handle pomodoro log data correctly', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD format

      const mockPomodoroLog = [
        {
          project: 'Work',
          minutes: 25,
          finishedAt: yesterday.toISOString(),
        },
        {
          project: 'Study',
          minutes: 30,
          finishedAt: yesterday.toISOString(),
        },
      ];

      mockStorage.local.get.mockResolvedValue({ pomodoroLog: mockPomodoroLog });

      const result = await analyticsService.getTaskChartData('week');

      expect(result).toHaveLength(7);
      // Find the data entry that has focusTime > 0 (the one with our test data)
      const dataEntry = result.find((item) => item.focusTime > 0);
      expect(dataEntry?.focusTime).toBe(55); // 25 + 30
      expect(dataEntry?.pomodoros).toBe(2);
    });

    it('should handle empty data gracefully', async () => {
      mockStorage.local.get.mockResolvedValue({ pomodoroLog: [] });

      const result = await analyticsService.getTaskChartData('week');

      expect(result).toHaveLength(7);
      expect(result.every((item) => item.focusTime === 0)).toBe(true);
      expect(result.every((item) => item.pomodoros === 0)).toBe(true);
    });
  });

  describe('getFocusTimeDistribution', () => {
    it('should return top 15 tasks', async () => {
      const mockPomodoroLog = Array.from({ length: 20 }, (_, i) => ({
        taskId: `task-${i}`,
        title: `Task ${i}`,
        project: `Project ${i % 3}`,
        minutes: 25,
        finishedAt: new Date().toISOString(),
      }));

      mockStorage.local.get.mockResolvedValue({ pomodoroLog: mockPomodoroLog });

      const result = await analyticsService.getFocusTimeDistribution();

      expect(result).toHaveLength(15); // Should be limited to top 15
      expect(result[0]).toHaveProperty('taskName');
      expect(result[0]).toHaveProperty('duration');
      expect(result[0]).toHaveProperty('project');
    });

    it('should handle large datasets', async () => {
      const mockPomodoroLog = Array.from({ length: 100 }, (_, i) => ({
        taskId: `task-${i}`,
        title: `Task ${i}`,
        project: `Project ${i % 5}`,
        minutes: Math.floor(Math.random() * 50) + 10,
        finishedAt: new Date().toISOString(),
      }));

      mockStorage.local.get.mockResolvedValue({ pomodoroLog: mockPomodoroLog });

      const result = await analyticsService.getFocusTimeDistribution();

      expect(result).toHaveLength(15);
      // Should be sorted by duration descending
      expect(result[0].duration).toBeGreaterThanOrEqual(result[1].duration);
    });
  });

  describe('getProjectTimeDistribution', () => {
    it('should aggregate projects correctly', async () => {
      const mockPomodoroLog = [
        { project: 'Work', minutes: 25, finishedAt: new Date().toISOString() },
        { project: 'Work', minutes: 30, finishedAt: new Date().toISOString() },
        { project: 'Study', minutes: 20, finishedAt: new Date().toISOString() },
        {
          project: 'Personal',
          minutes: 15,
          finishedAt: new Date().toISOString(),
        },
      ];

      mockStorage.local.get.mockResolvedValue({ pomodoroLog: mockPomodoroLog });

      const result = await analyticsService.getProjectTimeDistribution();

      expect(result).toHaveLength(3);
      const workProject = result.find((p) => p.project === 'Work');
      expect(workProject?.totalTime).toBe(55); // 25 + 30
      expect(workProject?.taskCount).toBe(2);
    });

    it('should handle uncategorized projects', async () => {
      const mockPomodoroLog = [
        { minutes: 25, finishedAt: new Date().toISOString() }, // No project
        { project: 'Work', minutes: 30, finishedAt: new Date().toISOString() },
      ];

      mockStorage.local.get.mockResolvedValue({ pomodoroLog: mockPomodoroLog });

      const result = await analyticsService.getProjectTimeDistribution();

      expect(result).toHaveLength(2);
      const uncategorized = result.find((p) => p.project === 'Uncategorized');
      expect(uncategorized?.totalTime).toBe(25);
    });
  });

  describe('getFocusTimeSummary', () => {
    it('should calculate time periods correctly', async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mockPomodoroLog = [
        { minutes: 25, finishedAt: today.toISOString() },
        { minutes: 30, finishedAt: yesterday.toISOString() },
      ];

      mockStorage.local.get.mockResolvedValue({ pomodoroLog: mockPomodoroLog });

      const result = await analyticsService.getFocusTimeSummary();

      expect(result.today).toBe(25);
      expect(result.thisWeek).toBe(55); // 25 + 30
    });

    it('should handle invalid data gracefully', async () => {
      const mockPomodoroLog = [
        { minutes: 'invalid', finishedAt: new Date().toISOString() },
        { minutes: 25, finishedAt: 'invalid-date' },
      ];

      mockStorage.local.get.mockResolvedValue({ pomodoroLog: mockPomodoroLog });

      const result = await analyticsService.getFocusTimeSummary();

      expect(result.today).toBe(0);
      expect(result.thisWeek).toBe(0);
    });
  });

  describe('getReportSummary', () => {
    it('should return complete summary', async () => {
      // Mock all the required methods
      vi.spyOn(analyticsService, 'getTaskCompletionSummary').mockResolvedValue({
        today: 5,
        thisWeek: 15,
        thisTwoWeeks: 25,
        thisMonth: 50,
      });

      vi.spyOn(analyticsService, 'getFocusTimeSummary').mockResolvedValue({
        today: 120,
        thisWeek: 600,
        thisTwoWeeks: 1200,
        thisMonth: 2400,
      });

      vi.spyOn(analyticsService, 'getTotalPomodoros').mockResolvedValue(24);
      vi.spyOn(analyticsService, 'getAverageSessionLength').mockResolvedValue(
        25
      );

      const result = await analyticsService.getReportSummary();

      expect(result.tasksCompletedToday).toBe(5);
      expect(result.focusTimeToday).toBe(120);
      expect(result.totalPomodoros).toBe(24);
      expect(result.averageSessionLength).toBe(25);
    });
  });
});

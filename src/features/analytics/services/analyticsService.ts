import { TaskService } from '../../tasks/services/taskService';
import { Task } from '../../tasks/types/task';
import {
  FocusTimeEntry,
  ProjectTimeData,
  ReportSummary,
  TaskChartData,
} from '../types';

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Get task completion summary
  async getTaskCompletionSummary(): Promise<{
    today: number;
    thisWeek: number;
    thisTwoWeeks: number;
    thisMonth: number;
  }> {
    try {
      const tasks = await TaskService.getTasks();
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const startOfWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      );
      const startOfTwoWeeks = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 14
      );
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const completedTasks = tasks.filter(
        (task) => task.completed && task.completedAt
      );

      return {
        today: completedTasks.filter((task) => {
          const completedDate = new Date(task.completedAt!);
          return completedDate >= startOfDay;
        }).length,
        thisWeek: completedTasks.filter((task) => {
          const completedDate = new Date(task.completedAt!);
          return completedDate >= startOfWeek;
        }).length,
        thisTwoWeeks: completedTasks.filter((task) => {
          const completedDate = new Date(task.completedAt!);
          return completedDate >= startOfTwoWeeks;
        }).length,
        thisMonth: completedTasks.filter((task) => {
          const completedDate = new Date(task.completedAt!);
          return completedDate >= startOfMonth;
        }).length,
      };
    } catch (error) {
      console.error('Error getting task completion summary:', error);
      return { today: 0, thisWeek: 0, thisTwoWeeks: 0, thisMonth: 0 };
    }
  }

  // Get focus time summary based on completed pomodoros
  async getFocusTimeSummary(): Promise<{
    today: number;
    thisWeek: number;
    thisTwoWeeks: number;
    thisMonth: number;
  }> {
    try {
      const tasks = await TaskService.getTasks();
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const startOfWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      );
      const startOfTwoWeeks = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 14
      );
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate focus time based on completed pomodoros (25 minutes each)
      const POMODORO_DURATION = 25; // minutes

      const calculateFocusTime = (tasks: Task[], startDate: Date) => {
        return tasks
          .filter((task) => {
            if (!task.completed || !task.completedAt) return false;
            const completedDate = new Date(task.completedAt);
            return completedDate >= startDate;
          })
          .reduce(
            (total, task) =>
              total + task.completedPomodoros * POMODORO_DURATION,
            0
          );
      };

      return {
        today: calculateFocusTime(tasks, startOfDay),
        thisWeek: calculateFocusTime(tasks, startOfWeek),
        thisTwoWeeks: calculateFocusTime(tasks, startOfTwoWeeks),
        thisMonth: calculateFocusTime(tasks, startOfMonth),
      };
    } catch (error) {
      console.error('Error getting focus time summary:', error);
      return { today: 0, thisWeek: 0, thisTwoWeeks: 0, thisMonth: 0 };
    }
  }

  // Get project time distribution based on actual tasks
  async getProjectTimeDistribution(): Promise<ProjectTimeData[]> {
    try {
      const tasks = await TaskService.getTasks();
      const projectMap = new Map<
        string,
        { totalPomodoros: number; taskCount: number }
      >();

      // Group tasks by project and calculate total pomodoros
      tasks.forEach((task) => {
        const project = task.project || 'Uncategorized';
        const existing = projectMap.get(project);
        if (existing) {
          existing.totalPomodoros += task.completedPomodoros;
          existing.taskCount += 1;
        } else {
          projectMap.set(project, {
            totalPomodoros: task.completedPomodoros,
            taskCount: 1,
          });
        }
      });

      const totalPomodoros = Array.from(projectMap.values()).reduce(
        (sum, data) => sum + data.totalPomodoros,
        0
      );

      const colors = [
        '#3b82f6',
        '#ef4444',
        '#f97316',
        '#6366f1',
        '#10b981',
        '#06b6d4',
      ];

      return Array.from(projectMap.entries())
        .filter(([_, data]) => data.totalPomodoros > 0) // Only show projects with completed pomodoros
        .map(([project, data], index) => ({
          project,
          totalTime: data.totalPomodoros * 25, // Convert pomodoros to minutes
          percentage:
            totalPomodoros > 0
              ? Math.round((data.totalPomodoros / totalPomodoros) * 100)
              : 0,
          color: colors[index % colors.length],
          taskCount: data.taskCount,
        }))
        .sort((a, b) => b.totalTime - a.totalTime); // Sort by time descending
    } catch (error) {
      console.error('Error getting project time distribution:', error);
      return [];
    }
  }

  // Get focus time distribution (top tasks by completed pomodoros)
  async getFocusTimeDistribution(): Promise<FocusTimeEntry[]> {
    try {
      const tasks = await TaskService.getTasks();
      const taskMap = new Map<
        string,
        {
          totalPomodoros: number;
          project: string;
          color: string;
          taskId: string;
        }
      >();

      // Group tasks by title and calculate total pomodoros
      tasks.forEach((task) => {
        const existing = taskMap.get(task.title);
        if (existing) {
          existing.totalPomodoros += task.completedPomodoros;
        } else {
          taskMap.set(task.title, {
            totalPomodoros: task.completedPomodoros,
            project: task.project || 'Uncategorized',
            color: this.getTaskColor(task.priority),
            taskId: task.id,
          });
        }
      });

      const colors = [
        '#3b82f6',
        '#ef4444',
        '#f97316',
        '#6366f1',
        '#10b981',
        '#06b6d4',
      ];

      return Array.from(taskMap.entries())
        .filter(([_, data]) => data.totalPomodoros > 0) // Only show tasks with completed pomodoros
        .map(([taskName, data], index) => ({
          id: data.taskId,
          taskName,
          project: data.project,
          duration: data.totalPomodoros * 25, // Convert pomodoros to minutes
          date: new Date(),
          color: data.color || colors[index % colors.length],
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10); // Top 10 tasks
    } catch (error) {
      console.error('Error getting focus time distribution:', error);
      return [];
    }
  }

  // Get task chart data based on actual task completion
  async getTaskChartData(
    timeRange: 'week' | 'biweekly' | 'month'
  ): Promise<TaskChartData[]> {
    try {
      const tasks = await TaskService.getTasks();
      const now = new Date();

      let days: number;
      switch (timeRange) {
        case 'week':
          days = 7;
          break;
        case 'biweekly':
          days = 14;
          break;
        case 'month':
          days = 30;
          break;
        default:
          days = 7;
      }

      const data: TaskChartData[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - i
        );
        const dateStr = date.toISOString().split('T')[0];

        // Get tasks completed on this date
        const dayTasks = tasks.filter((task) => {
          if (!task.completed || !task.completedAt) return false;
          const completedDate = new Date(task.completedAt);
          return completedDate.toDateString() === date.toDateString();
        });

        // Calculate pomodoros and focus time for this day
        const dayPomodoros = dayTasks.reduce(
          (sum, task) => sum + task.completedPomodoros,
          0
        );
        const dayFocusTime = dayPomodoros * 25; // 25 minutes per pomodoro

        // Group by projects
        const projects: { [key: string]: number } = {};
        dayTasks.forEach((task) => {
          const project = task.project || 'Uncategorized';
          projects[project] =
            (projects[project] || 0) + task.completedPomodoros * 25;
        });

        data.push({
          date: dateStr,
          pomodoros: dayPomodoros,
          tasks: dayTasks.length,
          focusTime: dayFocusTime,
          projects,
        });
      }

      return data;
    } catch (error) {
      console.error('Error getting task chart data:', error);
      return [];
    }
  }

  // Get complete report summary
  async getReportSummary(): Promise<ReportSummary> {
    const taskSummary = await this.getTaskCompletionSummary();
    const focusTimeSummary = await this.getFocusTimeSummary();
    const totalPomodoros = await this.getTotalPomodoros();
    const averageSessionLength = await this.getAverageSessionLength();

    return {
      tasksCompletedToday: taskSummary.today,
      tasksCompletedThisWeek: taskSummary.thisWeek,
      tasksCompletedThisTwoWeeks: taskSummary.thisTwoWeeks,
      tasksCompletedThisMonth: taskSummary.thisMonth,
      focusTimeToday: focusTimeSummary.today,
      focusTimeThisWeek: focusTimeSummary.thisWeek,
      focusTimeThisTwoWeeks: focusTimeSummary.thisTwoWeeks,
      focusTimeThisMonth: focusTimeSummary.thisMonth,
      totalPomodoros,
      averageSessionLength,
    };
  }

  // Initialize sample data if no tasks exist
  async initializeSampleData(): Promise<void> {
    try {
      const tasks = await TaskService.getTasks();
      if (tasks.length === 0) {
        await TaskService.createSampleAnalyticsData();
        console.log('Sample analytics data initialized');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  // Helper methods
  private async getTotalPomodoros(): Promise<number> {
    try {
      const tasks = await TaskService.getTasks();
      return tasks.reduce((total, task) => total + task.completedPomodoros, 0);
    } catch (error) {
      console.error('Error getting total pomodoros:', error);
      return 0;
    }
  }

  private async getAverageSessionLength(): Promise<number> {
    try {
      const tasks = await TaskService.getTasks();
      const completedTasks = tasks.filter(
        (task) => task.completedPomodoros > 0
      );

      if (completedTasks.length === 0) return 0;

      const totalPomodoros = completedTasks.reduce(
        (sum, task) => sum + task.completedPomodoros,
        0
      );
      return Math.round((totalPomodoros * 25) / completedTasks.length); // 25 minutes per pomodoro
    } catch (error) {
      console.error('Error getting average session length:', error);
      return 0;
    }
  }

  private getTaskColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return '#ef4444'; // red
      case 'high':
        return '#f97316'; // orange
      case 'medium':
        return '#3b82f6'; // blue
      case 'low':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  }
}

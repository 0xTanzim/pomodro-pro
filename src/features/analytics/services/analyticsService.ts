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
      // Only retain last 30 days for analytics calculations
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentTasks = tasks.filter((t) => {
        const created = new Date(t.createdAt).getTime();
        const completed = t.completedAt
          ? new Date(t.completedAt).getTime()
          : null;
        return (completed ?? created) >= cutoff;
      });
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

      const completedTasks = recentTasks.filter(
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
      // Prefer local pomodoro log for accurate durations and times
      const { pomodoroLog } = await chrome.storage.local.get(['pomodoroLog']);
      const entries: Array<{
        taskId: string;
        title: string;
        project?: string;
        minutes: number;
        finishedAt: string;
      }> = Array.isArray(pomodoroLog) ? pomodoroLog : [];
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentEntries = entries.filter((e) => {
        const t = new Date(e.finishedAt).getTime();
        return t >= cutoff && Number.isFinite(e.minutes);
      });
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

      if (recentEntries.length > 0) {
        const sum = (from: Date) =>
          recentEntries
            .filter((e) => new Date(e.finishedAt) >= from)
            .reduce(
              (acc, e) => acc + (Number.isFinite(e.minutes) ? e.minutes : 0),
              0
            );
        return {
          today: sum(startOfDay),
          thisWeek: sum(startOfWeek),
          thisTwoWeeks: sum(startOfTwoWeeks),
          thisMonth: sum(startOfMonth),
        };
      }

      // Fallback to tasks if log empty
      const tasks = await TaskService.getTasks();
      return {
        today: this.calculateFocusTime(tasks, startOfDay),
        thisWeek: this.calculateFocusTime(tasks, startOfWeek),
        thisTwoWeeks: this.calculateFocusTime(tasks, startOfTwoWeeks),
        thisMonth: this.calculateFocusTime(tasks, startOfMonth),
      };
    } catch (error) {
      console.error('Error getting focus time summary:', error);
      return {
        today: 0,
        thisWeek: 0,
        thisTwoWeeks: 0,
        thisMonth: 0,
      };
    }
  }

  // Get project time distribution based on actual tasks
  async getProjectTimeDistribution(): Promise<ProjectTimeData[]> {
    try {
      // Use pomodoro log for precise time per project
      const { pomodoroLog } = await chrome.storage.local.get(['pomodoroLog']);
      const entries: Array<{
        project?: string;
        minutes: number;
        finishedAt: string;
      }> = Array.isArray(pomodoroLog) ? pomodoroLog : [];
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentEntries = entries.filter((e) => {
        const t = new Date(e.finishedAt).getTime();
        return t >= cutoff && Number.isFinite(e.minutes);
      });
      const projectMap = new Map<
        string,
        { totalMinutes: number; taskCount: number }
      >();

      if (recentEntries.length > 0) {
        recentEntries.forEach((entry) => {
          const project = entry.project || 'Uncategorized';
          const existing = projectMap.get(project);
          if (existing) {
            existing.totalMinutes += entry.minutes;
            existing.taskCount += 1;
          } else {
            projectMap.set(project, {
              totalMinutes: entry.minutes,
              taskCount: 1,
            });
          }
        });
      } else {
        // Fallback from tasks
        const tasks = await TaskService.getTasks();
        tasks.forEach((task) => {
          const project = task.project || 'Uncategorized';
          const duration = Number.isFinite(task.pomodoroDuration)
            ? (task.pomodoroDuration as number)
            : 25;
          const minutes = (task.completedPomodoros || 0) * duration;
          const existing = projectMap.get(project);
          if (existing) {
            existing.totalMinutes += minutes;
            existing.taskCount += 1;
          } else {
            projectMap.set(project, { totalMinutes: minutes, taskCount: 1 });
          }
        });
      }

      const totalMinutes = Array.from(projectMap.values()).reduce(
        (sum, d) => sum + d.totalMinutes,
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
        .map(([project, data], index) => ({
          project,
          totalTime: data.totalMinutes,
          percentage:
            totalMinutes > 0
              ? Math.round((data.totalMinutes / totalMinutes) * 100)
              : 0,
          color: colors[index % colors.length],
          taskCount: data.taskCount,
        }))
        .sort((a, b) => b.totalTime - a.totalTime);
    } catch (error) {
      console.error('Error getting project time distribution:', error);
      return [];
    }
  }

  // Get focus time distribution (top tasks by completed pomodoros)
  async getFocusTimeDistribution(): Promise<FocusTimeEntry[]> {
    try {
      // Focus time top tasks from pomodoro log
      const { pomodoroLog } = await chrome.storage.local.get(['pomodoroLog']);
      const entries: Array<{
        taskId: string;
        title: string;
        project?: string;
        minutes: number;
        finishedAt: string;
      }> = Array.isArray(pomodoroLog) ? pomodoroLog : [];
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentEntries = entries.filter(
        (e) => new Date(e.finishedAt).getTime() >= cutoff
      );
      const taskMap = new Map<
        string,
        {
          totalMinutes: number;
          project: string;
          color: string;
          taskId: string;
          date?: Date;
        }
      >();
      const colors = [
        '#3b82f6',
        '#ef4444',
        '#f97316',
        '#6366f1',
        '#10b981',
        '#06b6d4',
      ];
      if (recentEntries.length > 0) {
        recentEntries.forEach((e) => {
          const key = e.title;
          const existing = taskMap.get(key);
          const minutes = Number.isFinite(e.minutes) ? e.minutes : 0;
          if (existing) {
            existing.totalMinutes += minutes;
            existing.date = new Date(e.finishedAt);
          } else {
            taskMap.set(key, {
              totalMinutes: minutes,
              project: e.project || 'Uncategorized',
              color: colors[Math.floor(Math.random() * colors.length)],
              taskId: e.taskId,
              date: new Date(e.finishedAt),
            });
          }
        });
      } else {
        const tasks = await TaskService.getTasks();
        tasks.forEach((task) => {
          const key = task.title;
          const duration = Number.isFinite(task.pomodoroDuration)
            ? (task.pomodoroDuration as number)
            : 25;
          const minutes = (task.completedPomodoros || 0) * duration;
          if (minutes <= 0) return;
          taskMap.set(key, {
            totalMinutes: minutes,
            project: task.project || 'Uncategorized',
            color: colors[Math.floor(Math.random() * colors.length)],
            taskId: task.id,
            date: task.completedAt ? new Date(task.completedAt) : undefined,
          });
        });
      }

      // Return top 15 tasks instead of 10 to handle more data
      return Array.from(taskMap.entries())
        .map(([taskTitle, data]) => ({
          id: data.taskId,
          taskName: taskTitle,
          project: data.project,
          duration: Number.isFinite(data.totalMinutes) ? data.totalMinutes : 0,
          date: data.date || new Date(),
          color: data.color,
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 15); // Increased from 10 to 15
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
      const { pomodoroLog } = await chrome.storage.local.get(['pomodoroLog']);
      const entries: Array<{
        project?: string;
        minutes: number;
        finishedAt: string;
      }> = Array.isArray(pomodoroLog) ? pomodoroLog : [];
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentEntries = entries.filter(
        (e) => new Date(e.finishedAt).getTime() >= cutoff
      );
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

        // Get entries finished on this date; fallback to tasks if empty log
        let dayFocusTime = 0;
        const projects: { [key: string]: number } = {};
        let dayEntries: typeof recentEntries = [];
        let pomodorosCount = 0;

        if (recentEntries.length > 0) {
          dayEntries = recentEntries.filter((e) => {
            const finished = new Date(e.finishedAt);
            return finished.toDateString() === date.toDateString();
          });
          dayFocusTime = dayEntries.reduce(
            (sum, e) => sum + (Number.isFinite(e.minutes) ? e.minutes : 0),
            0
          );
          pomodorosCount = dayEntries.length;
          dayEntries.forEach((e) => {
            const project = e.project || 'Uncategorized';
            projects[project] =
              (projects[project] || 0) +
              (Number.isFinite(e.minutes) ? e.minutes : 0);
          });
        } else {
          // Fallback to tasks for historical data
          const tasks = await TaskService.getTasks();
          tasks.forEach((task) => {
            if (!task.completed || !task.completedAt) return;
            const completedDate = new Date(task.completedAt);
            if (completedDate.toDateString() !== date.toDateString()) return;
            const duration = Number.isFinite(task.pomodoroDuration)
              ? (task.pomodoroDuration as number)
              : 25;
            const minutes = (task.completedPomodoros || 0) * duration;
            dayFocusTime += minutes;
            const project = task.project || 'Uncategorized';
            projects[project] = (projects[project] || 0) + minutes;
          });
          // Estimate pomodoro count from completed tasks
          pomodorosCount = tasks.filter((task) => {
            if (!task.completed || !task.completedAt) return false;
            const completedDate = new Date(task.completedAt);
            return completedDate.toDateString() === date.toDateString();
          }).length;
        }

        data.push({
          date: dateStr,
          pomodoros: pomodorosCount,
          tasks: Object.keys(projects).length,
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
    try {
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
    } catch (error) {
      console.error('Error getting report summary:', error);
      // Return default values if there's an error
      return {
        tasksCompletedToday: 0,
        tasksCompletedThisWeek: 0,
        tasksCompletedThisTwoWeeks: 0,
        tasksCompletedThisMonth: 0,
        focusTimeToday: 0,
        focusTimeThisWeek: 0,
        focusTimeThisTwoWeeks: 0,
        focusTimeThisMonth: 0,
        totalPomodoros: 0,
        averageSessionLength: 0,
      };
    }
  }

  // Remove the initializeSampleData method as it creates hardcoded data
  // The extension should work with real user data only

  // Helper methods
  private async getTotalPomodoros(): Promise<number> {
    try {
      const { pomodoroLog } = await chrome.storage.local.get(['pomodoroLog']);
      const entries: any[] = Array.isArray(pomodoroLog) ? pomodoroLog : [];
      if (entries.length > 0) return entries.length;
      const tasks = await TaskService.getTasks();
      return tasks.reduce(
        (total, task) => total + (task.completedPomodoros || 0),
        0
      );
    } catch (error) {
      console.error('Error getting total pomodoros:', error);
      return 0;
    }
  }

  private async getAverageSessionLength(): Promise<number> {
    try {
      const { pomodoroLog } = await chrome.storage.local.get(['pomodoroLog']);
      const entries: any[] = Array.isArray(pomodoroLog) ? pomodoroLog : [];
      if (entries.length > 0) {
        const total = entries.reduce(
          (sum, e) => sum + (Number.isFinite(e.minutes) ? e.minutes : 0),
          0
        );
        return Math.round(total / entries.length);
      }
      // Fallback from tasks
      const tasks = await TaskService.getTasks();
      const completed = tasks.filter((t) => (t.completedPomodoros || 0) > 0);
      if (completed.length === 0) return 0;
      const total = completed.reduce((sum, t) => {
        const duration = Number.isFinite(t.pomodoroDuration)
          ? (t.pomodoroDuration as number)
          : 25;
        return sum + (t.completedPomodoros || 0) * duration;
      }, 0);
      return Math.round(total / completed.length);
    } catch (error) {
      console.error('Error getting average session length:', error);
      return 0;
    }
  }

  private calculateFocusTime(tasks: Task[], startDate: Date): number {
    return tasks
      .filter((task) => {
        if (!task.completed || !task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return completedDate >= startDate;
      })
      .reduce((total, task) => {
        const duration = Number.isFinite(task.pomodoroDuration)
          ? (task.pomodoroDuration as number)
          : 25;
        return total + (task.completedPomodoros || 0) * duration;
      }, 0);
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

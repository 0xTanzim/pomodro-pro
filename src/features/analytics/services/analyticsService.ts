import { TaskCompletion, FocusTimeEntry, ProjectTimeData, ReportSummary, TaskChartData } from '../types';

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
      const tasks = await this.getTasks();
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfTwoWeeks = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const completedTasks = tasks.filter(task => task.completed && task.completedAt);

      return {
        today: completedTasks.filter(task => task.completedAt! >= startOfDay).length,
        thisWeek: completedTasks.filter(task => task.completedAt! >= startOfWeek).length,
        thisTwoWeeks: completedTasks.filter(task => task.completedAt! >= startOfTwoWeeks).length,
        thisMonth: completedTasks.filter(task => task.completedAt! >= startOfMonth).length,
      };
    } catch (error) {
      console.error('Error getting task completion summary:', error);
      return { today: 0, thisWeek: 0, thisTwoWeeks: 0, thisMonth: 0 };
    }
  }

  // Get focus time summary
  async getFocusTimeSummary(): Promise<{
    today: number;
    thisWeek: number;
    thisTwoWeeks: number;
    thisMonth: number;
  }> {
    try {
      const focusTimeEntries = await this.getFocusTimeEntries();
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfTwoWeeks = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return {
        today: focusTimeEntries
          .filter(entry => entry.date >= startOfDay)
          .reduce((sum, entry) => sum + entry.duration, 0),
        thisWeek: focusTimeEntries
          .filter(entry => entry.date >= startOfWeek)
          .reduce((sum, entry) => sum + entry.duration, 0),
        thisTwoWeeks: focusTimeEntries
          .filter(entry => entry.date >= startOfTwoWeeks)
          .reduce((sum, entry) => sum + entry.duration, 0),
        thisMonth: focusTimeEntries
          .filter(entry => entry.date >= startOfMonth)
          .reduce((sum, entry) => sum + entry.duration, 0),
      };
    } catch (error) {
      console.error('Error getting focus time summary:', error);
      return { today: 0, thisWeek: 0, thisTwoWeeks: 0, thisMonth: 0 };
    }
  }

  // Get project time distribution
  async getProjectTimeDistribution(): Promise<ProjectTimeData[]> {
    try {
      const focusTimeEntries = await this.getFocusTimeEntries();
      const projectMap = new Map<string, { totalTime: number; taskCount: number }>();

      focusTimeEntries.forEach(entry => {
        const existing = projectMap.get(entry.project);
        if (existing) {
          existing.totalTime += entry.duration;
          existing.taskCount += 1;
        } else {
          projectMap.set(entry.project, { totalTime: entry.duration, taskCount: 1 });
        }
      });

      const totalTime = Array.from(projectMap.values()).reduce((sum, data) => sum + data.totalTime, 0);
      const colors = ['#3b82f6', '#ef4444', '#f97316', '#6366f1', '#10b981', '#06b6d4'];

      return Array.from(projectMap.entries()).map(([project, data], index) => ({
        project,
        totalTime: data.totalTime,
        percentage: totalTime > 0 ? Math.round((data.totalTime / totalTime) * 100) : 0,
        color: colors[index % colors.length],
        taskCount: data.taskCount,
      }));
    } catch (error) {
      console.error('Error getting project time distribution:', error);
      return [];
    }
  }

  // Get focus time distribution (top tasks)
  async getFocusTimeDistribution(): Promise<FocusTimeEntry[]> {
    try {
      const focusTimeEntries = await this.getFocusTimeEntries();
      const taskMap = new Map<string, { totalTime: number; project: string; color: string }>();

      focusTimeEntries.forEach(entry => {
        const existing = taskMap.get(entry.taskName);
        if (existing) {
          existing.totalTime += entry.duration;
        } else {
          taskMap.set(entry.taskName, {
            totalTime: entry.duration,
            project: entry.project,
            color: entry.color,
          });
        }
      });

      return Array.from(taskMap.entries())
        .map(([taskName, data]) => ({
          id: taskName,
          taskName,
          project: data.project,
          duration: data.totalTime,
          date: new Date(),
          color: data.color,
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10); // Top 10 tasks
    } catch (error) {
      console.error('Error getting focus time distribution:', error);
      return [];
    }
  }

  // Get task chart data
  async getTaskChartData(timeRange: 'week' | 'biweekly' | 'month'): Promise<TaskChartData[]> {
    try {
      const focusTimeEntries = await this.getFocusTimeEntries();
      const tasks = await this.getTasks();
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
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayEntries = focusTimeEntries.filter(entry => 
          entry.date.toDateString() === date.toDateString()
        );
        
        const dayTasks = tasks.filter(task => 
          task.completed && task.completedAt && 
          task.completedAt.toDateString() === date.toDateString()
        );

        const projects: { [key: string]: number } = {};
        dayEntries.forEach(entry => {
          projects[entry.project] = (projects[entry.project] || 0) + entry.duration;
        });

        data.push({
          date: dateStr,
          pomodoros: dayEntries.length,
          tasks: dayTasks.length,
          focusTime: dayEntries.reduce((sum, entry) => sum + entry.duration, 0),
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

    return {
      tasksCompletedToday: taskSummary.today,
      tasksCompletedThisWeek: taskSummary.thisWeek,
      tasksCompletedThisTwoWeeks: taskSummary.thisTwoWeeks,
      tasksCompletedThisMonth: taskSummary.thisMonth,
      focusTimeToday: focusTimeSummary.today,
      focusTimeThisWeek: focusTimeSummary.thisWeek,
      focusTimeThisTwoWeeks: focusTimeSummary.thisTwoWeeks,
      focusTimeThisMonth: focusTimeSummary.thisMonth,
      totalPomodoros: await this.getTotalPomodoros(),
      averageSessionLength: await this.getAverageSessionLength(),
    };
  }

  // Helper methods to get data from storage
  private async getTasks(): Promise<TaskCompletion[]> {
    try {
      const result = await chrome.storage.sync.get(['tasks']);
      return result.tasks || [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  private async getFocusTimeEntries(): Promise<FocusTimeEntry[]> {
    try {
      const result = await chrome.storage.local.get(['focusTimeEntries']);
      return result.focusTimeEntries || [];
    } catch (error) {
      console.error('Error getting focus time entries:', error);
      return [];
    }
  }

  private async getTotalPomodoros(): Promise<number> {
    try {
      const result = await chrome.storage.local.get(['totalPomodoros']);
      return result.totalPomodoros || 0;
    } catch (error) {
      console.error('Error getting total pomodoros:', error);
      return 0;
    }
  }

  private async getAverageSessionLength(): Promise<number> {
    try {
      const focusTimeEntries = await this.getFocusTimeEntries();
      if (focusTimeEntries.length === 0) return 0;
      
      const totalTime = focusTimeEntries.reduce((sum, entry) => sum + entry.duration, 0);
      return Math.round(totalTime / focusTimeEntries.length);
    } catch (error) {
      console.error('Error getting average session length:', error);
      return 0;
    }
  }
} 
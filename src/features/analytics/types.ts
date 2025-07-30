export interface TaskCompletion {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: Date;
  priority: 'High' | 'Medium' | 'Low';
  project?: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
}

export interface FocusTimeEntry {
  id: string;
  taskName: string;
  project: string;
  duration: number; // in minutes
  date: Date;
  color: string;
}

export interface ProjectTimeData {
  project: string;
  totalTime: number; // in minutes
  percentage: number;
  color: string;
  taskCount: number;
}

export interface TaskChartData {
  date: string;
  pomodoros: number;
  tasks: number;
  focusTime: number;
  projects: { [key: string]: number };
}

export interface ReportSummary {
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisTwoWeeks: number;
  tasksCompletedThisMonth: number;
  focusTimeToday: number;
  focusTimeThisWeek: number;
  focusTimeThisTwoWeeks: number;
  focusTimeThisMonth: number;
  totalPomodoros: number;
  averageSessionLength: number;
}

export type ReportView = 'pomodoro' | 'tasks';
export type TimeRange = 'today' | 'week' | 'biweekly' | 'month'; 
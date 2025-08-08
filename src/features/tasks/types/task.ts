export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project: string;
  tags: string[];
  pomodoroCount: number;
  completedPomodoros: number;
  pomodoroDuration?: number; // Duration in minutes for this specific task
  shortBreakDuration?: number; // Per-task short break in minutes
  longBreakDuration?: number; // Per-task long break in minutes
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  dueDate?: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document';
  url: string;
}

export interface TaskStats {
  totalPomodoroHours: string;
  elapsedTime: string;
  tasksWaiting: number;
  tasksCompleted: number;
  focusTime: string;
}

export interface DailyAchievement {
  date: string;
  focusTime: string;
  completedTasks: number;
  totalPomodoros: number;
}

export type TaskFilter = 'all' | 'today' | 'completed' | 'pending';
export type TaskSort = 'priority' | 'dueDate' | 'createdAt' | 'title';

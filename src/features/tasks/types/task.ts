export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project: string;
  dueDate?: string;
  reminder?: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
  pomodoroCount: number;
  completedPomodoros: number;
  tags: string[];
  attachments: Attachment[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
  color: string;
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

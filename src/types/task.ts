export interface Task {
  id: string;
  name: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
  pomodorosCompleted: number;
  estimatedPomodoros: number;
}

export interface TaskFormData {
  name: string;
  priority: Task["priority"];
  tags: string[];
  estimatedPomodoros: number;
}

export interface TaskFilters {
  completed?: boolean;
  priority?: Task["priority"];
  tags?: string[];
}

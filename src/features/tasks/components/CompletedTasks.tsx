import { Card } from '@/components/ui/card';
import React from 'react';
import { DailyAchievement, Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface CompletedTasksProps {
  tasks: Task[];
  achievements?: DailyAchievement[];
  onToggle?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onStartPomodoro?: (task: Task) => void;
  hasMore?: boolean;
  total?: number;
}

export const CompletedTasks: React.FC<CompletedTasksProps> = ({
  tasks,
  achievements = [],
  onToggle,
  onDelete,
  onEdit,
  onStartPomodoro,
  hasMore = false,
  total = 0,
}) => {
  const completedTasks = tasks.filter((task) => task.completed);

  // Group tasks by completion date
  const groupedTasks = completedTasks.reduce(
    (groups, task) => {
      const date = task.completedAt
        ? new Date(task.completedAt).toDateString()
        : 'Unknown';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
      return groups;
    },
    {} as Record<string, Task[]>
  );

  // Get achievement for a specific date
  const getAchievement = (date: string): DailyAchievement | undefined => {
    return achievements?.find(
      (achievement) => new Date(achievement.date).toDateString() === date
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pb-8">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Completed</h2>
        {hasMore && (
          <p className="text-xs text-gray-500">
            Showing {tasks.length} of {total} completed tasks
          </p>
        )}
      </div>

      {Object.entries(groupedTasks).map(([date, dateTasks]) => {
        const achievement = getAchievement(date);

        return (
          <div key={date} className="space-y-2">
            {/* Date header with achievement summary */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-800">
                {formatDate(date)}
              </h3>
              {achievement && (
                <p className="text-xs text-gray-600">
                  Focus: {achievement.focusTime} Completed:{' '}
                  {achievement.completedTasks} tasks
                </p>
              )}
            </div>

            {/* Completed tasks for this date */}
            <div className="space-y-1">
              {dateTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit ? () => onEdit(task) : () => {}}
                  onDelete={onDelete ? () => onDelete(task.id) : () => {}}
                  onToggleCompletion={
                    onToggle ? () => onToggle(task.id) : () => {}
                  }
                />
              ))}
            </div>
          </div>
        );
      })}

      {completedTasks.length === 0 && (
        <Card className="p-4 text-center">
          <div className="text-gray-500">
            <p className="text-sm font-medium mb-1">No completed tasks yet</p>
            <p className="text-xs">Complete some tasks to see them here!</p>
          </div>
        </Card>
      )}
    </div>
  );
};

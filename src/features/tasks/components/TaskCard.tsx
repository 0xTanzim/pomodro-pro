import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Edit3,
  Flag,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import React from 'react';
import { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggleCompletion: () => void;
}

const TAG_COLORS: Record<string, string> = {
  '#Work': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  '#Personal':
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  '#Urgent': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  '#Meeting':
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  '#Study':
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  '#Health': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
};

const PROJECT_COLORS: Record<string, string> = {
  'AI Chatbot App': 'bg-gradient-to-r from-blue-500 to-purple-600',
  'Website Redesign': 'bg-gradient-to-r from-green-500 to-teal-600',
  'Mobile App': 'bg-gradient-to-r from-orange-500 to-red-600',
  'Database Migration': 'bg-gradient-to-r from-purple-500 to-pink-600',
  'API Integration': 'bg-gradient-to-r from-indigo-500 to-blue-600',
  General: 'bg-gradient-to-r from-gray-500 to-gray-600',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  high: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
  medium: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  low: 'border-green-500 bg-green-50 dark:bg-green-900/20',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleCompletion,
}) => {
  const getTagColor = (tag: string) => {
    return (
      TAG_COLORS[tag] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    );
  };

  const getProjectColor = (project: string) => {
    return PROJECT_COLORS[project] || PROJECT_COLORS['General'];
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && !task.completed;
  };

  return (
    <Card
      className={`p-2 border-l-4 ${getPriorityColor(task.priority)} hover:shadow-md hover:scale-[1.01] transition-all duration-200 group ${
        isOverdue() ? 'border-red-500 bg-red-50' : ''
      }`}
    >
      <div className="flex items-center space-x-2">
        {/* Checkbox */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={onToggleCompletion}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 hover:scale-110 transition-transform border-2 border-gray-300 hover:border-blue-400 data-[state=unchecked]:bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {task.completed && (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                )}
                <h3
                  className={`text-sm font-medium text-gray-900 dark:text-white ${
                    task.completed ? 'line-through text-gray-500' : ''
                  } ${isOverdue() ? 'text-red-600' : ''}`}
                >
                  {task.title}
                </h3>
                {isOverdue() && (
                  <Badge className="text-xs px-1 py-0.5 bg-red-100 text-red-800">
                    Overdue
                  </Badge>
                )}
              </div>

              {/* Project and Priority Badges */}
              <div className="flex items-center space-x-1 mb-1">
                <Badge
                  className={`text-xs px-1 py-0.5 ${getProjectColor(task.project)} text-white`}
                >
                  <FolderOpen className="h-2 w-2 mr-1" />
                  {task.project}
                </Badge>

                <Badge
                  variant="outline"
                  className="text-xs px-1 py-0.5 border-current"
                >
                  <Flag className="h-2 w-2 mr-1" />
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}
                </Badge>
              </div>

              {/* Timestamps and Pomodoro Count */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-2 w-2" />
                  <span>
                    {task.completedPomodoros}/{task.pomodoroCount} pomodoros
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-2 w-2" />
                  <span>{formatDate(task.createdAt)}</span>
                  {task.completedAt && (
                    <>
                      <span>•</span>
                      <span>Completed {formatDate(task.completedAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Complete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCompletion}
                className={`h-6 w-6 p-0 ${
                  task.completed
                    ? 'text-green-600 hover:text-green-700'
                    : 'text-gray-500 hover:text-green-600'
                }`}
                title={
                  task.completed ? 'Mark as incomplete' : 'Mark as complete'
                }
              >
                <Check className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600"
                title="Edit task"
              >
                <Edit3 className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                title="Delete task"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

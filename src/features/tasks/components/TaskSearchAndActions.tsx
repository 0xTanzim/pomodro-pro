import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, SortAsc } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { TaskSort } from '../types/task';

interface TaskSearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: TaskSort;
  onSortChange: (sort: TaskSort) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  onAddTask: () => void;
  todayTasksCount: number;
}

const DAILY_TASK_LIMIT = 30;

export const TaskSearchAndActions: React.FC<TaskSearchAndActionsProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortDirection,
  onSortDirectionChange,
  onAddTask,
  todayTasksCount,
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Check if daily limit is reached
  const isDailyLimitReached = todayTasksCount >= DAILY_TASK_LIMIT;

  // Click outside handler for sort menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node)
      ) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const sortOptions = [
    { value: 'priority', label: 'Priority' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'createdAt', label: 'Created' },
    { value: 'title', label: 'Title' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <div className="relative" ref={sortMenuRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSortMenu(!showSortMenu)}
          className="flex items-center space-x-1 h-8 px-2"
        >
          <SortAsc className="h-3 w-3" />
          <span className="text-xs">Sort</span>
        </Button>

        {showSortMenu && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Sort by
              </div>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value as TaskSort);
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    sortBy === option.value
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Direction
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    onSortDirectionChange('asc');
                    setShowSortMenu(false);
                  }}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    sortDirection === 'asc'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  Asc
                </button>
                <button
                  onClick={() => {
                    onSortDirectionChange('desc');
                    setShowSortMenu(false);
                  }}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    sortDirection === 'desc'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  Desc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onAddTask}
        size="sm"
        className="h-8 px-3"
        disabled={isDailyLimitReached}
        title={
          isDailyLimitReached
            ? `Daily limit reached (${DAILY_TASK_LIMIT} tasks)`
            : 'Add new task'
        }
      >
        <Plus className="h-3 w-3 mr-1" />
        <span className="text-xs">{isDailyLimitReached ? 'Limit' : 'Add'}</span>
      </Button>

      {isDailyLimitReached && (
        <div className="text-xs text-red-500">
          Daily limit: {todayTasksCount}/{DAILY_TASK_LIMIT}
        </div>
      )}
    </div>
  );
};

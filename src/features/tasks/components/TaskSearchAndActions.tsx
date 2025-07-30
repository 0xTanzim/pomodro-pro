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
}

export const TaskSearchAndActions: React.FC<TaskSearchAndActionsProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortDirection,
  onSortDirectionChange,
  onAddTask,
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Click outside handler for sort menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
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
    { value: 'title', label: 'Title' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tasks, tags, or projects..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="relative" ref={sortMenuRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSortMenu(!showSortMenu)}
          className="flex items-center space-x-1"
        >
          <SortAsc className="h-4 w-4" />
          <span>Sort</span>
        </Button>

        {showSortMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2">Sort by</div>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value as TaskSort);
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    sortBy === option.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              <div className="text-xs font-medium text-gray-500 mb-2">Direction</div>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    onSortDirectionChange('asc');
                    setShowSortMenu(false);
                  }}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    sortDirection === 'asc' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
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
                    sortDirection === 'desc' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  Desc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button onClick={onAddTask} size="sm">
        <Plus className="h-4 w-4 mr-1" />
        Add Task
      </Button>
    </div>
  );
};

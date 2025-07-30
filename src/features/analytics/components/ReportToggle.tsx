import React from 'react';
import { ReportView } from '../types';

interface ReportToggleProps {
  view: ReportView;
  onViewChange: (view: ReportView) => void;
}

export const ReportToggle: React.FC<ReportToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6 w-fit">
      <button
        onClick={() => onViewChange('tasks')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          view === 'tasks'
            ? 'bg-orange-500 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Tasks
      </button>
      <button
        onClick={() => onViewChange('pomodoro')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          view === 'pomodoro'
            ? 'bg-orange-500 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Pomodoro
      </button>
    </div>
  );
}; 
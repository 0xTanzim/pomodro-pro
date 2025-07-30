import React from 'react';
import { ReportView, TaskChartData } from '../types';

interface TaskChartProps {
  data: TaskChartData[];
  view: ReportView;
}

export const TaskChart: React.FC<TaskChartProps> = ({ data, view }) => {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const maxValue = data.length > 0
    ? Math.max(...data.map(item => view === 'tasks' ? item.tasks : item.pomodoros))
    : 0;

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No chart data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="relative h-64">
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => {
            const value = view === 'tasks' ? item.tasks : item.pomodoros;
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

            return (
              <div key={item.date} className="flex-1 flex flex-col items-center">
                <div className="relative w-full">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${height}%` }}
                  />
                  {Object.entries(item.projects).map(([project, projectTime], projectIndex) => {
                    const projectHeight = maxValue > 0 ? (projectTime / maxValue) * 100 : 0;
                    const colors = ['#3b82f6', '#ef4444', '#f97316', '#6366f1', '#10b981', '#06b6d4'];

                    return (
                      <div
                        key={project}
                        className="absolute bottom-0 w-full rounded-t transition-all duration-300"
                        style={{
                          height: `${projectHeight}%`,
                          backgroundColor: colors[projectIndex % colors.length],
                          zIndex: projectIndex,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {formatDate(item.date)}
                </div>
                <div className="text-xs font-medium text-gray-900 dark:text-white mt-1">
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {view === 'tasks' ? 'Tasks' : 'Pomodoros'}
          </span>
        </div>
        {data.length > 0 && Object.keys(data[0].projects).length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Projects
            </span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {data.reduce((sum, item) => sum + (view === 'tasks' ? item.tasks : item.pomodoros), 0)}
          </div>
          <div className="text-sm text-gray-500">
            Total {view === 'tasks' ? 'Tasks' : 'Pomodoros'}
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(data.reduce((sum, item) => sum + item.focusTime, 0) / 60)}h
          </div>
          <div className="text-sm text-gray-500">
            Total Focus Time
          </div>
        </div>
      </div>
    </div>
  );
};

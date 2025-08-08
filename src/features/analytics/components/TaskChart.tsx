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
      day: 'numeric',
    });
  };

  // Use focusTime (minutes) for consistent stacking with per-project minutes
  const maxValue =
    data.length > 0 ? Math.max(...data.map((item) => item.focusTime)) : 0;

  // Check if we have any meaningful data
  const hasData = data.some((item) => item.focusTime > 0);
  const totalFocusTime = data.reduce((sum, item) => sum + item.focusTime, 0);
  const totalPomodoros = data.reduce((sum, item) => sum + item.pomodoros, 0);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No chart data available</p>
        <p className="text-sm mt-2">
          Complete some pomodoros to see your progress
        </p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No focus time recorded in this period</p>
        <p className="text-sm mt-2">
          Start a pomodoro session to see your data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="relative h-64">
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => {
            const valueMinutes = item.focusTime;
            const height = maxValue > 0 ? (valueMinutes / maxValue) * 100 : 0;
            const hasProjects = Object.keys(item.projects).length > 0;

            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center"
              >
                <div className="relative w-full">
                  {/* Main bar - only show if there's focus time */}
                  {valueMinutes > 0 && (
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                    />
                  )}

                  {/* Project bars - only show if there are projects with time */}
                  {hasProjects &&
                    valueMinutes > 0 &&
                    Object.entries(item.projects).map(
                      ([project, projectTime], projectIndex) => {
                        const projectHeight =
                          maxValue > 0 ? (projectTime / maxValue) * 100 : 0;
                        const colors = [
                          '#3b82f6',
                          '#ef4444',
                          '#f97316',
                          '#6366f1',
                          '#10b981',
                          '#06b6d4',
                        ];

                        return (
                          <div
                            key={project}
                            className="absolute bottom-0 w-full rounded-t transition-all duration-300"
                            style={{
                              height: `${projectHeight}%`,
                              backgroundColor:
                                colors[projectIndex % colors.length],
                              zIndex: projectIndex,
                            }}
                          />
                        );
                      }
                    )}
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {formatDate(item.date)}
                </div>
                <div className="text-xs font-medium text-gray-900 dark:text-white mt-1">
                  {Math.round(valueMinutes)}m
                </div>
                {item.pomodoros > 0 && (
                  <div className="text-xs text-gray-400">
                    {item.pomodoros} pomodoro{item.pomodoros !== 1 ? 's' : ''}
                  </div>
                )}
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
            Focus Minutes
          </span>
        </div>
        {data.length > 0 &&
          data.some((item) => Object.keys(item.projects).length > 0) && (
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
            {Math.round(totalFocusTime)}m
          </div>
          <div className="text-sm text-gray-500">Total Focus Time</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(totalFocusTime / 60)}h
          </div>
          <div className="text-sm text-gray-500">Total Focus Time</div>
        </div>
      </div>

      {/* Additional stats */}
      {totalPomodoros > 0 && (
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalPomodoros} pomodoro{totalPomodoros !== 1 ? 's' : ''} completed
          </div>
        </div>
      )}
    </div>
  );
};

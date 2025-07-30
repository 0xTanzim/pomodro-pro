import React from 'react';
import { ProjectTimeData } from '../types';

interface ProjectTimeDistributionProps {
  data: ProjectTimeData[];
}

export const ProjectTimeDistribution: React.FC<ProjectTimeDistributionProps> = ({ data }) => {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const totalTime = data.reduce((sum, item) => sum + item.totalTime, 0);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No project data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Donut Chart */}
      <div className="relative flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const previousItems = data.slice(0, index);
              const previousTotal = previousItems.reduce((sum, prevItem) => sum + prevItem.totalTime, 0);
              const startAngle = (previousTotal / totalTime) * 360;
              const endAngle = ((previousTotal + item.totalTime) / totalTime) * 360;

              const startRadians = (startAngle * Math.PI) / 180;
              const endRadians = (endAngle * Math.PI) / 180;

              const x1 = 50 + 35 * Math.cos(startRadians);
              const y1 = 50 + 35 * Math.sin(startRadians);
              const x2 = 50 + 35 * Math.cos(endRadians);
              const y2 = 50 + 35 * Math.sin(endRadians);

              const largeArcFlag = item.totalTime / totalTime > 0.5 ? 1 : 0;

              const pathData = [
                `M ${x1} ${y1}`,
                `A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              ].join(' ');

              return (
                <path
                  key={item.project}
                  d={pathData}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(totalTime)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total Time
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.project} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.project}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.taskCount} tasks
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formatTime(item.totalTime)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.percentage}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

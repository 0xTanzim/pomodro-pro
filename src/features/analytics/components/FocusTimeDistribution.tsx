import React from 'react';
import { FocusTimeEntry } from '../types';

interface FocusTimeDistributionProps {
  data: FocusTimeEntry[];
}

export const FocusTimeDistribution: React.FC<FocusTimeDistributionProps> = ({ data }) => {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const maxTime = data.length > 0 ? Math.max(...data.map(item => item.duration)) : 0;

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No focus time data available</p>
        </div>
      ) : (
        data.map((item, index) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.taskName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.project}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white ml-4">
                {formatTime(item.duration)}
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${maxTime > 0 ? (item.duration / maxTime) * 100 : 0}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

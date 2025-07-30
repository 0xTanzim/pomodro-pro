import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReportSummary, ReportView } from '../types';

interface TaskCompletionCardsProps {
  summary: ReportSummary | null;
  view: ReportView;
}

export const TaskCompletionCards: React.FC<TaskCompletionCardsProps> = ({ summary, view }) => {
  if (!summary) return null;

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCardsData = () => {
    if (view === 'tasks') {
      return [
        {
          value: summary.tasksCompletedToday,
          label: 'Task Completed Today',
          color: 'text-orange-600',
        },
        {
          value: summary.tasksCompletedThisWeek,
          label: 'Task Completed This Week',
          color: 'text-orange-600',
        },
        {
          value: summary.tasksCompletedThisTwoWeeks,
          label: 'Task Completed This Two Weeks',
          color: 'text-orange-600',
        },
        {
          value: summary.tasksCompletedThisMonth,
          label: 'Task Completed This Month',
          color: 'text-orange-600',
        },
      ];
    } else {
      return [
        {
          value: formatTime(summary.focusTimeToday),
          label: 'Focus Time Today',
          color: 'text-orange-600',
        },
        {
          value: formatTime(summary.focusTimeThisWeek),
          label: 'Focus Time This Week',
          color: 'text-orange-600',
        },
        {
          value: formatTime(summary.focusTimeThisTwoWeeks),
          label: 'Focus Time This Two Weeks',
          color: 'text-orange-600',
        },
        {
          value: formatTime(summary.focusTimeThisMonth),
          label: 'Focus Time This Month',
          color: 'text-orange-600',
        },
      ];
    }
  };

  const cardsData = getCardsData();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cardsData.map((card, index) => (
        <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${card.color} mb-2`}>
                {card.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {card.label}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 
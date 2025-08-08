import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, ListTodo, Timer } from 'lucide-react';
import React from 'react';
import { TaskStats as TaskStatsType } from '../types/task';

interface TaskStatsProps {
  stats: TaskStatsType;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}> = ({ icon, value, label, color }) => (
  <Card className="p-2 text-center hover:shadow-sm transition-shadow cursor-pointer">
    <div className="flex flex-col items-center space-y-1">
      <div className={`p-1.5 rounded-full ${color}`}>{icon}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 font-medium leading-tight">
        {label}
      </div>
    </div>
  </Card>
);

export const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-2 mb-3">
      <StatCard
        icon={<Clock className="w-4 h-4 text-white" />}
        value={stats.totalPomodoroHours}
        label="Pomodoro Hours"
        color="bg-red-500"
      />

      <StatCard
        icon={<Timer className="w-4 h-4 text-white" />}
        value={stats.elapsedTime}
        label="Elapsed Time"
        color="bg-red-500"
      />

      <StatCard
        icon={<ListTodo className="w-4 h-4 text-white" />}
        value={stats.tasksWaiting}
        label="Tasks Waiting"
        color="bg-red-500"
      />

      <StatCard
        icon={<CheckCircle className="w-4 h-4 text-white" />}
        value={stats.tasksCompleted}
        label="Tasks Completed"
        color="bg-red-500"
      />
    </div>
  );
};

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
  <Card className="p-4 text-center hover:shadow-md transition-shadow">
    <div className="flex flex-col items-center space-y-2">
      <div className={`p-2 rounded-full ${color}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
      </div>
      <div className="text-xs text-gray-600 font-medium">
        {label}
      </div>
    </div>
  </Card>
);

export const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <StatCard
        icon={<Clock className="w-5 h-5 text-white" />}
        value={stats.totalPomodoroHours}
        label="Total Pomodoro Hours"
        color="bg-red-500"
      />

      <StatCard
        icon={<Timer className="w-5 h-5 text-white" />}
        value={stats.elapsedTime}
        label="Elapsed Time"
        color="bg-red-500"
      />

      <StatCard
        icon={<ListTodo className="w-5 h-5 text-white" />}
        value={stats.tasksWaiting}
        label="Task Waiting"
        color="bg-red-500"
      />

      <StatCard
        icon={<CheckCircle className="w-5 h-5 text-white" />}
        value={stats.tasksCompleted}
        label="Task Completed"
        color="bg-red-500"
      />
    </div>
  );
};

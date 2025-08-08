import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useState } from 'react';
import { Task } from '../types/task';
import { CompletedTasks } from './CompletedTasks';
import { TaskCard } from './TaskCard';

interface TaskTabsProps {
  sortedTasks: Task[];
  todayTasks: Task[];
  pendingTasks: Task[];
  completedTasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleCompletion: (taskId: string) => void;
}

export const TaskTabs: React.FC<TaskTabsProps> = ({
  sortedTasks,
  todayTasks,
  pendingTasks,
  completedTasks,
  onEditTask,
  onDeleteTask,
  onToggleCompletion,
}) => {
  // Smart limiting for large numbers
  const formatCount = (count: number) => {
    if (count > 999) {
      return `${Math.floor(count / 1000)}k+`;
    }
    return count.toString();
  };

  // Limit tasks for performance (show first 50, then "show more")
  const limitTasks = (tasks: Task[], limit: number = 50) => {
    if (tasks.length <= limit) {
      return { tasks, hasMore: false };
    }
    return { tasks: tasks.slice(0, limit), hasMore: true, total: tasks.length };
  };

  // Smart limits based on tab type
  const todayLimited = limitTasks(todayTasks, 30); // Daily limit
  const pendingLimited = limitTasks(pendingTasks, 100); // Higher limit for pending
  const allLimited = limitTasks(sortedTasks, 100); // Higher limit for overview
  const completedLimited = limitTasks(completedTasks, 50); // Recent completed only

  const [activeTab, setActiveTab] = useState<string>('today');

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full h-full flex flex-col"
    >
      <TabsList className="grid w-full grid-cols-4 flex-shrink-0 mb-1">
        <TabsTrigger value="today">
          Today ({formatCount(todayTasks.length)})
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending ({formatCount(pendingTasks.length)})
        </TabsTrigger>
        <TabsTrigger value="all">
          All ({formatCount(sortedTasks.length)})
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed ({formatCount(completedTasks.length)})
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden min-h-0">
        <TabsContent
          value="today"
          className="h-full overflow-y-auto space-y-1 mt-1 pb-20"
        >
          {todayTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p>No tasks due today. Great job staying on top of things!</p>
            </div>
          ) : (
            <>
              {todayLimited.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onToggleCompletion={() => onToggleCompletion(task.id)}
                />
              ))}
              {todayLimited.hasMore && (
                <div className="text-center text-gray-500 py-2 text-sm">
                  Showing {todayLimited.tasks.length} of {todayLimited.total}{' '}
                  today's tasks
                </div>
              )}
              {todayTasks.filter((t) => !t.completed).length > 0 && (
                <div className="text-center text-orange-500 py-2 text-xs">
                  ⚠️ {todayTasks.filter((t) => !t.completed).length} incomplete
                  tasks from today
                </div>
              )}
              <div className="h-16"></div>
            </>
          )}
        </TabsContent>

        <TabsContent
          value="pending"
          className="h-full overflow-y-auto space-y-1 mt-1 pb-20"
        >
          {pendingTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p>All tasks completed! Time to celebrate! 🎉</p>
            </div>
          ) : (
            <>
              {pendingLimited.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onToggleCompletion={() => onToggleCompletion(task.id)}
                />
              ))}
              {pendingLimited.hasMore && (
                <div className="text-center text-gray-500 py-2 text-sm">
                  Showing {pendingLimited.tasks.length} of{' '}
                  {pendingLimited.total} pending tasks
                </div>
              )}
              <div className="h-16"></div>
            </>
          )}
        </TabsContent>

        <TabsContent
          value="all"
          className="h-full overflow-y-auto space-y-1 mt-1 pb-20"
        >
          {sortedTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p>No tasks found. Create your first task to get started!</p>
            </div>
          ) : (
            <>
              {allLimited.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onToggleCompletion={() => onToggleCompletion(task.id)}
                />
              ))}
              {allLimited.hasMore && (
                <div className="text-center text-gray-500 py-2 text-sm">
                  Showing {allLimited.tasks.length} of {allLimited.total} total
                  tasks
                </div>
              )}
              <div className="h-16"></div>
            </>
          )}
        </TabsContent>

        <TabsContent
          value="completed"
          className="h-full overflow-y-auto mt-1 pb-20"
        >
          <CompletedTasks
            tasks={completedLimited.tasks}
            onToggle={onToggleCompletion}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
            hasMore={completedLimited.hasMore}
            total={completedLimited.total}
          />
          <div className="h-16"></div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

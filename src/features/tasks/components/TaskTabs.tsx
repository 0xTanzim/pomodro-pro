import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';
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
  return (
    <Tabs defaultValue="all" className="w-full h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
        <TabsTrigger value="all">All ({sortedTasks.length})</TabsTrigger>
        <TabsTrigger value="today">Today ({todayTasks.length})</TabsTrigger>
        <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
        <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden min-h-0">
        <TabsContent value="all" className="h-full overflow-y-auto space-y-2 mt-4 pb-6">
          {sortedTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No tasks found. Create your first task to get started!</p>
            </div>
          ) : (
            <>
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onToggleCompletion={() => onToggleCompletion(task.id)}
                />
              ))}
              <div className="h-4"></div> {/* Bottom space */}
            </>
          )}
        </TabsContent>

        <TabsContent value="today" className="h-full overflow-y-auto space-y-2 mt-4 pb-6">
          {todayTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No tasks due today. Great job staying on top of things!</p>
            </div>
          ) : (
            <>
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onToggleCompletion={() => onToggleCompletion(task.id)}
                />
              ))}
              <div className="h-4"></div> {/* Bottom space */}
            </>
          )}
        </TabsContent>

        <TabsContent value="pending" className="h-full overflow-y-auto space-y-2 mt-4 pb-6">
          {pendingTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>All tasks completed! Time to celebrate! 🎉</p>
            </div>
          ) : (
            <>
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onToggleCompletion={() => onToggleCompletion(task.id)}
                />
              ))}
              <div className="h-4"></div> {/* Bottom space */}
            </>
          )}
        </TabsContent>

        <TabsContent value="completed" className="h-full overflow-y-auto mt-4 pb-6">
          <CompletedTasks
            tasks={completedTasks}
            onToggle={onToggleCompletion}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
          />
          <div className="h-4"></div> {/* Bottom space */}
        </TabsContent>
      </div>
    </Tabs>
  );
};

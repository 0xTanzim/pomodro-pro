import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Task, TaskSort } from '../types/task';
import { AddTaskForm } from './AddTaskForm';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskSearchAndActions } from './TaskSearchAndActions';
import { TaskStats } from './TaskStats';
import { TaskTabs } from './TaskTabs';

export const TaskList: React.FC = () => {
  const {
    tasks,
    priorities,
    projects,
    stats,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  } = useTasks();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<TaskSort>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      await addTask(taskData);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleSaveTask = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask.id, updatedTask);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleCompletion = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         task.project.toLowerCase().includes(searchTerm.toLowerCase());

    if (searchTerm) return matchesSearch;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };

    switch (sortBy) {
      case 'priority':
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return sortDirection === 'desc' ? bPriority - aPriority : aPriority - bPriority;
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const aDate = new Date(a.dueDate).getTime();
        const bDate = new Date(b.dueDate).getTime();
        return sortDirection === 'desc' ? bDate - aDate : aDate - bDate;
      case 'createdAt':
        const aCreated = new Date(a.createdAt).getTime();
        const bCreated = new Date(b.createdAt).getTime();
        return sortDirection === 'desc' ? bCreated - aCreated : aCreated - bCreated;
      case 'title':
        const comparison = a.title.localeCompare(b.title);
        return sortDirection === 'desc' ? -comparison : comparison;
      default:
        return 0;
    }
  });

  const todayTasks = sortedTasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate === today;
  });

  const pendingTasks = sortedTasks.filter(task => !task.completed);
  const completedTasks = sortedTasks.filter(task => task.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading tasks">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Stats */}
      {stats && <TaskStats stats={stats} />}

      {/* Search and Actions */}
      <TaskSearchAndActions
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
        onAddTask={() => setShowAddDialog(true)}
      />

      {/* Tabs */}
      <div className="flex-1 min-h-0">
        <TaskTabs
          sortedTasks={sortedTasks}
          todayTasks={todayTasks}
          pendingTasks={pendingTasks}
          completedTasks={completedTasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onToggleCompletion={handleToggleCompletion}
        />
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task with all the details you need.
            </DialogDescription>
          </DialogHeader>

          <AddTaskForm
            onAdd={handleAddTask}
            onCancel={() => setShowAddDialog(false)}
            priorities={priorities}
            projects={projects}
          />
        </DialogContent>
      </Dialog>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTask}
        priorities={priorities}
        projects={projects}
      />
    </div>
  );
};

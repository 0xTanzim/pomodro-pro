import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, SortAsc, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Task, TaskSort } from '../types/task';
import { CompletedTasks } from './CompletedTasks';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskStats } from './TaskStats';

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
    getTasksByFilter,
  } = useTasks();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<TaskSort>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Use priorities and projects from settings

  // Click outside handler for sort menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      <div className="flex items-center justify-center h-64">
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
    <div className="space-y-4">
      {/* Stats */}
      {stats && <TaskStats stats={stats} />}

      {/* Search and Actions */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks, tags, or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative" ref={sortMenuRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center space-x-1"
          >
            <SortAsc className="h-4 w-4" />
            <span>Sort</span>
          </Button>

          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2">Sort by</div>
                {[
                  { value: 'priority', label: 'Priority' },
                  { value: 'dueDate', label: 'Due Date' },
                  { value: 'createdAt', label: 'Created' },
                  { value: 'title', label: 'Title' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value as TaskSort);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      sortBy === option.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <div className="text-xs font-medium text-gray-500 mb-2">Direction</div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setSortDirection('asc');
                      setShowSortMenu(false);
                    }}
                    className={`flex-1 px-2 py-1 text-xs rounded ${
                      sortDirection === 'asc' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    Asc
                  </button>
                  <button
                    onClick={() => {
                      setSortDirection('desc');
                      setShowSortMenu(false);
                    }}
                    className={`flex-1 px-2 py-1 text-xs rounded ${
                      sortDirection === 'desc' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    Desc
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <Button onClick={() => setShowAddDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({sortedTasks.length})</TabsTrigger>
          <TabsTrigger value="today">Today ({todayTasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2">
          {sortedTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No tasks found. Create your first task to get started!</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onToggleCompletion={() => handleToggleCompletion(task.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-2">
          {todayTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No tasks due today. Great job staying on top of things!</p>
            </div>
          ) : (
            todayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onToggleCompletion={() => handleToggleCompletion(task.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-2">
          {pendingTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>All tasks completed! Time to celebrate! 🎉</p>
            </div>
          ) : (
            pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onToggleCompletion={() => handleToggleCompletion(task.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-2">
          <CompletedTasks tasks={completedTasks} />
        </TabsContent>
      </Tabs>

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

// Add Task Form Component
interface AddTaskFormProps {
  onAdd: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  priorities: { id: string; name: string; color: string }[];
  projects: { id: string; name: string; color: string }[];
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd, onCancel, priorities, projects }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pomodoros: 1,
    priority: priorities[0]?.name || 'Medium',
    project: projects[0]?.name || 'Work',
    dueDate: '',
    reminder: '',
    repeat: 'none' as const,
    tags: [] as string[],
    notes: '',
    subtasks: [] as any[]
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onAdd({
        title: formData.title.trim(),
        description: formData.description || '',
        priority: formData.priority,
        project: formData.project,
        pomodoros: formData.pomodoros,
        completedPomodoros: 0,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        reminder: formData.reminder ? new Date(formData.reminder).toISOString() : null,
        repeat: formData.repeat,
        tags: formData.tags,
        notes: formData.notes,
        subtasks: formData.subtasks,
        completed: false,
        attachments: []
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Task Title *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter task title..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Pomodoro Count</label>
          <Input
            type="number"
            min="1"
            value={formData.pomodoroCount}
            onChange={(e) => setFormData(prev => ({ ...prev, pomodoroCount: parseInt(e.target.value) || 1 }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Priority</label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(priority => (
                <SelectItem key={priority} value={priority.toLowerCase()}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Project</label>
          <Select
            value={formData.project}
            onValueChange={(value) => setFormData(prev => ({ ...prev, project: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Due Date</label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Tags</label>
        <div className="flex space-x-2">
          <Input
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }))}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Task
        </Button>
      </div>
    </form>
  );
};

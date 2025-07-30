import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { Task } from '../types/task';

interface AddTaskFormProps {
  onAdd: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  priorities: { id: string; name: string; color: string }[];
  projects: { id: string; name: string; color: string }[];
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd, onCancel, priorities, projects }) => {
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

  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onAdd({
        title: formData.title.trim(),
        description: formData.description || '',
        priority: formData.priority.toLowerCase() as Task['priority'],
        project: formData.project,
        pomodoroCount: formData.pomodoros,
        completedPomodoros: 0,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        reminder: formData.reminder ? new Date(formData.reminder).toISOString() : undefined,
        repeat: formData.repeat,
        tags: formData.tags,
        notes: formData.notes,

        completed: false,
        attachments: [],
        color: '#3b82f6'
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
        <label htmlFor="task-title" className="text-sm font-medium">Task Title *</label>
        <Input
          id="task-title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter task title..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="pomodoro-count" className="text-sm font-medium">Pomodoro Count</label>
          <Input
            id="pomodoro-count"
            type="number"
            min="1"
            value={formData.pomodoros}
            onChange={(e) => setFormData(prev => ({ ...prev, pomodoros: parseInt(e.target.value) || 1 }))}
          />
        </div>
        <div>
          <label htmlFor="priority-select" className="text-sm font-medium">Priority</label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger id="priority-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(priority => (
                <SelectItem key={priority.name} value={priority.name}>
                  {priority.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="project-select" className="text-sm font-medium">Project</label>
          <Select
            value={formData.project}
            onValueChange={(value) => setFormData(prev => ({ ...prev, project: value }))}
          >
            <SelectTrigger id="project-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.name} value={project.name}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="due-date" className="text-sm font-medium">Due Date</label>
          <Input
            id="due-date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label htmlFor="tag-input" className="text-sm font-medium">Tags</label>
        <div className="flex space-x-2">
          <Input
            id="tag-input"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="sm" aria-label="Add tag">
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
                  aria-label={`Remove tag ${tag}`}
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

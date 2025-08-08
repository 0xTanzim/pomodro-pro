import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Plus, Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Task } from '../types/task';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  priorities: { id: string; name: string; color: string }[];
  projects: { id: string; name: string; color: string }[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  priorities,
  projects,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setIsEditing(false);
    }
  }, [task]);

  if (!task || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
  };

  const addTag = () => {
    if (newTag.trim() && !editedTask.tags.includes(newTag.trim())) {
      setEditedTask((prev) =>
        prev
          ? {
              ...prev,
              tags: [...prev.tags, newTag.trim()],
            }
          : null
      );
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedTask((prev) =>
      prev
        ? {
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
          }
        : null
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? 'Edit Task' : 'Task Details'}</span>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Make changes to your task'
              : 'View task details and progress'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedTask.title}
                  onChange={(e) =>
                    setEditedTask((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedTask.description}
                  onChange={(e) =>
                    setEditedTask((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={editedTask.priority}
                    onValueChange={(value) =>
                      setEditedTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              priority: value.toLowerCase() as Task['priority'],
                            }
                          : null
                      )
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem
                          key={priority.id}
                          value={priority.name.toLowerCase()}
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: priority.color }}
                            />
                            <span>{priority.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select
                    value={editedTask.project}
                    onValueChange={(value) =>
                      setEditedTask((prev) =>
                        prev ? { ...prev, project: value } : null
                      )
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.name}>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            <span>{project.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pomodoroCount">Pomodoros</Label>
                  <Input
                    id="pomodoroCount"
                    type="number"
                    value={editedTask.pomodoroCount}
                    onChange={(e) =>
                      setEditedTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              pomodoroCount: parseInt(e.target.value) || 0,
                            }
                          : null
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completedPomodoros">Completed</Label>
                  <Input
                    id="completedPomodoros"
                    type="number"
                    value={editedTask.completedPomodoros}
                    onChange={(e) =>
                      setEditedTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              completedPomodoros: parseInt(e.target.value) || 0,
                            }
                          : null
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pomodoroDuration">
                    Pomodoro Duration (min)
                  </Label>
                  <Input
                    id="pomodoroDuration"
                    type="number"
                    value={editedTask.pomodoroDuration || 25}
                    onChange={(e) =>
                      setEditedTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              pomodoroDuration: Math.max(
                                1,
                                parseInt(e.target.value) || 25
                              ),
                            }
                          : null
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortBreakDuration">Short Break (min)</Label>
                  <Input
                    id="shortBreakDuration"
                    type="number"
                    value={editedTask.shortBreakDuration ?? 5}
                    onChange={(e) =>
                      setEditedTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              shortBreakDuration: Math.max(
                                1,
                                parseInt(e.target.value) || 5
                              ),
                            }
                          : null
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreakDuration">Long Break (min)</Label>
                  <Input
                    id="longBreakDuration"
                    type="number"
                    value={editedTask.longBreakDuration ?? 10}
                    onChange={(e) =>
                      setEditedTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              longBreakDuration: Math.max(
                                1,
                                parseInt(e.target.value) || 10
                              ),
                            }
                          : null
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates and Reminders */}
          <Card>
            <CardHeader>
              <CardTitle>Dates & Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={
                      editedTask.dueDate ? editedTask.dueDate.split('T')[0] : ''
                    }
                    onChange={(e) =>
                      setEditedTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              dueDate: e.target.value
                                ? new Date(e.target.value).toISOString()
                                : undefined,
                            }
                          : null
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder">Reminder</Label>
                  <Input
                    id="reminder"
                    type="datetime-local"
                    value={
                      editedTask.reminder
                        ? editedTask.reminder.slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setEditedTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              reminder: e.target.value
                                ? new Date(e.target.value).toISOString()
                                : undefined,
                            }
                          : null
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat">Repeat</Label>
                <Select
                  value={editedTask.repeat}
                  onValueChange={(value) =>
                    setEditedTask((prev) =>
                      prev ? { ...prev, repeat: value as Task['repeat'] } : null
                    )
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add new tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {editedTask.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>#{tag}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedTask.notes}
                onChange={(e) =>
                  setEditedTask((prev) =>
                    prev ? { ...prev, notes: e.target.value } : null
                  )
                }
                disabled={!isEditing}
                rows={4}
                placeholder="Add notes about this task..."
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

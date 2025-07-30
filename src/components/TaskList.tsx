import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTaskStore } from "@/store/taskStore";
import { Calendar, Clock, Edit, Plus, Star, Tag, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";

const priorityConfig = {
  high: {
    gradient: "from-red-500 to-pink-600",
    bgGradient: "from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950",
    icon: Star,
    label: "High Priority"
  },
  medium: {
    gradient: "from-yellow-500 to-orange-600",
    bgGradient: "from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950",
    icon: TrendingUp,
    label: "Medium Priority"
  },
  low: {
    gradient: "from-green-500 to-emerald-600",
    bgGradient: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
    icon: Calendar,
    label: "Low Priority"
  },
} as const;

export default function TaskList(): JSX.Element {
  const { getFilteredTasks, toggleTask, deleteTask, addTask, updateTask } = useTaskStore();
  const tasks = getFilteredTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTaskTags, setNewTaskTags] = useState("");
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(1);

  const handleAddTask = (): void => {
    if (newTaskName.trim()) {
      if (editingTask) {
        // Update existing task
        updateTask(editingTask, {
          name: newTaskName.trim(),
          priority: newTaskPriority,
          tags: newTaskTags.split(",").map(tag => tag.trim()).filter(Boolean),
          estimatedPomodoros: newTaskPomodoros,
        });
        setEditingTask(null);
      } else {
        // Add new task
      addTask({
        name: newTaskName.trim(),
        priority: newTaskPriority,
        tags: newTaskTags.split(",").map(tag => tag.trim()).filter(Boolean),
        estimatedPomodoros: newTaskPomodoros,
      });
      }
      // Reset form
      setNewTaskName("");
      setNewTaskPriority("medium");
      setNewTaskTags("");
      setNewTaskPomodoros(1);
      // Close dialog
      setIsDialogOpen(false);
    }
  };

  const resetForm = (): void => {
    setNewTaskName("");
    setNewTaskPriority("medium");
    setNewTaskTags("");
    setNewTaskPomodoros(1);
    setEditingTask(null);
  };

  const handleEditTask = (task: any): void => {
    setEditingTask(task.id);
    setNewTaskName(task.name);
    setNewTaskPriority(task.priority);
    setNewTaskTags(task.tags.join(", "));
    setNewTaskPomodoros(task.estimatedPomodoros);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Add Task Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <Plus className="w-5 h-5 mr-3" />
            Create New Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {editingTask ? "Edit Task" : "Create New Task"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add a new task to your Pomodoro workflow. Set the priority, add tags, and estimate the number of Pomodoros needed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Task Name</label>
              <Input
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Enter task name..."
                className="rounded-xl border-2 focus:border-indigo-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTask();
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">Priority Level</label>
              <div className="grid grid-cols-3 gap-3">
                {(["high", "medium", "low"] as const).map((priority) => {
                  const config = priorityConfig[priority];
                  const IconComponent = config.icon;
                  return (
                    <Button
                      key={priority}
                      variant={newTaskPriority === priority ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewTaskPriority(priority)}
                      className={`rounded-xl transition-all duration-200 ${
                        newTaskPriority === priority
                          ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-1" />
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Tags (comma separated)</label>
              <Input
                value={newTaskTags}
                onChange={(e) => setNewTaskTags(e.target.value)}
                placeholder="work, urgent, project..."
                className="rounded-xl border-2 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Estimated Pomodoros</label>
              <Input
                type="number"
                min="1"
                value={newTaskPomodoros}
                onChange={(e) => setNewTaskPomodoros(parseInt(e.target.value) || 1)}
                className="rounded-xl border-2 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAddTask}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
              >
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
                className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task List */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
        {tasks.map((task) => {
          const taskPriorityConfig = priorityConfig[task.priority];
          const IconComponent = taskPriorityConfig.icon;

          return (
            <Card
              key={task.id}
              className={`p-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl bg-gradient-to-br ${taskPriorityConfig.bgGradient}`}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-1 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-500 data-[state=checked]:to-purple-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className={`text-base font-bold text-gray-800 dark:text-gray-100 ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}>
                      {task.name}
                    </h3>
                    <Badge className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${taskPriorityConfig.gradient} text-white shadow-md`}>
                      <IconComponent className="w-3 h-3 mr-1" />
                      {taskPriorityConfig.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {task.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs px-2 py-1 rounded-full border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-2 py-1 rounded-full border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50">
                        +{task.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{task.pomodorosCompleted}</span>
                    <span>/</span>
                    <span className="font-medium">{task.estimatedPomodoros}</span>
                    <span>pomodoros</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditTask(task)}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-full transition-all duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTask(task.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded-full transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
              <Plus className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">No tasks yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Create your first task to get started with your productivity journey!</p>
          </div>
        )}
      </div>
    </div>
  );
}

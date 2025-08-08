import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Bell,
  Clock,
  Flag,
  FolderOpen,
  Plus,
  Save,
  Settings,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Priority {
  id: string;
  name: string;
  color: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
}

const defaultPriorities: Priority[] = [
  { id: '1', name: 'High', color: '#ef4444' },
  { id: '2', name: 'Medium', color: '#f97316' },
  { id: '3', name: 'Low', color: '#10b981' },
];

const defaultProjects: Project[] = [
  { id: '1', name: 'Work', color: '#3b82f6' },
  { id: '2', name: 'Personal', color: '#8b5cf6' },
  { id: '3', name: 'Study', color: '#06b6d4' },
];

const defaultTimerSettings: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  notifications: true,
};

export default function Options(): React.JSX.Element {
  const [priorities, setPriorities] = useState<Priority[]>(defaultPriorities);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [timerSettings, setTimerSettings] =
    useState<TimerSettings>(defaultTimerSettings);
  const [newPriority, setNewPriority] = useState('');
  const [newProject, setNewProject] = useState('');
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  const openReport = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
  };

  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await chrome.storage.sync.get([
          'priorities',
          'projects',
          'timerSettings',
        ]);
        if (result.priorities) setPriorities(result.priorities);
        if (result.projects) setProjects(result.projects);
        if (result.timerSettings) {
          const ts = result.timerSettings;
          setTimerSettings({
            ...ts,
            focusDuration: Math.round((ts.focusDuration ?? 1500) / 60),
            shortBreakDuration: Math.round((ts.shortBreakDuration ?? 300) / 60),
            longBreakDuration: Math.round((ts.longBreakDuration ?? 900) / 60),
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Save settings to storage
  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      const timerSettingsInSeconds = {
        ...timerSettings,
        focusDuration:
          Math.max(1, Math.round(timerSettings.focusDuration)) * 60,
        shortBreakDuration:
          Math.max(1, Math.round(timerSettings.shortBreakDuration)) * 60,
        longBreakDuration:
          Math.max(1, Math.round(timerSettings.longBreakDuration)) * 60,
      };

      await chrome.storage.sync.set({
        priorities,
        projects,
        timerSettings: timerSettingsInSeconds,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    }
  };

  // Priority CRUD operations
  const addPriority = () => {
    if (
      newPriority.trim() &&
      !priorities.find(
        (p) => p.name.toLowerCase() === newPriority.trim().toLowerCase()
      )
    ) {
      const priority: Priority = {
        id: Date.now().toString(),
        name: newPriority.trim(),
        color: '#6b7280',
      };
      setPriorities([...priorities, priority]);
      setNewPriority('');
    }
  };

  const removePriority = (id: string) => {
    setPriorities(priorities.filter((p) => p.id !== id));
  };

  const updatePriority = (id: string, name: string) => {
    setPriorities(priorities.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  // Project CRUD operations
  const addProject = () => {
    if (
      newProject.trim() &&
      !projects.find(
        (p) => p.name.toLowerCase() === newProject.trim().toLowerCase()
      )
    ) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.trim(),
        color: '#6b7280',
      };
      setProjects([...projects, project]);
      setNewProject('');
    }
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const updateProject = (id: string, name: string) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  // Timer settings updates
  const updateTimerSetting = (key: keyof TimerSettings, value: any) => {
    setTimerSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Settings className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Customize your Pomodoro experience
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={openReport}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>View Report</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Save Status */}
        {saveStatus === 'saving' && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Saving settings...</span>
            </div>
          </div>
        )}

        {saveStatus === 'saved' && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <span>✓ Settings saved successfully!</span>
            </div>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <span>✗ Failed to save settings. Please try again.</span>
            </div>
          </div>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Task Settings */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Priorities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flag className="h-5 w-5" />
                  <span>Task Priorities</span>
                </CardTitle>
                <CardDescription>
                  Manage the priority levels available for tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add new priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPriority()}
                  />
                  <Button onClick={addPriority} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {priorities.map((priority) => (
                    <div
                      key={priority.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: priority.color }}
                        />
                        <Input
                          value={priority.name}
                          onChange={(e) =>
                            updatePriority(priority.id, e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePriority(priority.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5" />
                  <span>Projects</span>
                </CardTitle>
                <CardDescription>
                  Manage the projects available for task organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add new project"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addProject()}
                  />
                  <Button onClick={addProject} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <Input
                          value={project.name}
                          onChange={(e) =>
                            updateProject(project.id, e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProject(project.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timer Settings */}
          <TabsContent value="timer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Timer Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure timer durations and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="focusDuration">
                      Focus Duration (minutes)
                    </Label>
                    <Input
                      id="focusDuration"
                      type="number"
                      value={timerSettings.focusDuration}
                      onChange={(e) =>
                        updateTimerSetting(
                          'focusDuration',
                          parseInt(e.target.value) || 25
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortBreakDuration">
                      Short Break (minutes)
                    </Label>
                    <Input
                      id="shortBreakDuration"
                      type="number"
                      value={timerSettings.shortBreakDuration}
                      onChange={(e) =>
                        updateTimerSetting(
                          'shortBreakDuration',
                          parseInt(e.target.value) || 5
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longBreakDuration">
                      Long Break (minutes)
                    </Label>
                    <Input
                      id="longBreakDuration"
                      type="number"
                      value={timerSettings.longBreakDuration}
                      onChange={(e) =>
                        updateTimerSetting(
                          'longBreakDuration',
                          parseInt(e.target.value) || 15
                        )
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto-start Pomodoros</Label>
                      <p className="text-sm text-gray-500">
                        Automatically start the next pomodoro session
                      </p>
                    </div>
                    <Switch
                      checked={timerSettings.autoStartPomodoros}
                      onCheckedChange={(checked) =>
                        updateTimerSetting('autoStartPomodoros', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto-start Breaks</Label>
                      <p className="text-sm text-gray-500">
                        Automatically start break sessions
                      </p>
                    </div>
                    <Switch
                      checked={timerSettings.autoStartBreaks}
                      onCheckedChange={(checked) =>
                        updateTimerSetting('autoStartBreaks', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable notifications</Label>
                    <p className="text-sm text-gray-500">
                      Show notifications when timer sessions end
                    </p>
                  </div>
                  <Switch
                    checked={timerSettings.notifications}
                    onCheckedChange={(checked) =>
                      updateTimerSetting('notifications', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={saveSettings}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useTimerStore } from '@/store/timerStore';
import {
  Clock,
  Coffee,
  Pause,
  Play,
  RotateCcw,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export default function Timer(): React.JSX.Element {
  const {
    state,
    settings,
    isLoading,
    loadState,
    startTimer,
    pauseTimer,
    resetTimer,
    skipBreak,
    setSelectedTask,
  } = useTimerStore();
  const { tasks, loading: tasksLoading } = useTasks();
  const { resolvedTheme } = useTheme();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pomodoroLog, setPomodoroLog] = useState<
    Array<{
      taskId: string;
      title: string;
      project?: string;
      minutes: number;
      finishedAt: string;
    }>
  >([]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Load pomodoro log data
  useEffect(() => {
    const loadPomodoroLog = async () => {
      try {
        const result = await chrome.storage.local.get(['pomodoroLog']);
        const log = Array.isArray(result.pomodoroLog) ? result.pomodoroLog : [];
        setPomodoroLog(log);
      } catch (error) {
        console.error('Error loading pomodoro log:', error);
      }
    };

    loadPomodoroLog();

    // Listen for pomodoro log changes
    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area === 'local' && changes.pomodoroLog) {
        const log = Array.isArray(changes.pomodoroLog.newValue)
          ? changes.pomodoroLog.newValue
          : [];
        setPomodoroLog(log);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // Get pending tasks for selection (including completed ones for display)
  const pendingTasks = useMemo(() => {
    return tasks.filter((task) => !task.completed);
  }, [tasks]);

  // Get selected task
  const selectedTask = useMemo(() => {
    return tasks.find((task) => task.id === state?.selectedTaskId);
  }, [tasks, state?.selectedTaskId]);

  // Calculate real-time stats from tasks and pomodoro logs
  const realTimeStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's pending tasks
    const todayPendingTasks = tasks.filter((task) => {
      if (task.completed) return false;
      const taskDate = new Date(task.createdAt);
      return taskDate >= today && taskDate < tomorrow;
    });
    const pendingTasksCount = todayPendingTasks.length;

    // Calculate today's pomodoros and focus time from pomodoro log
    let todayPomodoros = 0;
    let todayFocusTime = 0;

    if (pomodoroLog.length > 0) {
      // Filter pomodoro log for today's entries only
      const todayEntries = pomodoroLog.filter((entry) => {
        const entryDate = new Date(entry.finishedAt);
        return entryDate >= today && entryDate < tomorrow;
      });

      todayPomodoros = todayEntries.length;
      todayFocusTime = todayEntries.reduce((sum, entry) => {
        return sum + (Number.isFinite(entry.minutes) ? entry.minutes : 0);
      }, 0);
    } else {
      // Fallback to task data for today only
      const todayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= today && taskDate < tomorrow;
      });

      todayPomodoros = todayTasks.reduce(
        (sum, task) => sum + task.completedPomodoros,
        0
      );
      todayFocusTime = todayTasks.reduce((sum, task) => {
        const duration = task.pomodoroDuration || 25; // Default to 25 minutes
        return sum + task.completedPomodoros * duration;
      }, 0);
    }

    return {
      todos: pendingTasksCount,
      pomodoros: todayPomodoros,
      focus: Math.round(todayFocusTime), // Already in minutes from pomodoro log
    };
  }, [tasks, pomodoroLog]);

  // Memoize time formatting to prevent unnecessary recalculations
  const timeString = useMemo(() => {
    if (!state) return '25:00';
    const minutes = Math.floor(state.time / 60);
    const seconds = state.time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [state?.time]);

  // Memoize progress calculation based on settings
  const progress = useMemo(() => {
    if (!state || !settings) return 0;
    const getCurrentDuration = (): number => {
      switch (state.mode) {
        case 'focus':
          if (
            selectedTask?.pomodoroDuration &&
            selectedTask.pomodoroDuration > 0
          ) {
            return selectedTask.pomodoroDuration * 60;
          }
          return settings.focusDuration;
        case 'short_break':
          if (
            selectedTask?.shortBreakDuration &&
            selectedTask.shortBreakDuration > 0
          ) {
            return selectedTask.shortBreakDuration * 60;
          }
          return settings.shortBreakDuration;
        case 'long_break':
          if (
            selectedTask?.longBreakDuration &&
            selectedTask.longBreakDuration > 0
          ) {
            return selectedTask.longBreakDuration * 60;
          }
          return settings.longBreakDuration;
        default:
          return settings.focusDuration;
      }
    };
    const currentDuration = getCurrentDuration();
    return Math.max(
      0,
      Math.min(100, ((currentDuration - state.time) / currentDuration) * 100)
    );
  }, [state?.mode, state?.time, settings, selectedTask]);

  // Memoize mode configuration
  const modeConfig = useMemo(() => {
    if (!state) {
      return {
        gradient: 'from-green-500 to-emerald-600',
        bgGradient:
          'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
        icon: Target,
        title: 'Focus Time',
        subtitle: 'Stay focused and productive',
        color: 'text-green-600 dark:text-green-400',
      };
    }

    switch (state.mode) {
      case 'focus':
        return {
          gradient: 'from-green-500 to-emerald-600',
          bgGradient:
            'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
          icon: Target,
          title: 'Focus Time',
          subtitle: selectedTask
            ? `Working on: ${selectedTask.title}${selectedTask.project ? ` (${selectedTask.project})` : ''}`
            : 'Anonymous focus session',
          color: 'text-green-600 dark:text-green-400',
        };
      case 'short_break':
        return {
          gradient: 'from-blue-500 to-cyan-600',
          bgGradient:
            'from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950',
          icon: Coffee,
          title: 'Short Break',
          subtitle: 'Take a quick breather',
          color: 'text-blue-600 dark:text-blue-400',
        };
      case 'long_break':
        return {
          gradient: 'from-purple-500 to-pink-600',
          bgGradient:
            'from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
          icon: Zap,
          title: 'Long Break',
          subtitle: 'Time to recharge',
          color: 'text-purple-600 dark:text-purple-400',
        };
      default:
        return {
          gradient: 'from-green-500 to-emerald-600',
          bgGradient:
            'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
          icon: Target,
          title: 'Focus Time',
          subtitle: 'Stay focused and productive',
          color: 'text-green-600 dark:text-green-400',
        };
    }
  }, [state?.mode, selectedTask]);

  const IconComponent = modeConfig.icon;

  // Memoize event handlers to prevent unnecessary re-renders
  const handleStartPause = useCallback(() => {
    if (state?.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [state?.isRunning, startTimer, pauseTimer]);

  const handleReset = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const confirmReset = useCallback(() => {
    resetTimer();
    setShowResetConfirm(false);
  }, [resetTimer]);

  const cancelReset = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  const handleTaskSelect = useCallback(
    (taskId: string) => {
      const selectedId = taskId === 'none' ? null : taskId;
      setSelectedTask(selectedId);
    },
    [setSelectedTask]
  );

  if (isLoading || !state) {
    return (
      <div className="h-full flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
          role="status"
          aria-label="Loading timer"
        ></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Main Timer Card */}
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl  min-h-[320px]">
        <div className="flex items-start justify-between gap-6">
          {/* Left side - Timer Display + Controls */}
          <div className="flex-1 flex flex-col items-center">
            {/* Task Selection (show in focus mode) */}
            {state.mode === 'focus' && (
              <div className="w-full mb-4">
                <Select
                  value={state.selectedTaskId || 'none'}
                  onValueChange={handleTaskSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a task to work on (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      No task selected (anonymous)
                    </SelectItem>
                    {pendingTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Break controls */}
            {state.mode !== 'focus' && (
              <div className="w-full flex justify-end mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={skipBreak}
                  className="h-8 px-3 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  Skip Break
                </Button>
              </div>
            )}

            {/* Timer Display */}
            <div className="relative w-44 h-44 mb-6">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(156, 163, 175, 0.2)"
                  strokeWidth="3"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={`url(#gradient-${state.mode})`}
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out drop-shadow-lg"
                />
                {/* Gradient definitions */}
                <defs>
                  <linearGradient
                    id="gradient-focus"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient
                    id="gradient-short_break"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                  <linearGradient
                    id="gradient-long_break"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-wider mb-1">
                  {timeString}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {Math.round(progress)}% Complete
                </div>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={handleStartPause}
                className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 ${
                  state.isRunning
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
                    : `bg-gradient-to-r ${modeConfig.gradient} hover:shadow-xl text-white`
                }`}
              >
                {state.isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleReset}
                className="px-6 py-3 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Right side - Mode Info + Stats */}
          <div className="flex flex-col items-start justify-start min-w-[180px] m-2">
            {/* Mode Info */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${modeConfig.gradient} flex items-center justify-center shadow-lg`}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
                  {modeConfig.title}
                </h2>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {modeConfig.subtitle}
              </p>
            </div>

            {/* Stats Section */}
            <div className="space-y-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center mr-6">
                <div className="text-center">
                  <div className="text-sm text-green-600 font-semibold">
                    Todos
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {realTimeStats.todos}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-sm text-green-600 font-medium">
                      Pomodoro
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {realTimeStats.pomodoros}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-green-600 font-medium">
                      Focus
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {realTimeStats.focus}m
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Today's real-time stats
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Bar */}
      <div className="flex justify-center gap-4 mt-auto">
        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div
          role="button"
          aria-label="Open Settings"
          onClick={() =>
            chrome.tabs.create({ url: chrome.runtime.getURL('options.html') })
          }
          className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:opacity-90"
        >
          <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div
          role="button"
          aria-label="Open Report"
          onClick={() =>
            chrome.tabs.create({ url: chrome.runtime.getURL('report.html') })
          }
          className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:opacity-90"
        >
          <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset timer?</DialogTitle>
            <DialogDescription>
              This will reset the current session time. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={cancelReset}>
              Cancel
            </Button>
            <Button
              onClick={confirmReset}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { TaskService } from '../services/taskService';
import { DailyAchievement, Task, TaskStats } from '../types/task';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorities, setPriorities] = useState<
    { id: string; name: string; color: string }[]
  >([]);
  const [projects, setProjects] = useState<
    { id: string; name: string; color: string }[]
  >([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [achievements, setAchievements] = useState<DailyAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks and settings
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [
        tasksData,
        prioritiesData,
        projectsData,
        statsData,
        achievementsData,
      ] = await Promise.all([
        TaskService.getTasks(),
        TaskService.getPriorities(),
        TaskService.getProjects(),
        TaskService.getTaskStats(),
        TaskService.getDailyAchievements(),
      ]);

      setTasks(tasksData);
      setPriorities(prioritiesData);
      setProjects(projectsData);
      setStats(statsData);
      setAchievements(achievementsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Listen for storage changes to reload data when tasks change
  useEffect(() => {
    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      // Reload tasks when they change in sync storage
      if (area === 'sync' && changes.tasks) {
        console.log('[useTasks] Tasks changed in storage, reloading...');
        loadTasks();
      }

      // Reload priorities and projects when they change
      if (changes.priorities || changes.projects) {
        console.log('[useTasks] Priorities or projects changed, reloading...');
        loadTasks();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [loadTasks]);

  // Add task
  const addTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newTask = await TaskService.addTask(taskData);
        // Reload all tasks to ensure consistency
        await loadTasks();
        return newTask;
      } catch (err) {
        console.error('Failed to add task:', err);
        setError('Failed to add task');
        throw err;
      }
    },
    [loadTasks]
  );

  // Update task
  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      try {
        const updatedTask = await TaskService.updateTask(id, updates);
        if (updatedTask) {
          // Reload all tasks to ensure consistency
          await loadTasks();
          return updatedTask;
        }
        return null;
      } catch (err) {
        console.error('Failed to update task:', err);
        setError('Failed to update task');
        throw err;
      }
    },
    [loadTasks]
  );

  // Delete task
  const deleteTask = useCallback(
    async (id: string) => {
      try {
        const success = await TaskService.deleteTask(id);
        if (success) {
          // Reload all tasks to ensure consistency
          await loadTasks();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Failed to delete task:', err);
        setError('Failed to delete task');
        return false;
      }
    },
    [loadTasks]
  );

  // Toggle task completion
  const toggleTaskCompletion = useCallback(
    async (id: string) => {
      try {
        const updatedTask = await TaskService.toggleTaskCompletion(id);
        if (updatedTask) {
          // Reload all tasks to ensure consistency
          await loadTasks();
          return updatedTask;
        }
        return null;
      } catch (err) {
        console.error('Failed to toggle task completion:', err);
        setError('Failed to toggle task completion');
        throw err;
      }
    },
    [loadTasks]
  );

  // Update stats
  const updateStats = useCallback(async (newStats: Partial<TaskStats>) => {
    try {
      await TaskService.updateTaskStats(newStats);
      setStats((prev) => (prev ? { ...prev, ...newStats } : null));
    } catch (err) {
      console.error('Failed to update stats:', err);
      setError('Failed to update stats');
    }
  }, []);

  // Add achievement
  const addAchievement = useCallback(
    async (achievement: Omit<DailyAchievement, 'id' | 'date'>) => {
      try {
        const newAchievement =
          await TaskService.addDailyAchievement(achievement);
        setAchievements((prev) => [...prev, newAchievement]);
        return newAchievement;
      } catch (err) {
        console.error('Failed to add achievement:', err);
        setError('Failed to add achievement');
        throw err;
      }
    },
    []
  );

  // Get tasks by filter
  const getTasksByFilter = useCallback(
    async (filter: 'all' | 'today' | 'pending' | 'completed') => {
      try {
        return await TaskService.getTasksByFilter(filter);
      } catch (err) {
        console.error('Failed to get tasks by filter:', err);
        setError('Failed to get tasks by filter');
        return [];
      }
    },
    []
  );

  return {
    tasks,
    priorities,
    projects,
    stats,
    achievements,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateStats,
    addAchievement,
    getTasksByFilter,
    loadTasks,
  };
};

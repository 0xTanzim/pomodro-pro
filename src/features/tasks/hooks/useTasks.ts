import { useCallback, useEffect, useState } from 'react';
import { TaskService } from '../services/taskService';
import { DailyAchievement, Task, TaskStats } from '../types/task';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorities, setPriorities] = useState<{ id: string; name: string; color: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; color: string }[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [achievements, setAchievements] = useState<DailyAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks and settings
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksData, prioritiesData, projectsData, statsData, achievementsData] = await Promise.all([
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

  // Initialize with sample data if empty
  const initializeData = useCallback(async () => {
    try {
      await TaskService.initializeSampleData();
      await loadTasks();
    } catch (err) {
      console.error('Failed to initialize data:', err);
      setError('Failed to initialize data');
    }
  }, [loadTasks]);

  // Load data on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Listen for settings changes
  useEffect(() => {
    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.priorities || changes.projects) {
        loadTasks(); // Reload to get updated priorities/projects
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [loadTasks]);

  // Add task
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await TaskService.addTask(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      console.error('Failed to add task:', err);
      setError('Failed to add task');
      throw err;
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await TaskService.updateTask(id, updates);
      if (updatedTask) {
        setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
        return updatedTask;
      }
      return null;
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task');
      throw err;
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (id: string) => {
    try {
      const success = await TaskService.deleteTask(id);
      if (success) {
        setTasks(prev => prev.filter(task => task.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task');
      return false;
    }
  }, []);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (id: string) => {
    try {
      const updatedTask = await TaskService.toggleTaskCompletion(id);
      if (updatedTask) {
        setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
        return updatedTask;
      }
      return null;
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      setError('Failed to toggle task completion');
      throw err;
    }
  }, []);

  // Update stats
  const updateStats = useCallback(async (newStats: Partial<TaskStats>) => {
    try {
      await TaskService.updateTaskStats(newStats);
      setStats(prev => prev ? { ...prev, ...newStats } : null);
    } catch (err) {
      console.error('Failed to update stats:', err);
      setError('Failed to update stats');
    }
  }, []);

  // Add achievement
  const addAchievement = useCallback(async (achievement: Omit<DailyAchievement, 'id' | 'date'>) => {
    try {
      const newAchievement = await TaskService.addDailyAchievement(achievement);
      setAchievements(prev => [...prev, newAchievement]);
      return newAchievement;
    } catch (err) {
      console.error('Failed to add achievement:', err);
      setError('Failed to add achievement');
      throw err;
    }
  }, []);

  // Get tasks by filter
  const getTasksByFilter = useCallback(async (filter: 'all' | 'today' | 'pending' | 'completed') => {
    try {
      return await TaskService.getTasksByFilter(filter);
    } catch (err) {
      console.error('Failed to get tasks by filter:', err);
      setError('Failed to get tasks by filter');
      return [];
    }
  }, []);

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
    initializeData,
  };
};

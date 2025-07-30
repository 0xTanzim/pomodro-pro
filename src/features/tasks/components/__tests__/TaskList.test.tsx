import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useTasks } from '../../hooks/useTasks';
import { TaskList } from '../TaskList';

// Mock the useTasks hook
vi.mock('../../hooks/useTasks');

const mockUseTasks = useTasks as jest.MockedFunction<typeof useTasks>;

describe('TaskList', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Test description',
      completed: false,
      priority: 'medium' as const,
      project: 'Work',
      dueDate: '2024-01-01',
      reminder: null,
      repeat: 'none' as const,
      pomodoroCount: 2,
      completedPomodoros: 0,
      tags: ['test'],

      attachments: [],
      notes: '',
      createdAt: '2024-01-01T00:00:00Z',
      completedAt: null,
      color: '#3b82f6'
    }
  ];

  const mockPriorities = [
    { id: '1', name: 'Low', color: '#10b981' },
    { id: '2', name: 'Medium', color: '#f59e0b' },
    { id: '3', name: 'High', color: '#ef4444' },
    { id: '4', name: 'Urgent', color: '#dc2626' }
  ];

  const mockProjects = [
    { id: '1', name: 'Work', color: '#3b82f6' },
    { id: '2', name: 'Personal', color: '#8b5cf6' }
  ];

  const mockStats = {
    totalPomodoroHours: '2.5',
    elapsedTime: '1.5',
    tasksWaiting: 5,
    tasksCompleted: 3,
    focusTime: '1.0'
  };

  beforeEach(() => {
    mockUseTasks.mockReturnValue({
      tasks: mockTasks,
      priorities: mockPriorities,
      projects: mockProjects,
      stats: mockStats,
      achievements: [],
      loading: false,
      error: null,
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTaskCompletion: vi.fn(),
      updateStats: vi.fn(),
      addAchievement: vi.fn(),
      getTasksByFilter: vi.fn(),
      loadTasks: vi.fn(),
      initializeData: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders task list with stats', () => {
    render(<TaskList />);

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search tasks, tags, or projects...')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseTasks.mockReturnValue({
      ...mockUseTasks(),
      loading: true,
    });

    render(<TaskList />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseTasks.mockReturnValue({
      ...mockUseTasks(),
      error: 'Failed to load tasks',
    });

    render(<TaskList />);

    expect(screen.getByText('Error: Failed to load tasks')).toBeInTheDocument();
  });

  it('opens add task dialog when add button is clicked', () => {
    render(<TaskList />);

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  it('filters tasks by search term', async () => {
    render(<TaskList />);

    const searchInput = screen.getByPlaceholderText('Search tasks, tags, or projects...');
    fireEvent.change(searchInput, { target: { value: 'Test Task 1' } });

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
  });

  it('displays tabs with correct counts', () => {
    render(<TaskList />);

    expect(screen.getByText('All (1)')).toBeInTheDocument();
    expect(screen.getByText('Today (0)')).toBeInTheDocument();
    expect(screen.getByText('Pending (1)')).toBeInTheDocument();
    expect(screen.getByText('Completed (0)')).toBeInTheDocument();
  });
});

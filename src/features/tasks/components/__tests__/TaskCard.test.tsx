import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Task } from '../../types/task';
import { TaskCard } from '../TaskCard';

// Mock the current date to ensure consistent testing
const mockDate = new Date('2024-01-15T12:00:00Z');
vi.setSystemTime(mockDate);

describe('TaskCard', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'medium',
    project: 'Test Project',
    tags: ['#Work'],
    pomodoroCount: 4,
    completedPomodoros: 2,
    pomodoroDuration: 25,
    completed: false,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    attachments: [],
  };

  const defaultProps = {
    task: mockTask,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleCompletion: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('renders task card with basic information', () => {
    render(<TaskCard {...defaultProps} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('2/4 pomodoros')).toBeInTheDocument();
  });

  it('shows overdue badge when task is overdue', () => {
    const overdueTask: Task = {
      ...mockTask,
      dueDate: '2024-01-10', // 5 days ago
    };

    render(<TaskCard {...defaultProps} task={overdueTask} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('does not show overdue badge for completed tasks', () => {
    const completedOverdueTask: Task = {
      ...mockTask,
      completed: true,
      dueDate: '2024-01-10', // 5 days ago
    };

    render(<TaskCard {...defaultProps} task={completedOverdueTask} />);

    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  it('does not show overdue badge for tasks without due date', () => {
    const taskWithoutDueDate: Task = {
      ...mockTask,
      dueDate: undefined,
    };

    render(<TaskCard {...defaultProps} task={taskWithoutDueDate} />);

    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  it('shows overdue badge for tasks due yesterday', () => {
    const yesterdayTask: Task = {
      ...mockTask,
      dueDate: '2024-01-14', // Yesterday
    };

    render(<TaskCard {...defaultProps} task={yesterdayTask} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('does not show overdue badge for tasks due today', () => {
    const todayTask: Task = {
      ...mockTask,
      dueDate: '2024-01-15', // Today
    };

    render(<TaskCard {...defaultProps} task={todayTask} />);

    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  it('does not show overdue badge for future tasks', () => {
    const futureTask: Task = {
      ...mockTask,
      dueDate: '2024-01-20', // Future date
    };

    render(<TaskCard {...defaultProps} task={futureTask} />);

    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  it('applies overdue styling when task is overdue', () => {
    const overdueTask: Task = {
      ...mockTask,
      dueDate: '2024-01-10', // 5 days ago
    };

    render(<TaskCard {...defaultProps} task={overdueTask} />);

    const taskTitle = screen.getByText('Test Task');
    expect(taskTitle).toHaveClass('text-red-600');
  });

  it('calls onToggleCompletion when checkbox is clicked', () => {
    render(<TaskCard {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(defaultProps.onToggleCompletion).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<TaskCard {...defaultProps} />);

    const editButton = screen.getByTitle('Edit task');
    fireEvent.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<TaskCard {...defaultProps} />);

    const deleteButton = screen.getByTitle('Delete task');
    fireEvent.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('shows completed styling when task is completed', () => {
    const completedTask: Task = {
      ...mockTask,
      completed: true,
      completedAt: '2024-01-12T10:00:00Z',
    };

    render(<TaskCard {...defaultProps} task={completedTask} />);

    const taskTitle = screen.getByText('Test Task');
    expect(taskTitle).toHaveClass('line-through', 'text-gray-500');
  });

  it('shows completion date for completed tasks', () => {
    const completedTask: Task = {
      ...mockTask,
      completed: true,
      completedAt: '2024-01-12T10:00:00Z',
    };

    render(<TaskCard {...defaultProps} task={completedTask} />);

    expect(screen.getByText(/Completed/)).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    const taskWithRecentDate: Task = {
      ...mockTask,
      createdAt: '2024-01-15T10:00:00Z', // Today
    };

    render(<TaskCard {...defaultProps} task={taskWithRecentDate} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('handles different priority levels correctly', () => {
    const urgentTask: Task = {
      ...mockTask,
      priority: 'urgent',
    };

    render(<TaskCard {...defaultProps} task={urgentTask} />);

    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('handles tasks with different pomodoro durations', () => {
    const taskWithCustomDuration: Task = {
      ...mockTask,
      pomodoroDuration: 30,
    };

    render(<TaskCard {...defaultProps} task={taskWithCustomDuration} />);

    expect(screen.getByText('2/4 pomodoros')).toBeInTheDocument();
  });

  it('handles edge case: task due exactly at midnight', () => {
    const midnightTask: Task = {
      ...mockTask,
      dueDate: '2024-01-15', // Today at midnight
    };

    render(<TaskCard {...defaultProps} task={midnightTask} />);

    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  it('handles edge case: task due in different timezone', () => {
    const timezoneTask: Task = {
      ...mockTask,
      dueDate: '2024-01-14', // Yesterday in local time
    };

    render(<TaskCard {...defaultProps} task={timezoneTask} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('handles edge case: task with invalid due date', () => {
    const invalidDateTask: Task = {
      ...mockTask,
      dueDate: 'invalid-date',
    };

    render(<TaskCard {...defaultProps} task={invalidDateTask} />);

    // Should not crash and should not show overdue badge
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });
});

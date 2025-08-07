import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Task } from '../../types/task';
import { TaskCard } from '../TaskCard';

// Mock Chrome API
global.chrome = {
  storage: {
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn(),
    },
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
} as any;

describe('TaskCard', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test description',
    completed: false,
    priority: 'high',
    project: 'Work',
    pomodoroCount: 4,
    completedPomodoros: 2,
    tags: ['#Work', '#Urgent'],
    attachments: [],
    createdAt: new Date().toISOString(),
    color: '#ef4444',
  };

  const defaultProps = {
    task: mockTask,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleCompletion: vi.fn(),
  };

  it('renders task card with all information', () => {
    render(<TaskCard {...defaultProps} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('2/4 pomodoros')).toBeInTheDocument();
  });

  it('shows completed state correctly', () => {
    const completedTask = {
      ...mockTask,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    render(<TaskCard {...defaultProps} task={completedTask} />);

    expect(screen.getByText('Test Task')).toHaveClass('line-through');
    expect(screen.getByText(/Completed/)).toBeInTheDocument();
  });

  it('shows overdue state correctly', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    };
    render(<TaskCard {...defaultProps} task={overdueTask} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toHaveClass('text-red-600');
  });

  it('handles checkbox click', () => {
    render(<TaskCard {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(defaultProps.onToggleCompletion).toHaveBeenCalled();
  });

  it('handles edit button click', () => {
    render(<TaskCard {...defaultProps} />);

    const editButton = screen.getByTitle('Edit task');
    fireEvent.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalled();
  });

  it('handles delete button click', () => {
    render(<TaskCard {...defaultProps} />);

    const deleteButton = screen.getByTitle('Delete task');
    fireEvent.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalled();
  });

  it('formats dates correctly', () => {
    const todayTask = { ...mockTask, createdAt: new Date().toISOString() };
    render(<TaskCard {...defaultProps} task={todayTask} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('handles long task titles', () => {
    const longTitleTask = {
      ...mockTask,
      title:
        'This is a very long task title that should be handled properly without breaking the layout',
    };
    render(<TaskCard {...defaultProps} task={longTitleTask} />);

    expect(screen.getByText(longTitleTask.title)).toBeInTheDocument();
  });

  it('handles missing optional fields', () => {
    const minimalTask = {
      ...mockTask,
      description: undefined,
      tags: [],
      attachments: [],
      dueDate: undefined,
    };
    render(<TaskCard {...defaultProps} task={minimalTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('2/4 pomodoros')).toBeInTheDocument();
  });

  it('shows different priority colors', () => {
    const priorities = ['low', 'medium', 'high', 'urgent'] as const;

    priorities.forEach((priority) => {
      const taskWithPriority = { ...mockTask, priority };
      const { container } = render(
        <TaskCard {...defaultProps} task={taskWithPriority} />
      );

      const card = container.querySelector('.border-l-4');
      expect(card).toBeInTheDocument();
    });
  });

  it('handles empty pomodoro count', () => {
    const taskWithNoPomodoros = {
      ...mockTask,
      pomodoroCount: 0,
      completedPomodoros: 0,
    };
    render(<TaskCard {...defaultProps} task={taskWithNoPomodoros} />);

    expect(screen.getByText('0/0 pomodoros')).toBeInTheDocument();
  });

  it('shows completion timestamp for completed tasks', () => {
    const completedTask = {
      ...mockTask,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    render(<TaskCard {...defaultProps} task={completedTask} />);

    expect(screen.getByText(/Completed/)).toBeInTheDocument();
  });
});

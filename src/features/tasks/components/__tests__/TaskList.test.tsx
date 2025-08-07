import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskList } from '../TaskList';

// Mock Chrome API
global.chrome = {
  storage: {
    sync: {
      get: vi.fn().mockResolvedValue({
        tasks: [],
        priorities: ['low', 'medium', 'high', 'urgent'],
        projects: ['Work', 'Personal', 'Study'],
      }),
      set: vi.fn(),
    },
    local: {
      get: vi.fn().mockResolvedValue({
        tasks: [],
        priorities: ['low', 'medium', 'high', 'urgent'],
        projects: ['Work', 'Personal', 'Study'],
      }),
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

// Mock useTasks hook
vi.mock('../../hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: [],
    priorities: ['low', 'medium', 'high', 'urgent'],
    projects: ['Work', 'Personal', 'Study'],
    loading: false,
    error: null,
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleTaskCompletion: vi.fn(),
  }),
}));

describe('TaskList', () => {
  it('renders task list with empty state', () => {
    render(<TaskList />);

    expect(
      screen.getByText(
        'No tasks due today. Great job staying on top of things!'
      )
    ).toBeInTheDocument();
  });

  it('renders search and actions section', () => {
    render(<TaskList />);

    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
    expect(screen.getByText('Sort')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    render(<TaskList />);

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('test');
    });
  });

  it('handles sort functionality', () => {
    render(<TaskList />);

    const sortButton = screen.getByText('Sort');
    fireEvent.click(sortButton);

    // Should show sort options
    expect(screen.getByText('Sort by')).toBeInTheDocument();
  });

  it('handles add task button click', () => {
    render(<TaskList />);

    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    // Should trigger add task dialog
    // This would be tested in integration tests
  });

  it('renders tabs correctly', () => {
    render(<TaskList />);

    expect(screen.getByText('Today (0)')).toBeInTheDocument();
    expect(screen.getByText('Pending (0)')).toBeInTheDocument();
    expect(screen.getByText('All (0)')).toBeInTheDocument();
    expect(screen.getByText('Completed (0)')).toBeInTheDocument();
  });
});

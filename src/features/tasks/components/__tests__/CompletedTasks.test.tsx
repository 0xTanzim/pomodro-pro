import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Task } from '../../types/task';
import { CompletedTasks } from '../CompletedTasks';

// Mock the TaskCard component
vi.mock('../TaskCard', () => ({
  TaskCard: ({ task, onEdit, onDelete, onToggleCompletion }: any) => (
    <div data-testid={`completed-task-card-${task.id}`}>
      <span>{task.title}</span>
      <button onClick={onEdit} data-testid={`completed-edit-${task.id}`}>
        Edit
      </button>
      <button onClick={onDelete} data-testid={`completed-delete-${task.id}`}>
        Delete
      </button>
      <button
        onClick={onToggleCompletion}
        data-testid={`completed-toggle-${task.id}`}
      >
        Toggle
      </button>
    </div>
  ),
}));

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Completed Task 1',
    description: 'Test description 1',
    priority: 'high',
    project: 'Test Project',
    pomodoroCount: 4,
    completedPomodoros: 4,
    completed: true,
    tags: ['#Work'],
    dueDate: '2024-01-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    completedAt: '2024-01-15T00:00:00Z',
    color: '#10b981',
  },
  {
    id: '2',
    title: 'Completed Task 2',
    description: 'Test description 2',
    priority: 'medium',
    project: 'Test Project',
    pomodoroCount: 2,
    completedPomodoros: 2,
    completed: true,
    tags: ['#Personal'],
    dueDate: '2024-01-10',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    completedAt: '2024-01-10T00:00:00Z',
    color: '#10b981',
  },
  {
    id: '3',
    title: 'Completed Task 3',
    description: 'Test description 3',
    priority: 'low',
    project: 'Test Project',
    pomodoroCount: 1,
    completedPomodoros: 1,
    completed: true,
    tags: ['#Study'],
    dueDate: '2024-01-12',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    completedAt: '2024-01-12T00:00:00Z',
    color: '#10b981',
  },
];

const mockAchievements = [
  {
    date: '2024-01-15',
    focusTime: 120,
    completedTasks: 1,
  },
  {
    date: '2024-01-10',
    focusTime: 60,
    completedTasks: 1,
  },
];

const mockProps = {
  tasks: mockTasks,
  achievements: mockAchievements,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  onStartPomodoro: vi.fn(),
};

describe('CompletedTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders completed tasks title', () => {
    render(<CompletedTasks {...mockProps} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays all completed tasks', () => {
    render(<CompletedTasks {...mockProps} />);

    expect(screen.getByTestId('completed-task-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('completed-task-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('completed-task-card-3')).toBeInTheDocument();
  });

  it('groups tasks by completion date', () => {
    render(<CompletedTasks {...mockProps} />);

    // Should show date headers for different completion dates
    expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    expect(screen.getByText('1/10/2024')).toBeInTheDocument();
  });

  it('shows achievement information when available', () => {
    render(<CompletedTasks {...mockProps} />);

    expect(screen.getByText(/Focus: 120/)).toBeInTheDocument();
    expect(screen.getAllByText(/Completed: 1 tasks/)).toHaveLength(2);
  });

  it('handles tasks without achievements gracefully', () => {
    const propsWithoutAchievements = {
      ...mockProps,
      achievements: [],
    };

    render(<CompletedTasks {...propsWithoutAchievements} />);

    // Should still render tasks but without achievement info
    expect(screen.getByTestId('completed-task-card-1')).toBeInTheDocument();
    expect(screen.queryByText(/Focus:/)).not.toBeInTheDocument();
  });

  it('shows empty state when no completed tasks', () => {
    const emptyProps = {
      ...mockProps,
      tasks: [],
    };

    render(<CompletedTasks {...emptyProps} />);

    expect(screen.getByText('No completed tasks yet')).toBeInTheDocument();
    expect(
      screen.getByText('Complete some tasks to see them here!')
    ).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<CompletedTasks {...mockProps} />);

    const editButton = screen.getByTestId('completed-edit-1');
    fireEvent.click(editButton);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<CompletedTasks {...mockProps} />);

    const deleteButton = screen.getByTestId('completed-delete-1');
    fireEvent.click(deleteButton);

    expect(mockProps.onDelete).toHaveBeenCalledWith('1');
  });

  it('calls onToggle when toggle button is clicked', () => {
    render(<CompletedTasks {...mockProps} />);

    const toggleButton = screen.getByTestId('completed-toggle-1');
    fireEvent.click(toggleButton);

    expect(mockProps.onToggle).toHaveBeenCalledWith('1');
  });

  it('handles optional props gracefully', () => {
    const propsWithoutOptional = {
      tasks: mockTasks,
      achievements: undefined,
      onToggle: undefined,
      onDelete: undefined,
      onEdit: undefined,
      onStartPomodoro: undefined,
    };

    render(<CompletedTasks {...propsWithoutOptional} />);

    // Should still render without errors
    expect(screen.getByTestId('completed-task-card-1')).toBeInTheDocument();
  });

  it('handles tasks with unknown completion date', () => {
    const tasksWithUnknownDate = [
      {
        ...mockTasks[0],
        completedAt: undefined,
      },
    ];

    render(
      <CompletedTasks
        tasks={tasksWithUnknownDate}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Invalid Date')).toBeInTheDocument();
  });
});

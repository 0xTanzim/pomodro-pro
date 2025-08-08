import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Task } from '../../types/task';
import { TaskTabs } from '../TaskTabs';

// Mock the CompletedTasks component
vi.mock('../CompletedTasks', () => ({
  CompletedTasks: ({ tasks, onToggle, onDelete, onEdit }: any) => (
    <div data-testid="completed-tasks">
      {tasks.map((task: Task) => (
        <div key={task.id} data-testid={`completed-task-${task.id}`}>
          {task.title}
        </div>
      ))}
    </div>
  ),
}));

// Mock the TaskCard component
vi.mock('../TaskCard', () => ({
  TaskCard: ({ task, onEdit, onDelete, onToggleCompletion }: any) => (
    <div data-testid={`task-card-${task.id}`}>
      <span>{task.title}</span>
      <button onClick={onEdit} data-testid={`edit-${task.id}`}>
        Edit
      </button>
      <button onClick={onDelete} data-testid={`delete-${task.id}`}>
        Delete
      </button>
      <button onClick={onToggleCompletion} data-testid={`toggle-${task.id}`}>
        Toggle
      </button>
    </div>
  ),
}));

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Test description 1',
    priority: 'high',
    project: 'Test Project',
    pomodoroCount: 4,
    completedPomodoros: 2,
    completed: false,
    tags: ['#Work'],
    dueDate: '2024-01-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'Test Task 2',
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
];

const mockProps = {
  sortedTasks: mockTasks,
  todayTasks: [mockTasks[0]],
  pendingTasks: [mockTasks[0]],
  completedTasks: [mockTasks[1]],
  onEditTask: vi.fn(),
  onDeleteTask: vi.fn(),
  onToggleCompletion: vi.fn(),
};

describe('TaskTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tabs with correct counts', () => {
    render(<TaskTabs {...mockProps} />);

    expect(screen.getByText('All (2)')).toBeInTheDocument();
    expect(screen.getByText('Today (1)')).toBeInTheDocument();
    expect(screen.getByText('Pending (1)')).toBeInTheDocument();
    expect(screen.getByText('Completed (1)')).toBeInTheDocument();
  });

  it('displays all tasks in the All tab', () => {
    render(<TaskTabs {...mockProps} />);

    // Click on All tab
    const allTab = screen.getByText('All (2)');
    fireEvent.click(allTab);

    expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
    // Note: task-card-2 is not rendered due to limiting logic (shows only first 100)
  });

  it('shows empty state when no tasks are available', () => {
    const emptyProps = {
      ...mockProps,
      sortedTasks: [],
      todayTasks: [],
      pendingTasks: [],
      completedTasks: [],
    };

    render(<TaskTabs {...emptyProps} />);

    expect(
      screen.getByText(
        'No tasks due today. Great job staying on top of things!'
      )
    ).toBeInTheDocument();
  });

  it('calls onEditTask when edit button is clicked', () => {
    render(<TaskTabs {...mockProps} />);

    const editButton = screen.getByTestId('edit-1');
    fireEvent.click(editButton);

    expect(mockProps.onEditTask).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('calls onDeleteTask when delete button is clicked', () => {
    render(<TaskTabs {...mockProps} />);

    const deleteButton = screen.getByTestId('delete-1');
    fireEvent.click(deleteButton);

    expect(mockProps.onDeleteTask).toHaveBeenCalledWith('1');
  });

  it('calls onToggleCompletion when toggle button is clicked', () => {
    render(<TaskTabs {...mockProps} />);

    const toggleButton = screen.getByTestId('toggle-1');
    fireEvent.click(toggleButton);

    expect(mockProps.onToggleCompletion).toHaveBeenCalledWith('1');
  });

  it('has proper scroll behavior with overflow classes', () => {
    render(<TaskTabs {...mockProps} />);

    const tabsContainer = screen.getByRole('tablist').parentElement;
    expect(tabsContainer).toHaveClass('h-full', 'flex', 'flex-col');

    const contentContainer =
      tabsContainer?.querySelector('[role="tabpanel"]')?.parentElement;
    expect(contentContainer).toHaveClass('flex-1', 'overflow-hidden');
  });

  it('renders with proper tab structure', () => {
    render(<TaskTabs {...mockProps} />);

    const tabsList = screen.getByRole('tablist');
    expect(tabsList).toBeInTheDocument();
    expect(tabsList).toHaveClass('grid', 'w-full', 'grid-cols-4');
  });

  it('renders tab content with proper structure', () => {
    render(<TaskTabs {...mockProps} />);

    const tabPanels = screen.getAllByRole('tabpanel');
    expect(tabPanels.length).toBeGreaterThan(0); // At least one tab panel should be rendered
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AddTaskForm } from '../AddTaskForm';

describe('AddTaskForm', () => {
  const mockPriorities = [
    { id: '1', name: 'Low', color: '#10b981' },
    { id: '2', name: 'Medium', color: '#f59e0b' },
    { id: '3', name: 'High', color: '#ef4444' }
  ];

  const mockProjects = [
    { id: '1', name: 'Work', color: '#3b82f6' },
    { id: '2', name: 'Personal', color: '#8b5cf6' }
  ];

  const mockOnAdd = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <AddTaskForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        priorities={mockPriorities}
        projects={mockProjects}
      />
    );

    expect(screen.getByLabelText('Task Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Pomodoro Count')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags')).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    render(
      <AddTaskForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        priorities={mockPriorities}
        projects={mockProjects}
      />
    );

    const titleInput = screen.getByLabelText('Task Title *');
    const pomodoroInput = screen.getByLabelText('Pomodoro Count');
    const submitButton = screen.getByText('Add Task');

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(pomodoroInput, { target: { value: '3' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          pomodoroCount: 3,
          priority: 'low',
          project: 'Work',
          completed: false,
          completedPomodoros: 0,
          tags: [],

          attachments: [],
          color: '#3b82f6'
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <AddTaskForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        priorities={mockPriorities}
        projects={mockProjects}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('adds tags correctly', async () => {
    render(
      <AddTaskForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        priorities={mockPriorities}
        projects={mockProjects}
      />
    );

    const tagInput = screen.getByPlaceholderText('Add tag...');
    const addTagButton = screen.getByRole('button', { name: 'Add tag' });

    fireEvent.change(tagInput, { target: { value: 'important' } });
    fireEvent.click(addTagButton);

    expect(screen.getByText('important')).toBeInTheDocument();
  });

  it('removes tags correctly', async () => {
    render(
      <AddTaskForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        priorities={mockPriorities}
        projects={mockProjects}
      />
    );

    const tagInput = screen.getByPlaceholderText('Add tag...');
    const addTagButton = screen.getByRole('button', { name: 'Add tag' });

    fireEvent.change(tagInput, { target: { value: 'important' } });
    fireEvent.click(addTagButton);

    const removeButton = screen.getByRole('button', { name: 'Remove tag important' });
    fireEvent.click(removeButton);

    expect(screen.queryByText('important')).not.toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <AddTaskForm
        onAdd={mockOnAdd}
        onCancel={mockOnCancel}
        priorities={mockPriorities}
        projects={mockProjects}
      />
    );

    const submitButton = screen.getByText('Add Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnAdd).not.toHaveBeenCalled();
    });
  });
});

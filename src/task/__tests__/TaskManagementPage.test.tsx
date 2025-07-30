import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TaskManagementPage } from '../TaskManagementPage';

// Mock the TaskList component
vi.mock('@/features/tasks/components/TaskList', () => ({
  TaskList: () => (
    <div data-testid="task-list">
      <h2>Task List Component</h2>
    </div>
  )
}));

// Mock the ThemeToggle component
vi.mock('@/components/ThemeToggle', () => ({
  default: () => (
    <button data-testid="theme-toggle">Theme Toggle</button>
  )
}));

// Mock the Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
}));

describe('TaskManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header correctly', () => {
    render(<TaskManagementPage />);

    expect(screen.getByText('Task Management')).toBeInTheDocument();
    expect(screen.getByText('Organize and track your tasks efficiently')).toBeInTheDocument();
  });

  it('renders the theme toggle component', () => {
    render(<TaskManagementPage />);

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders the task list component', () => {
    render(<TaskManagementPage />);

    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByText('Task List Component')).toBeInTheDocument();
  });

  it('renders the card structure correctly', () => {
    render(<TaskManagementPage />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toBeInTheDocument();
    expect(screen.getByText('Your Tasks')).toBeInTheDocument();
  });



  it('has proper layout structure', () => {
    render(<TaskManagementPage />);

    const mainContainer = screen.getByTestId('card').closest('.min-h-screen');
    expect(mainContainer).toHaveClass('bg-background');

    const contentContainer = mainContainer?.querySelector('.container');
    expect(contentContainer).toHaveClass('mx-auto', 'p-6');
  });



  it('renders with proper background and styling', () => {
    render(<TaskManagementPage />);

    const pageContainer = screen.getByTestId('card').closest('.min-h-screen');
    expect(pageContainer).toHaveClass('bg-background');
  });

  it('has proper container and spacing', () => {
    render(<TaskManagementPage />);

    const container = screen.getByTestId('card').closest('.container');
    expect(container).toHaveClass('mx-auto', 'p-6');
  });



  it('renders the title with proper typography', () => {
    render(<TaskManagementPage />);

    const title = screen.getByText('Task Management');
    expect(title).toHaveClass('text-3xl', 'font-bold');
  });

  it('renders the subtitle with proper styling', () => {
    render(<TaskManagementPage />);

    const subtitle = screen.getByText('Organize and track your tasks efficiently');
    expect(subtitle).toHaveClass('text-muted-foreground');
  });

  it('renders the main card with proper structure', () => {
    render(<TaskManagementPage />);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('w-full');
  });

  it('renders the card content with proper structure', () => {
    render(<TaskManagementPage />);

    const cardContent = screen.getByTestId('card-content');
    expect(cardContent).toBeInTheDocument();
  });

  it('renders the card header with proper structure', () => {
    render(<TaskManagementPage />);

    const cardHeader = screen.getByTestId('card-header');
    expect(cardHeader).toBeInTheDocument();
  });

  it('renders the card title with proper structure', () => {
    render(<TaskManagementPage />);

    const cardTitle = screen.getByTestId('card-title');
    expect(cardTitle).toBeInTheDocument();
    expect(cardTitle).toHaveTextContent('Your Tasks');
  });

  it('has proper semantic HTML structure', () => {
    render(<TaskManagementPage />);

    // Should have proper heading hierarchy
    const mainHeading = screen.getByText('Task Management');
    expect(mainHeading.tagName).toBe('H1');

    const cardHeading = screen.getByText('Your Tasks');
    expect(cardHeading.tagName).toBe('H3');
  });

  it('renders with proper accessibility attributes', () => {
    render(<TaskManagementPage />);

    // The page should be accessible
    const mainContainer = screen.getByTestId('card').closest('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('has proper responsive layout', () => {
    render(<TaskManagementPage />);

    const container = screen.getByTestId('card').closest('.container');
    expect(container).toHaveClass('mx-auto');
  });

  it('renders with proper spacing and padding', () => {
    render(<TaskManagementPage />);

    const container = screen.getByTestId('card').closest('.container');
    expect(container).toHaveClass('p-6');
  });



  it('renders the title with proper font weight', () => {
    render(<TaskManagementPage />);

    const title = screen.getByText('Task Management');
    expect(title).toHaveClass('font-bold');
  });

  it('renders the subtitle with proper color', () => {
    render(<TaskManagementPage />);

    const subtitle = screen.getByText('Organize and track your tasks efficiently');
    expect(subtitle).toHaveClass('text-muted-foreground');
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportPage } from '../components/ReportPage';
import { useAnalytics } from '../hooks/useAnalytics';

// Mock the useAnalytics hook
vi.mock('../hooks/useAnalytics');

const mockUseAnalytics = useAnalytics as ReturnType<typeof vi.fn>;

// Mock the ThemeToggle component
vi.mock('@/components/ThemeToggle', () => ({
  default: function MockThemeToggle() {
    return <div data-testid="theme-toggle">Theme Toggle</div>;
  },
}));

describe('ReportPage Component', () => {
  const defaultMockData = {
    isLoading: false,
    reportView: 'tasks' as const,
    setReportView: vi.fn(),
    timeRange: 'week' as const,
    setTimeRange: vi.fn(),
    summary: {
      tasksCompletedToday: 5,
      tasksCompletedThisWeek: 25,
      tasksCompletedThisTwoWeeks: 58,
      tasksCompletedThisMonth: 124,
      focusTimeToday: 120,
      focusTimeThisWeek: 600,
      focusTimeThisTwoWeeks: 1200,
      focusTimeThisMonth: 2400,
      totalPomodoros: 50,
      averageSessionLength: 25,
    },
    projectTimeData: [
      {
        project: 'Project A',
        totalTime: 300,
        percentage: 50,
        color: '#3b82f6',
        taskCount: 10,
      },
      {
        project: 'Project B',
        totalTime: 180,
        percentage: 30,
        color: '#ef4444',
        taskCount: 5,
      },
    ],
    focusTimeData: [
      {
        id: '1',
        taskName: 'Task 1',
        project: 'Project A',
        duration: 120,
        date: new Date(),
        color: '#3b82f6',
      },
    ],
    taskChartData: [
      {
        date: '2024-01-01',
        pomodoros: 5,
        tasks: 3,
        focusTime: 120,
        projects: { 'Project A': 60, 'Project B': 60 },
      },
    ],
    refreshData: vi.fn(),
  };

  beforeEach(() => {
    mockUseAnalytics.mockReturnValue(defaultMockData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    mockUseAnalytics.mockReturnValue({
      ...defaultMockData,
      isLoading: true,
    });

    render(<ReportPage />);

    expect(screen.getByText('Loading report data...')).toBeInTheDocument();
  });

  it('renders report page with all components when not loading', () => {
    render(<ReportPage />);

    // Check header
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Track your productivity and focus time')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();

    // Check summary cards
    expect(screen.getByText('5')).toBeInTheDocument(); // tasks completed today
    expect(screen.getByText('25')).toBeInTheDocument(); // tasks completed this week
    expect(screen.getByText('58')).toBeInTheDocument(); // tasks completed this two weeks
    expect(screen.getByText('124')).toBeInTheDocument(); // tasks completed this month

    // Check chart sections
    expect(screen.getByText('Focus Time')).toBeInTheDocument();
    expect(screen.getByText('Project Time Distribution')).toBeInTheDocument();
    expect(screen.getByText('Task Chart')).toBeInTheDocument();

    // Check additional stats
    expect(screen.getByText('Total Pomodoros')).toBeInTheDocument();
    expect(screen.getByText('Average Session')).toBeInTheDocument();
    expect(screen.getByText('Productivity Score')).toBeInTheDocument();
  });

  it('calls refreshData when refresh button is clicked', () => {
    render(<ReportPage />);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(defaultMockData.refreshData).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when no data is available', () => {
    mockUseAnalytics.mockReturnValue({
      ...defaultMockData,
      summary: null,
      projectTimeData: [],
      focusTimeData: [],
      taskChartData: [],
    });

    render(<ReportPage />);

    // Should still render the page structure
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('displays correct productivity score calculation', () => {
    render(<ReportPage />);

    // Productivity score should be (tasksCompletedThisWeek / totalPomodoros) * 100
    // (25 / 50) * 100 = 50%
    const productivityScore = screen.getByText('50%', { selector: '.text-3xl.font-bold.text-purple-600' });
    expect(productivityScore).toBeInTheDocument();
  });

  it('displays zero productivity score when no pomodoros', () => {
    mockUseAnalytics.mockReturnValue({
      ...defaultMockData,
      summary: {
        ...defaultMockData.summary!,
        totalPomodoros: 0,
      },
    });

    render(<ReportPage />);

    const productivityScore = screen.getByText('0%', { selector: '.text-3xl.font-bold.text-purple-600' });
    expect(productivityScore).toBeInTheDocument();
  });

  it('renders time range selector in task chart section', () => {
    render(<ReportPage />);

    const timeRangeSelect = screen.getByRole('combobox');
    expect(timeRangeSelect).toBeInTheDocument();
    expect(timeRangeSelect).toHaveValue('week');
  });

  it('calls setTimeRange when time range is changed', () => {
    render(<ReportPage />);

    const timeRangeSelect = screen.getByRole('combobox');
    fireEvent.change(timeRangeSelect, { target: { value: 'month' } });

    expect(defaultMockData.setTimeRange).toHaveBeenCalledWith('month');
  });

  it('renders all chart components with correct data', () => {
    render(<ReportPage />);

    // Check that chart components are rendered
    expect(screen.getByText('Focus Time')).toBeInTheDocument();
    expect(screen.getByText('Project Time Distribution')).toBeInTheDocument();
    expect(screen.getByText('Task Chart')).toBeInTheDocument();

    // Check that data is displayed - use more specific selectors
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    const projectElements = screen.getAllByText('Project A');
    expect(projectElements.length).toBeGreaterThan(0);
  });

  it('displays correct summary statistics', () => {
    render(<ReportPage />);

    // Check total pomodoros
    expect(screen.getByText('50')).toBeInTheDocument();

    // Check average session length
    expect(screen.getByText('25m')).toBeInTheDocument();

    // Check task completion counts
    expect(screen.getByText('5')).toBeInTheDocument(); // today
    expect(screen.getByText('25')).toBeInTheDocument(); // this week
    expect(screen.getByText('58')).toBeInTheDocument(); // this two weeks
    expect(screen.getByText('124')).toBeInTheDocument(); // this month
  });

  it('handles missing summary data gracefully', () => {
    mockUseAnalytics.mockReturnValue({
      ...defaultMockData,
      summary: null,
    });

    render(<ReportPage />);

    // Should still render the page without summary cards
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();

    // Summary cards should not be rendered
    expect(screen.queryByText('Total Pomodoros')).not.toBeInTheDocument();
  });
});

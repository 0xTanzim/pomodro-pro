import { ThemeProvider } from "@/contexts/ThemeContext";
import { useTimerStore } from "@/store/timerStore";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Timer from "../Timer";

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    lastError: null,
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  alarms: {
    create: vi.fn(),
    clear: vi.fn(),
    onAlarm: {
      addListener: vi.fn(),
    },
  },
  notifications: {
    create: vi.fn(),
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
};

// Mock the timer store
vi.mock("@/store/timerStore");
const mockUseTimerStore = useTimerStore as vi.MockedFunction<typeof useTimerStore>;

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe("Timer Component", () => {
  const defaultMockState = {
    time: 1500, // 25 minutes
    mode: "focus" as const,
    isRunning: false,
    cycle: 0,
    todos: [],
    pomodoros: 0,
    focusSeconds: 0,
    totalFocusTime: 0,
    dailyGoal: 28800,
    streak: 0,
  };

  const defaultMockActions = {
    loadState: vi.fn().mockResolvedValue(undefined),
    startTimer: vi.fn().mockResolvedValue(undefined),
    pauseTimer: vi.fn().mockResolvedValue(undefined),
    resetTimer: vi.fn().mockResolvedValue(undefined),
    addTodo: vi.fn().mockResolvedValue(undefined),
    toggleTodo: vi.fn().mockResolvedValue(undefined),
    deleteTodo: vi.fn().mockResolvedValue(undefined),
    updateTodo: vi.fn().mockResolvedValue(undefined),
    setDailyGoal: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Chrome APIs globally
    global.chrome = mockChrome as any;

    // Mock timer store
    mockUseTimerStore.mockReturnValue({
      state: defaultMockState,
      isLoading: false,
      error: null,
      ...defaultMockActions,
    });
  });

  it("renders timer with correct time format", async () => {
    render(<Timer />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText("25:00")).toBeInTheDocument();
    });
    expect(screen.getByText("Focus Time")).toBeInTheDocument();
  });

  it("displays start button when timer is not running", async () => {
    render(<Timer />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText("Start")).toBeInTheDocument();
    });
    expect(screen.queryByText("Pause")).not.toBeInTheDocument();
  });

  it("displays pause button when timer is running", async () => {
    mockUseTimerStore.mockReturnValue({
      state: { ...defaultMockState, isRunning: true },
      isLoading: false,
      error: null,
      ...defaultMockActions,
    });

    render(<Timer />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText("Pause")).toBeInTheDocument();
    });
    expect(screen.queryByText("Start")).not.toBeInTheDocument();
  });

  it("calls startTimer when start button is clicked", async () => {
    const mockStartTimer = vi.fn().mockResolvedValue(undefined);
    mockUseTimerStore.mockReturnValue({
      state: defaultMockState,
      isLoading: false,
      error: null,
      ...defaultMockActions,
      startTimer: mockStartTimer,
    });

    render(<Timer />, { wrapper: TestWrapper });

    await waitFor(() => {
      const startButton = screen.getByText("Start");
      fireEvent.click(startButton);
    });

    expect(mockStartTimer).toHaveBeenCalled();
  });

  it("calls pauseTimer when pause button is clicked", async () => {
    const mockPauseTimer = vi.fn().mockResolvedValue(undefined);
    mockUseTimerStore.mockReturnValue({
      state: { ...defaultMockState, isRunning: true },
      isLoading: false,
      error: null,
      ...defaultMockActions,
      pauseTimer: mockPauseTimer,
    });

    render(<Timer />, { wrapper: TestWrapper });

    await waitFor(() => {
      const pauseButton = screen.getByText("Pause");
      fireEvent.click(pauseButton);
    });

    expect(mockPauseTimer).toHaveBeenCalled();
  });

  it("calls resetTimer when reset button is clicked", async () => {
    const mockResetTimer = vi.fn().mockResolvedValue(undefined);
    mockUseTimerStore.mockReturnValue({
      state: defaultMockState,
      isLoading: false,
      error: null,
      ...defaultMockActions,
      resetTimer: mockResetTimer,
    });

    render(<Timer />, { wrapper: TestWrapper });

    await waitFor(() => {
      const resetButton = screen.getByText("Reset");
      fireEvent.click(resetButton);
    });

    expect(mockResetTimer).toHaveBeenCalled();
  });

  it("displays correct time for different durations", async () => {
    mockUseTimerStore.mockReturnValue({
      state: { ...defaultMockState, time: 3661 }, // 1 hour 1 minute 1 second
      isLoading: false,
      error: null,
      ...defaultMockActions,
    });

    render(<Timer />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText("61:01")).toBeInTheDocument();
    });
  });

  it("displays correct mode labels", async () => {
    mockUseTimerStore.mockReturnValue({
      state: { ...defaultMockState, mode: "short_break" },
      isLoading: false,
      error: null,
      ...defaultMockActions,
    });

    render(<Timer />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText("Short Break")).toBeInTheDocument();
    });
  });

  it("shows loading spinner when isLoading is true", () => {
    mockUseTimerStore.mockReturnValue({
      state: null,
      isLoading: true,
      error: null,
      ...defaultMockActions,
    });

    render(<Timer />, { wrapper: TestWrapper });

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays stats correctly", async () => {
    const mockStateWithTodos = {
      ...defaultMockState,
      todos: [{ id: "1", text: "Test todo", completed: false } as any],
      pomodoros: 5,
      focusSeconds: 3600,
    };

    mockUseTimerStore.mockReturnValue({
      state: mockStateWithTodos,
      isLoading: false,
      error: null,
      ...defaultMockActions,
    });

    render(<Timer />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument(); // Todos count
      expect(screen.getByText("5")).toBeInTheDocument(); // Pomodoros count
      expect(screen.getByText("3600")).toBeInTheDocument(); // Focus seconds
    });
  });
});

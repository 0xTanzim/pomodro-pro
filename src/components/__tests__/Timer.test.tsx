import { usePomodoroStore } from "@/store/pomodoroStore";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Timer from "../Timer";

// Mock the stores
vi.mock("@/store/pomodoroStore");
vi.mock("@/hooks/useTimer");

const mockUsePomodoroStore = usePomodoroStore as vi.MockedFunction<typeof usePomodoroStore>;

describe("Timer Component", () => {
  const defaultMockState = {
    time: 1500, // 25 minutes
    mode: "focus" as const,
    isRunning: false,
    cycle: 0,
    setTime: vi.fn(),
    setMode: vi.fn(),
    setIsRunning: vi.fn(),
    setCycle: vi.fn(),
    reset: vi.fn(),
  };

  beforeEach(() => {
    mockUsePomodoroStore.mockReturnValue(defaultMockState);
  });

  it("renders timer with correct time format", () => {
    render(<Timer />);

    expect(screen.getByText("25:00")).toBeInTheDocument();
    expect(screen.getByText("FOCUS")).toBeInTheDocument();
  });

  it("displays start button when timer is not running", () => {
    render(<Timer />);

    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.queryByText("Pause")).not.toBeInTheDocument();
  });

  it("displays pause button when timer is running", () => {
    mockUsePomodoroStore.mockReturnValue({
      ...defaultMockState,
      isRunning: true,
    });

    render(<Timer />);

    expect(screen.getByText("Pause")).toBeInTheDocument();
    expect(screen.queryByText("Start")).not.toBeInTheDocument();
  });

  it("calls setIsRunning when start/pause button is clicked", () => {
    const mockSetIsRunning = vi.fn();
    mockUsePomodoroStore.mockReturnValue({
      ...defaultMockState,
      setIsRunning: mockSetIsRunning,
    });

    render(<Timer />);

    const startButton = screen.getByText("Start");
    fireEvent.click(startButton);

    expect(mockSetIsRunning).toHaveBeenCalledWith(true);
  });

  it("calls reset when reset button is clicked", () => {
    const mockReset = vi.fn();
    mockUsePomodoroStore.mockReturnValue({
      ...defaultMockState,
      reset: mockReset,
    });

    render(<Timer />);

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    expect(mockReset).toHaveBeenCalled();
  });

  it("displays correct time for different durations", () => {
    mockUsePomodoroStore.mockReturnValue({
      ...defaultMockState,
      time: 3661, // 1 hour 1 minute 1 second
    });

    render(<Timer />);

    expect(screen.getByText("61:01")).toBeInTheDocument();
  });

  it("displays correct mode labels", () => {
    mockUsePomodoroStore.mockReturnValue({
      ...defaultMockState,
      mode: "short_break",
    });

    render(<Timer />);

    expect(screen.getByText("SHORT BREAK")).toBeInTheDocument();
  });
});

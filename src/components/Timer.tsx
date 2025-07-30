import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { useTimerStore } from "@/store/timerStore";
import { Clock, Coffee, Pause, Play, RotateCcw, Target, TrendingUp, Zap } from "lucide-react";
import React, { useCallback, useEffect, useMemo } from "react";

export default function Timer(): React.JSX.Element {
  const { state, isLoading, loadState, startTimer, pauseTimer, resetTimer } = useTimerStore();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Memoize time formatting to prevent unnecessary recalculations
  const timeString = useMemo(() => {
    if (!state) return "25:00";
    const minutes = Math.floor(state.time / 60);
    const seconds = state.time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [state?.time]);

  // Memoize progress calculation
  const progress = useMemo(() => {
    if (!state) return 0;
    const getCurrentDuration = (): number => {
      switch (state.mode) {
        case "focus": return 25 * 60;
        case "short_break": return 5 * 60;
        case "long_break": return 15 * 60;
        default: return 25 * 60;
      }
    };
    const currentDuration = getCurrentDuration();
    return Math.max(0, Math.min(100, ((currentDuration - state.time) / currentDuration) * 100));
  }, [state?.mode, state?.time]);

  // Memoize mode configuration
  const modeConfig = useMemo(() => {
    if (!state) {
      return {
        gradient: "from-green-500 to-emerald-600",
        bgGradient: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
        icon: Target,
        title: "Focus Time",
        subtitle: "Stay focused and productive",
        color: "text-green-600 dark:text-green-400"
      };
    }

    switch (state.mode) {
      case "focus":
        return {
          gradient: "from-green-500 to-emerald-600",
          bgGradient: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
          icon: Target,
          title: "Focus Time",
          subtitle: "Stay focused and productive",
          color: "text-green-600 dark:text-green-400"
        };
      case "short_break":
        return {
          gradient: "from-blue-500 to-cyan-600",
          bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950",
          icon: Coffee,
          title: "Short Break",
          subtitle: "Take a quick breather",
          color: "text-blue-600 dark:text-blue-400"
        };
      case "long_break":
        return {
          gradient: "from-purple-500 to-pink-600",
          bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950",
          icon: Zap,
          title: "Long Break",
          subtitle: "Time to recharge",
          color: "text-purple-600 dark:text-purple-400"
        };
      default:
        return {
          gradient: "from-green-500 to-emerald-600",
          bgGradient: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
          icon: Target,
          title: "Focus Time",
          subtitle: "Stay focused and productive",
          color: "text-green-600 dark:text-green-400"
        };
    }
  }, [state?.mode]);

  const IconComponent = modeConfig.icon;

  // Memoize event handlers to prevent unnecessary re-renders
  const handleStartPause = useCallback(() => {
    if (state?.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [state?.isRunning, startTimer, pauseTimer]);

  const handleReset = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  if (isLoading || !state) {
    return (
      <div className="h-full flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
          role="status"
          aria-label="Loading timer"
        ></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Main Timer Card */}
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl  min-h-[320px]">
        <div className="flex items-start justify-between gap-6">
          {/* Left side - Timer Display + Controls */}
          <div className="flex-1 flex flex-col items-center">
            {/* Timer Display */}
            <div className="relative w-44 h-44 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(156, 163, 175, 0.2)"
                  strokeWidth="3"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={`url(#gradient-${state.mode})`}
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out drop-shadow-lg"
                />
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="gradient-focus" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="gradient-short_break" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                  <linearGradient id="gradient-long_break" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-wider mb-1">
                  {timeString}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {Math.round(progress)}% Complete
                </div>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={handleStartPause}
                className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 ${
                  state.isRunning
                    ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                    : `bg-gradient-to-r ${modeConfig.gradient} hover:shadow-xl text-white`
                }`}
              >
                {state.isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleReset}
                className="px-6 py-3 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Right side - Mode Info + Stats */}
          <div className="flex flex-col items-start justify-start min-w-[180px] m-2">
            {/* Mode Info */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${modeConfig.gradient} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
                  {modeConfig.title}
                </h2>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {modeConfig.subtitle}
              </p>
            </div>

            {/* Stats Section */}
            {/* <div className="space-y-4 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-green-600 font-medium">Todos</div>
                 <div className="text-2xl font-bold text-green-600">
                  {state.todos.length}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-sm text-green-600 font-medium">Pomodoro</div>
                  <div className="text-lg font-bold text-green-600">{state.pomodoros}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-green-600 font-medium">Focus</div>
                  <div className="text-lg font-bold text-green-600">{state.focusSeconds}</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Updates when timer completes
              </div>
            </div> */}

            {/* Stats Section */}
<div className="space-y-4 flex flex-col items-center justify-center">
  <div className="flex flex-col items-center justify-center mr-6">
    <div className="text-center">
    <div className="text-sm text-green-600 font-semibold">Todos</div>
    <div className="text-2xl font-bold text-green-600">
      {state.todos.length}
    </div>
  </div>

  <div className="flex gap-4">
    <div className="text-center">
      <div className="text-sm text-green-600 font-medium">Pomodoro</div>
      <div className="text-lg font-bold text-green-600">{state.pomodoros}</div>
    </div>
    <div className="text-center">
      <div className="text-sm text-green-600 font-medium">Focus</div>
      <div className="text-lg font-bold text-green-600">{state.focusSeconds}</div>
    </div>
  </div>

  </div>
  <div className="text-xs text-gray-500 dark:text-gray-400">
    Updates when timer completes
  </div>
</div>
          </div>
        </div>
      </Card>

      {/* Navigation Bar */}
      <div className="flex justify-center gap-4 mt-auto">
        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
      </div>
    </div>
  );
}

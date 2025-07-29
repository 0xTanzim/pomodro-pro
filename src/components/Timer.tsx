import { usePomodoroStore } from "@/store/pomodoroStore";
import { useTimer } from "@/hooks/useTimer";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Target, Coffee, Zap } from "lucide-react";

export default function Timer(): JSX.Element {
  const { time, mode, isRunning, setIsRunning, reset } = usePomodoroStore();
  useTimer();

  // Ensure time is a valid number and format properly
  const validTime = Math.max(0, Math.floor(time || 0));
  const minutes = Math.floor(validTime / 60);
  const seconds = (validTime % 60).toString().padStart(2, "0");

  const getCurrentDuration = (): number => {
    switch (mode) {
      case "focus": return 25 * 60;
      case "short_break": return 5 * 60;
      case "long_break": return 15 * 60;
      default: return 25 * 60;
    }
  };

  const currentDuration = getCurrentDuration();
  const progress = Math.max(0, Math.min(100, ((currentDuration - validTime) / currentDuration) * 100));

  const getModeConfig = () => {
    switch (mode) {
      case "focus":
        return {
          gradient: "from-indigo-500 via-purple-500 to-pink-500",
          bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950",
          icon: Target,
          title: "Focus Time",
          subtitle: "Stay focused and productive"
        };
      case "short_break":
        return {
          gradient: "from-emerald-500 via-teal-500 to-cyan-500",
          bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950",
          icon: Coffee,
          title: "Short Break",
          subtitle: "Take a quick breather"
        };
      case "long_break":
        return {
          gradient: "from-orange-500 via-red-500 to-pink-500",
          bgGradient: "from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950",
          icon: Zap,
          title: "Long Break",
          subtitle: "Time to recharge"
        };
      default:
        return {
          gradient: "from-indigo-500 via-purple-500 to-pink-500",
          bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950",
          icon: Target,
          title: "Focus Time",
          subtitle: "Stay focused and productive"
        };
    }
  };

  const modeConfig = getModeConfig();
  const IconComponent = modeConfig.icon;

  return (
    <div className={`h-full rounded-2xl bg-gradient-to-br ${modeConfig.bgGradient} p-6 flex flex-col items-center justify-center`}>
      {/* Mode Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${modeConfig.gradient} flex items-center justify-center shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
          {modeConfig.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {modeConfig.subtitle}
        </p>
      </div>

      {/* Timer Circle */}
      <div className="relative w-40 h-40 mb-8">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={`url(#gradient-${mode})`}
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-lg"
          />
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient-focus" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="gradient-short_break" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="gradient-long_break" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-wider mb-1">
            {minutes}:{seconds}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {Math.round(progress)}% Complete
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 py-4 rounded-xl font-semibold shadow-xl transition-all duration-300 hover:scale-105 ${
            isRunning
              ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
              : `bg-gradient-to-r ${modeConfig.gradient} hover:shadow-2xl text-white`
          }`}
        >
          {isRunning ? (
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
          onClick={reset}
          className="px-8 py-4 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}

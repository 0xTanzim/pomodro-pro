import TaskList from "@/components/TaskList";
import ThemeToggle from "@/components/ThemeToggle";
import Timer from "@/components/Timer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from "@/store/themeStore";
import { CheckSquare, Zap } from "lucide-react";
import { useEffect } from "react";

export default function App(): JSX.Element {
  const { loadTheme } = useThemeStore();
  const { loadTasks } = useTaskStore();

  useEffect(() => {
    loadTheme();
    loadTasks();
  }, [loadTheme, loadTasks]);

  return (
    <div className="h-[550px] w-[450px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="h-full p-6 border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Pomodoro Pro
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Boost your productivity</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="timer" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            <TabsTrigger
              value="timer"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Zap className="w-4 h-4 mr-2" />
              Timer
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="flex-1 overflow-hidden">
            <Timer />
          </TabsContent>
          <TabsContent value="tasks" className="flex-1 overflow-y-auto">
            <TaskList />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

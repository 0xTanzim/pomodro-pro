import ThemeToggle from '@/components/ThemeToggle';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { TaskList } from '@/features/tasks/components/TaskList';
import { usePopupSize } from '@/hooks/usePopupSize';
import { BarChart3, Clock, Settings, Target, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';

export default function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('timer');
  const popupSize = usePopupSize({ isTasksActive: activeTab === 'tasks' });
  const { summary, isLoading: analyticsLoading } = useAnalytics();

  const openReport = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
  };

  const openSettings = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  };

  const openTasks = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('task.html') });
  };

  // Format time for display
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div
      className="bg-background text-foreground"
      style={{
        height: `${popupSize.height}px`,
        width: `${popupSize.width}px`,
      }}
    >
      <Card className="h-full flex flex-col">
        {/* Header  */}
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold">Pomodoro Pro</h1>
              <p className="text-xs text-muted-foreground">
                Boost your productivity
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Main Content - More space */}
        <div className="flex-1 p-3 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3 mb-2">
              <TabsTrigger value="timer">Timer</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="report">Report</TabsTrigger>
            </TabsList>

            <TabsContent value="timer" className="flex-1 overflow-y-auto">
              <Timer />
            </TabsContent>

            <TabsContent value="tasks" className="flex-1 overflow-y-auto">
              <TaskList />
            </TabsContent>

            <TabsContent value="report" className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-xl font-bold text-blue-600">
                          {analyticsLoading
                            ? '...'
                            : summary?.totalPomodoros || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total Pomodoros
                        </div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-xl font-bold text-green-600">
                          {analyticsLoading
                            ? '...'
                            : summary?.tasksCompletedThisWeek || 0}
                        </div>
                        <div className="text-xs text-gray-500">Tasks Done</div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Additional Stats */}
                {summary && (
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <div>
                          <div className="text-lg font-bold text-purple-600">
                            {formatTime(summary.focusTimeThisWeek)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Focus Time
                          </div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="text-lg font-bold text-orange-600">
                            {summary.tasksCompletedToday}
                          </div>
                          <div className="text-xs text-gray-500">Today</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <BarChart3 className="h-4 w-4" />
                      <span>Analytics</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      View detailed reports and analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <Button onClick={openReport} className="w-full text-sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Open Full Report
                    </Button>
                    <Button
                      onClick={openTasks}
                      variant="outline"
                      className="w-full text-sm"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Go to Tasks
                    </Button>
                    <Button
                      onClick={openSettings}
                      variant="outline"
                      className="w-full text-sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Go to Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div className="text-xs">
                        <span className="font-medium">Right-click</span> the
                        extension icon to access report and settings
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <div className="text-xs">
                        <span className="font-medium">Track progress</span> with
                        detailed analytics and charts
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                      <div className="text-xs">
                        <span className="font-medium">Customize settings</span>{' '}
                        for priorities, projects, and notifications
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}

import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, PieChart, RefreshCw, Target } from 'lucide-react';
import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { FocusTimeDistribution } from './FocusTimeDistribution';
import { ProjectTimeDistribution } from './ProjectTimeDistribution';
import { ReportToggle } from './ReportToggle';
import { TaskChart } from './TaskChart';
import { TaskCompletionCards } from './TaskCompletionCards';

export const ReportPage: React.FC = () => {
  const {
    isLoading,
    reportView,
    setReportView,
    timeRange,
    setTimeRange,
    summary,
    projectTimeData,
    focusTimeData,
    taskChartData,
    refreshData,
  } = useAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading report data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your productivity and focus time
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={refreshData} variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Report Toggle */}
        <ReportToggle
          view={reportView}
          onViewChange={setReportView}
        />

        {/* Summary Cards */}
        <div className="mb-8">
          <TaskCompletionCards
            summary={summary}
            view={reportView}
          />
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Focus Time Distribution */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Focus Time</span>
              </CardTitle>
              <CardDescription>
                Time spent on different tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FocusTimeDistribution data={focusTimeData} />
            </CardContent>
          </Card>

          {/* Project Time Distribution */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Project Time Distribution</span>
              </CardTitle>
              <CardDescription>
                Time allocation across projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectTimeDistribution data={projectTimeData} />
            </CardContent>
          </Card>
        </div>

        {/* Task Chart */}
        <div className="mt-8">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <CardTitle>Task Chart</CardTitle>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="week">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="month">Monthly</option>
                </select>
              </div>
              <CardDescription>
                Task completion and focus time trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskChart data={taskChartData} view={reportView} />
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        {summary && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Total Pomodoros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {summary.totalPomodoros}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Completed sessions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Average Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {summary.averageSessionLength}m
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Minutes per session
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Productivity Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {summary.totalPomodoros > 0 ? Math.round((summary.tasksCompletedThisWeek / summary.totalPomodoros) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Task completion rate
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { AnalyticsService } from '../services/analyticsService';
import {
  FocusTimeEntry,
  ProjectTimeData,
  ReportSummary,
  ReportView,
  TaskChartData,
  TimeRange,
} from '../types';

export const useAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reportView, setReportView] = useState<ReportView>('tasks');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [projectTimeData, setProjectTimeData] = useState<ProjectTimeData[]>([]);
  const [focusTimeData, setFocusTimeData] = useState<FocusTimeEntry[]>([]);
  const [taskChartData, setTaskChartData] = useState<TaskChartData[]>([]);

  const analyticsService = AnalyticsService.getInstance();

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // Initialize sample data if no tasks exist
      await analyticsService.initializeSampleData();

      const [summaryData, projectData, focusData, chartData] =
        await Promise.all([
          analyticsService.getReportSummary(),
          analyticsService.getProjectTimeDistribution(),
          analyticsService.getFocusTimeDistribution(),
          analyticsService.getTaskChartData(
            timeRange === 'biweekly' ? 'biweekly' : 'week'
          ),
        ]);

      setSummary(summaryData);
      setProjectTimeData(projectData);
      setFocusTimeData(focusData);
      setTaskChartData(chartData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadReportData();
  };

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  return {
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
  };
};

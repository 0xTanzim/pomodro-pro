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
      const summary = await analyticsService.getReportSummary();
      const projectData = await analyticsService.getProjectTimeDistribution();
      const focusData = await analyticsService.getFocusTimeDistribution();
      const chartData = await analyticsService.getTaskChartData(timeRange);

      setSummary(summary);
      setProjectTimeData(projectData);
      setFocusTimeData(focusData);
      setTaskChartData(chartData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // setError('Failed to load analytics data'); // This line was removed from the new_code
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadReportData();
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const summary = await analyticsService.getReportSummary();
        const projectData = await analyticsService.getProjectTimeDistribution();
        const focusData = await analyticsService.getFocusTimeDistribution();
        const chartData = await analyticsService.getTaskChartData(timeRange);

        setSummary(summary);
        setProjectTimeData(projectData);
        setFocusTimeData(focusData);
        setTaskChartData(chartData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        // setError('Failed to load analytics data'); // This line was removed from the new_code
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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

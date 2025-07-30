import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskList } from '@/features/tasks/components/TaskList';
import { Target } from 'lucide-react';
import React, { Suspense } from 'react';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TaskManagementPage Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Failed to load task management page</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading Task Management...</p>
    </div>
  </div>
);

export const TaskManagementPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Task Management</h1>
                <p className="text-muted-foreground">Organize and track your tasks efficiently</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Main Content */}
          <Card className="w-full h-[calc(100vh-200px)]">
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <Suspense fallback={<LoadingSpinner />}>
                <div className="h-full">
                  <TaskList />
                </div>
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

---
alwaysApply: true
---

# Pomodoro Pro Chrome Extension - Development Instructions

This document provides comprehensive guidelines for developing the **Pomodoro Pro Chrome Extension**, a modern, feature-rich time management tool built with **React**, **TypeScript**, **Tailwind CSS**, **Shadcn UI**, and **Zustand** using Chrome's **Manifest V3**. These instructions are designed for developers and IDE agents to ensure consistent, maintainable, and scalable code that adheres to enterprise-grade standards.

## Overview

**Pomodoro Pro** is a Chrome Extension that implements the Pomodoro Technique for productivity, featuring a timer, task management, analytics, and settings. The extension is designed to be modular, performant, and user-friendly, with a focus on persistence, synchronization, and testability.

### Key Features

- **Timer**: A Pomodoro timer (25-minute work sessions, 5-minute breaks) running persistently in the background.
- **Task Management**: Create, edit, and track tasks with priorities, projects, tags, and Pomodoro counts.
- **Analytics Dashboard**: Visualize productivity metrics using Recharts.
- **Settings**: Customizable timer durations, notifications, and themes.
- **Cross-Device Sync**: Persist user settings and tasks across devices via `chrome.storage.sync`.

## Architecture Overview

The extension follows a **multi-entry point architecture** to support different UI contexts and a persistent background service worker. Each entry point is optimized for its specific use case while sharing reusable components and services.

### Entry Points

1. **Popup** (`index.html`): Main timer interface, constrained to 600px height for compact layouts.
2. **Options** (`options.html`): Settings configuration page for user preferences.
3. **Report** (`report.html`): Analytics dashboard displaying productivity metrics with Recharts.
4. **Task** (`task.html`): Dedicated task management page for creating and organizing tasks.
5. **Background Service Worker** (`background.ts`): Handles timer logic, notifications, and persistent state using `chrome.alarms`.

### State Management

The extension uses a **dual store architecture** with **Zustand** for state management:

- **timerStore.ts**: Manages timer state (e.g., running, paused, time remaining) synchronized with the background script via `chrome.storage.local`.
- **taskStore.ts**: Manages task-related state (e.g., task list, priorities, tags) stored in `chrome.storage.sync` for cross-device persistence.

**Key Pattern**: The background script is the **source of truth** for timer state. UI components (popup, etc.) sync with the background script using storage listeners:

```typescript
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.timerState) {
    timerStore.setState(changes.timerState.newValue);
  }
});
```

### Chrome Storage Strategy

- **chrome.storage.local**: Used for transient data like timer state (fast, local-only).
- **chrome.storage.sync**: Used for persistent data like tasks and settings (syncs across devices).
- **Storage Helper**: Use `src/lib/chromeStorage.ts` for all storage operations to ensure consistent error handling and Promise-based APIs. **Never** call `chrome.storage` directly.

## Coding Standards

### General Principles

1. **DRY (Don't Repeat Yourself)**: Reuse components, hooks, and services to minimize code duplication.
2. **YAGNI (You Aren't Gonna Need It)**: Avoid over-engineering; implement only what's required for the current feature set.
3. **SOLID Principles**: Ensure single responsibility, open-closed principle, and dependency inversion where applicable.
4. **File Size**: Keep files under 250 lines of code (LOC). Split complex logic into smaller, reusable components or hooks.
5. **TypeScript**: Use strict typing with interfaces for all data structures. Avoid `any` types.
6. **Testing**: Write unit tests for all components, hooks, and services using **Vitest** and **React Testing Library**. Ensure 100% test coverage for critical paths (timer logic, task CRUD).

### Code Style

- **Formatting**: Use **Prettier** for consistent formatting and **ESLint** for code quality.
- **Naming**: Use descriptive, camelCase names for variables and functions (e.g., `startTimer`, `TaskCard`).
- **Components**: Use functional components with **React Hooks**. Avoid class components.
- **Styling**: Use **Tailwind CSS** with **Shadcn UI** components. Avoid custom CSS files.
- **Icons**: Use **Lucide React** icons for consistency.
- **Documentation**: Use **TSDoc** for TypeScript code and **JSDoc** for JavaScript utilities.

### Example TSDoc

```typescript
/**
 * Starts a new Pomodoro timer session.
 * @param duration - Duration of the timer in minutes.
 * @returns Promise resolving to true if the timer started successfully.
 * @throws Error if the timer is already running.
 */
async function startTimer(duration: number): Promise<boolean> {
  // Implementation
}
```

## Feature Development Guidelines

### Timer Feature

The timer is the core of the extension, driven by the background script for persistence.

- **Implementation**:
  - Use `chrome.alarms` API in `background.ts` for timer logic (avoid `setInterval` for reliability).
  - Store timer state in `chrome.storage.local` for fast access.
  - Sync timer state to the popup via `chrome.storage.onChanged` listeners.
- **Public API** (in `TimerService`):

  ```typescript
  interface TimerService {
    startTimer(duration: number): Promise<void>;
    pauseTimer(): Promise<void>;
    resetTimer(): Promise<void>;
    getTimerState(): Promise<TimerState>;
  }
  ```

- **State Shape**:

  ```typescript
  interface TimerState {
    isRunning: boolean;
    timeRemaining: number; // Seconds
    mode: 'work' | 'break';
    duration: number; // Minutes
  }
  ```

- **Constraints**:
  - Ensure the timer persists when the popup closes.
  - Handle edge cases: browser suspension, network interruptions, and storage quota limits.

### Task Management Feature

The task management system allows users to create, update, and track tasks with Pomodoro integration.

- **Implementation**:
  - Use `TaskService` for CRUD operations, storing tasks in `chrome.storage.sync`.
  - Provide a `useTasks` hook for React components to interact with tasks.
  - Validate task data (e.g., non-empty titles, valid priorities) before saving.
- **Public API** (in `TaskService`):

  ```typescript
  interface TaskService {
    addTask(task: Partial<Task>): Promise<Task>;
    updateTask(id: string, updates: Partial<Task>): Promise<Task>;
    deleteTask(id: string): Promise<void>;
    getTasks(): Promise<Task[]>;
  }
  ```

- **State Shape**:

  ```typescript
  interface Task {
    id: string; // UUID
    title: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    project: string;
    pomodoroCount: number;
    completedPomodoros: number;
    tags: string[];
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
  }
  ```

- **Constraints**:
  - Optimize for `chrome.storage.sync` quota limits (e.g., compress task data if needed).
  - Handle edge cases: duplicate task IDs, invalid input, and sync conflicts.

### Analytics Feature

The analytics dashboard visualizes productivity metrics using **Recharts**.

- **Implementation**:
  - Use `ReportService` to aggregate task and timer data.
  - Provide a `useReportData` hook for fetching and transforming data for charts.
  - Store historical data in `chrome.storage.local` (non-synced, as analytics are device-specific).
- **Public API** (in `ReportService`):

  ```typescript
  interface ReportService {
    getPomodoroStats(): Promise<PomodoroStats>;
    getTaskCompletionStats(): Promise<TaskCompletionStats>;
  }
  ```

- **Constraints**:
  - Optimize chart rendering for performance within the 600px popup height.
  - Handle edge cases: empty data sets, large data volumes, and rendering bottlenecks.

### Settings Feature

The settings page allows users to customize timer durations, notifications, and themes.

- **Implementation**:
  - Store settings in `chrome.storage.sync` for cross-device persistence.
  - Provide a `useSettings` hook for accessing and updating settings.
  - Validate settings (e.g., positive timer durations) before saving.
- **Public API** (in `SettingsService`):

  ```typescript
  interface SettingsService {
    getSettings(): Promise<Settings>;
    updateSettings(updates: Partial<Settings>): Promise<void>;
  }
  ```

- **State Shape**:

  ```typescript
  interface Settings {
    workDuration: number; // Minutes
    breakDuration: number; // Minutes
    longBreakDuration: number; // Minutes
    theme: 'light' | 'dark';
    notifications: boolean;
  }
  ```

## Chrome Extension Constraints

### Popup Optimization

- **Height Constraint**: The popup must fit within a 600px height. Use `flex-1 overflow-y-auto` for scrollable content and compact layouts (e.g., `space-y-2` for spacing).
- **Performance**: Minimize re-renders using `React.memo` and `useCallback` for event handlers.
- **Message Passing**: Communicate with the background script using `chrome.runtime.sendMessage`:

  ```typescript
  chrome.runtime.sendMessage(
    { type: 'START_TIMER', duration: 25 },
    (response) => {
      if (response.success) {
        console.log('Timer started');
      }
    }
  );
  ```

### Background Script

- **Timer Logic**: Use `chrome.alarms` for reliable timer updates:

  ```typescript
  chrome.alarms.create('pomodoro', { periodInMinutes: 1 / 60 }); // Tick every second
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'pomodoro') {
      updateTimerState();
    }
  });
  ```

- **Message Handling**:

  ```typescript
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'START_TIMER') {
      startTimer(request.duration);
      sendResponse({ success: true });
    }
  });
  ```

### Storage Abstraction

Use `src/lib/chromeStorage.ts` for all storage operations:

```typescript
// Example: Get timer state
import { getStorageItem } from '../lib/chromeStorage';

async function getTimerState(): Promise<TimerState> {
  return getStorageItem('timerState', {
    isRunning: false,
    timeRemaining: 1500,
    mode: 'work',
    duration: 25,
  });
}
```

## Testing Guidelines

- **Test Framework**: Use **Vitest** with **React Testing Library** for unit and integration tests.
- **Coverage**: Aim for 100% coverage of critical paths (timer logic, task CRUD, storage operations).
- **Mocking**: Mock `chrome` APIs using `vitest-environment-jsdom` and custom mocks in `tests/mocks/chrome.ts`.
- **Example Test**:

  ```typescript
  import { render, screen } from '@testing-library/react';
  import { describe, it, expect } from 'vitest';
  import TimerDisplay from '../features/timer/components/TimerDisplay';

  describe('TimerDisplay', () => {
    it('displays initial timer state', () => {
      render(<TimerDisplay timeRemaining={1500} isRunning={false} />);
      expect(screen.getByText('25:00')).toBeInTheDocument();
    });
  });
  ```

## Performance and Scalability

- **Storage Optimization**: Compress task data (e.g., use short keys) to stay within `chrome.storage` quotas.
- **Rendering**: Use `React.memo` and `useMemo` to prevent unnecessary re-renders in the popup.
- **Background Script**: Minimize CPU usage in `background.ts` by using `chrome.alarms` instead of polling.
- **Error Handling**: Handle storage errors, network interruptions, and Chrome API failures gracefully.

## Trade-Offs and Decisions

1. **Background-Driven Timer**:
   - **Why**: Ensures timer persistence across browser sessions and popup closures.
   - **Trade-Off**: Increased complexity in state synchronization but guarantees reliability.
2. **Zustand for State Management**:
   - **Why**: Lightweight, TypeScript-friendly, and avoids Redux boilerplate.
   - **Trade-Off**: Requires careful synchronization with `chrome.storage`.
3. **Tailwind CSS with Shadcn UI**:
   - **Why**: Rapid prototyping, consistent styling, and no custom CSS maintenance.
   - **Trade-Off**: Larger bundle size, mitigated by Vite's tree-shaking.

## Example Implementation

### Timer Service

```typescript
/**
 * Service for managing Pomodoro timer operations.
 */
class TimerService {
  /**
   * Starts a new timer session.
   * @param duration - Timer duration in minutes.
   * @throws Error if the timer is already running.
   */
  async startTimer(duration: number): Promise<void> {
    const state = await getStorageItem<TimerState>('timerState', {
      isRunning: false,
      timeRemaining: duration * 60,
      mode: 'work',
      duration,
    });
    if (state.isRunning) throw new Error('Timer is already running');
    await chrome.runtime.sendMessage({ type: 'START_TIMER', duration });
  }

  /**
   * Gets the current timer state.
   * @returns Current timer state.
   */
  async getTimerState(): Promise<TimerState> {
    return getStorageItem<TimerState>('timerState', {
      isRunning: false,
      timeRemaining: 1500,
      mode: 'work',
      duration: 25,
    });
  }
}
```

### Task Component

```typescript
/**
 * Displays a single task with actions.
 * @param task - Task object to display.
 */
function TaskCard({ task }: { task: Task }) {
  const { updateTask, deleteTask } = useTasks();

  return (
    <div className="flex items-center justify-between p-2 border rounded space-x-2">
      <span>{task.title}</span>
      <button
        className="btn btn-sm"
        onClick={() => updateTask(task.id, { completedPomodoros: task.completedPomodoros + 1 })}
      >
        Complete Pomodoro
      </button>
      <button className="btn btn-sm btn-error" onClick={() => deleteTask(task.id)}>
        Delete
      </button>
    </div>
  );
}
```

## Getting Started

1. Clone the repository and run `pnpm install`.
2. Start development with `pnpm dev` or `pnpm run watch`.
3. Load the `dist/` folder as an unpacked extension in Chrome.
4. Write features, tests, and documentation following the guidelines above.
5. Run `pnpm test` and `pnpm lint` before committing changes.

## Additional Resources

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Vitest Documentation](https://vitest.dev/)

By following these instructions, developers and IDE agents can build a robust, maintainable, and user-friendly Pomodoro Pro Chrome Extension that meets enterprise-grade standards.

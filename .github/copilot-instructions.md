# Pomodoro Pro Chrome Extension - AI Coding Instructions

This is a modern Chrome Extension (Manifest V3) for Pomodoro time management built with React, TypeScript, Tailwind CSS, Shadcn UI, and Zustand.

## Architecture Overview

### Multi-Entry Point Extension

- **Popup** (`index.html`): Main timer interface in 600px height constraint - optimize for compact layouts
- **Options** (`options.html`): Settings configuration page
- **Report** (`report.html`): Analytics dashboard with charts (Recharts)
- **Task** (`task.html`): Dedicated task management page
- **Background Service Worker** (`background.ts`): Persistent timer logic using `chrome.alarms`

### State Management Pattern

**Dual Store Architecture**:

- `timerStore.ts` (Zustand): Timer state synchronized with background script via `chrome.storage.local`
- `taskStore.ts` & feature stores: UI-specific state management

**Key Pattern**: Background script is the source of truth for timer state. Popup syncs via storage listeners:

```typescript
// Always use storage listeners for state sync between contexts
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.timerState) {
    setTimerState(changes.timerState.newValue);
  }
});
```

### Chrome Storage Strategy

- `chrome.storage.local`: Timer state, temporary data (fast, local-only)
- `chrome.storage.sync`: Settings, tasks, user preferences (syncs across devices)
- **Storage Helper**: Always use `src/lib/chromeStorage.ts` utilities, never direct chrome.storage calls

## Development Workflow

### Essential Commands

```bash
pnpm dev              # Development with hot reload
pnpm run watch        # Build with file watching for extension testing
pnpm build           # Production build to dist/
pnpm test            # Run Vitest unit tests
```

### Testing Extension Locally

1. Run `pnpm run watch` for auto-rebuilding
2. Load `dist/` folder as unpacked extension in Chrome
3. Refresh extension after changes to background script

## Project-Specific Patterns

### Component Organization

**Feature-Based Structure**: Each feature has its own `components/`, `hooks/`, `services/`, `types/` folders:

```
src/features/tasks/
├── components/     # TaskList, TaskCard, TaskStats, etc.
├── hooks/         # useTasks hook with CRUD operations
├── services/      # TaskService for storage operations
└── types/         # Task interfaces and type definitions
```

### Chrome Extension Constraints

**Popup Size Optimization**: All popup components must work within 600px height:

- Use `flex-1 overflow-y-auto` for scrollable content areas
- Compact stats cards with horizontal layouts
- Minimize vertical spacing (`space-y-2` over `space-y-4`)

**Message Passing Pattern**:

```typescript
// Popup to Background communication
chrome.runtime.sendMessage({ type: 'START_TIMER' }, (response) => {
  // Handle response
});

// Background script handlers
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'START_TIMER') {
    startTimer();
    sendResponse({ success: true });
  }
});
```

### Task Management System

**Service Layer Pattern**: All data operations go through service classes:

- `TaskService.addTask()`, `TaskService.updateTask()`, etc.
- Services handle storage, validation, and error handling
- Hooks consume services and provide React-friendly APIs

**Task State Shape**: Rich task objects with priorities, projects, tags, and Pomodoro tracking:

```typescript
interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project: string;
  pomodoroCount: number;
  completedPomodoros: number;
  tags: string[];
  // ... see src/features/tasks/types/task.ts
}
```

### Timer Implementation

**Background-Driven Timer**: Timer logic runs in background script using `chrome.alarms` API (not setInterval) for persistence across browser sessions.

**State Synchronization**: Popup displays timer state but doesn't control the timer directly - all timer actions flow through background script.

## Code Style & Conventions

- **File Size**: Keep components under 250 LOC - split complex components into sub-components
- **TypeScript**: Strict typing - define interfaces for all data structures
- **Styling**: Tailwind CSS with Shadcn UI components - no custom CSS
- **Icons**: Lucide React icons only
- **State**: Zustand stores with TypeScript interfaces
- **Testing**: Vitest + Testing Library for component tests

## Critical Integration Points

### Vite Build Configuration

Multi-entry build setup in `vite.config.ts` handles different extension contexts (popup, options, background). Background script gets special treatment for Chrome Extension compatibility.

### Chrome Storage Abstraction

Never use `chrome.storage` directly - always use `src/lib/chromeStorage.ts` helpers for consistent error handling and Promise-based APIs.

### Timer Persistence

Timer continues running even when popup closes because it runs in background script. Popup is just a view layer that syncs with persistent state.

When working on this codebase, prioritize understanding the background script timer logic and storage synchronization patterns - these are unique to Chrome Extensions and critical for correct functionality.

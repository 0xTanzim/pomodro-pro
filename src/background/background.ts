import type { Task } from '@/features/tasks/types/task';
import { getFromStorage, setToStorage } from '@/lib/chromeStorage';
import {
  DEFAULT_SETTINGS,
  DEFAULT_TIMER_STATE,
  TimerMode,
  TimerSettings,
  TimerState,
} from '@/types/timer';

// Initialize context menu for report page, settings, and tasks
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'go-to-report',
    title: 'Go to Report Page',
    contexts: ['action'],
  });

  chrome.contextMenus.create({
    id: 'go-to-settings',
    title: 'Go to Settings',
    contexts: ['action'],
  });

  chrome.contextMenus.create({
    id: 'go-to-tasks',
    title: 'Go to Task Management',
    contexts: ['action'],
  });

  // Set default settings on fresh install if not present
  (async () => {
    const existing = await getFromStorage<TimerSettings>(
      'timerSettings',
      'sync'
    );
    if (!existing) {
      await chrome.storage.sync.set({ timerSettings: DEFAULT_SETTINGS });
    }
    const state = await getFromStorage<TimerState>('timerState');
    if (!state) {
      await setToStorage('timerState', DEFAULT_TIMER_STATE);
    }
  })().catch((e) => console.error('Failed to set defaults on install', e));
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'go-to-report') {
    chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
  }

  if (info.menuItemId === 'go-to-settings') {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  }

  if (info.menuItemId === 'go-to-tasks') {
    chrome.tabs.create({ url: chrome.runtime.getURL('task.html') });
  }
});

// Timer state management
let isTimerRunning = false;

// Alarm name constant
const TIMER_ALARM = 'pomodoro-timer-alarm';

// Helper to create a 1-second alarm
function createTimerAlarm() {
  chrome.alarms.create(TIMER_ALARM, { delayInMinutes: 1 / 60 }); // 1 second
}

// Helper to clear the timer alarm
function clearTimerAlarm() {
  chrome.alarms.clear(TIMER_ALARM);
}

// Start timer using alarms
function startTimer(): void {
  isTimerRunning = true;
  clearTimerAlarm();
  createTimerAlarm();
  console.log('[BG] Timer started (alarms)');
}

// Stop timer and clear alarm
function stopTimer(): void {
  isTimerRunning = false;
  clearTimerAlarm();
  console.log('[BG] Timer stopped (alarms)');
}

// Get timer settings
async function getTimerSettings(): Promise<TimerSettings> {
  try {
    const settings = await getFromStorage<TimerSettings>(
      'timerSettings',
      'sync'
    );
    return settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting timer settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Handle timer tick logic
async function handleTimerTick(): Promise<void> {
  try {
    const state = await getFromStorage<TimerState>('timerState');
    const settings = await getTimerSettings();

    if (!state || !state.isRunning || state.time <= 0) {
      stopTimer();
      return;
    }

    // Update timer
    const newState = { ...state };
    newState.time -= 1;
    // Only count focus time during focus mode; avoid inflating analytics during breaks
    if (newState.mode === 'focus') {
      newState.focusSeconds += 1;
      newState.totalFocusTime += 1;
    }

    // Check if timer completed
    if (newState.time === 0) {
      await handleTimerComplete(newState, settings);
    } else {
      await setToStorage('timerState', newState);
    }
  } catch (error) {
    console.error('Error in timer tick (alarms):', error);
    stopTimer();
  }
}

// Listen for alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === TIMER_ALARM) {
    handleTimerTick().then(() => {
      // If timer is still running, schedule next tick
      if (isTimerRunning) {
        createTimerAlarm();
      }
    });
  }
});

// Handle timer completion
async function handleTimerComplete(
  state: TimerState,
  settings: TimerSettings
): Promise<void> {
  const newState = { ...state };
  newState.isRunning = false;

  if (state.mode === 'focus') {
    // Focus session completed
    newState.pomodoros += 1;
    newState.cycle += 1;

    // Update selected task if any, or log anonymous session
    if (state.selectedTaskId) {
      try {
        const tasks: Task[] =
          ((await getFromStorage<Task[]>('tasks', 'sync')) as Task[]) || [];
        const taskIndex = tasks.findIndex(
          (task) => task.id === state.selectedTaskId
        );

        if (taskIndex !== -1) {
          const updatedTasks = [...tasks];
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            completedPomodoros: updatedTasks[taskIndex].completedPomodoros + 1,
          };

          // Auto-complete task if planned pomodoros reached or exceeded
          const planned = updatedTasks[taskIndex].pomodoroCount || 0;
          const done = updatedTasks[taskIndex].completedPomodoros;
          if (planned > 0 && done >= planned) {
            updatedTasks[taskIndex] = {
              ...updatedTasks[taskIndex],
              completed: true,
              completedAt: new Date().toISOString(),
            };
          }

          // Update task in storage
          await chrome.storage.sync.set({ tasks: updatedTasks });
          console.log(
            `[BG] Updated pomodoros for task: ${updatedTasks[taskIndex].title}`
          );

          // Append session to local pomodoro log for analytics
          try {
            const logKey = 'pomodoroLog';
            const local = await chrome.storage.local.get([logKey]);
            const log = Array.isArray(local[logKey]) ? local[logKey] : [];
            const durationMinutes = updatedTasks[taskIndex].pomodoroDuration
              ? updatedTasks[taskIndex].pomodoroDuration
              : Math.round((await getTimerSettings()).focusDuration / 60);
            const entry = {
              taskId: updatedTasks[taskIndex].id,
              title: updatedTasks[taskIndex].title,
              project: updatedTasks[taskIndex].project,
              minutes: durationMinutes,
              finishedAt: new Date().toISOString(),
            };
            // Keep only last 1000 entries to cap size
            const updatedLog = [...log, entry].slice(-1000);
            await chrome.storage.local.set({ [logKey]: updatedLog });
          } catch (e) {
            console.error('[BG] Failed to append to pomodoro log', e);
          }
        }
      } catch (error) {
        console.error('Error updating task pomodoros:', error);
      }
    } else {
      // Anonymous pomodoro - log it for analytics
      try {
        const logKey = 'pomodoroLog';
        const local = await chrome.storage.local.get([logKey]);
        const log = Array.isArray(local[logKey]) ? local[logKey] : [];
        const durationMinutes = Math.round(
          (await getTimerSettings()).focusDuration / 60
        );
        const entry = {
          taskId: 'anonymous',
          title: 'Anonymous Focus Session',
          project: 'Uncategorized',
          minutes: durationMinutes,
          finishedAt: new Date().toISOString(),
        };
        // Keep only last 1000 entries to cap size
        const updatedLog = [...log, entry].slice(-1000);
        await chrome.storage.local.set({ [logKey]: updatedLog });
        console.log('[BG] Logged anonymous pomodoro session');
      } catch (e) {
        console.error(
          '[BG] Failed to append anonymous session to pomodoro log',
          e
        );
      }
    }

    // Determine next mode
    const nextMode: TimerMode =
      newState.cycle % 4 === 0 ? 'long_break' : 'short_break';
    // Prefer per-task break durations when a task is selected
    let nextDuration =
      nextMode === 'long_break'
        ? settings.longBreakDuration
        : settings.shortBreakDuration;
    try {
      if (state.selectedTaskId) {
        const tasks: Task[] =
          (await getFromStorage<Task[]>('tasks', 'sync')) || [];
        const selected = tasks.find((t) => t.id === state.selectedTaskId);
        if (selected) {
          if (nextMode === 'long_break' && selected.longBreakDuration) {
            nextDuration = selected.longBreakDuration * 60;
          }
          if (nextMode === 'short_break' && selected.shortBreakDuration) {
            nextDuration = selected.shortBreakDuration * 60;
          }
        }
      }
    } catch (e) {
      // Fallback to settings if anything goes wrong
    }

    newState.mode = nextMode;
    newState.time = nextDuration;

    // Send notification
    if (settings.notifications) {
      try {
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: 'Focus Session Complete! 🎉',
          message: `Great job! You've completed ${newState.pomodoros} Pomodoro${newState.pomodoros > 1 ? 's' : ''}. Time for a break!`,
        });
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }

    // Auto-start break if enabled
    if (settings.autoStartBreaks) {
      newState.isRunning = true;
    }
  } else {
    // Break completed
    newState.mode = 'focus';
    // If a task has a specific durations, use them; otherwise use settings
    if (state.selectedTaskId) {
      try {
        const tasks: Task[] =
          (await getFromStorage<Task[]>('tasks', 'sync')) || [];
        const selected = tasks.find((t) => t.id === state.selectedTaskId);
        if (selected?.pomodoroDuration && selected.pomodoroDuration > 0) {
          newState.time = selected.pomodoroDuration * 60;
        } else {
          newState.time = settings.focusDuration;
        }
      } catch (e) {
        newState.time = settings.focusDuration;
      }
    } else {
      newState.time = settings.focusDuration;
    }

    // Send notification
    if (settings.notifications) {
      try {
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: 'Break Complete! ⚡',
          message: 'Break time is over. Ready to focus again?',
        });
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }

    // Auto-start next focus session if enabled
    if (settings.autoStartPomodoros) {
      newState.isRunning = true;
    }
  }

  await setToStorage('timerState', newState);
}

// Handle storage changes to start/stop timer
chrome.storage.onChanged.addListener(
  async (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string
  ) => {
    if (areaName === 'local' && changes.timerState) {
      const newState = changes.timerState.newValue as TimerState;
      try {
        if (newState.isRunning && !isTimerRunning) {
          startTimer();
        } else if (!newState.isRunning && isTimerRunning) {
          stopTimer();
        }
      } catch (err) {
        console.error('[BG] Error handling timerState change', err, newState);
      }
    }

    // If settings in sync changed and timer is idle, update remaining time to reflect new durations
    if (areaName === 'sync' && changes.timerSettings) {
      try {
        const state =
          (await getFromStorage<TimerState>('timerState')) ||
          DEFAULT_TIMER_STATE;
        const settings =
          (changes.timerSettings.newValue as TimerSettings) || DEFAULT_SETTINGS;

        if (!state.isRunning) {
          const newState = { ...state };
          if (state.mode === 'focus') newState.time = settings.focusDuration;
          if (state.mode === 'short_break')
            newState.time = settings.shortBreakDuration;
          if (state.mode === 'long_break')
            newState.time = settings.longBreakDuration;
          await setToStorage('timerState', newState);
        }
      } catch (error) {
        console.error('[BG] Failed to apply new settings to idle timer', error);
      }
    }
  }
);

// Handle messages from popup
chrome.runtime.onMessage.addListener(
  (message: any, sender: any, sendResponse: (response?: any) => void) => {
    if (message.type === 'GET_TIMER_STATE') {
      getFromStorage<TimerState>('timerState').then(sendResponse);
      return true; // Keep message channel open for async response
    }

    if (message.type === 'UPDATE_TIMER_STATE') {
      setToStorage('timerState', message.state).then(() =>
        sendResponse({ success: true })
      );
      return true;
    }

    if (message.type === 'RESET_TIMER') {
      getTimerSettings().then(async (settings) => {
        const current =
          (await getFromStorage<TimerState>('timerState')) ||
          DEFAULT_TIMER_STATE;
        let time = settings.focusDuration;
        if (current.selectedTaskId) {
          try {
            const tasks: any[] =
              (await getFromStorage<any>('tasks', 'sync')) || [];
            const selected = tasks.find((t) => t.id === current.selectedTaskId);
            if (current.mode === 'focus' && selected?.pomodoroDuration) {
              time = selected.pomodoroDuration * 60;
            }
            if (
              current.mode === 'short_break' &&
              selected?.shortBreakDuration
            ) {
              time = selected.shortBreakDuration * 60;
            }
            if (current.mode === 'long_break' && selected?.longBreakDuration) {
              time = selected.longBreakDuration * 60;
            }
          } catch {}
        } else {
          if (current.mode === 'short_break')
            time = settings.shortBreakDuration;
          if (current.mode === 'long_break') time = settings.longBreakDuration;
        }
        const resetState = {
          ...current,
          time,
          isRunning: false,
        } as TimerState;
        await setToStorage('timerState', resetState);
        sendResponse({ success: true });
      });
      return true;
    }
  }
);

// Handle extension icon badge updates with throttling
let lastBadgeUpdate = 0;
async function updateBadge(): Promise<void> {
  const now = Date.now();

  // Throttle badge updates to every 500ms
  if (now - lastBadgeUpdate < 500) {
    return;
  }

  lastBadgeUpdate = now;

  try {
    const state = await getFromStorage<TimerState>('timerState');
    if (state) {
      const minutes = Math.floor(state.time / 60);
      const seconds = state.time % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      await chrome.action.setBadgeText({ text: timeString });
      await chrome.action.setBadgeBackgroundColor({
        color: state.isRunning ? '#10b981' : '#6b7280',
      });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
}

// Cleanup on extension shutdown
chrome.runtime.onSuspend.addListener(() => {
  clearTimerAlarm(); // Clear alarms on extension shutdown
});

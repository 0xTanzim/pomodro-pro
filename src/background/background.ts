import { getFromStorage, setToStorage } from "@/lib/chromeStorage";
import { DEFAULT_TIMER_STATE, TimerMode, TimerState } from "@/types/timer";

// Initialize context menu for report page and settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'go-to-report',
    title: 'Go to Report Page',
    contexts: ['action']
  });

  chrome.contextMenus.create({
    id: 'go-to-settings',
    title: 'Go to Settings',
    contexts: ['action']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'go-to-report') {
    chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
  }

  if (info.menuItemId === 'go-to-settings') {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  }
});

// Timer state management
let isTimerRunning = false;

// Alarm name constant
const TIMER_ALARM = "pomodoro-timer-alarm";

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
  console.log("[BG] Timer started (alarms)");
}

// Stop timer and clear alarm
function stopTimer(): void {
  isTimerRunning = false;
  clearTimerAlarm();
  console.log("[BG] Timer stopped (alarms)");
}

// Handle timer tick logic
async function handleTimerTick(): Promise<void> {
  try {
    const state = await getFromStorage<TimerState>("timerState");
    const settings = await getFromStorage("timerSettings");

    if (!state || !state.isRunning || state.time <= 0) {
      stopTimer();
      return;
    }

    // Update timer
    const newState = { ...state };
    newState.time -= 1;
    newState.focusSeconds += 1;
    newState.totalFocusTime += 1;

    // Check if timer completed
    if (newState.time === 0) {
      await handleTimerComplete(newState, settings);
    } else {
      await setToStorage("timerState", newState);
    }
  } catch (error) {
    console.error("Error in timer tick (alarms):", error);
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
async function handleTimerComplete(state: TimerState, settings: any): Promise<void> {
  const newState = { ...state };
  newState.isRunning = false;

  if (state.mode === "focus") {
    // Focus session completed
    newState.pomodoros += 1;
    newState.cycle += 1;

    // Determine next mode
    const nextMode: TimerMode = newState.cycle % 4 === 0 ? "long_break" : "short_break";
    const nextDuration = nextMode === "long_break"
      ? settings?.longBreakDuration || 15 * 60
      : settings?.shortBreakDuration || 5 * 60;

    newState.mode = nextMode;
    newState.time = nextDuration;

    // Send notification
    if (settings?.notifications) {
      try {
        await chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon-128.png",
          title: "Focus Session Complete! 🎉",
          message: `Great job! You've completed ${newState.pomodoros} Pomodoro${newState.pomodoros > 1 ? 's' : ''}. Time for a break!`,
        });
      } catch (error) {
        console.error("Failed to create notification:", error);
      }
    }

    // Auto-start break if enabled
    if (settings?.autoStartBreaks) {
      newState.isRunning = true;
    }
  } else {
    // Break completed
    newState.mode = "focus";
    newState.time = settings?.focusDuration || 25 * 60;

    // Send notification
    if (settings?.notifications) {
      try {
        await chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon-128.png",
          title: "Break Complete! ⚡",
          message: "Break time is over. Ready to focus again?",
        });
      } catch (error) {
        console.error("Failed to create notification:", error);
      }
    }

    // Auto-start next focus session if enabled
    if (settings?.autoStartPomodoros) {
      newState.isRunning = true;
    }
  }

  await setToStorage("timerState", newState);
}

// Handle storage changes to start/stop timer
chrome.storage.onChanged.addListener(async (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
  if (areaName === "local" && changes.timerState) {
    const newState = changes.timerState.newValue as TimerState;
    try {
      if (newState.isRunning && !isTimerRunning) {
        startTimer();
      } else if (!newState.isRunning && isTimerRunning) {
        stopTimer();
      }
    } catch (err) {
      console.error("[BG] Error handling timerState change", err, newState);
    }
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: (response?: any) => void) => {
  if (message.type === "GET_TIMER_STATE") {
    getFromStorage<TimerState>("timerState").then(sendResponse);
    return true; // Keep message channel open for async response
  }

  if (message.type === "UPDATE_TIMER_STATE") {
    setToStorage("timerState", message.state).then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === "RESET_TIMER") {
    getFromStorage("timerSettings").then(async (settings) => {
      const resetState = {
        ...DEFAULT_TIMER_STATE,
        time: settings?.focusDuration || 25 * 60,
        todos: (await getFromStorage<TimerState>("timerState"))?.todos || [],
      };
      await setToStorage("timerState", resetState);
      sendResponse({ success: true });
    });
    return true;
  }
});

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
    const state = await getFromStorage<TimerState>("timerState");
    if (state) {
      const minutes = Math.floor(state.time / 60);
      const seconds = state.time % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      await chrome.action.setBadgeText({ text: timeString });
      await chrome.action.setBadgeBackgroundColor({ color: state.isRunning ? "#10b981" : "#6b7280" });
    }
  } catch (error) {
    console.error("Failed to update badge:", error);
  }
}

// Cleanup on extension shutdown
chrome.runtime.onSuspend.addListener(() => {
  clearTimerAlarm(); // Clear alarms on extension shutdown
});

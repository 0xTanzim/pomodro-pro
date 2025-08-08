# Chrome Permissions Explanation for Pomodoro Pro

## 🔐 **Required Permissions**

### **1. Storage Permission**

```json
"permissions": ["storage"]
```

**Why We Need It:**

- Save user tasks and settings locally
- Store timer state and pomodoro logs
- Sync data across devices via Chrome sync
- Persist user preferences between sessions

**What It Does:**

- Uses `chrome.storage.local` for timer state and analytics
- Uses `chrome.storage.sync` for tasks and settings
- Enables cross-device synchronization
- Stores user preferences and customization options

**User Benefit:**

- Your data persists between browser sessions
- Tasks and settings sync across all your Chrome browsers
- No data loss when closing the browser
- Seamless experience across devices

**Data Stored:**

- Tasks: titles, descriptions, priorities, projects, tags
- Settings: timer durations, notification preferences
- Analytics: pomodoro completion logs, productivity metrics
- User preferences: theme settings, customization options

### **2. Alarms Permission**

```json
"permissions": ["alarms"]
```

**Why We Need It:**

- Keep timer running accurately in the background
- Maintain timer state even when popup is closed
- Ensure precise timing for pomodoro sessions
- Handle browser suspension and restoration

**What It Does:**

- Uses `chrome.alarms` API for reliable timer functionality
- Updates timer every second when running
- Maintains timer state across browser events
- Handles timer completion and mode transitions

**User Benefit:**

- Timer continues working even if you close the popup
- Accurate timing regardless of browser activity
- Reliable session completion notifications
- Timer persists across browser restarts

**Technical Implementation:**

- Creates 1-second alarms for timer ticks
- Updates timer state in background script
- Handles timer completion and break transitions
- Manages auto-start settings for breaks and sessions

### **3. Notifications Permission**

```json
"permissions": ["notifications"]
```

**Why We Need It:**

- Alert users when pomodoro sessions complete
- Notify users when breaks are finished
- Provide audio and visual session completion alerts
- Enhance user experience with timely notifications

**What It Does:**

- Shows desktop notifications for session completion
- Displays session statistics in notifications
- Provides audio alerts for session end
- Sends notifications for break completion

**User Benefit:**

- Know when to take breaks or start new sessions
- Stay on track with your productivity schedule
- Receive timely reminders for session transitions
- Enhanced focus with session completion alerts

**Notification Content:**

- Session completion messages
- Break start/end notifications
- Productivity statistics
- Session count and progress updates

### **4. Active Tab Permission**

```json
"permissions": ["activeTab"]
```

**Why We Need It:**

- Access current tab for context menu integration
- Enable right-click menu functionality
- Provide quick access to extension features
- Support keyboard shortcuts and tab integration

**What It Does:**

- Enables context menu on right-click
- Provides quick access to extension features
- Supports keyboard shortcuts for timer control
- Integrates with current webpage context

**User Benefit:**

- Quick access to extension features from any webpage
- Right-click menu for reports and settings
- Keyboard shortcuts for timer control
- Seamless integration with browsing workflow

**Features Enabled:**

- Context menu integration
- Keyboard shortcuts (Space for start/pause)
- Quick access to reports and settings
- Tab-aware functionality

### **5. Context Menus Permission**

```json
"permissions": ["contextMenus"]
```

**Why We Need It:**

- Add custom right-click menu options
- Provide quick access to extension features
- Enable context-sensitive functionality
- Improve user experience with easy navigation

**What It Does:**

- Creates custom context menu items
- Provides quick access to reports page
- Enables settings access from context menu
- Offers task management shortcuts

**User Benefit:**

- Easy access to extension features
- Quick navigation to reports and settings
- Context-sensitive menu options
- Improved workflow integration

**Menu Items Added:**

- "Go to Report Page" - Opens analytics dashboard
- "Go to Settings" - Opens settings page
- "Go to Task Management" - Opens task management

## 🔒 **Privacy & Security**

### **No External Data Transmission**

- All data stored locally in browser
- No external servers or cloud storage
- No analytics or tracking services
- No data sent to third parties

### **Data Protection**

- Uses Chrome's built-in security features
- Leverages Chrome's encryption for synced data
- No sensitive information collected
- User data remains private and secure

### **Transparency**

- Clear permission explanations
- Detailed privacy policy provided
- Open source code available
- User control over data retention

## 📋 **Permission Summary**

| Permission      | Purpose                               | User Benefit                             |
| --------------- | ------------------------------------- | ---------------------------------------- |
| `storage`       | Save tasks, settings, and analytics   | Data persistence and cross-device sync   |
| `alarms`        | Maintain accurate timer functionality | Reliable timer that works in background  |
| `notifications` | Alert users of session completion     | Timely reminders and session tracking    |
| `activeTab`     | Enable context menu integration       | Quick access to extension features       |
| `contextMenus`  | Add custom right-click menu items     | Easy navigation and workflow integration |

## ✅ **Compliance**

### **Chrome Web Store Guidelines**

- All permissions are necessary for core functionality
- Clear explanations provided for each permission
- No excessive or unnecessary permissions requested
- Privacy-focused implementation
- User data protection prioritized

### **Best Practices**

- Minimal permission set for required functionality
- Clear documentation of permission usage
- User control over data and settings
- Transparent privacy practices
- No external dependencies or tracking

---

**All permissions are essential for the extension's core functionality and provide clear user benefits while maintaining privacy and security standards.**

# Pomodoro Pro Extension – TODO

## Setup & Tooling
- [ ] Initialize Vite + React + TypeScript project
- [ ] Add Tailwind CSS, Shadcn UI, Zustand, Recharts, react-circular-progressbar
- [ ] Setup ESLint, Prettier, and ensure linting works
- [ ] Configure Vite for Chrome extension (relative paths, multiple entry points for popup/options/background)
- [ ] Create manifest.json (MV3, permissions, popup, options, background, etc.)

## Core Features
- [ ] Pomodoro Timer: Focus, short break, long break, cycles, start/pause/reset, auto-start, progress circle
- [ ] Task Management: Add/edit/delete tasks, priorities, tags, completion, sync storage
- [ ] Settings: Custom durations, auto-start, notifications, sounds, colors, blacklist/whitelist
- [ ] Notifications: Desktop notifications via chrome.notifications
- [ ] Analytics: Track Pomodoros, tasks, display charts (Recharts), export history
- [ ] Site Blocking: Blacklist/whitelist using chrome.declarativeNetRequest
- [ ] Options Page: Settings UI, persistent storage
- [ ] Popup Page: Main timer/task UI
- [ ] Background Service Worker: Timer logic, alarms, notifications, site blocking

## UI/UX
- [ ] Use Tailwind + Shadcn UI for modern, beautiful, accessible UI
- [ ] Follow Figma screenshots for inspiration (from demoTodoDesign/)
- [ ] Responsive, dark/light mode, ARIA/accessibility

## Code Quality
- [ ] Modular, SRP, SoC, <250 LOC per file/component
- [ ] TypeScript everywhere, strict types
- [ ] Unit tests for logic-heavy modules (if time allows)
- [ ] Linting and formatting enforced

## Build & Test
- [ ] Vite build outputs to dist/ with correct structure for Chrome
- [ ] Test extension in Chrome (chrome://extensions)
- [ ] Fix any build/lint issues

## Documentation & Tracking
- [ ] Update README with setup, build, and usage instructions
- [ ] Mark completed tasks here as you go

# Pomodoro Pro Chrome Extension

A modern, feature-rich Pomodoro timer Chrome extension built with React, TypeScript, Tailwind CSS, Shadcn UI, Zustand, and Vite.

## 🎯 Features

- **⏱️ Smart Timer**: Customizable Pomodoro sessions with focus/break cycles
- **📋 Task Management**: Create and organize tasks with priorities, projects, and tags
- **📊 Analytics**: Real-time productivity reports and progress tracking
- **🔔 Notifications**: Desktop notifications for session completion
- **🌙 Themes**: Light and dark theme support
- **📱 Cross-Device Sync**: Tasks and settings sync across all your Chrome browsers
- **🔒 Privacy Focused**: All data stored locally, no external servers

## 🚀 Getting Started

### Installation

1. **From Chrome Web Store** (Recommended)
   - Install directly from the [Chrome Web Store](https://chrome.google.com/webstore/detail/pomodoro-pro/...)
   - Click the extension icon to start using

2. **Development Setup**

   ```sh
   # Clone the repository
   git clone https://github.com/0xTanzim/pomodro-pro.git
   cd pomodro-pro

   # Install dependencies
   pnpm install

   # Start development
   pnpm run dev

   # Build for production
   pnpm run build
   ```

### Load in Chrome (Development)

1. Go to `chrome://extensions/`
2. Enable "Developer Mode"
3. Click "Load unpacked" and select the `dist/` folder
4. The extension will appear in your toolbar

## 📁 Project Structure

```
/src
├── components/     # UI components (Timer, TaskList, etc.)
├── features/       # Feature modules (analytics, tasks)
├── store/          # Zustand state management
├── hooks/          # Custom React hooks
├── lib/            # Utilities and helpers
├── background/     # Service worker for timer logic
└── types/          # TypeScript type definitions

/public
├── manifest.json   # Chrome extension manifest
├── icons/          # Extension icons
└── *.html          # Entry point HTML files
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI, Lucide React Icons
- **State Management**: Zustand
- **Build Tool**: Vite
- **Chrome APIs**: Manifest V3, Storage, Alarms, Notifications
- **Testing**: Vitest, React Testing Library

## 📋 Development

### Available Scripts

```sh
pnpm dev          # Start development server
pnpm build         # Build for production
pnpm test          # Run tests
pnpm lint          # Run ESLint
pnpm format        # Format code with Prettier
```

### Code Quality

- **ESLint**: Code linting and quality checks
- **Prettier**: Code formatting
- **TypeScript**: Type safety and IntelliSense
- **Testing**: Unit tests with Vitest and React Testing Library

## 📚 Documentation

- **[User Manual](docs/USER_MANUAL.md)**: Complete guide for users
- **[Privacy Policy](PRIVACY_POLICY.md)**: Data handling and privacy information
- **[Chrome Store Answers](docs/CHROME_STORE_ANSWERS.md)**: Store submission details
- **[Permissions Explanation](docs/PERMISSIONS_EXPLANATION.md)**: Chrome permissions details

## 🔐 Permissions

This extension requires the following Chrome permissions:

- **`storage`**: Save tasks, settings, and analytics data
- **`alarms`**: Maintain accurate timer functionality in background
- **`notifications`**: Alert users when sessions complete
- **`activeTab`**: Enable context menu integration
- **`contextMenus`**: Add right-click menu options

All permissions are necessary for core functionality and are clearly documented.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Keep files under 250 lines of code
- Follow modular architecture principles
- Write tests for new features
- Follow TypeScript best practices
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/0xTanzim/pomodro-pro/issues)
- **Documentation**: Check the [User Manual](docs/USER_MANUAL.md)
- **Chrome Web Store**: [Install from Chrome Web Store](https://chrome.google.com/webstore/detail/pomodoro-pro/...)

## 🎯 About

Pomodoro Pro helps you boost productivity using the proven Pomodoro Technique. Perfect for students, professionals, freelancers, and anyone wanting to improve their time management and focus.

---

**Made with ❤️ by [0xTanzim](https://github.com/0xTanzim)**

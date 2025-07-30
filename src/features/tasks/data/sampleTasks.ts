import { Task } from '../types/task';

export const sampleTasks: Omit<Task, 'id' | 'createdAt'>[] = [
  {
    title: "Design App Icons and Assets",
    description: "Create modern app icons and design assets for the Pomodoro app",
    completed: false,
    priority: 'urgent',
    project: 'Pomodoro App',
    pomodoroCount: 6,
    completedPomodoros: 0,
    tags: ['#Urgent', '#Work', '#Design'],

    attachments: [],
    color: 'bg-red-500'
  },
  {
    title: "Exercise or Workout",
    description: "Daily exercise routine to stay healthy and productive",
    completed: false,
    priority: 'medium',
    project: 'General',
    pomodoroCount: 2,
    completedPomodoros: 0,
    tags: ['#Personal', '#Productive', '#Home'],

    attachments: [],
    color: 'bg-green-500'
  },
  {
    title: "Write a Report & Proposal",
    description: "Complete the quarterly report and prepare proposal for next quarter",
    completed: false,
    priority: 'high',
    project: 'Work Project',
    pomodoroCount: 4,
    completedPomodoros: 0,
    tags: ['#Productive', '#Work', '#Important'],

    attachments: [],
    color: 'bg-purple-500'
  },
  {
    title: "Study for Exams",
    description: "Review course materials and practice problems for upcoming exams",
    completed: false,
    priority: 'high',
    project: 'General',
    pomodoroCount: 5,
    completedPomodoros: 0,
    tags: ['#Important', '#Work', '#Study'],

    attachments: [],
    color: 'bg-green-500'
  },
  {
    title: "Define the App Concept",
    description: "Define the core concept and features for the AI Chatbot App",
    completed: true,
    priority: 'urgent',
    project: 'AI Chatbot App',
    pomodoroCount: 2,
    completedPomodoros: 2,
    tags: ['#Urgent', '#Work', '#Design'],

    attachments: [],
    color: 'bg-red-500',
    completedAt: new Date().toISOString()
  },
  {
    title: "Market Research and Analysis",
    description: "Conduct comprehensive market research for the Fashion App",
    completed: true,
    priority: 'high',
    project: 'Fashion App',
    pomodoroCount: 3,
    completedPomodoros: 3,
    tags: ['#Research', '#Work', '#Productive'],

    attachments: [],
    color: 'bg-orange-500',
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
  },
  {
    title: "Identify Target Audience",
    description: "Define and analyze the target audience for the Pomodoro App",
    completed: true,
    priority: 'urgent',
    project: 'Pomodoro App',
    pomodoroCount: 4,
    completedPomodoros: 4,
    tags: ['#Urgent', '#Work', '#Design'],

    attachments: [],
    color: 'bg-red-500',
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
  },
  {
    title: "Watch a movie or TV show",
    description: "Relax and enjoy some entertainment",
    completed: true,
    priority: 'low',
    project: 'General',
    pomodoroCount: 5,
    completedPomodoros: 5,
    tags: ['#Personal', '#Home'],
    attachments: [],
    color: 'bg-green-500',
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
  },
  {
    title: "Read a Book or Article",
    description: "Read the latest industry articles and books",
    completed: true,
    priority: 'medium',
    project: 'General',
    pomodoroCount: 3,
    completedPomodoros: 3,
    tags: ['#Personal', '#Productive'],
    attachments: [],
    color: 'bg-purple-500',
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
  }
];

export const sampleStats = {
  totalPomodoroHours: '06:40',
  elapsedTime: '00:00',
  tasksWaiting: 4,
  tasksCompleted: 5,
  focusTime: '02:05'
};

export const sampleAchievements = [
  {
    date: new Date().toISOString(),
    focusTime: '2h 5m',
    completedTasks: 2,
    totalPomodoros: 5
  },
  {
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    focusTime: '5h',
    completedTasks: 3,
    totalPomodoros: 12
  }
];

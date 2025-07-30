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
    subtasks: [
      { id: '1', title: 'Sketch initial concepts', completed: false, pomodoroCount: 2 },
      { id: '2', title: 'Create vector icons', completed: false, pomodoroCount: 3 },
      { id: '3', title: 'Design app screenshots', completed: false, pomodoroCount: 1 }
    ],
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
    subtasks: [
      { id: '4', title: 'Warm up exercises', completed: false, pomodoroCount: 1 },
      { id: '5', title: 'Main workout routine', completed: false, pomodoroCount: 1 }
    ],
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
    subtasks: [
      { id: '6', title: 'Research data', completed: false, pomodoroCount: 1 },
      { id: '7', title: 'Write report draft', completed: false, pomodoroCount: 2 },
      { id: '8', title: 'Create proposal', completed: false, pomodoroCount: 1 }
    ],
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
    subtasks: [
      { id: '9', title: 'Review chapter 1-3', completed: false, pomodoroCount: 2 },
      { id: '10', title: 'Practice problems', completed: false, pomodoroCount: 2 },
      { id: '11', title: 'Create study notes', completed: false, pomodoroCount: 1 }
    ],
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
    subtasks: [
      { id: '12', title: 'Research competitors', completed: true, pomodoroCount: 1 },
      { id: '13', title: 'Define core features', completed: true, pomodoroCount: 1 }
    ],
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
    subtasks: [
      { id: '14', title: 'Analyze competitors', completed: true, pomodoroCount: 1 },
      { id: '15', title: 'Survey target audience', completed: true, pomodoroCount: 1 },
      { id: '16', title: 'Write analysis report', completed: true, pomodoroCount: 1 }
    ],
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
    subtasks: [
      { id: '17', title: 'Create user personas', completed: true, pomodoroCount: 2 },
      { id: '18', title: 'Analyze user behavior', completed: true, pomodoroCount: 2 }
    ],
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
    subtasks: [],
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
    subtasks: [],
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

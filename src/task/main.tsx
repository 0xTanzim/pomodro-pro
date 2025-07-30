import { ThemeProvider } from '@/contexts/ThemeContext';
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { TaskManagementPage } from './TaskManagementPage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <TaskManagementPage />
    </ThemeProvider>
  </React.StrictMode>
);

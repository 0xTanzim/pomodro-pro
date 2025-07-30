import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ReportPage } from '../features/analytics/components/ReportPage'
import '../index.css'

// Add report-page class to body for full page styling
document.body.classList.add('report-page');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ReportPage />
    </ThemeProvider>
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '../contexts/ThemeContext'
import '../index.css'
import Options from './Options'

// Add options-page class to body for full page styling
document.body.classList.add('options-page');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Options />
    </ThemeProvider>
  </React.StrictMode>,
)

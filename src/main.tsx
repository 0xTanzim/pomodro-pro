import App from "@/App";
import { ThemeProvider } from "@/contexts/ThemeContext";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Add popup class to body for popup styling
document.body.classList.add('popup');

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
    <App />
    </ThemeProvider>
  </React.StrictMode>,
);

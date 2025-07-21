
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppStateProvider } from "@/contexts/AppStateContext";
import { UIStateProvider } from "@/contexts/UIStateContext";

// Force dark mode on document root immediately
document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppStateProvider>
      <UIStateProvider>
        <App />
      </UIStateProvider>
    </AppStateProvider>
  </StrictMode>
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppStateProvider } from "@/contexts/AppStateContext";
import { UIStateProvider } from "@/contexts/UIStateContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppStateProvider>
      <UIStateProvider>
        <App />
      </UIStateProvider>
    </AppStateProvider>
  </StrictMode>
);

import { useState, useEffect } from 'react';

interface TutorialProgress {
  hasSeenTutorial: boolean;
  hasCompletedTutorial: boolean;
  completedSteps: string[];
  hasUploadedData: boolean;
  hasCreatedChart: boolean;
  hasBuiltDashboard: boolean;
  hasUsedAI: boolean;
  lastActiveTab: string | null;
}

const STORAGE_KEY = 'tutorial-progress';

export const useTutorialProgress = () => {
  const [progress, setProgress] = useState<TutorialProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      hasSeenTutorial: false,
      hasCompletedTutorial: false,
      completedSteps: [],
      hasUploadedData: false,
      hasCreatedChart: false,
      hasBuiltDashboard: false,
      hasUsedAI: false,
      lastActiveTab: null
    };
  });

  // Save to localStorage whenever progress changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const updateProgress = (updates: Partial<TutorialProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  const markTutorialSeen = () => {
    updateProgress({ hasSeenTutorial: true });
  };

  const markTutorialCompleted = () => {
    updateProgress({ 
      hasCompletedTutorial: true,
      hasSeenTutorial: true 
    });
  };

  const markStepCompleted = (stepId: string) => {
    setProgress(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, stepId])]
    }));
  };

  const markDataUploaded = () => {
    updateProgress({ hasUploadedData: true });
    markStepCompleted('upload-data');
  };

  const markChartCreated = () => {
    updateProgress({ hasCreatedChart: true });
    markStepCompleted('create-chart');
  };

  const markDashboardBuilt = () => {
    updateProgress({ hasBuiltDashboard: true });
    markStepCompleted('build-dashboard');
  };

  const markAIUsed = () => {
    updateProgress({ hasUsedAI: true });
    markStepCompleted('try-ai');
  };

  const setActiveTab = (tabId: string) => {
    updateProgress({ lastActiveTab: tabId });
  };

  const resetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress({
      hasSeenTutorial: false,
      hasCompletedTutorial: false,
      completedSteps: [],
      hasUploadedData: false,
      hasCreatedChart: false,
      hasBuiltDashboard: false,
      hasUsedAI: false,
      lastActiveTab: null
    });
  };

  // Computed values
  const shouldShowTutorial = !progress.hasSeenTutorial;
  const shouldShowChecklist = progress.hasSeenTutorial && !progress.hasCompletedTutorial;
  const completionPercentage = [
    progress.hasUploadedData,
    progress.hasCreatedChart,
    progress.hasBuiltDashboard,
    progress.hasUsedAI
  ].filter(Boolean).length / 4 * 100;

  return {
    progress,
    shouldShowTutorial,
    shouldShowChecklist,
    completionPercentage,
    markTutorialSeen,
    markTutorialCompleted,
    markStepCompleted,
    markDataUploaded,
    markChartCreated,
    markDashboardBuilt,
    markAIUsed,
    setActiveTab,
    resetProgress,
    updateProgress
  };
};
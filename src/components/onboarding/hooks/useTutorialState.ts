import { useState } from 'react';

export const useTutorialState = (
  totalSteps: number,
  onComplete: () => void,
  onClose: () => void
) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleNext = (stepId: string) => {
    setCompletedSteps(prev => new Set(prev).add(stepId));
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return {
    currentStep,
    completedSteps,
    progress,
    handleNext,
    handlePrevious,
    handleSkip
  };
};
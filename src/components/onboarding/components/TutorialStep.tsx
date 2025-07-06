import React from 'react';

export interface TutorialStepData {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  target?: string;
  content: React.ReactNode;
}

interface TutorialStepProps {
  step: TutorialStepData;
}

export const TutorialStep: React.FC<TutorialStepProps> = ({ step }) => {
  return step.content;
};
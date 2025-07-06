import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export const TutorialNavigation: React.FC<TutorialNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSkip
}) => {
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      <div className="flex gap-2">
        <Button variant="ghost" onClick={onSkip}>
          Skip Tutorial
        </Button>
        <Button onClick={onNext}>
          {isLastStep ? 'Get Started' : 'Next'}
          {!isLastStep && (
            <ChevronRight className="h-4 w-4 ml-1" />
          )}
        </Button>
      </div>
    </div>
  );
};
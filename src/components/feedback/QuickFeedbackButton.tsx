import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { RatingComponent } from './RatingComponent';
import { useUnifiedFeedback } from '@/hooks/useUnifiedFeedback';

interface QuickFeedbackButtonProps {
  feedbackType: string;
  featureContext: any;
  feedbackData: any;
  onFeedbackSubmitted?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabels?: boolean;
}

export const QuickFeedbackButton: React.FC<QuickFeedbackButtonProps> = ({
  feedbackType,
  featureContext,
  feedbackData,
  onFeedbackSubmitted,
  variant = "ghost",
  size = "sm",
  showLabels = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittedType, setSubmittedType] = useState<'positive' | 'negative' | null>(null);

  const { submitFeedback, isSubmitting, getFeedbackTypeByName } = useUnifiedFeedback();

  const feedbackTypeData = getFeedbackTypeByName(feedbackType);

  const handleQuickFeedback = async (type: 'positive' | 'negative') => {
    if (!feedbackTypeData) return;

    const quickRating = type === 'positive' ? 5 : 1;
    
    submitFeedback({
      feedbackTypeId: feedbackTypeData.id,
      featureContext,
      feedbackData: {
        ...feedbackData,
        quick_feedback_type: type,
      },
      rating: quickRating,
    });

    setSubmittedType(type);
    onFeedbackSubmitted?.();
  };

  const handleDetailedFeedback = async () => {
    if (!feedbackTypeData || !rating) return;

    submitFeedback({
      feedbackTypeId: feedbackTypeData.id,
      featureContext,
      feedbackData,
      rating,
      feedbackText: feedbackText.trim() || undefined,
    });

    setIsOpen(false);
    setRating(0);
    setFeedbackText('');
    onFeedbackSubmitted?.();
  };

  if (submittedType) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {submittedType === 'positive' ? (
          <ThumbsUp className="h-4 w-4 text-green-600" />
        ) : (
          <ThumbsDown className="h-4 w-4 text-red-600" />
        )}
        {showLabels && <span>Thanks for your feedback!</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={() => handleQuickFeedback('positive')}
        disabled={isSubmitting}
        className="hover:bg-green-50 hover:text-green-600"
      >
        <ThumbsUp className="h-4 w-4" />
        {showLabels && <span className="ml-1">Good</span>}
      </Button>

      <Button
        variant={variant}
        size={size}
        onClick={() => handleQuickFeedback('negative')}
        disabled={isSubmitting}
        className="hover:bg-red-50 hover:text-red-600"
      >
        <ThumbsDown className="h-4 w-4" />
        {showLabels && <span className="ml-1">Poor</span>}
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={isSubmitting}
          >
            <MessageSquare className="h-4 w-4" />
            {showLabels && <span className="ml-1">Detailed</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">Provide Detailed Feedback</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Help us improve by sharing your thoughts
              </p>
            </div>

            <RatingComponent
              label="Overall Rating"
              rating={rating}
              onChange={setRating}
              showValue
            />

            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional Comments (Optional)
              </label>
              <Textarea
                placeholder="What could be improved?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleDetailedFeedback}
                disabled={!rating || isSubmitting}
                className="flex-1"
              >
                Submit Feedback
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
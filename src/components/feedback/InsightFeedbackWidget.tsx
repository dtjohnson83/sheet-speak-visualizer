import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RatingComponent } from './RatingComponent';
import { QuickFeedbackButton } from './QuickFeedbackButton';
import { useInsightFeedback } from '@/hooks/useInsightFeedback';
import { Brain, MessageSquare } from 'lucide-react';

interface InsightFeedbackWidgetProps {
  insight: any;
  insightType: string;
  dataContext?: any;
  onFeedbackSubmitted?: () => void;
  showQuickFeedback?: boolean;
  compact?: boolean;
}

export const InsightFeedbackWidget: React.FC<InsightFeedbackWidgetProps> = ({
  insight,
  insightType,
  dataContext,
  onFeedbackSubmitted,
  showQuickFeedback = true,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [accuracyRating, setAccuracyRating] = useState(0);
  const [usefulnessRating, setUsefulnessRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [suggestedImprovement, setSuggestedImprovement] = useState('');

  const { submitInsightFeedback, isSubmitting } = useInsightFeedback();

  const handleSubmit = async () => {
    submitInsightFeedback({
      insightType,
      originalInsight: insight,
      userRating,
      accuracyRating,
      usefulnessRating,
      feedbackText: feedbackText.trim() || undefined,
      suggestedImprovement: suggestedImprovement.trim() || undefined,
      dataContext,
    });

    setIsOpen(false);
    setUserRating(0);
    setAccuracyRating(0);
    setUsefulnessRating(0);
    setFeedbackText('');
    setSuggestedImprovement('');
    onFeedbackSubmitted?.();
  };

  return (
    <div className="flex items-center gap-2">
      {showQuickFeedback && (
        <QuickFeedbackButton
          feedbackType="ai_insight"
          featureContext={{ insight_type: insightType }}
          feedbackData={{ original_insight: insight }}
          onFeedbackSubmitted={onFeedbackSubmitted}
          size={compact ? "icon" : "sm"}
          showLabels={!compact}
        />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size={compact ? "icon" : "sm"}>
            <MessageSquare className="h-4 w-4" />
            {!compact && <span className="ml-1">Detailed Feedback</span>}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Insight Feedback
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Insight Type: <span className="font-medium text-foreground">{insightType}</span>
              </p>
            </div>

            <RatingComponent
              label="Overall Quality"
              rating={userRating}
              onChange={setUserRating}
              showValue
            />

            <RatingComponent
              label="Accuracy"
              rating={accuracyRating}
              onChange={setAccuracyRating}
              showValue
            />

            <RatingComponent
              label="Usefulness"
              rating={usefulnessRating}
              onChange={setUsefulnessRating}
              showValue
            />

            <div>
              <label className="text-sm font-medium mb-2 block">
                General Feedback
              </label>
              <Textarea
                placeholder="What did you think about this insight?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                How could this insight be improved?
              </label>
              <Textarea
                placeholder="Suggestions for better insights, different analysis methods, etc."
                value={suggestedImprovement}
                onChange={(e) => setSuggestedImprovement(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!userRating || isSubmitting}
                className="flex-1"
              >
                Submit Feedback
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
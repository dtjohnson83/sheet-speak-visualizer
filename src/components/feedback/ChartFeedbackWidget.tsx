import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RatingComponent } from './RatingComponent';
import { QuickFeedbackButton } from './QuickFeedbackButton';
import { useChartFeedback } from '@/hooks/useChartFeedback';
import { Settings, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
 
interface ChartFeedbackWidgetProps {
  chartSuggestion: any;
  chartType: string;
  dataContext?: any;
  onFeedbackSubmitted?: () => void;
  showQuickFeedback?: boolean;
}

export const ChartFeedbackWidget: React.FC<ChartFeedbackWidgetProps> = ({
  chartSuggestion,
  chartType,
  dataContext,
  onFeedbackSubmitted,
  showQuickFeedback = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [suggestedImprovements, setSuggestedImprovements] = useState('');

  const { submitChartFeedback, isSubmitting } = useChartFeedback();
  const { user } = useAuth();
  const navigate = useNavigate();
 
  const handleSubmit = async () => {
    submitChartFeedback({
      chartSuggestion,
      chartType,
      rating,
      feedbackText: feedbackText.trim() || undefined,
      dataContext: {
        ...dataContext,
        suggested_improvements: suggestedImprovements.trim() || undefined,
      },
    });

    setIsOpen(false);
    setRating(0);
    setFeedbackText('');
    setSuggestedImprovements('');
    onFeedbackSubmitted?.();
  };

  return (
    <div className="flex items-center gap-2">
      {showQuickFeedback && (
        <QuickFeedbackButton
          feedbackType="chart_recommendation"
          featureContext={{ chart_type: chartType }}
          feedbackData={{ chart_suggestion: chartSuggestion }}
          onFeedbackSubmitted={onFeedbackSubmitted}
        />
      )}

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (open && !user) {
          toast({ title: 'Sign in required', description: 'Please sign in to submit chart feedback.' });
          navigate('/auth');
          return;
        }
        setIsOpen(open);
      }}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Improve chart">
                  <Settings className="h-4 w-4" />
                  <span className="ml-1">Improve Chart</span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              {user ? 'Suggest improvements to this chart' : 'Sign in required to submit feedback'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Chart Feedback
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Chart Type: <span className="font-medium text-foreground">{chartType}</span>
              </p>
            </div>

            <RatingComponent
              label="How useful is this chart suggestion?"
              rating={rating}
              onChange={setRating}
              showValue
            />

            <div>
              <label className="text-sm font-medium mb-2 block">
                What did you think about this chart?
              </label>
              <Textarea
                placeholder="Share your thoughts about the chart suggestion..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Suggestions for improvement
              </label>
              <Textarea
                placeholder="How could this chart be better? Different visualization type, axes, colors, etc."
                value={suggestedImprovements}
                onChange={(e) => setSuggestedImprovements(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!rating || isSubmitting}
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

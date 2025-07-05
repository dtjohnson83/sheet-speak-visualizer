import React from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { TierInfo, ProgressStatus } from './types';

interface TierHeaderProps {
  tier: TierInfo;
  progress: ProgressStatus;
  isExpanded: boolean;
}

export const TierHeader = ({ tier, progress, isExpanded }: TierHeaderProps) => {
  const progressIcon = progress === 'complete' ? CheckCircle2 : progress === 'active' ? ArrowRight : ChevronRight;
  const progressColor = progress === 'complete' ? 'text-green-600 dark:text-green-400' : progress === 'active' ? 'text-primary' : 'text-muted-foreground';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          tier.color === 'blue' ? 'bg-primary/10 text-primary' :
          tier.color === 'green' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
          tier.color === 'purple' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
          'bg-orange-500/10 text-orange-600 dark:text-orange-400'
        }`}>
          <tier.icon className="h-5 w-5" />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-lg">{tier.title}</h3>
          <p className="text-sm text-muted-foreground">{tier.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={progressColor}>
          {React.createElement(progressIcon, { className: "h-5 w-5" })}
        </div>
        {isExpanded ? 
          <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        }
      </div>
    </div>
  );
};
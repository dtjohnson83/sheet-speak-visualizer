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
  const progressColor = progress === 'complete' ? 'text-green-500' : progress === 'active' ? 'text-primary' : 'text-muted-foreground/60';

  const getIconStyling = (color: string) => {
    switch (color) {
      case 'slate':
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700';
      case 'green':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700';
      case 'amber':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700';
      default:
        return 'bg-primary/10 text-primary border border-primary/20';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${getIconStyling(tier.color)}`}>
          <tier.icon className="h-6 w-6" />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-xl text-foreground">{tier.title}</h3>
          <p className="text-sm text-muted-foreground/80">{tier.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`${progressColor} transition-colors`}>
          {React.createElement(progressIcon, { className: "h-5 w-5" })}
        </div>
        {isExpanded ? 
          <ChevronDown className="h-5 w-5 text-muted-foreground/60 transition-transform" /> : 
          <ChevronRight className="h-5 w-5 text-muted-foreground/60 transition-transform" />
        }
      </div>
    </div>
  );
};
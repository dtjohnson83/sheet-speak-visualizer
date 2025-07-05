import React from 'react';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { TierInfo, ProgressStatus } from './types';
import { TierHeader } from './TierHeader';
import { TabButton } from './TabButton';

interface TierSectionProps {
  tierKey: string;
  tier: TierInfo;
  progress: ProgressStatus;
  isExpanded: boolean;
  activeTab: string;
  onToggle: () => void;
  onTabChange: (tabId: string) => void;
}

export const TierSection = ({
  tierKey,
  tier,
  progress,
  isExpanded,
  activeTab,
  onToggle,
  onTabChange
}: TierSectionProps) => {
  const isMobile = useIsMobile();

  const getBorderStyling = (progress: ProgressStatus, tier: TierInfo) => {
    if (progress === 'complete') {
      switch (tier.color) {
        case 'blue':
          return 'ring-2 ring-blue-500/40 bg-blue-500/8 border border-blue-500/25';
        case 'teal':
          return 'ring-2 ring-teal-500/40 bg-teal-500/8 border border-teal-500/25';
        case 'green':
          return 'ring-2 ring-green-500/40 bg-green-500/8 border border-green-500/25';
        case 'amber':
          return 'ring-2 ring-amber-500/40 bg-amber-500/8 border border-amber-500/25';
        default:
          return 'ring-2 ring-primary/40 bg-primary/8 border border-primary/25';
      }
    }
    if (progress === 'active') {
      switch (tier.color) {
        case 'blue':
          return 'ring-2 ring-blue-500/40 bg-blue-500/8 border border-blue-500/25';
        case 'teal':
          return 'ring-2 ring-teal-500/40 bg-teal-500/8 border border-teal-500/25';
        case 'green':
          return 'ring-2 ring-green-500/40 bg-green-500/8 border border-green-500/25';
        case 'amber':
          return 'ring-2 ring-amber-500/40 bg-amber-500/8 border border-amber-500/25';
        default:
          return 'ring-2 ring-primary/40 bg-primary/8 border border-primary/25';
      }
    }
    return 'hover:bg-accent/10 border border-border/50';
  };

  return (
    <Collapsible key={tierKey} open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="w-full">
        <Card className={`p-6 hover:shadow-lg transition-all duration-300 cursor-pointer ${getBorderStyling(progress, tier)}`}>
          <TierHeader tier={tier} progress={progress} isExpanded={isExpanded} />
        </Card>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-4 ml-6 border-l-2 border-muted/30 pl-6">
          <div className={`grid gap-3 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'
          }`}>
            {tier.tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
              />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
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
          return 'ring-2 ring-[var(--tier-blue-ring)] bg-[var(--tier-blue-bg)] border border-[var(--tier-blue-border)]';
        case 'teal':
          return 'ring-2 ring-[var(--tier-teal-ring)] bg-[var(--tier-teal-bg)] border border-[var(--tier-teal-border)]';
        case 'green':
          return 'ring-2 ring-[var(--tier-green-ring)] bg-[var(--tier-green-bg)] border border-[var(--tier-green-border)]';
        case 'amber':
          return 'ring-2 ring-[var(--tier-amber-ring)] bg-[var(--tier-amber-bg)] border border-[var(--tier-amber-border)]';
        default:
          return 'ring-2 ring-primary/40 bg-primary/8 border border-primary/25';
      }
    }
    if (progress === 'active') {
      switch (tier.color) {
        case 'blue':
          return 'ring-2 ring-[var(--tier-blue-ring)] bg-[var(--tier-blue-bg)] border border-[var(--tier-blue-border)]';
        case 'teal':
          return 'ring-2 ring-[var(--tier-teal-ring)] bg-[var(--tier-teal-bg)] border border-[var(--tier-teal-border)]';
        case 'green':
          return 'ring-2 ring-[var(--tier-green-ring)] bg-[var(--tier-green-bg)] border border-[var(--tier-green-border)]';
        case 'amber':
          return 'ring-2 ring-[var(--tier-amber-ring)] bg-[var(--tier-amber-bg)] border border-[var(--tier-amber-border)]';
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
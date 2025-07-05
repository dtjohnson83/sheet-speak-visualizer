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
    const getTierSpecificStyling = (baseClasses: string, hoverClass: string) => {
      switch (tier.color) {
        case 'blue':
          return `${baseClasses} ring-[var(--tier-blue-ring)] bg-[var(--tier-blue-bg)] border-[var(--tier-blue-border)] hover:bg-[var(--tier-blue-hover)]`;
        case 'teal':
          return `${baseClasses} ring-[var(--tier-teal-ring)] bg-[var(--tier-teal-bg)] border-[var(--tier-teal-border)] hover:bg-[var(--tier-teal-hover)]`;
        case 'green':
          return `${baseClasses} ring-[var(--tier-green-ring)] bg-[var(--tier-green-bg)] border-[var(--tier-green-border)] hover:bg-[var(--tier-green-hover)]`;
        case 'amber':
          return `${baseClasses} ring-[var(--tier-amber-ring)] bg-[var(--tier-amber-bg)] border-[var(--tier-amber-border)] hover:bg-[var(--tier-amber-hover)]`;
        default:
          return `${baseClasses} ring-primary/40 bg-primary/8 border-primary/25 hover:bg-primary/12`;
      }
    };

    if (progress === 'complete') {
      return getTierSpecificStyling('ring-2', 'complete');
    }
    if (progress === 'active') {
      return getTierSpecificStyling('ring-2', 'active');
    }
    // Pending state - use tier colors with hover effects instead of generic accent
    return getTierSpecificStyling('border', 'pending');
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
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

  return (
    <Collapsible key={tierKey} open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="w-full">
        <Card className={`p-4 hover:shadow-md transition-all duration-200 ${
          progress === 'active' ? 'ring-2 ring-primary/30 bg-accent/50' :
          progress === 'complete' ? 'ring-2 ring-green-500/30 bg-green-500/10 dark:bg-green-500/5' : ''
        }`}>
          <TierHeader tier={tier} progress={progress} isExpanded={isExpanded} />
        </Card>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-2 ml-4 border-l-2 border-muted pl-4">
          <div className={`grid gap-2 ${
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
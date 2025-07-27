import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabInfo } from './types';

interface TabButtonProps {
  tab: TabInfo;
  isActive: boolean;
  onClick: () => void;
}

export const TabButton = ({ tab, isActive, onClick }: TabButtonProps) => (
  <Button
    variant={isActive ? "secondary" : "ghost"}
    onClick={onClick}
    className={`w-full justify-start p-2 sm:p-4 h-auto flex items-center gap-2 sm:gap-3 transition-all duration-200 rounded-lg ${
      isActive 
        ? 'ring-2 ring-primary/50 bg-primary/10 text-primary shadow-sm font-semibold border border-primary/20' 
        : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent hover:border-muted'
    }`}
  >
    <tab.icon className="h-4 w-4 flex-shrink-0" />
    <span className="font-medium text-sm sm:text-base truncate">{tab.label}</span>
    {tab.badge && (
      <Badge 
        variant="secondary" 
        className={`ml-auto text-xs flex-shrink-0 ${
          isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        }`}
      >
        {tab.badge}
      </Badge>
    )}
  </Button>
);
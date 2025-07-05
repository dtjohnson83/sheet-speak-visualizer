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
    className={`w-full justify-start p-3 h-auto flex items-center gap-3 transition-all ${
      isActive 
        ? 'ring-2 ring-primary/30 bg-accent text-accent-foreground shadow-sm' 
        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
    }`}
  >
    <tab.icon className="h-4 w-4" />
    <span className="font-medium">{tab.label}</span>
    {tab.badge && (
      <Badge variant="secondary" className="ml-auto text-xs">
        {tab.badge}
      </Badge>
    )}
  </Button>
);
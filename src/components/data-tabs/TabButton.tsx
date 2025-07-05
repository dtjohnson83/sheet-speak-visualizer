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
    variant={isActive ? "default" : "ghost"}
    onClick={onClick}
    className="w-full justify-start p-3 h-auto flex items-center gap-3"
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
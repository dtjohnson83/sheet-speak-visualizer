import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { HelpCircle, Info, X } from 'lucide-react';

interface TooltipInfo {
  id: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  showOnce?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

interface ContextualTooltipProps {
  tooltip: TooltipInfo;
  children: React.ReactNode;
  trigger?: 'hover' | 'click' | 'focus';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  tooltip,
  children,
  trigger = 'hover',
  side = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  useEffect(() => {
    if (tooltip.showOnce) {
      const seenKey = `tooltip-seen-${tooltip.id}`;
      const wasSeen = localStorage.getItem(seenKey) === 'true';
      setHasBeenSeen(wasSeen);
    }
  }, [tooltip.id, tooltip.showOnce]);

  const handleOpenChange = (open: boolean) => {
    setIsVisible(open);
    
    if (open && tooltip.showOnce && !hasBeenSeen) {
      const seenKey = `tooltip-seen-${tooltip.id}`;
      localStorage.setItem(seenKey, 'true');
      setHasBeenSeen(true);
    }
  };

  // Don't show tooltip if it's marked as "show once" and has been seen
  if (tooltip.showOnce && hasBeenSeen) {
    return <>{children}</>;
  }

  const IconComponent = tooltip.icon || Info;

  return (
    <TooltipProvider>
      <Tooltip open={isVisible} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild className={className}>
          <div className="relative inline-flex items-center gap-2">
            {children}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 opacity-60 hover:opacity-100 transition-opacity"
              onClick={(e) => {
                if (trigger === 'click') {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsVisible(!isVisible);
                }
              }}
              onFocus={() => {
                if (trigger === 'focus') {
                  setIsVisible(true);
                }
              }}
              onBlur={() => {
                if (trigger === 'focus') {
                  setIsVisible(false);
                }
              }}
              onMouseEnter={() => {
                if (trigger === 'hover') {
                  setIsVisible(true);
                }
              }}
              onMouseLeave={() => {
                if (trigger === 'hover') {
                  setIsVisible(false);
                }
              }}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            
            {/* Priority indicator */}
            {tooltip.priority === 'high' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4 shrink-0" />
              <span className="font-medium">{tooltip.title}</span>
              {isVisible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-auto"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {tooltip.description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Predefined tooltips for common features
export const predefinedTooltips = {
  fileUpload: {
    id: 'file-upload-help',
    title: 'File Upload Tips',
    description: 'Supported formats: CSV, Excel (.xlsx, .xls). For best results, ensure your data has clear column headers and consistent formatting.',
    priority: 'medium' as const,
    showOnce: true
  },
  
  chartCreation: {
    id: 'chart-creation-help',
    title: 'Smart Chart Suggestions',
    description: 'Our AI automatically suggests the best chart types based on your data. You can always customize or change the chart type after creation.',
    priority: 'medium' as const,
    showOnce: true
  },
  
  dashboardTiles: {
    id: 'dashboard-tiles-help',
    title: 'Saving Charts as Tiles',
    description: 'Click "Save as Tile" when creating charts to add them to your dashboard. Tiles can be resized and rearranged to create custom layouts.',
    priority: 'high' as const,
    showOnce: true
  },
  
  aiFeatures: {
    id: 'ai-features-help',
    title: 'AI-Powered Analysis',
    description: 'Ask natural language questions about your data, get automated insights, and receive suggestions for better visualizations.',
    priority: 'high' as const,
    showOnce: true
  },
  
  keyboardShortcuts: {
    id: 'keyboard-shortcuts-help',
    title: 'Keyboard Shortcuts',
    description: 'Use Ctrl+1 through Ctrl+8 to quickly navigate between tabs. More shortcuts coming soon!',
    priority: 'low' as const,
    showOnce: true
  },
  
  dataQuality: {
    id: 'data-quality-help',
    title: 'Data Quality Monitoring',
    description: 'Our AI agents automatically check for data quality issues like missing values, duplicates, and inconsistencies.',
    priority: 'medium' as const,
    showOnce: true
  }
};
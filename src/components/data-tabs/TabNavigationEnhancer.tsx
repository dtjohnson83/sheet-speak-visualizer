import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TabNavigationEnhancerProps {
  onTabChange: (value: string) => void;
  tabs: string[];
}

export const TabNavigationEnhancer = ({ onTabChange, tabs }: TabNavigationEnhancerProps) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return; // Disable keyboard shortcuts on mobile

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl/Cmd + number key is pressed
      if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '8') {
        event.preventDefault();
        const tabIndex = parseInt(event.key) - 1;
        if (tabIndex < tabs.length) {
          onTabChange(tabs[tabIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onTabChange, tabs, isMobile]);

  return null; // This component only handles keyboard events
};
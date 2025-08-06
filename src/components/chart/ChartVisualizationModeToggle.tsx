import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChartVisualizationModeToggleProps {
  currentMode: 'traditional' | 'cauldron';
  onModeChange: (mode: 'traditional' | 'cauldron') => void;
}

export const ChartVisualizationModeToggle: React.FC<ChartVisualizationModeToggleProps> = ({
  currentMode,
  onModeChange
}) => {
  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-primary/20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground mb-1">
            Visualization Mode
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose how you want to create your charts
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={currentMode === 'traditional' ? 'default' : 'outline'}
            onClick={() => onModeChange('traditional')}
            className="flex items-center gap-2"
          >
            📊 Traditional
            {currentMode === 'traditional' && (
              <Badge variant="secondary" className="text-xs">Active</Badge>
            )}
          </Button>
          
          <Button
            variant={currentMode === 'cauldron' ? 'default' : 'outline'}
            onClick={() => onModeChange('cauldron')}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            🪄 Magic Cauldron
            {currentMode === 'cauldron' && (
              <Badge variant="secondary" className="text-xs">Active</Badge>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
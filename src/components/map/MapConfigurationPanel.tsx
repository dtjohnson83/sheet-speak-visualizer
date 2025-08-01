import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Layers, 
  Palette, 
  Zap, 
  Target,
  MapPin,
  Mountain
} from 'lucide-react';

interface MapConfigurationPanelProps {
  chartType: 'map2d' | 'map3d';
  onConfigChange: (config: any) => void;
  currentConfig?: any;
}

export const MapConfigurationPanel = ({ 
  chartType, 
  onConfigChange, 
  currentConfig = {} 
}: MapConfigurationPanelProps) => {
  const [activeTab, setActiveTab] = useState<'style' | 'layers' | 'interaction' | 'performance'>('style');

  const mapStyles = useMemo(() => [
    { id: 'light', name: 'Light', preview: '#f8f9fa' },
    { id: 'dark', name: 'Dark', preview: '#1a1a1a' },
    { id: 'streets', name: 'Streets', preview: '#ffffff' },
    { id: 'satellite', name: 'Satellite', preview: '#2d5a27' },
    { id: 'outdoors', name: 'Outdoors', preview: '#e8f5e8' }
  ], []);

  const layerOptions = useMemo(() => {
    const base = [
      { id: 'points', name: 'Data Points', icon: Target, enabled: true },
      { id: 'clusters', name: 'Point Clustering', icon: Layers, enabled: false },
      { id: 'heatmap', name: 'Heat Map', icon: Zap, enabled: false }
    ];

    if (chartType === 'map3d') {
      base.push(
        { id: 'terrain', name: '3D Terrain', icon: Mountain, enabled: true },
        { id: 'buildings', name: '3D Buildings', icon: MapPin, enabled: false }
      );
    }

    return base;
  }, [chartType]);

  const colorSchemes = [
    { name: 'Default', colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'] },
    { name: 'Ocean', colors: ['#0891b2', '#0e7490', '#155e75', '#164e63'] },
    { name: 'Forest', colors: ['#059669', '#047857', '#065f46', '#064e3b'] },
    { name: 'Sunset', colors: ['#dc2626', '#ea580c', '#d97706', '#ca8a04'] }
  ];

  const handleStyleChange = (styleId: string) => {
    onConfigChange({
      ...currentConfig,
      style: styleId
    });
  };

  const handleLayerToggle = (layerId: string, enabled: boolean) => {
    onConfigChange({
      ...currentConfig,
      layers: {
        ...currentConfig.layers,
        [layerId]: enabled
      }
    });
  };

  const handleColorSchemeChange = (colors: string[]) => {
    onConfigChange({
      ...currentConfig,
      colors
    });
  };

  const tabs = [
    { id: 'style', name: 'Style', icon: Palette },
    { id: 'layers', name: 'Layers', icon: Layers },
    { id: 'interaction', name: 'Controls', icon: Settings },
    { id: 'performance', name: 'Performance', icon: Zap }
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        {chartType === 'map2d' ? (
          <MapPin className="h-4 w-4 text-primary" />
        ) : (
          <Mountain className="h-4 w-4 text-primary" />
        )}
        <h3 className="font-semibold">
          {chartType === 'map2d' ? '2D Map' : '3D Map'} Configuration
        </h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <IconComponent className="h-3 w-3" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'style' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Map Style</h4>
              <div className="grid grid-cols-2 gap-2">
                {mapStyles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleChange(style.id)}
                    className={`p-2 border rounded-lg text-left hover:bg-muted transition-colors ${
                      currentConfig.style === style.id ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <div 
                      className="w-full h-6 rounded mb-1"
                      style={{ backgroundColor: style.preview }}
                    />
                    <div className="text-xs font-medium">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Color Scheme</h4>
              <div className="space-y-2">
                {colorSchemes.map(scheme => (
                  <button
                    key={scheme.name}
                    onClick={() => handleColorSchemeChange(scheme.colors)}
                    className="w-full p-2 border rounded-lg text-left hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-xs font-medium">{scheme.name}</div>
                    </div>
                    <div className="flex gap-1">
                      {scheme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Map Layers</h4>
            {layerOptions.map(layer => {
              const IconComponent = layer.icon;
              const isEnabled = currentConfig.layers?.[layer.id] ?? layer.enabled;
              
              return (
                <div
                  key={layer.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{layer.name}</span>
                  </div>
                  <Button
                    variant={isEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLayerToggle(layer.id, !isEnabled)}
                  >
                    {isEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'interaction' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Interaction Controls</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• Drag to pan the map</div>
              <div>• Scroll to zoom in/out</div>
              <div>• Click markers for details</div>
              {chartType === 'map3d' && (
                <>
                  <div>• Ctrl+Drag to rotate (3D)</div>
                  <div>• Shift+Drag to tilt (3D)</div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Performance Settings</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Point Clustering</span>
                <Badge variant="secondary">Auto</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lazy Loading</span>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              {chartType === 'map3d' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">3D Optimization</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Download, Video, Camera, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportChart3D } from '../utils/chart3DExporter';

interface ExportShareProps {
  chartType: string;
  chartTitle: string;
  chartData: any;
  chartRef?: React.RefObject<HTMLElement>;
  is3D?: boolean;
  isTemporalAnimation?: boolean;
  temporalAnimationState?: any;
  temporalAnimationControls?: any;
  onClose: () => void;
}

export const ExportShare: React.FC<ExportShareProps> = ({
  chartType,
  chartTitle,
  chartData,
  chartRef,
  is3D,
  isTemporalAnimation,
  temporalAnimationState,
  temporalAnimationControls,
  onClose
}) => {
  const [exportFormat, setExportFormat] = useState('png');
  const [resolution, setResolution] = useState(2);
  const [includeBackground, setIncludeBackground] = useState(true);
  const [animationDuration, setAnimationDuration] = useState(5);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportFormats = {
    png: { name: 'PNG Image', icon: FileImage, supportsAnimation: false },
    jpg: { name: 'JPEG Image', icon: FileImage, supportsAnimation: false },
    webp: { name: 'WebP Image', icon: FileImage, supportsAnimation: false },
    gif: { name: 'Animated GIF', icon: Camera, supportsAnimation: true },
    mp4: { name: 'MP4 Video', icon: Camera, supportsAnimation: true }
  };

  const resolutionOptions = {
    1: { name: 'Standard (1x)', width: 800, height: 600 },
    2: { name: 'High (2x)', width: 1600, height: 1200 },
    3: { name: 'Ultra (3x)', width: 2400, height: 1800 },
    4: { name: '4K', width: 3840, height: 2160 }
  };

  const currentFormat = exportFormats[exportFormat as keyof typeof exportFormats];
  const currentResolution = resolutionOptions[resolution as keyof typeof resolutionOptions];

  const exportChart = async () => {
    if (!chartRef?.current) {
      toast({
        title: "Error",
        description: "Chart not found",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      const fileName = `${chartTitle.toLowerCase().replace(/\s+/g, '-')}-chart`;
      
      // Export static image only (animation export removed)
      {
        // Export static image
        if (is3D) {
          const imageBlob = await exportChart3D(
            chartRef.current,
            {
              width: currentResolution.width,
              height: currentResolution.height
            },
            {
              format: exportFormat as 'png' | 'jpg' | 'webp',
              quality: 0.95,
              includeBackground
            }
          );
          
          const url = URL.createObjectURL(imageBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${fileName}.${exportFormat}`;
          link.click();
          URL.revokeObjectURL(url);
        } else {
          // Use existing 2D export
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(chartRef.current, {
            width: currentResolution.width,
            height: currentResolution.height,
            scale: 1,
            backgroundColor: includeBackground ? '#ffffff' : null
          });
          
          const link = document.createElement('a');
          link.href = canvas.toDataURL(`image/${exportFormat}`, 0.95);
          link.download = `${fileName}.${exportFormat}`;
          link.click();
        }
      }

      toast({
        title: "Export Complete",
        description: `Chart exported as ${currentFormat.name}`
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export chart",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Format</label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(exportFormats).map(([key, format]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <format.icon className="h-4 w-4" />
                    {format.name}
                    {format.supportsAnimation && (is3D || isTemporalAnimation) && (
                      <span className="text-xs bg-primary/10 text-primary px-1 rounded">
                        {is3D ? '3D Animation' : 'Temporal Animation'}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Resolution: {currentResolution.name} ({currentResolution.width} x {currentResolution.height}px)
          </label>
          <Slider
            value={[resolution]}
            onValueChange={(value) => setResolution(value[0])}
            min={1}
            max={4}
            step={1}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Include Background</label>
          <Switch
            checked={includeBackground}
            onCheckedChange={setIncludeBackground}
          />
        </div>

        {currentFormat.supportsAnimation && (is3D || isTemporalAnimation) && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Animation Duration: {animationDuration}s
            </label>
            <Slider
              value={[animationDuration]}
              onValueChange={(value) => setAnimationDuration(value[0])}
              min={2}
              max={15}
              step={1}
              className="w-full"
            />
          </div>
        )}
      </Card>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>• {is3D ? '3D charts' : isTemporalAnimation ? 'Temporal animation' : '2D charts'} supported</p>
        <p>• File size varies by resolution and complexity</p>
        {currentFormat.supportsAnimation && is3D && (
          <p>• Animation captures 360° rotation with interactions</p>
        )}
        {currentFormat.supportsAnimation && isTemporalAnimation && (
          <p>• Animation captures temporal data progression over time</p>
        )}
      </div>

      <Button 
        onClick={exportChart} 
        disabled={isExporting}
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : `Export as ${currentFormat.name}`}
      </Button>
    </div>
  );
};
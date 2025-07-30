import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Twitter, Linkedin, Facebook, Instagram, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateChartDescription } from '../utils/chartDescriptionGenerator';
import { exportChart3D } from '../utils/chart3DExporter';

interface SocialMediaShareProps {
  chartType: string;
  chartTitle: string;
  chartData: any;
  chartRef?: React.RefObject<HTMLElement>;
  is3D?: boolean;
  onClose: () => void;
}

export const SocialMediaShare: React.FC<SocialMediaShareProps> = ({
  chartType,
  chartTitle,
  chartData,
  chartRef,
  is3D,
  onClose
}) => {
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<string>('twitter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const platformConfigs = {
    twitter: {
      name: 'Twitter/X',
      icon: Twitter,
      maxChars: 280,
      imageSize: { width: 1200, height: 675 },
      url: 'https://twitter.com/intent/tweet'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: Linkedin,
      maxChars: 3000,
      imageSize: { width: 1200, height: 627 },
      url: 'https://www.linkedin.com/sharing/share-offsite'
    },
    facebook: {
      name: 'Facebook',
      icon: Facebook,
      maxChars: 63206,
      imageSize: { width: 1200, height: 630 },
      url: 'https://www.facebook.com/sharer/sharer.php'
    },
    instagram: {
      name: 'Instagram',
      icon: Instagram,
      maxChars: 2200,
      imageSize: { width: 1080, height: 1080 },
      url: null // Instagram requires manual upload
    }
  };

  const currentPlatform = platformConfigs[platform as keyof typeof platformConfigs];

  const generateDescription = async () => {
    setIsGenerating(true);
    try {
      const generatedText = await generateChartDescription(chartType, chartTitle, chartData, platform);
      setDescription(generatedText);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate description",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareToSocialMedia = async () => {
    setIsExporting(true);
    try {
      let imageBlob = null;
      
      if (chartRef?.current) {
        if (is3D) {
          imageBlob = await exportChart3D(chartRef.current, currentPlatform.imageSize);
        } else {
          // Use existing PNG export for 2D charts
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(chartRef.current, {
            width: currentPlatform.imageSize.width,
            height: currentPlatform.imageSize.height,
            scale: 1
          });
          imageBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/png');
          });
        }
      }

      if (platform === 'instagram') {
        // For Instagram, just copy text and download image
        await navigator.clipboard.writeText(description);
        
        if (imageBlob) {
          const url = URL.createObjectURL(imageBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${chartTitle.toLowerCase().replace(/\s+/g, '-')}-instagram.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
        
        toast({
          title: "Ready for Instagram",
          description: "Caption copied to clipboard and image downloaded"
        });
      } else {
        // For other platforms, open sharing URL
        const shareUrl = new URL(currentPlatform.url!);
        
        if (platform === 'twitter') {
          shareUrl.searchParams.set('text', description);
        } else if (platform === 'linkedin') {
          shareUrl.searchParams.set('summary', description);
        } else if (platform === 'facebook') {
          shareUrl.searchParams.set('quote', description);
        }
        
        window.open(shareUrl.toString(), '_blank');
        
        toast({
          title: "Opening " + currentPlatform.name,
          description: "Share dialog opened in new tab"
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share to social media",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(description);
      toast({
        title: "Copied",
        description: "Description copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(platformConfigs).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4" />
                  {config.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={generateDescription} 
          disabled={isGenerating}
          variant="outline"
        >
          {isGenerating ? 'Generating...' : 'Generate Description'}
        </Button>
      </div>

      <Card className="p-4">
        <h4 className="font-medium mb-2">Post Description</h4>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`Write a description for your ${chartType} chart...`}
          maxLength={currentPlatform.maxChars}
          className="min-h-32"
        />
        <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
          <span>
            {description.length} / {currentPlatform.maxChars} characters
          </span>
          <span>
            Image size: {currentPlatform.imageSize.width} x {currentPlatform.imageSize.height}px
          </span>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button 
          onClick={shareToSocialMedia} 
          disabled={!description.trim() || isExporting}
          className="flex-1"
        >
          {isExporting ? 'Preparing...' : `Share to ${currentPlatform.name}`}
        </Button>
        
        <Button 
          onClick={copyToClipboard} 
          variant="outline"
          disabled={!description.trim()}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2 } from 'lucide-react';
import { SocialMediaShare } from './SocialMediaShare';
import { EmailShare } from './EmailShare';
import { ExportShare } from './ExportShare';

interface ChartShareDialogProps {
  chartType: string;
  chartTitle: string;
  chartData: any;
  chartRef?: React.RefObject<HTMLElement>;
  is3D?: boolean;
}

export const ChartShareDialog: React.FC<ChartShareDialogProps> = ({
  chartType,
  chartTitle,
  chartData,
  chartRef,
  is3D = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Chart</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="space-y-4">
            <SocialMediaShare
              chartType={chartType}
              chartTitle={chartTitle}
              chartData={chartData}
              chartRef={chartRef}
              is3D={is3D}
              onClose={() => setIsOpen(false)}
            />
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <EmailShare
              chartType={chartType}
              chartTitle={chartTitle}
              chartData={chartData}
              chartRef={chartRef}
              is3D={is3D}
              onClose={() => setIsOpen(false)}
            />
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4">
            <ExportShare
              chartType={chartType}
              chartTitle={chartTitle}
              chartData={chartData}
              chartRef={chartRef}
              is3D={is3D}
              onClose={() => setIsOpen(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
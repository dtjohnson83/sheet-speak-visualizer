import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Download, Image, FileImage, FileText } from 'lucide-react';
import { exportChartToPNG, exportChartToSVG, exportChartToPDF } from '@/utils/pdf';

interface ChartExportButtonProps {
  chartTitle: string;
  containerSelector?: string; // CSS selector for the chart container
}

export const ChartExportButton = ({ 
  chartTitle, 
  containerSelector = '.recharts-wrapper' 
}: ChartExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    setIsExporting(true);
    
    try {
      // Find the chart container - be more specific about targeting the right chart
      let chartElement: HTMLElement | null = null;
      
      console.log('Starting export process for format:', format);
      console.log('Available elements:', {
        chartContainers: document.querySelectorAll('.chart-container').length,
        rechartsWrappers: document.querySelectorAll('.recharts-wrapper').length,
        svgElements: document.querySelectorAll('svg').length
      });
      
      // Try multiple strategies to find the chart - focus on the closest chart container
      const selectors = [
        '.chart-container .recharts-wrapper',
        '.chart-container',
        '.recharts-wrapper', 
        'svg'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Checking selector "${selector}": found ${elements.length} elements`);
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i] as HTMLElement;
          const rect = element.getBoundingClientRect();
          console.log(`Element ${i} dimensions:`, { width: rect.width, height: rect.height, visible: rect.width > 0 && rect.height > 0 });
          
          if (rect.width > 0 && rect.height > 0) {
            chartElement = element;
            console.log('Selected chart element using selector:', selector, 'index:', i);
            break;
          }
        }
        
        if (chartElement) break;
      }
      
      if (!chartElement) {
        console.error('No valid chart element found');
        throw new Error('Chart container not found or has zero dimensions');
      }
      
      const rect = chartElement.getBoundingClientRect();
      console.log('Final chart element details:', {
        width: rect.width,
        height: rect.height,
        tagName: chartElement.tagName,
        className: chartElement.className,
        hasContent: chartElement.children.length > 0
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const safeTitle = chartTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const fileName = `${safeTitle}-${timestamp}`;

      switch (format) {
        case 'png':
          await exportChartToPNG(chartElement, `${fileName}.png`);
          toast({
            title: "PNG Export Successful",
            description: "Chart exported as PNG image.",
          });
          break;
        case 'svg':
          await exportChartToSVG(chartElement, `${fileName}.svg`);
          toast({
            title: "SVG Export Successful", 
            description: "Chart exported as SVG vector image.",
          });
          break;
        case 'pdf':
          await exportChartToPDF(chartElement, chartTitle, `${fileName}.pdf`);
          toast({
            title: "PDF Export Successful",
            description: "Chart exported as PDF document.",
          });
          break;
      }
    } catch (error) {
      console.error(`Error exporting chart as ${format}:`, error);
      toast({
        title: "Export Failed",
        description: `Failed to export chart as ${format.toUpperCase()}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('png')}>
          <Image className="h-4 w-4 mr-2" />
          PNG Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('svg')}>
          <FileImage className="h-4 w-4 mr-2" />
          SVG Vector
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          PDF Document
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
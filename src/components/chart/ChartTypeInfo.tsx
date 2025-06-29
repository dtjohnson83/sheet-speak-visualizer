
import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getChartTypeInfo } from '@/lib/chartTypeInfo';

interface ChartTypeInfoProps {
  chartType: string;
  className?: string;
}

export const ChartTypeInfo = ({ chartType, className = '' }: ChartTypeInfoProps) => {
  const info = getChartTypeInfo(chartType);
  
  if (!info) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className={`h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help ${className}`} />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-80">
          <div className="space-y-2">
            <div className="font-medium">{info.name}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">{info.description}</div>
            <div className="text-xs">
              <div className="font-medium mb-1">Requirements:</div>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-300">
                {info.requirements.xAxis && (
                  <li>{info.requirements.xAxis.label}: {info.requirements.xAxis.type}</li>
                )}
                {info.requirements.yAxis && (
                  <li>{info.requirements.yAxis.label}: {info.requirements.yAxis.type}</li>
                )}
                {info.requirements.additional?.map((req, index) => (
                  <li key={index}>{req.label}: {req.type}</li>
                ))}
              </ul>
            </div>
            <div className="text-xs">
              <span className="font-medium">Best for:</span> {info.bestFor[0]}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

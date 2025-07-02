import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface AIResponseDisclaimerProps {
  sampleSize: number;
  totalRows: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  analysisType: 'chat' | 'report';
}

export const AIResponseDisclaimer = ({ 
  sampleSize, 
  totalRows, 
  confidenceLevel, 
  analysisType 
}: AIResponseDisclaimerProps) => {
  const samplePercentage = (sampleSize / totalRows) * 100;
  
  const getDisclaimerContent = () => {
    const baseText = `Based on analysis of ${sampleSize.toLocaleString()} sample rows from your ${totalRows.toLocaleString()}-row dataset (${samplePercentage.toFixed(2)}%).`;
    
    switch (confidenceLevel) {
      case 'high':
        return {
          text: `${baseText} This sample provides reliable insights with high confidence.`,
          variant: 'default' as const,
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'medium':
        return {
          text: `${baseText} Insights are directional and generally reliable, but may not capture all patterns.`,
          variant: 'default' as const,
          icon: <Info className="h-4 w-4" />
        };
      case 'low':
        return {
          text: `${baseText} Limited sample size means insights should be verified with additional analysis.`,
          variant: 'destructive' as const,
          icon: <AlertTriangle className="h-4 w-4" />
        };
    }
  };

  const disclaimer = getDisclaimerContent();

  return (
    <Alert variant={disclaimer.variant} className="text-xs">
      <disclaimer.icon.type {...disclaimer.icon.props} />
      <AlertDescription className="text-xs leading-relaxed">
        {disclaimer.text}
      </AlertDescription>
    </Alert>
  );
};
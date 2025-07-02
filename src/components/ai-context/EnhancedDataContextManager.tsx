import { useState, useEffect } from 'react';
import { BusinessContext, BusinessContextCollector } from './BusinessContextCollector';
import { ColumnContext, ColumnInterpretationDialog } from './ColumnInterpretationDialog';
import { ColumnInfo, DataRow } from '@/pages/Index';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles } from 'lucide-react';

export interface EnhancedDataContext {
  businessContext: BusinessContext;
  columnContexts: ColumnContext[];
  dataQuality: {
    completeness: number;
    consistency: number;
    validity: number;
  };
  relationships: {
    primaryDate: string;
    keyMetrics: string[];
    dimensions: string[];
    measures: string[];
  };
  domainKnowledge: {
    industry: string;
    commonPatterns: string[];
    businessRules: string[];
  };
}

interface EnhancedDataContextManagerProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  onContextReady: (context: EnhancedDataContext) => void;
  onSkip: () => void;
}

export const EnhancedDataContextManager = ({
  data,
  columns,
  fileName,
  onContextReady,
  onSkip
}: EnhancedDataContextManagerProps) => {
  const [step, setStep] = useState<'business' | 'columns' | 'processing' | 'complete'>('business');
  const [businessContext, setBusinessContext] = useState<BusinessContext | null>(null);
  const [columnContexts, setColumnContexts] = useState<ColumnContext[]>([]);
  const [progress, setProgress] = useState(0);

  const handleBusinessContextCollected = (context: BusinessContext) => {
    setBusinessContext(context);
    setStep('columns');
    setProgress(33);
  };

  const handleColumnInterpretationComplete = (interpretations: ColumnContext[]) => {
    setColumnContexts(interpretations);
    setStep('processing');
    setProgress(66);
    
    // Process the enhanced context
    setTimeout(() => {
      processEnhancedContext(businessContext!, interpretations);
    }, 1000);
  };

  const processEnhancedContext = (businessCtx: BusinessContext, columnCtx: ColumnContext[]) => {
    // Calculate data quality metrics
    const completeness = calculateCompleteness(data, columns);
    const consistency = calculateConsistency(data, columns);
    const validity = calculateValidity(data, columnCtx);

    // Identify relationships and structure
    const primaryDate = columnCtx.find(col => col.isPrimary && col.dataType === 'date')?.name || 
                       columnCtx.find(col => col.dataType === 'date')?.name || '';
    
    const keyMetrics = columnCtx.filter(col => col.isKPI || col.businessMeaning.includes('Revenue') || 
                                               col.businessMeaning.includes('Performance')).map(col => col.name);
    
    const dimensions = columnCtx.filter(col => col.dataType === 'categorical' || 
                                              col.businessMeaning.includes('Category')).map(col => col.name);
    
    const measures = columnCtx.filter(col => col.dataType === 'numeric' && !col.isKPI).map(col => col.name);

    // Generate domain knowledge
    const commonPatterns = generateCommonPatterns(businessCtx.domain);
    const businessRules = generateBusinessRules(businessCtx.domain, columnCtx);

    const enhancedContext: EnhancedDataContext = {
      businessContext: businessCtx,
      columnContexts: columnCtx,
      dataQuality: {
        completeness,
        consistency,
        validity
      },
      relationships: {
        primaryDate,
        keyMetrics,
        dimensions,
        measures
      },
      domainKnowledge: {
        industry: businessCtx.industry,
        commonPatterns,
        businessRules
      }
    };

    setProgress(100);
    setStep('complete');
    
    setTimeout(() => {
      onContextReady(enhancedContext);
    }, 1500);
  };

  const calculateCompleteness = (data: DataRow[], columns: ColumnInfo[]): number => {
    const totalCells = data.length * columns.length;
    const filledCells = columns.reduce((sum, col) => {
      return sum + col.values.filter(val => val !== null && val !== undefined && val !== '').length;
    }, 0);
    return Math.round((filledCells / totalCells) * 100);
  };

  const calculateConsistency = (data: DataRow[], columns: ColumnInfo[]): number => {
    // Basic consistency check based on data type patterns
    let consistencyScore = 100;
    
    columns.forEach(col => {
      if (col.type === 'numeric') {
        const numericValues = col.values.filter(val => !isNaN(Number(val)));
        const ratio = numericValues.length / col.values.length;
        if (ratio < 0.9) consistencyScore -= 10;
      }
    });
    
    return Math.max(consistencyScore, 0);
  };

  const calculateValidity = (data: DataRow[], columnCtx: ColumnContext[]): number => {
    let validityScore = 100;
    
    columnCtx.forEach(ctx => {
      if (ctx.expectedRange && ctx.dataType === 'numeric') {
        const column = data.find(col => Object.keys(col).includes(ctx.name));
        if (column) {
          // Basic range validation would go here
          // This is simplified for the demo
        }
      }
    });
    
    return validityScore;
  };

  const generateCommonPatterns = (domain: string): string[] => {
    const patterns: { [key: string]: string[] } = {
      sales: ['Seasonal trends', 'Product lifecycle patterns', 'Territory performance variations'],
      marketing: ['Campaign effectiveness cycles', 'Customer acquisition costs', 'Conversion funnel metrics'],
      finance: ['Monthly/quarterly reporting cycles', 'Budget variance analysis', 'Cash flow patterns'],
      operations: ['Supply chain optimization', 'Capacity utilization', 'Quality control metrics'],
      hr: ['Employee lifecycle events', 'Performance review cycles', 'Compensation benchmarking'],
      customer: ['Customer journey stages', 'Retention and churn patterns', 'Satisfaction scoring']
    };
    return patterns[domain] || ['General business patterns', 'Time-based trends', 'Performance metrics'];
  };

  const generateBusinessRules = (domain: string, columnCtx: ColumnContext[]): string[] => {
    const rules = [
      'Numeric KPIs should have realistic ranges',
      'Date fields should be chronologically consistent',
      'Categorical data should have limited distinct values'
    ];

    // Add domain-specific rules
    if (domain === 'sales') {
      rules.push('Revenue should always be positive', 'Quantities should be whole numbers');
    }
    if (domain === 'finance') {
      rules.push('Costs should be positive', 'Percentages should be between 0-100');
    }

    return rules;
  };

  const handleSkip = () => {
    setStep('complete');
    onSkip();
  };

  if (step === 'business') {
    return (
      <BusinessContextCollector
        fileName={fileName}
        onContextCollected={handleBusinessContextCollected}
        onSkip={handleSkip}
      />
    );
  }

  if (step === 'columns') {
    return (
      <ColumnInterpretationDialog
        columns={columns}
        onInterpretationComplete={handleColumnInterpretationComplete}
        onSkip={handleSkip}
      />
    );
  }

  if (step === 'processing' || step === 'complete') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-blue-500 animate-pulse" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {step === 'processing' ? 'Processing Enhanced Context' : 'Context Ready!'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 'processing' 
                ? 'Building enhanced AI context for better analysis...'
                : 'Your AI analysis will now be significantly more accurate!'}
            </p>
          </div>

          <div className="space-y-3">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Business Context</span>
              <span>Column Interpretation</span>
              <span>AI Enhancement</span>
            </div>
          </div>

          {step === 'complete' && (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Ready for Enhanced AI Analysis</span>
            </div>
          )}

          {businessContext && (
            <div className="text-left bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Context Summary:</h4>
              <div className="space-y-1 text-sm">
                <div>Domain: <Badge variant="outline">{businessContext.domain}</Badge></div>
                <div>Purpose: {businessContext.purpose}</div>
                <div>Objectives: {businessContext.objectives.slice(0, 3).join(', ')}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Target, Calendar, FileText, ArrowRight } from 'lucide-react';

export interface BusinessContext {
  domain: string;
  purpose: string;
  timePeriod: string;
  objectives: string[];
  industry: string;
  dataSource: string;
  primaryMetrics: string[];
  customContext?: string;
}

interface BusinessContextCollectorProps {
  onContextCollected: (context: BusinessContext) => void;
  onSkip: () => void;
  fileName: string;
}

const BUSINESS_DOMAINS = [
  { value: 'sales', label: 'Sales & Revenue' },
  { value: 'marketing', label: 'Marketing & Campaigns' },
  { value: 'finance', label: 'Finance & Accounting' },
  { value: 'operations', label: 'Operations & Supply Chain' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'customer', label: 'Customer Analytics' },
  { value: 'product', label: 'Product Analytics' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' }
];

const COMMON_OBJECTIVES = [
  'Performance Analysis',
  'Trend Analysis',
  'Forecasting',
  'Comparison Analysis',
  'ROI Analysis',
  'Customer Segmentation',
  'Cost Optimization',
  'Quality Assessment',
  'Risk Analysis',
  'Operational Efficiency'
];

export const BusinessContextCollector = ({ onContextCollected, onSkip, fileName }: BusinessContextCollectorProps) => {
  const [context, setContext] = useState<Partial<BusinessContext>>({
    objectives: [],
    primaryMetrics: []
  });
  const [newObjective, setNewObjective] = useState('');
  const [newMetric, setNewMetric] = useState('');

  const addObjective = (objective: string) => {
    if (objective && !context.objectives?.includes(objective)) {
      setContext(prev => ({
        ...prev,
        objectives: [...(prev.objectives || []), objective]
      }));
    }
    setNewObjective('');
  };

  const removeObjective = (objective: string) => {
    setContext(prev => ({
      ...prev,
      objectives: prev.objectives?.filter(obj => obj !== objective) || []
    }));
  };

  const addMetric = (metric: string) => {
    if (metric && !context.primaryMetrics?.includes(metric)) {
      setContext(prev => ({
        ...prev,
        primaryMetrics: [...(prev.primaryMetrics || []), metric]
      }));
    }
    setNewMetric('');
  };

  const removeMetric = (metric: string) => {
    setContext(prev => ({
      ...prev,
      primaryMetrics: prev.primaryMetrics?.filter(m => m !== metric) || []
    }));
  };

  const handleSubmit = () => {
    const completeContext: BusinessContext = {
      domain: context.domain || 'other',
      purpose: context.purpose || '',
      timePeriod: context.timePeriod || '',
      objectives: context.objectives || [],
      industry: context.industry || '',
      dataSource: context.dataSource || '',
      primaryMetrics: context.primaryMetrics || [],
      customContext: context.customContext
    };
    onContextCollected(completeContext);
  };

  const isValid = context.domain && context.purpose;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Enhance AI Analysis with Business Context
        </CardTitle>
        <CardDescription>
          Help AI provide more accurate insights by describing your data's business context.
          This reduces hallucinations and improves analysis quality.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-100">Analyzing: {fileName}</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Providing context helps AI understand what your data represents and deliver relevant insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="domain">Business Domain *</Label>
              <Select value={context.domain} onValueChange={(value) => setContext(prev => ({ ...prev, domain: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business domain" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_DOMAINS.map(domain => (
                    <SelectItem key={domain.value} value={domain.value}>
                      {domain.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="purpose">Dataset Purpose *</Label>
              <Input
                id="purpose"
                placeholder="e.g., Q4 sales performance analysis"
                value={context.purpose || ''}
                onChange={(e) => setContext(prev => ({ ...prev, purpose: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="timePeriod">Time Period</Label>
              <Input
                id="timePeriod"
                placeholder="e.g., January 2024 - March 2024"
                value={context.timePeriod || ''}
                onChange={(e) => setContext(prev => ({ ...prev, timePeriod: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g., Technology, Healthcare, Retail"
                value={context.industry || ''}
                onChange={(e) => setContext(prev => ({ ...prev, industry: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="dataSource">Data Source</Label>
              <Input
                id="dataSource"
                placeholder="e.g., CRM system, Google Analytics, ERP"
                value={context.dataSource || ''}
                onChange={(e) => setContext(prev => ({ ...prev, dataSource: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Analysis Objectives</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add analysis objective"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addObjective(newObjective)}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addObjective(newObjective)}
                  disabled={!newObjective}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_OBJECTIVES.map(obj => (
                  <Badge
                    key={obj}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => addObjective(obj)}
                  >
                    + {obj}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {context.objectives?.map(objective => (
                  <Badge
                    key={objective}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeObjective(objective)}
                  >
                    {objective} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Primary Metrics/KPIs</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., Revenue, Conversion Rate"
                  value={newMetric}
                  onChange={(e) => setNewMetric(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMetric(newMetric)}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addMetric(newMetric)}
                  disabled={!newMetric}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {context.primaryMetrics?.map(metric => (
                  <Badge
                    key={metric}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeMetric(metric)}
                  >
                    {metric} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="customContext">Additional Context</Label>
              <Textarea
                id="customContext"
                placeholder="Any other relevant information about your data or business context..."
                value={context.customContext || ''}
                onChange={(e) => setContext(prev => ({ ...prev, customContext: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onSkip}>
            Skip for now
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="flex items-center gap-2">
            Continue with Enhanced Context
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
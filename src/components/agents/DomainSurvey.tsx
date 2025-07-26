import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, Users, ShoppingCart, Factory, Heart, GraduationCap, Home, Globe, SkipForward, Clock, Database, BarChart } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export interface DomainContext {
  domain: string;
  industry?: string;
  businessType?: string;
  keyMetrics?: string[];
  customContext?: string;
  dataDescription?: string;
  dataType?: 'time_series' | 'transactional' | 'behavioral' | 'financial' | 'operational' | 'mixed';
  businessObjectives?: string[];
  analysisGoals?: string[];
}

interface DomainSurveyProps {
  open: boolean;
  onClose: () => void;
  onComplete: (context: DomainContext) => void;
  onSkip: () => void;
}

const domains = [
  { id: 'finance', label: 'Finance & Banking', icon: TrendingUp, description: 'Revenue, expenses, investments, financial metrics' },
  { id: 'retail', label: 'Retail & E-commerce', icon: ShoppingCart, description: 'Sales, inventory, customer behavior, conversion rates' },
  { id: 'manufacturing', label: 'Manufacturing', icon: Factory, description: 'Production, quality, supply chain, efficiency' },
  { id: 'healthcare', label: 'Healthcare', icon: Heart, description: 'Patient data, outcomes, operational metrics' },
  { id: 'education', label: 'Education', icon: GraduationCap, description: 'Student performance, enrollment, resources' },
  { id: 'real-estate', label: 'Real Estate', icon: Home, description: 'Property values, sales, market trends' },
  { id: 'marketing', label: 'Marketing & Advertising', icon: Users, description: 'Campaigns, engagement, ROI, customer acquisition' },
  { id: 'operations', label: 'Operations & Logistics', icon: Building2, description: 'Efficiency, costs, performance, workflows' },
  { id: 'general', label: 'General Business', icon: Globe, description: 'Mixed business data, general analytics' }
];

export const DomainSurvey: React.FC<DomainSurveyProps> = ({
  open,
  onClose,
  onComplete,
  onSkip
}) => {
  console.log('DomainSurvey rendered with open:', open);
  const [step, setStep] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('');
  const [keyMetrics, setKeyMetrics] = useState<string[]>([]);
  const [customContext, setCustomContext] = useState<string>('');
  const [dataDescription, setDataDescription] = useState<string>('');
  const [dataType, setDataType] = useState<string>('');
  const [businessObjectives, setBusinessObjectives] = useState<string[]>([]);
  const [analysisGoals, setAnalysisGoals] = useState<string[]>([]);

  const selectedDomainInfo = domains.find(d => d.id === selectedDomain);

  const handleMetricToggle = (metric: string) => {
    setKeyMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const handleObjectiveToggle = (objective: string) => {
    setBusinessObjectives(prev => 
      prev.includes(objective) 
        ? prev.filter(o => o !== objective)
        : [...prev, objective]
    );
  };

  const handleGoalToggle = (goal: string) => {
    setAnalysisGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const getMetricsForDomain = (domain: string) => {
    const metricMap: Record<string, string[]> = {
      finance: ['Revenue', 'Expenses', 'Profit Margin', 'Cash Flow', 'ROI', 'Customer LTV'],
      retail: ['Sales Volume', 'Conversion Rate', 'Average Order Value', 'Customer Acquisition Cost', 'Inventory Turnover'],
      manufacturing: ['Production Volume', 'Quality Metrics', 'Efficiency Rate', 'Downtime', 'Unit Cost'],
      healthcare: ['Patient Satisfaction', 'Treatment Outcomes', 'Wait Times', 'Resource Utilization'],
      education: ['Student Performance', 'Enrollment Rate', 'Completion Rate', 'Faculty Ratio'],
      'real-estate': ['Property Values', 'Sales Volume', 'Days on Market', 'Price per Sq Ft'],
      marketing: ['Campaign ROI', 'Click-through Rate', 'Conversion Rate', 'Customer Acquisition Cost', 'Engagement Rate'],
      operations: ['Efficiency Rate', 'Cost per Unit', 'Turnaround Time', 'Quality Score'],
      general: ['Revenue', 'Growth Rate', 'Customer Satisfaction', 'Operational Efficiency']
    };
    return metricMap[domain] || [];
  };

  const dataTypes = [
    { id: 'time_series', label: 'Time Series', description: 'Data with timestamps, time-based patterns' },
    { id: 'transactional', label: 'Transactional', description: 'Sales, orders, financial transactions' },
    { id: 'behavioral', label: 'Behavioral', description: 'User actions, engagement, interactions' },
    { id: 'financial', label: 'Financial', description: 'Revenue, costs, financial metrics' },
    { id: 'operational', label: 'Operational', description: 'Process data, performance metrics' },
    { id: 'mixed', label: 'Mixed', description: 'Combination of different data types' }
  ];

  const businessObjectiveOptions = [
    'Revenue Optimization', 'Cost Reduction', 'Risk Management', 'Customer Growth',
    'Process Improvement', 'Quality Enhancement', 'Market Expansion', 'Innovation',
    'Compliance', 'Sustainability'
  ];

  const analysisGoalOptions = [
    'Forecasting', 'Trend Analysis', 'Anomaly Detection', 'Pattern Recognition',
    'Correlation Discovery', 'Scenario Planning', 'Risk Assessment', 'Performance Optimization',
    'Customer Segmentation', 'Predictive Modeling'
  ];

  const handleComplete = () => {
    const context: DomainContext = {
      domain: selectedDomain,
      businessType: businessType || undefined,
      keyMetrics: keyMetrics.length > 0 ? keyMetrics : undefined,
      customContext: customContext || undefined,
      dataDescription: dataDescription || undefined,
      industry: selectedDomainInfo?.label,
      dataType: dataType as any || undefined,
      businessObjectives: businessObjectives.length > 0 ? businessObjectives : undefined,
      analysisGoals: analysisGoals.length > 0 ? analysisGoals : undefined
    };
    onComplete(context);
  };

  const canProceed = selectedDomain && (step === 1 || step === 2 || step === 3 || step === 4);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Data Domain Survey</DialogTitle>
          <DialogDescription>
            Help us understand your data to provide better predictive analysis
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">What domain does your data represent?</h3>
              <Button variant="ghost" size="sm" onClick={onSkip}>
                <SkipForward className="h-4 w-4 mr-2" />
                Skip Survey
              </Button>
            </div>
            
            <RadioGroup value={selectedDomain} onValueChange={setSelectedDomain}>
              <div className="grid grid-cols-2 gap-3">
                {domains.map((domain) => (
                  <div key={domain.id}>
                    <RadioGroupItem value={domain.id} id={domain.id} className="sr-only" />
                    <Label htmlFor={domain.id} className="cursor-pointer">
                      <Card className={`h-full transition-all ${selectedDomain === domain.id ? 'ring-2 ring-primary' : ''}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <domain.icon className="h-4 w-4" />
                            {domain.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-xs">
                            {domain.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedDomain}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && selectedDomain && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Key Metrics & Business Type</h3>
            
            <div className="space-y-3">
              <Label htmlFor="business-type">Business Type (Optional)</Label>
              <Input
                id="business-type"
                placeholder="e.g., B2B SaaS, Retail Store, Manufacturing Plant..."
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Which metrics are most important to your business?</Label>
              <div className="flex flex-wrap gap-2">
                {getMetricsForDomain(selectedDomain).map((metric) => (
                  <Badge
                    key={metric}
                    variant={keyMetrics.includes(metric) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleMetricToggle(metric)}
                  >
                    {metric}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Data Type & Objectives</h3>
            
            <div className="space-y-3">
              <Label>What type of data are you working with?</Label>
              <RadioGroup value={dataType} onValueChange={setDataType}>
                <div className="grid grid-cols-2 gap-3">
                  {dataTypes.map((type) => (
                    <div key={type.id}>
                      <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                      <Label htmlFor={type.id} className="cursor-pointer">
                        <Card className={`h-full transition-all ${dataType === type.id ? 'ring-2 ring-primary' : ''}`}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              {type.label}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-xs">
                              {type.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Business Objectives (Select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {businessObjectiveOptions.map((objective) => (
                  <Badge
                    key={objective}
                    variant={businessObjectives.includes(objective) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleObjectiveToggle(objective)}
                  >
                    {objective}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Analysis Goals & Context</h3>
            
            <div className="space-y-3">
              <Label>What analysis goals do you have? (Select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {analysisGoalOptions.map((goal) => (
                  <Badge
                    key={goal}
                    variant={analysisGoals.includes(goal) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleGoalToggle(goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="data-description">Describe your data (Optional)</Label>
              <Textarea
                id="data-description"
                placeholder="e.g., Monthly sales data from 2020-2024, includes regional breakdowns..."
                value={dataDescription}
                onChange={(e) => setDataDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="custom-context">Any specific business context or goals? (Optional)</Label>
              <Textarea
                id="custom-context"
                placeholder="e.g., Looking to predict seasonal trends, forecast revenue for budget planning..."
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleComplete}>
                Complete Survey
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
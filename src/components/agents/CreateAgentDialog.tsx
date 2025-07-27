
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Bot } from 'lucide-react';
import { useAIAgents } from '@/hooks/useAIAgents';
import { AgentType } from '@/types/agents';
import { DatasetSelector } from './DatasetSelector';
import { useDomainContext } from '@/hooks/useDomainContext';

const AGENT_TYPES: { value: AgentType; label: string; description: string }[] = [
  {
    value: 'data_quality',
    label: 'Data Quality Monitor',
    description: 'Monitors data completeness, accuracy, and consistency'
  },
  {
    value: 'anomaly_detection',
    label: 'Anomaly Detection',
    description: 'Identifies outliers and unusual patterns in data'
  },
  {
    value: 'trend_analysis',
    label: 'Trend Analysis',
    description: 'Analyzes trends and forecasts future patterns'
  },
  {
    value: 'predictive_analytics',
    label: 'Predictive Analytics',
    description: 'Creates predictive models and forecasts'
  }
];

const CAPABILITIES: { value: string; label: string }[] = [
  { value: 'data_analysis', label: 'Data Analysis' },
  { value: 'pattern_recognition', label: 'Pattern Recognition' },
  { value: 'statistical_analysis', label: 'Statistical Analysis' },
  { value: 'visualization_generation', label: 'Visualization Generation' },
  { value: 'anomaly_detection', label: 'Anomaly Detection' },
  { value: 'trend_forecasting', label: 'Trend Forecasting' },
  { value: 'correlation_analysis', label: 'Correlation Analysis' },
  { value: 'automated_insights', label: 'Automated Insights' },
  { value: 'data_quality_assessment', label: 'Data Quality Assessment' },
  { value: 'completeness_validation', label: 'Completeness Validation' },
  { value: 'consistency_checks', label: 'Consistency Checks' },
  { value: 'accuracy_validation', label: 'Accuracy Validation' },
  { value: 'uniqueness_validation', label: 'Uniqueness Validation' },
  { value: 'timeliness_checks', label: 'Timeliness Checks' }
];

export const CreateAgentDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AgentType>('data_quality');
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [scheduleFrequency, setScheduleFrequency] = useState<'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  
  const { createAgent, isCreatingAgent } = useAIAgents();
  const { domainContext, hasContext } = useDomainContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !type) return;

    const configuration = {
      analysis_frequency: scheduleFrequency === 'manual' ? 'daily' : scheduleFrequency,
      schedule: {
        frequency: scheduleFrequency,
        time: '09:00',
        timezone: 'UTC'
      },
      confidence_threshold: 0.7,
      auto_generate_visualizations: true,
      notification_preferences: {
        in_app: true,
        email: false
      },
      ...(hasContext && { domain_context: domainContext })
    };

    createAgent({
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      capabilities,
      configuration
    });

    // Reset form
    setName('');
    setDescription('');
    setType('data_quality');
    setCapabilities([]);
    setSelectedDataset('');
    setScheduleFrequency('daily');
    setOpen(false);
  };

  const toggleCapability = (capability: string) => {
    setCapabilities(prev => 
      prev.includes(capability) 
        ? prev.filter(c => c !== capability)
        : [...prev, capability]
    );
  };

  const selectedAgentType = AGENT_TYPES.find(t => t.value === type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create AI Agent
          </DialogTitle>
          <DialogDescription>
            Set up a new AI agent to automate data analysis tasks
            {hasContext && (
              <span className="block text-sm text-green-600 dark:text-green-400 mt-1">
                ✓ Domain context ({domainContext?.domain}) will be applied
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g., Sales Data Monitor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Agent Type</Label>
              <Select value={type} onValueChange={(value: AgentType) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_TYPES.map((agentType) => (
                    <SelectItem key={agentType.value} value={agentType.value}>
                      {agentType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Dataset</Label>
            <DatasetSelector 
              value={selectedDataset}
              onValueChange={setSelectedDataset}
              placeholder="Select dataset for this agent..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder={selectedAgentType?.description}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Schedule Frequency</Label>
            <Select value={scheduleFrequency} onValueChange={(value: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly') => setScheduleFrequency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Only</SelectItem>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Agent Capabilities</Label>
            <div className="grid grid-cols-2 gap-3">
              {CAPABILITIES.map((capability) => (
                <div key={capability.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={capability.value}
                    checked={capabilities.includes(capability.value)}
                    onCheckedChange={() => toggleCapability(capability.value)}
                  />
                  <Label
                    htmlFor={capability.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {capability.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingAgent || !name.trim()} className="w-full sm:w-auto">
              {isCreatingAgent ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

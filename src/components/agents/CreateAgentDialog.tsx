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
import { AgentType, AgentCapability } from '@/types/agents';

const AGENT_TYPES: { value: AgentType; label: string; description: string }[] = [
  {
    value: 'monitoring',
    label: 'Data Monitoring',
    description: 'Continuously monitors data for changes and patterns'
  },
  {
    value: 'insight_generation',
    label: 'Insight Generation',
    description: 'Automatically generates insights from data analysis'
  },
  {
    value: 'visualization',
    label: 'Visualization',
    description: 'Creates optimal chart recommendations and visualizations'
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
    value: 'correlation_discovery',
    label: 'Correlation Discovery',
    description: 'Finds relationships and correlations between variables'
  },
  {
    value: 'data_quality',
    label: 'Data Quality Monitor',
    description: 'Monitors data quality issues and generates quality reports'
  }
];

const CAPABILITIES: { value: AgentCapability; label: string }[] = [
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
  const [type, setType] = useState<AgentType>('monitoring');
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([]);
  
  const { createAgent, isCreatingAgent } = useAIAgents();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !type) return;

    const configuration = {
      analysis_frequency: 'daily',
      confidence_threshold: 0.7,
      auto_generate_visualizations: true,
      notification_preferences: {
        in_app: true,
        email: false
      }
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
    setType('monitoring');
    setCapabilities([]);
    setOpen(false);
  };

  const toggleCapability = (capability: AgentCapability) => {
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
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder={selectedAgentType?.description}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingAgent || !name.trim()}>
              {isCreatingAgent ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
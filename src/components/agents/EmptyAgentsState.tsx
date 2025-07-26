import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Plus, AlertCircle } from 'lucide-react';
import { CreateAgentDialog } from './CreateAgentDialog';

interface EmptyAgentsStateProps {
  onCreateAgent?: () => void;
}

export const EmptyAgentsState = ({ onCreateAgent }: EmptyAgentsStateProps) => {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
          <Bot className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle>No AI Agents Configured</CardTitle>
        <CardDescription>
          Create your first AI agent to start automating data analysis tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Why create an agent?</span>
          </div>
          <ul className="text-left space-y-1">
            <li>• Automatically monitor data quality</li>
            <li>• Detect anomalies and patterns</li>
            <li>• Generate insights and reports</li>
            <li>• Schedule regular analysis tasks</li>
          </ul>
        </div>
        
        <CreateAgentDialog />
        
        <p className="text-xs text-muted-foreground">
          Agents will automatically process your datasets and provide insights
        </p>
      </CardContent>
    </Card>
  );
};
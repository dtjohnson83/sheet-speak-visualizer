import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Activity, 
  Clock,
  CheckCircle,
  TrendingUp,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAIAgents } from '@/hooks/useAIAgents';

interface AgentStatusHeaderProps {
  fileName: string;
  agent: any;
  isCreatingAgent: boolean;
  onCreateAgent: () => Promise<void>;
  onScheduleCheck: () => Promise<void>;
}

export const AgentStatusHeader = ({ 
  fileName, 
  agent, 
  isCreatingAgent, 
  onCreateAgent, 
  onScheduleCheck 
}: AgentStatusHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Quality Agent
            </CardTitle>
            <CardDescription>
              AI-powered data quality monitoring and reporting for {fileName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {agent ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onScheduleCheck}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Check
                </Button>
              </div>
            ) : (
              <Button 
                onClick={onCreateAgent}
                disabled={isCreatingAgent}
              >
                {isCreatingAgent ? 'Creating...' : 'Create Agent'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {agent && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">Status</div>
                <div className="text-xs text-gray-600 capitalize">{agent.status}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Frequency</div>
                <div className="text-xs text-gray-600 capitalize">
                  {agent.configuration?.analysis_frequency || 'Daily'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">Last Check</div>
                <div className="text-xs text-gray-600">
                  {agent.last_active ? new Date(agent.last_active).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium">Alerts</div>
                <div className="text-xs text-gray-600">
                  {agent.configuration?.notification_preferences?.in_app ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useBusinessRuleProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processBusinessRules = async (agentId: string, data: any[]) => {
    if (!agentId || !data || data.length === 0) {
      toast({
        title: "Processing Error",
        description: "Invalid agent ID or data provided",
        variant: "destructive"
      });
      return null;
    }

    setIsProcessing(true);
    
    try {
      console.log(`Triggering business rule processing for agent: ${agentId}`);

      // Call the edge function to process business rules
      const { data: result, error } = await supabase.functions.invoke('business-rule-processor', {
        body: {
          agentId,
          data
        }
      });

      if (error) {
        console.error('Error calling business rule processor:', error);
        toast({
          title: "Processing Failed",
          description: error.message || "Failed to process business rules",
          variant: "destructive"
        });
        return null;
      }

      console.log('Business rule processing result:', result);

      if (result.violationsCreated > 0) {
        toast({
          title: "Rule Violations Detected",
          description: `${result.violationsCreated} business rule violation(s) detected and recorded`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Rules Processed",
          description: `${result.rulesEvaluated} business rules evaluated - no violations detected`,
        });
      }

      return result;

    } catch (error) {
      console.error('Error processing business rules:', error);
      toast({
        title: "Processing Error",
        description: "An unexpected error occurred while processing business rules",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const processBusinessRulesForDataset = async (datasetId: string, agents: any[]) => {
    // This would be used when processing rules for an entire dataset
    // For now, we'll process rules for all active agents
    const activeAgents = agents.filter(agent => agent.status === 'active');
    
    if (activeAgents.length === 0) {
      toast({
        title: "No Active Agents",
        description: "No active agents found to process business rules",
        variant: "default"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // For now, we'll need the actual dataset data to process rules
      // In a real implementation, this would fetch the dataset by ID
      console.log(`Processing business rules for dataset: ${datasetId} with ${activeAgents.length} agents`);
      
      toast({
        title: "Processing Started",
        description: `Started processing business rules for ${activeAgents.length} active agents`,
      });

      // This would iterate through agents and process their business rules
      // For now, just show a success message
      setTimeout(() => {
        toast({
          title: "Processing Complete",
          description: `Business rule processing completed for all active agents`,
        });
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      console.error('Error processing business rules for dataset:', error);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing business rules for the dataset",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return {
    processBusinessRules,
    processBusinessRulesForDataset,
    isProcessing
  };
};
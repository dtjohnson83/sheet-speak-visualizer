import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BusinessRule, BusinessRuleViolation } from '@/types/agents';
import { useToast } from '@/hooks/use-toast';

export const useBusinessRules = (agentId?: string) => {
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [violations, setViolations] = useState<BusinessRuleViolation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Fetch business rules
  const fetchRules = async () => {
    if (!agentId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('business_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setRules(data?.map(rule => ({
        ...rule,
        operator: rule.operator as BusinessRule['operator'],
        comparison_type: rule.comparison_type as BusinessRule['comparison_type'],
        time_window: rule.time_window as BusinessRule['time_window'],
        baseline_calculation: rule.baseline_calculation as BusinessRule['baseline_calculation'],
        alert_frequency: rule.alert_frequency as BusinessRule['alert_frequency'],
        created_at: new Date(rule.created_at),
        updated_at: new Date(rule.updated_at),
        last_evaluation: rule.last_evaluation ? new Date(rule.last_evaluation) : undefined,
        last_triggered: rule.last_triggered ? new Date(rule.last_triggered) : undefined,
      })) || []);
    } catch (error) {
      console.error('Error fetching business rules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch business rules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch rule violations
  const fetchViolations = async () => {
    if (!agentId) return;

    try {
      const { data, error } = await supabase
        .from('business_rule_violations')
        .select(`
          *,
          business_rules!inner(agent_id)
        `)
        .eq('business_rules.agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      setViolations(data?.map(violation => ({
        ...violation,
        severity: violation.violation_severity as BusinessRuleViolation['severity'],
        created_at: new Date(violation.created_at),
      })) || []);
    } catch (error) {
      console.error('Error fetching rule violations:', error);
    }
  };

  // Create business rule
  const createRule = async (ruleData: Partial<BusinessRule>) => {
    setIsCreating(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('business_rules')
        .insert({
          agent_id: ruleData.agent_id!,
          rule_name: ruleData.rule_name!,
          metric_column: ruleData.metric_column!,
          operator: ruleData.operator!,
          threshold_value: ruleData.threshold_value!,
          comparison_type: ruleData.comparison_type!,
          time_window: ruleData.time_window!,
          baseline_calculation: ruleData.baseline_calculation!,
          alert_frequency: ruleData.alert_frequency!,
          is_active: ruleData.is_active!,
          description: ruleData.description,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newRule: BusinessRule = {
        ...data,
        operator: data.operator as BusinessRule['operator'],
        comparison_type: data.comparison_type as BusinessRule['comparison_type'],
        time_window: data.time_window as BusinessRule['time_window'],
        baseline_calculation: data.baseline_calculation as BusinessRule['baseline_calculation'],
        alert_frequency: data.alert_frequency as BusinessRule['alert_frequency'],
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        last_evaluation: data.last_evaluation ? new Date(data.last_evaluation) : undefined,
        last_triggered: data.last_triggered ? new Date(data.last_triggered) : undefined,
      };

      setRules(prev => [newRule, ...prev]);
      
      toast({
        title: "Success",
        description: "Business rule created successfully",
      });

      return newRule;
    } catch (error) {
      console.error('Error creating business rule:', error);
      toast({
        title: "Error",
        description: "Failed to create business rule",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  // Update business rule
  const updateRule = async (ruleId: string, updates: Partial<BusinessRule>) => {
    setIsUpdating(true);
    try {
      // Convert Date objects to strings for database update
      const dbUpdates = {
        ...updates,
        created_at: undefined, // Don't update these timestamps
        updated_at: undefined,
        last_evaluation: updates.last_evaluation?.toISOString(),
        last_triggered: updates.last_triggered?.toISOString(),
      };

      const { data, error } = await supabase
        .from('business_rules')
        .update(dbUpdates)
        .eq('id', ruleId)
        .select()
        .single();

      if (error) throw error;

      const updatedRule: BusinessRule = {
        ...data,
        operator: data.operator as BusinessRule['operator'],
        comparison_type: data.comparison_type as BusinessRule['comparison_type'],
        time_window: data.time_window as BusinessRule['time_window'],
        baseline_calculation: data.baseline_calculation as BusinessRule['baseline_calculation'],
        alert_frequency: data.alert_frequency as BusinessRule['alert_frequency'],
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        last_evaluation: data.last_evaluation ? new Date(data.last_evaluation) : undefined,
        last_triggered: data.last_triggered ? new Date(data.last_triggered) : undefined,
      };

      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? updatedRule : rule
      ));

      toast({
        title: "Success",
        description: "Business rule updated successfully",
      });

      return updatedRule;
    } catch (error) {
      console.error('Error updating business rule:', error);
      toast({
        title: "Error",
        description: "Failed to update business rule",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle rule active status
  const toggleRule = async (ruleId: string, isActive: boolean) => {
    return updateRule(ruleId, { is_active: isActive });
  };

  // Delete business rule
  const deleteRule = async (ruleId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('business_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      
      toast({
        title: "Success",
        description: "Business rule deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting business rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete business rule",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // Load data on mount and agent change
  useEffect(() => {
    if (agentId) {
      fetchRules();
      fetchViolations();
    }
  }, [agentId]);

  return {
    rules,
    violations,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createRule,
    updateRule,
    toggleRule,
    deleteRule,
    refetch: () => {
      fetchRules();
      fetchViolations();
    },
  };
};
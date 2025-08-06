import { supabase } from '@/integrations/supabase/client';

export interface ClassificationRule {
  id: string;
  rule_name: string;
  rule_type: 'column_name_pattern' | 'value_pattern' | 'context_based';
  pattern: string;
  target_type: string;
  confidence_score: number;
  usage_count: number;
  success_rate: number;
  is_active: boolean;
  created_from_feedback_count: number;
}

export interface FeedbackPattern {
  pattern: string;
  originalType: string;
  correctedType: string;
  occurrences: number;
  confidence: number;
}

export class LearningEngine {
  
  // Analyze feedback patterns to generate new classification rules
  static async analyzeFeedbackPatterns(): Promise<FeedbackPattern[]> {
    try {
      const { data: feedback, error } = await supabase
        .from('column_type_feedback')
        .select('column_name, original_type, corrected_type, column_context')
        .eq('is_processed', false);

      if (error) throw error;

      const patterns = new Map<string, FeedbackPattern>();

      feedback?.forEach(item => {
        const columnPattern = item.column_name.toLowerCase();
        const key = `${columnPattern}:${item.original_type}:${item.corrected_type}`;
        
        if (patterns.has(key)) {
          const existing = patterns.get(key)!;
          existing.occurrences += 1;
          existing.confidence = Math.min(1.0, existing.confidence + 0.1);
        } else {
          patterns.set(key, {
            pattern: columnPattern,
            originalType: item.original_type,
            correctedType: item.corrected_type,
            occurrences: 1,
            confidence: 0.8, // Start with high confidence for user corrections
          });
        }
      });

      return Array.from(patterns.values())
        .filter(pattern => pattern.occurrences >= 2 || pattern.confidence >= 0.9)
        .sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error analyzing feedback patterns:', error);
      return [];
    }
  }

  // Create new classification rules from feedback patterns
  static async createRulesFromFeedback(): Promise<void> {
    try {
      const patterns = await this.analyzeFeedbackPatterns();
      const rulesToCreate = [];

      for (const pattern of patterns) {
        const ruleName = `feedback_rule_${pattern.pattern}_${pattern.correctedType}`;
        
        // Check if rule already exists
        const { data: existingRule } = await supabase
          .from('classification_rules')
          .select('id')
          .eq('rule_name', ruleName)
          .single();

        if (!existingRule) {
          rulesToCreate.push({
            rule_name: ruleName,
            rule_type: 'column_name_pattern',
            pattern: pattern.pattern,
            target_type: pattern.correctedType,
            confidence_score: pattern.confidence,
            created_from_feedback_count: pattern.occurrences,
          });
        }
      }

      if (rulesToCreate.length > 0) {
        const { error } = await supabase
          .from('classification_rules')
          .insert(rulesToCreate);

        if (error) throw error;

        // Mark feedback as processed
        await supabase
          .from('column_type_feedback')
          .update({ is_processed: true })
          .eq('is_processed', false);
      }
    } catch (error) {
      console.error('Error creating rules from feedback:', error);
    }
  }

  // Get active classification rules
  static async getActiveRules(): Promise<ClassificationRule[]> {
    try {
      const { data, error } = await supabase
        .from('classification_rules')
        .select('*')
        .eq('is_active', true)
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      return data as ClassificationRule[];
    } catch (error) {
      console.error('Error fetching classification rules:', error);
      return [];
    }
  }

  // Apply learned rules to column classification
  static async applyLearnedRules(columnName: string, defaultType: string): Promise<string> {
    try {
      const rules = await this.getActiveRules();
      const columnPattern = columnName.toLowerCase();

      // Find matching rules
      for (const rule of rules) {
        if (rule.rule_type === 'column_name_pattern') {
          // Check for exact match or pattern match
          if (columnPattern.includes(rule.pattern) || 
              new RegExp(rule.pattern, 'i').test(columnName)) {
            
            // Update usage count
            await supabase
              .from('classification_rules')
              .update({ 
                usage_count: rule.usage_count + 1,
                updated_at: new Date().toISOString() 
              })
              .eq('id', rule.id);

            return rule.target_type;
          }
        }
      }

      return defaultType;
    } catch (error) {
      console.error('Error applying learned rules:', error);
      return defaultType;
    }
  }

  // Update rule success rate based on user feedback
  static async updateRuleSuccessRate(ruleId: string, wasCorrect: boolean): Promise<void> {
    try {
      const { data: rule, error } = await supabase
        .from('classification_rules')
        .select('success_rate, usage_count')
        .eq('id', ruleId)
        .single();

      if (error || !rule) return;

      // Calculate new success rate using exponential moving average
      const alpha = 0.1; // Learning rate
      const newSuccessRate = wasCorrect 
        ? rule.success_rate + alpha * (1 - rule.success_rate)
        : rule.success_rate + alpha * (0 - rule.success_rate);

      await supabase
        .from('classification_rules')
        .update({ 
          success_rate: Math.max(0, Math.min(1, newSuccessRate)),
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId);

      // Deactivate rules with consistently low success rates
      if (newSuccessRate < 0.3 && rule.usage_count > 10) {
        await supabase
          .from('classification_rules')
          .update({ is_active: false })
          .eq('id', ruleId);
      }
    } catch (error) {
      console.error('Error updating rule success rate:', error);
    }
  }

  // Get classification confidence for a column
  static async getClassificationConfidence(columnName: string, type: string): Promise<number> {
    try {
      const rules = await this.getActiveRules();
      const columnPattern = columnName.toLowerCase();

      const matchingRule = rules.find(rule => 
        rule.rule_type === 'column_name_pattern' &&
        rule.target_type === type &&
        (columnPattern.includes(rule.pattern) || new RegExp(rule.pattern, 'i').test(columnName))
      );

      return matchingRule ? matchingRule.confidence_score : 0.5; // Default confidence
    } catch (error) {
      console.error('Error getting classification confidence:', error);
      return 0.5;
    }
  }
}
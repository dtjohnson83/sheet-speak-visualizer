import { supabase } from '@/integrations/supabase/client';

export interface ChartLearningRule {
  id: string;
  rule_name: string;
  rule_type: string;
  pattern: any;
  recommendation: any;
  confidence_score: number;
  success_rate: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChartFeedbackPattern {
  pattern: any;
  chartType: string;
  recommendedConfiguration: any;
  occurrences: number;
  confidence: number;
}

export class ChartLearningEngine {
  
  /**
   * Analyzes chart feedback to identify patterns for creating new learning rules
   */
  async analyzeChartFeedbackPatterns(): Promise<ChartFeedbackPattern[]> {
    const { data: unprocessedFeedback, error } = await supabase
      .from('chart_feedback')
      .select('*')
      .eq('is_processed', false);

    if (error) {
      console.error('Error fetching unprocessed chart feedback:', error);
      return [];
    }

    // Group feedback by chart type and similar patterns
    const feedbackMap = new Map<string, any[]>();
    
    unprocessedFeedback.forEach(feedback => {
      const dataContext = feedback.data_context as any;
      const datasetPattern = dataContext?.dataset_pattern || {};
      const key = `${feedback.chart_type}_${JSON.stringify(datasetPattern)}`;
      if (!feedbackMap.has(key)) {
        feedbackMap.set(key, []);
      }
      feedbackMap.get(key)!.push(feedback);
    });

    const patterns: ChartFeedbackPattern[] = [];

    feedbackMap.forEach((feedbackGroup, key) => {
      if (feedbackGroup.length >= 2) { // Only consider patterns with multiple occurrences
        const averageRating = feedbackGroup.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackGroup.length;
        
        if (averageRating >= 4) { // Only positive feedback patterns
          const chartType = feedbackGroup[0].chart_type;
          const commonCorrections = this.extractCommonCorrections(feedbackGroup);
          
          if (commonCorrections) {
            patterns.push({
              pattern: feedbackGroup[0].data_context || {},
              chartType,
              recommendedConfiguration: commonCorrections,
              occurrences: feedbackGroup.length,
              confidence: Math.min(averageRating / 5, 0.9),
            });
          }
        }
      }
    });

    return patterns;
  }

  /**
   * Creates new chart learning rules from analyzed feedback patterns
   */
  async createRulesFromChartFeedback(): Promise<void> {
    const patterns = await this.analyzeChartFeedbackPatterns();
    
    for (const pattern of patterns) {
      // Check if a similar rule already exists
      const { data: existingRules } = await supabase
        .from('chart_learning_rules')
        .select('*')
        .eq('rule_type', 'chart_preference');

      const ruleExists = existingRules?.some(rule => 
        JSON.stringify(rule.pattern) === JSON.stringify(pattern.pattern)
      );

      if (!ruleExists) {
        const ruleName = `Chart preference for ${pattern.chartType} with ${pattern.occurrences} confirmations`;
        
        const { error } = await supabase
          .from('chart_learning_rules')
          .insert({
            rule_name: ruleName,
            rule_type: 'chart_preference',
            pattern: {
              chart_type: pattern.chartType,
              data_pattern: pattern.pattern,
            },
            recommendation: pattern.recommendedConfiguration,
            confidence_score: pattern.confidence,
          });

        if (error) {
          console.error('Error creating chart learning rule:', error);
        }
      }
    }

    // Mark feedback as processed
    const { error: updateError } = await supabase
      .from('chart_feedback')
      .update({ is_processed: true })
      .eq('is_processed', false);

    if (updateError) {
      console.error('Error marking chart feedback as processed:', updateError);
    }
  }

  /**
   * Gets active chart learning rules
   */
  async getActiveChartRules(): Promise<ChartLearningRule[]> {
    const { data, error } = await supabase
      .from('chart_learning_rules')
      .select('*')
      .eq('is_active', true)
      .order('confidence_score', { ascending: false });

    if (error) {
      console.error('Error fetching chart learning rules:', error);
      return [];
    }

    return data as ChartLearningRule[];
  }

  /**
   * Applies learned rules to suggest optimal chart configuration
   */
  async applyLearnedChartRules(chartType: string, dataContext: any): Promise<any> {
    const rules = await this.getActiveChartRules();
    
    const matchingRule = rules.find(rule => 
      rule.pattern.chart_type === chartType &&
      this.matchesDataPattern(rule.pattern.data_pattern, dataContext)
    );

    if (matchingRule) {
      // Update usage count
      await supabase
        .from('chart_learning_rules')
        .update({ 
          usage_count: matchingRule.usage_count + 1 
        })
        .eq('id', matchingRule.id);

      return matchingRule.recommendation;
    }

    return null;
  }

  /**
   * Updates rule success rate based on user feedback
   */
  async updateChartRuleSuccessRate(ruleId: string, wasSuccessful: boolean): Promise<void> {
    const { data: rule, error: fetchError } = await supabase
      .from('chart_learning_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (fetchError || !rule) {
      console.error('Error fetching chart rule:', fetchError);
      return;
    }

    const currentSuccessRate = rule.success_rate || 0;
    const usageCount = rule.usage_count || 1;
    
    // Calculate new success rate using incremental average
    const newSuccessRate = ((currentSuccessRate * (usageCount - 1)) + (wasSuccessful ? 1 : 0)) / usageCount;

    const { error: updateError } = await supabase
      .from('chart_learning_rules')
      .update({ 
        success_rate: newSuccessRate,
        is_active: newSuccessRate >= 0.3, // Deactivate rules with very low success rates
      })
      .eq('id', ruleId);

    if (updateError) {
      console.error('Error updating chart rule success rate:', updateError);
    }
  }

  /**
   * Gets chart recommendation confidence score
   */
  async getChartRecommendationConfidence(chartType: string, dataContext: any): Promise<number> {
    const rules = await this.getActiveChartRules();
    
    const matchingRule = rules.find(rule => 
      rule.pattern.chart_type === chartType &&
      this.matchesDataPattern(rule.pattern.data_pattern, dataContext)
    );

    return matchingRule ? matchingRule.confidence_score : 0.5; // Default confidence
  }

  private extractCommonCorrections(feedbackGroup: any[]): any | null {
    const corrections = feedbackGroup
      .map(f => f.user_correction)
      .filter(c => c !== null && c !== undefined);

    if (corrections.length === 0) return null;

    // Find common configuration patterns
    const commonConfig: any = {};
    
    // Analyze common corrections and build recommendation
    corrections.forEach(correction => {
      if (correction.colors) commonConfig.colors = correction.colors;
      if (correction.axes) commonConfig.axes = correction.axes;
      if (correction.visualization_style) commonConfig.visualization_style = correction.visualization_style;
    });

    return Object.keys(commonConfig).length > 0 ? commonConfig : null;
  }

  private matchesDataPattern(rulePattern: any, dataContext: any): boolean {
    if (!rulePattern || !dataContext) return false;

    // Simple pattern matching - can be enhanced with more sophisticated logic
    const keys = Object.keys(rulePattern);
    return keys.every(key => {
      if (key === 'chart_type') return true; // Already matched
      return rulePattern[key] === dataContext[key];
    });
  }
}
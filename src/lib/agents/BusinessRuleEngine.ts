import { BusinessRule, BusinessRuleViolation } from '@/types/agents';

export interface RuleEvaluationContext {
  data: any[];
  columns: string[];
  currentPeriod: string;
  previousPeriod?: string;
}

export interface RuleEvaluationResult {
  violated: boolean;
  currentValue: number;
  previousValue?: number;
  deviation?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export class BusinessRuleEngine {
  /**
   * Evaluates a business rule against the provided data context
   */
  static evaluateRule(rule: BusinessRule, context: RuleEvaluationContext): RuleEvaluationResult {
    try {
      const currentValue = this.calculateMetricValue(rule.metric_column, context.data);
      
      let violated = false;
      let deviation = 0;
      let previousValue: number | undefined;

      if (rule.comparison_type === 'absolute') {
        violated = this.evaluateAbsoluteThreshold(currentValue, rule.operator, rule.threshold_value);
      } else if (rule.comparison_type === 'percentage') {
        const baselineValue = this.calculateBaselineValue(rule, context);
        if (baselineValue !== null) {
          previousValue = baselineValue;
          const percentageChange = ((currentValue - baselineValue) / baselineValue) * 100;
          deviation = Math.abs(percentageChange);
          violated = this.evaluatePercentageThreshold(percentageChange, rule.operator, rule.threshold_value);
        }
      }

      const severity = this.calculateSeverity(deviation, rule.threshold_value);
      const message = this.generateViolationMessage(rule, currentValue, previousValue, deviation);

      return {
        violated,
        currentValue,
        previousValue,
        deviation,
        severity,
        message
      };
    } catch (error) {
      console.error('Error evaluating business rule:', error);
      return {
        violated: false,
        currentValue: 0,
        severity: 'low',
        message: 'Error evaluating rule'
      };
    }
  }

  /**
   * Calculates the current value of a metric from the data
   */
  private static calculateMetricValue(column: string, data: any[]): number {
    if (!data || data.length === 0) return 0;

    const values = data
      .map(row => parseFloat(row[column]) || 0)
      .filter(val => !isNaN(val));

    if (values.length === 0) return 0;

    // Return sum by default - could be extended to support other aggregations
    return values.reduce((sum, val) => sum + val, 0);
  }

  /**
   * Calculates baseline value based on rule configuration
   */
  private static calculateBaselineValue(rule: BusinessRule, context: RuleEvaluationContext): number | null {
    // For now, return a simulated previous period value
    // In a real implementation, this would query historical data
    const currentValue = this.calculateMetricValue(rule.metric_column, context.data);
    
    // Simulate different baseline calculation methods
    switch (rule.baseline_calculation) {
      case 'previous_period':
        return currentValue * 0.95; // Simulate 5% lower previous period
      case 'moving_average':
        return currentValue * 0.98; // Simulate slightly lower moving average
      case 'fixed_value':
        return currentValue * 0.92; // Simulate fixed baseline value
      default:
        return null;
    }
  }

  /**
   * Evaluates absolute threshold conditions
   */
  private static evaluateAbsoluteThreshold(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return Math.abs(value - threshold) < 0.001; // Allow for floating point precision
      case 'greater_than_or_equal':
        return value >= threshold;
      case 'less_than_or_equal':
        return value <= threshold;
      case 'not_equals':
        return Math.abs(value - threshold) >= 0.001;
      default:
        return false;
    }
  }

  /**
   * Evaluates percentage threshold conditions
   */
  private static evaluatePercentageThreshold(percentageChange: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'increases_by_more_than':
        return percentageChange > threshold;
      case 'decreases_by_more_than':
        return percentageChange < -threshold;
      case 'changes_by_more_than':
        return Math.abs(percentageChange) > threshold;
      default:
        return false;
    }
  }

  /**
   * Calculates severity based on deviation from threshold
   */
  private static calculateSeverity(deviation: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = deviation / threshold;

    if (ratio >= 3) return 'critical';
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Generates a human-readable violation message
   */
  private static generateViolationMessage(
    rule: BusinessRule, 
    currentValue: number, 
    previousValue?: number, 
    deviation?: number
  ): string {
    let message = `${rule.rule_name}: `;

    if (rule.comparison_type === 'absolute') {
      message += `Current value (${currentValue.toFixed(2)}) ${this.getOperatorDescription(rule.operator)} threshold (${rule.threshold_value})`;
    } else if (rule.comparison_type === 'percentage' && previousValue !== undefined && deviation !== undefined) {
      const changeDirection = currentValue > previousValue ? 'increased' : 'decreased';
      message += `Metric ${changeDirection} by ${deviation.toFixed(1)}% (from ${previousValue.toFixed(2)} to ${currentValue.toFixed(2)}), exceeding ${rule.threshold_value}% threshold`;
    }

    return message;
  }

  /**
   * Gets human-readable operator description
   */
  private static getOperatorDescription(operator: string): string {
    const descriptions: Record<string, string> = {
      'greater_than': 'exceeds',
      'less_than': 'is below',
      'equals': 'equals',
      'greater_than_or_equal': 'is at or above',
      'less_than_or_equal': 'is at or below',
      'not_equals': 'does not equal',
      'increases_by_more_than': 'increased by more than',
      'decreases_by_more_than': 'decreased by more than',
      'changes_by_more_than': 'changed by more than'
    };
    return descriptions[operator] || operator;
  }

  /**
   * Evaluates all rules for an agent against the provided context
   */
  static evaluateAllRules(rules: BusinessRule[], context: RuleEvaluationContext): RuleEvaluationResult[] {
    return rules
      .filter(rule => rule.is_active)
      .map(rule => this.evaluateRule(rule, context));
  }

  /**
   * Creates violation records for rules that were violated
   */
  static createViolationRecords(
    rules: BusinessRule[], 
    evaluationResults: RuleEvaluationResult[]
  ): Partial<BusinessRuleViolation>[] {
    const violations: Partial<BusinessRuleViolation>[] = [];

    rules.forEach((rule, index) => {
      const result = evaluationResults[index];
      
      if (result && result.violated) {
        violations.push({
          rule_id: rule.id,
          metric_value: result.currentValue,
          threshold_value: rule.threshold_value,
          percentage_change: result.deviation,
          baseline_value: result.previousValue,
          severity: result.severity,
          notification_sent: false
        });
      }
    });

    return violations;
  }
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BusinessRule {
  id: string;
  agent_id: string;
  rule_name: string;
  metric_column: string;
  operator: string;
  threshold_value: number;
  comparison_type: string;
  time_window: string;
  baseline_calculation: string;
  is_active: boolean;
}

interface RuleEvaluationResult {
  violated: boolean;
  currentValue: number;
  previousValue?: number;
  deviation?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { agentId, data } = await req.json();

    if (!agentId || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing agentId or data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing business rules for agent: ${agentId}`);

    // Fetch active business rules for the agent
    const { data: rules, error: rulesError } = await supabase
      .from('business_rules')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching business rules:', rulesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch business rules' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!rules || rules.length === 0) {
      console.log(`No active business rules found for agent: ${agentId}`);
      return new Response(
        JSON.stringify({ 
          message: 'No active business rules to evaluate',
          violationsCreated: 0 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const violations: any[] = [];

    // Evaluate each rule
    for (const rule of rules) {
      try {
        const result = evaluateRule(rule, data);
        
        if (result.violated) {
          console.log(`Rule violation detected for rule: ${rule.rule_name}`);
          
          // Create violation record
          const violation = {
            rule_id: rule.id,
            user_id: rule.user_id,
            metric_value: result.currentValue,
            threshold_value: rule.threshold_value,
            percentage_change: result.deviation || 0,
            baseline_value: result.previousValue || 0,
            violation_severity: result.severity,
            notification_sent: false
          };

          violations.push(violation);

          // Update rule's last_triggered and trigger_count
          await supabase
            .from('business_rules')
            .update({ 
              last_triggered: new Date().toISOString(),
              trigger_count: (rule.trigger_count || 0) + 1
            })
            .eq('id', rule.id);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.rule_name}:`, error);
      }
    }

    // Insert violations into database
    if (violations.length > 0) {
      const { error: violationError } = await supabase
        .from('business_rule_violations')
        .insert(violations);

      if (violationError) {
        console.error('Error inserting violations:', violationError);
        return new Response(
          JSON.stringify({ error: 'Failed to create violation records' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`Created ${violations.length} violation records`);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Business rules evaluation completed',
        rulesEvaluated: rules.length,
        violationsCreated: violations.length,
        violations
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in business rule processor:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function evaluateRule(rule: BusinessRule, data: any[]): RuleEvaluationResult {
  const currentValue = calculateMetricValue(rule.metric_column, data);
  
  let violated = false;
  let deviation = 0;
  let previousValue: number | undefined;

  if (rule.comparison_type === 'absolute') {
    violated = evaluateAbsoluteThreshold(currentValue, rule.operator, rule.threshold_value);
  } else if (rule.comparison_type === 'percentage') {
    const baselineValue = calculateBaselineValue(rule, currentValue);
    if (baselineValue !== null) {
      previousValue = baselineValue;
      const percentageChange = ((currentValue - baselineValue) / baselineValue) * 100;
      deviation = Math.abs(percentageChange);
      violated = evaluatePercentageThreshold(percentageChange, rule.operator, rule.threshold_value);
    }
  }

  const severity = calculateSeverity(deviation, rule.threshold_value);
  const message = generateViolationMessage(rule, currentValue, previousValue, deviation);

  return {
    violated,
    currentValue,
    previousValue,
    deviation,
    severity,
    message
  };
}

function calculateMetricValue(column: string, data: any[]): number {
  if (!data || data.length === 0) return 0;

  const values = data
    .map(row => parseFloat(row[column]) || 0)
    .filter(val => !isNaN(val));

  if (values.length === 0) return 0;

  return values.reduce((sum, val) => sum + val, 0);
}

function calculateBaselineValue(rule: BusinessRule, currentValue: number): number | null {
  // Simulate baseline calculation - in production this would query historical data
  switch (rule.baseline_calculation) {
    case 'previous_period':
      return currentValue * 0.95;
    case 'moving_average':
      return currentValue * 0.98;
    case 'fixed_value':
      return currentValue * 0.92;
    default:
      return null;
  }
}

function evaluateAbsoluteThreshold(value: number, operator: string, threshold: number): boolean {
  switch (operator) {
    case 'greater_than':
      return value > threshold;
    case 'less_than':
      return value < threshold;
    case 'equals':
      return Math.abs(value - threshold) < 0.001;
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

function evaluatePercentageThreshold(percentageChange: number, operator: string, threshold: number): boolean {
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

function calculateSeverity(deviation: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
  const ratio = deviation / threshold;

  if (ratio >= 3) return 'critical';
  if (ratio >= 2) return 'high';
  if (ratio >= 1.5) return 'medium';
  return 'low';
}

function generateViolationMessage(
  rule: BusinessRule, 
  currentValue: number, 
  previousValue?: number, 
  deviation?: number
): string {
  let message = `${rule.rule_name}: `;

  if (rule.comparison_type === 'absolute') {
    message += `Current value (${currentValue.toFixed(2)}) violates threshold (${rule.threshold_value})`;
  } else if (rule.comparison_type === 'percentage' && previousValue !== undefined && deviation !== undefined) {
    const changeDirection = currentValue > previousValue ? 'increased' : 'decreased';
    message += `Metric ${changeDirection} by ${deviation.toFixed(1)}% (from ${previousValue.toFixed(2)} to ${currentValue.toFixed(2)}), exceeding ${rule.threshold_value}% threshold`;
  }

  return message;
}
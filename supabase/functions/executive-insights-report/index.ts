import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentInsight {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  insight_type: 'quality_issue' | 'anomaly_detected' | 'trend_analysis' | 'recommendation' | 'alert';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  metadata: any;
  created_at: string;
  is_read: boolean;
  confidence_score?: number;
}

interface AgentTask {
  id: string;
  agent_id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  completed_at?: string;
  result?: any;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
}

interface ExecutiveInsightsRequest {
  domainContext?: string;
  timeframe?: 'last_24h' | 'last_week' | 'last_month';
  focusAreas?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize variables outside try-catch for error handling
  let insights: AgentInsight[] = [];
  let tasks: AgentTask[] = [];
  let agents: Agent[] = [];

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user from JWT token in the request
    const authHeader = req.headers.get('Authorization') ?? '';
    console.log('Auth header present:', !!authHeader);
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required', 
          details: authError?.message || 'Invalid or missing token' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Authenticated user: ${user.id}`);

    const requestData: ExecutiveInsightsRequest = await req.json();
    
    // Step 1: Get user's agents first
    const agentsResult = await supabaseClient
      .from('ai_agents')
      .select('*')
      .eq('user_id', user.id);

    if (agentsResult.error) {
      console.error('Error fetching agents:', agentsResult.error);
      throw new Error(`Failed to fetch agents: ${agentsResult.error.message}`);
    }

    agents = agentsResult.data || [];
    const agentIds = agents.map(agent => agent.id);
    
    console.log(`Found ${agents.length} agents for user:`, agentIds);

    // Step 2: Fetch insights and tasks using agent IDs directly
    let insightsResult, tasksResult;
    
    if (agentIds.length > 0) {
      console.log('Fetching insights and tasks for agent IDs:', agentIds);
      [insightsResult, tasksResult] = await Promise.all([
        supabaseClient
          .from('agent_insights')
          .select('*')
          .in('agent_id', agentIds)
          .order('created_at', { ascending: false }),
        supabaseClient
          .from('agent_tasks')
          .select('*')
          .in('agent_id', agentIds)
          .order('created_at', { ascending: false })
      ]);
    } else {
      console.log('No agents found, skipping insights and tasks fetch');
      insightsResult = { data: [], error: null };
      tasksResult = { data: [], error: null };
    }

    if (insightsResult.error || tasksResult.error) {
      console.error('Database errors:', {
        insights: insightsResult.error,
        tasks: tasksResult.error
      });
      throw new Error(`Failed to fetch agent data: ${insightsResult.error?.message || tasksResult.error?.message}`);
    }

    insights = insightsResult.data || [];
    tasks = tasksResult.data || [];
    
    console.log(`Fetched ${insights.length} insights and ${tasks.length} tasks`);
    
    if (insights.length > 0) {
      console.log('Sample insight:', insights[0]);
    }
    if (tasks.length > 0) {
      console.log('Sample task:', tasks[0]);
    }
    
    // Map insight_type to severity for compatibility
    insights = insights.map(insight => ({
      ...insight,
      severity: insight.severity || mapInsightTypeToSeverity(insight.insight_type)
    }));

    // Generate executive report using AI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const xaiApiKey = Deno.env.get('XAI_API_KEY');

    if (!openAIApiKey && !xaiApiKey) {
      throw new Error('No AI API key configured');
    }

    const executiveContext = generateExecutiveContext(insights, tasks, agents, requestData);
    
    const systemPrompt = `You are an executive AI assistant generating concise, actionable strategic insights reports. Generate a brief but comprehensive report (max 800 words) focusing on:

1. **Executive Summary**: Key findings and immediate actions (2-3 sentences)
2. **Critical Issues**: Top 3 priority items requiring attention
3. **Key Insights**: Most important discoveries from agent analysis
4. **Recommendations**: 3-5 specific actionable next steps

Keep the report focused, business-oriented, and avoid verbose explanations. Transform technical agent insights into strategic business intelligence that executives can act upon immediately.

Context: ${requestData.domainContext || 'Data analysis'}
Timeframe: ${requestData.timeframe || 'Current period'}
Focus Areas: ${requestData.focusAreas?.join(', ') || 'All areas'}`;

    const userPrompt = `Based on the following AI agent intelligence, generate a concise executive insights report (max 800 words):

${executiveContext}

Structure the report with:
1. **Executive Summary** (2-3 sentences with key findings and immediate actions)
2. **Critical Issues** (Top 3 priority items requiring attention)
3. **Key Insights** (Most important agent discoveries)
4. **Recommendations** (3-5 specific actionable next steps)

Be concise, business-focused, and actionable. Avoid verbose explanations and focus on insights that drive decisions.`;

    let reportContent;
    let apiError = null;
    
    try {
      let apiResponse;
      
      if (xaiApiKey) {
        console.log('Attempting to use X.AI API...');
        apiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${xaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-3',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 3000,
          }),
        });
      } else if (openAIApiKey) {
        console.log('Attempting to use OpenAI API...');
        apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 3000,
          }),
        });
      }

      if (apiResponse && apiResponse.ok) {
        const aiResult = await apiResponse.json();
        reportContent = aiResult.choices[0].message.content;
        console.log('AI report generated successfully');
      } else {
        const errorText = apiResponse ? await apiResponse.text() : 'No API response';
        console.error(`AI API error: ${apiResponse?.status} - ${errorText}`);
        apiError = `AI API returned ${apiResponse?.status}: ${errorText}`;
        throw new Error(apiError);
      }
    } catch (error) {
      console.error('AI API call failed:', error);
      apiError = error.message;
      
      // Generate fallback report using local analysis
      reportContent = generateFallbackReport(insights, tasks, agents, requestData);
      console.log('Generated fallback report due to AI API failure');
    }

    // Generate summary statistics
    const summaryStats = generateSummaryStats(insights, tasks, agents);

    const response = {
      report: reportContent,
      metadata: {
        generated_at: new Date().toISOString(),
        insights_analyzed: insights.length,
        agents_active: agents.filter(a => a.status === 'active').length,
        critical_issues: insights.filter(i => i.severity === 'critical').length,
        is_fallback: !!apiError,
        api_error: apiError,
        ...summaryStats
      },
      raw_data: {
        insights: insights.slice(0, 50), // Limit for performance
        summary_stats: summaryStats
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in executive-insights-report function:', error);
    
    // Try to generate a basic fallback report even on major errors
    try {
      const basicReport = `
# Executive Report - Basic Analysis

## Error Notice
⚠️ **Report Generation Issue**: ${error.message}

## Available Data Summary
This is a basic analysis based on available agent data:

- Total insights available: ${insights?.length || 0}
- Total tasks recorded: ${tasks?.length || 0}  
- Total agents configured: ${agents?.length || 0}

## Recommendations
1. Please check your API key configuration
2. Verify network connectivity
3. Contact support if the issue persists

*Generated on ${new Date().toISOString()}*
      `;

      return new Response(JSON.stringify({ 
        report: basicReport,
        metadata: {
          generated_at: new Date().toISOString(),
          error: true,
          error_message: error.message,
          is_fallback: true
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fallbackError) {
      return new Response(JSON.stringify({ 
        error: error.message,
        report: "Unable to generate executive insights report at this time. Please try again later.",
        metadata: {
          generated_at: new Date().toISOString(),
          error: true
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
});

function generateExecutiveContext(
  insights: AgentInsight[], 
  tasks: AgentTask[], 
  agents: Agent[],
  requestData: ExecutiveInsightsRequest
): string {
  const timeframeDays = getTimeframeDays(requestData.timeframe);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

  // Filter data by timeframe
  const recentInsights = insights.filter(i => 
    new Date(i.created_at) >= cutoffDate
  );
  const recentTasks = tasks.filter(t => 
    new Date(t.created_at) >= cutoffDate
  );

  // Deep analysis of insight content and business intelligence extraction
  const businessIntelligence = extractBusinessIntelligence(recentInsights, recentTasks);
  const marketOpportunities = identifyMarketOpportunities(recentInsights);
  const riskAssessment = performRiskAssessment(recentInsights);
  const operationalInsights = extractOperationalInsights(recentInsights, recentTasks);
  
  // Categorize insights by severity and type
  const criticalInsights = recentInsights.filter(i => i.severity === 'critical');
  const highInsights = recentInsights.filter(i => i.severity === 'high');

  // Analyze task performance
  const completedTasks = recentTasks.filter(t => t.status === 'completed');
  const successRate = recentTasks.length > 0 ? (completedTasks.length / recentTasks.length) * 100 : 0;

  return `
## Executive Business Intelligence Analysis (${requestData.timeframe || 'Current Period'})

### Strategic Overview:
- Agents Deployed: ${agents.length} (${agents.filter(a => a.status === 'active').length} active)
- Intelligence Generated: ${recentInsights.length} insights from ${completedTasks.length} completed analyses
- System Performance: ${successRate.toFixed(1)}% task success rate

### Key Business Findings:
${businessIntelligence.keyFindings.map(finding => `- ${finding}`).join('\n')}

### Market Opportunities Identified:
${marketOpportunities.opportunities.map(opp => `- ${opp}`).join('\n')}

### Risk Factors & Concerns:
${riskAssessment.risks.map(risk => `- ${risk}`).join('\n')}

### Operational Performance Insights:
${operationalInsights.insights.map(insight => `- ${insight}`).join('\n')}

### Data Quality Assessment:
${businessIntelligence.qualityMetrics.map(metric => `- ${metric}`).join('\n')}

### Critical Action Items (${criticalInsights.length} urgent):
${criticalInsights.slice(0, 3).map(i => 
  `- **${i.title}**: ${extractActionableInsight(i)}`
).join('\n')}

### High-Impact Recommendations (${highInsights.length} items):
${highInsights.slice(0, 3).map(i => 
  `- **${i.title}**: ${extractActionableInsight(i)}`
).join('\n')}
  `;
}

// Extract business intelligence from insight data
function extractBusinessIntelligence(insights: AgentInsight[], tasks: AgentTask[]) {
  const keyFindings: string[] = [];
  const qualityMetrics: string[] = [];
  
  // Analyze insights with data content
  insights.forEach(insight => {
    if (insight.data || insight.metadata?.data) {
      const data = insight.data || insight.metadata?.data;
      
      // Extract statistical insights
      if (data.statistics) {
        const stats = data.statistics;
        Object.entries(stats).forEach(([column, metrics]: [string, any]) => {
          if (metrics && typeof metrics === 'object') {
            // Price analysis
            if (column.toLowerCase().includes('price') || column.toLowerCase().includes('sale')) {
              const mean = metrics.mean ? Math.round(metrics.mean) : null;
              const std = metrics.std ? Math.round(metrics.std) : null;
              if (mean && std) {
                const variability = ((std / mean) * 100).toFixed(1);
                keyFindings.push(`${column} shows average of $${mean.toLocaleString()} with ${variability}% price variability - indicating ${parseFloat(variability) > 30 ? 'high market volatility' : 'stable pricing'}`);
              }
            }
            
            // Size/quantity analysis
            if (column.toLowerCase().includes('size') || column.toLowerCase().includes('feet') || column.toLowerCase().includes('room')) {
              const mean = metrics.mean ? Math.round(metrics.mean) : null;
              const max = metrics.max ? Math.round(metrics.max) : null;
              if (mean && max) {
                keyFindings.push(`${column} analysis reveals average of ${mean.toLocaleString()} with maximum of ${max.toLocaleString()} - potential for premium market segmentation`);
              }
            }
            
            // Date/time analysis
            if (column.toLowerCase().includes('date') || column.toLowerCase().includes('year')) {
              const min = metrics.min;
              const max = metrics.max;
              if (min && max) {
                keyFindings.push(`${column} span indicates dataset covers ${Math.round(max - min)} time units - sufficient for trend analysis`);
              }
            }
          }
        });
      }
      
      // Extract completion and quality metrics
      if (data.analyzed_columns) {
        qualityMetrics.push(`Successfully analyzed ${data.analyzed_columns} data dimensions`);
      }
      
      if (data.analysis_type) {
        qualityMetrics.push(`Completed ${data.analysis_type.replace('_', ' ')} with high confidence`);
      }
    }
  });
  
  // Task performance insights with actual results
  const completedTasks = tasks.filter(t => t.status === 'completed');
  completedTasks.forEach(task => {
    if (task.result?.statistics) {
      const stats = task.result.statistics;
      Object.entries(stats).forEach(([column, metrics]: [string, any]) => {
        if (metrics && typeof metrics === 'object' && metrics.mean) {
          if (column.toLowerCase().includes('price')) {
            const mean = Math.round(metrics.mean);
            const std = metrics.std ? Math.round(metrics.std) : 0;
            const variability = std > 0 ? ((std / mean) * 100).toFixed(1) : '0';
            keyFindings.push(`${column} Analysis: $${mean.toLocaleString()} average value with ${variability}% variability - ${parseFloat(variability) > 30 ? 'high volatility market' : 'stable pricing environment'}`);
          }
          if (column.toLowerCase().includes('size') || column.toLowerCase().includes('feet')) {
            const mean = Math.round(metrics.mean);
            const max = Math.round(metrics.max);
            const min = Math.round(metrics.min);
            keyFindings.push(`${column} Distribution: ${min.toLocaleString()}-${max.toLocaleString()} range (avg: ${mean.toLocaleString()}) indicates ${((max - min) / mean > 1) ? 'diverse portfolio requiring segmented approach' : 'consistent market positioning'}`);
          }
          if (column.toLowerCase().includes('year')) {
            const range = Math.round(metrics.max - metrics.min);
            const avgAge = new Date().getFullYear() - Math.round(metrics.mean);
            keyFindings.push(`${column} Insights: ${range}-year span with average age of ${avgAge} years - ${avgAge > 25 ? 'mature inventory requiring modernization strategy' : 'relatively new portfolio'}`);
          }
          if (column.toLowerCase().includes('room') || column.toLowerCase().includes('bed')) {
            const mean = metrics.mean.toFixed(1);
            keyFindings.push(`${column} Profile: ${mean} average suggests ${parseFloat(mean) > 3 ? 'family-oriented' : 'starter/compact'} market focus`);
          }
        }
      });
    }
  });
  
  if (completedTasks.length > 0) {
    qualityMetrics.push(`${completedTasks.length} comprehensive analytical tasks completed with actionable insights`);
  }
  
  // Default insights if no specific data found
  if (keyFindings.length === 0) {
    keyFindings.push('Agent analysis indicates normal operational patterns');
    keyFindings.push('Data processing completed within expected parameters');
  }
  
  if (qualityMetrics.length === 0) {
    qualityMetrics.push('System data quality checks passed');
  }
  
  return { keyFindings, qualityMetrics };
}

// Identify market opportunities from insights
function identifyMarketOpportunities(insights: AgentInsight[]) {
  const opportunities: string[] = [];
  
  insights.forEach(insight => {
    const data = insight.data || insight.metadata?.data;
    if (data?.statistics) {
      Object.entries(data.statistics).forEach(([column, metrics]: [string, any]) => {
        if (metrics && typeof metrics === 'object') {
          // Pricing opportunities
          if (column.toLowerCase().includes('price') && metrics.std && metrics.mean) {
            const variability = (metrics.std / metrics.mean) * 100;
            if (variability > 25) {
              opportunities.push(`High price variability in ${column} suggests dynamic pricing opportunities`);
            }
          }
          
          // Market segmentation opportunities  
          if (column.toLowerCase().includes('size') || column.toLowerCase().includes('room')) {
            const range = metrics.max - metrics.min;
            if (range > metrics.mean) {
              opportunities.push(`Wide ${column} range indicates potential for tiered market segmentation`);
            }
          }
        }
      });
    }
    
    // Trend analysis opportunities
    if (insight.insight_type === 'trend_analysis') {
      opportunities.push(`Trend analysis completed - monitor for emerging patterns and market shifts`);
    }
  });
  
  if (opportunities.length === 0) {
    opportunities.push('Monitor data for emerging market trends and optimization opportunities');
    opportunities.push('Continue regular analysis to identify new business insights');
  }
  
  return { opportunities };
}

// Perform risk assessment from insights
function performRiskAssessment(insights: AgentInsight[]) {
  const risks: string[] = [];
  
  // Critical and high severity insights indicate risks
  const criticalIssues = insights.filter(i => i.severity === 'critical');
  const highIssues = insights.filter(i => i.severity === 'high');
  
  if (criticalIssues.length > 0) {
    risks.push(`${criticalIssues.length} critical issues requiring immediate attention`);
  }
  
  if (highIssues.length > 0) {
    risks.push(`${highIssues.length} high-priority concerns need executive review`);
  }
  
  // Analyze data quality risks
  insights.forEach(insight => {
    if (insight.insight_type === 'quality_issue') {
      risks.push(`Data quality issue detected: ${insight.title}`);
    }
    if (insight.insight_type === 'anomaly_detected') {
      risks.push(`Anomaly identified requiring investigation: ${insight.title}`);
    }
  });
  
  if (risks.length === 0) {
    risks.push('No significant risks identified in current analysis');
  }
  
  return { risks };
}

// Extract operational insights
function extractOperationalInsights(insights: AgentInsight[], tasks: AgentTask[]) {
  const operationalInsights: string[] = [];
  
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const failedTasks = tasks.filter(t => t.status === 'failed');
  
  if (completedTasks.length > 0) {
    operationalInsights.push(`Analytics pipeline processed ${completedTasks.length} tasks successfully`);
  }
  
  if (failedTasks.length > 0) {
    operationalInsights.push(`${failedTasks.length} tasks failed - system optimization recommended`);
  }
  
  // Processing efficiency
  const totalTasks = tasks.length;
  if (totalTasks > 0) {
    const efficiency = ((completedTasks.length / totalTasks) * 100).toFixed(1);
    operationalInsights.push(`Current operational efficiency: ${efficiency}%`);
  }
  
  // Recent insight generation
  const recentInsights = insights.filter(i => !i.is_read);
  if (recentInsights.length > 0) {
    operationalInsights.push(`${recentInsights.length} new insights await executive review`);
  }
  
  if (operationalInsights.length === 0) {
    operationalInsights.push('Operational systems functioning within normal parameters');
  }
  
  return { insights: operationalInsights };
}

// Extract actionable insights from individual insight data
function extractActionableInsight(insight: AgentInsight): string {
  // Try to extract specific actionable information from the insight
  if (insight.data?.statistics || insight.metadata?.data?.statistics) {
    const stats = insight.data?.statistics || insight.metadata?.data?.statistics;
    const columns = Object.keys(stats);
    if (columns.length > 0) {
      return `Review ${columns.length} key metrics showing statistical patterns requiring strategic evaluation`;
    }
  }
  
  // Fallback to description with action orientation
  const description = insight.description || insight.title;
  if (description.length > 80) {
    return description.substring(0, 80) + '... - requires executive analysis';
  }
  
  return description + ' - action needed';
}

function getTimeframeDays(timeframe?: string): number {
  switch (timeframe) {
    case 'last_24h': return 1;
    case 'last_week': return 7;
    case 'last_month': return 30;
    default: return 7;
  }
}

function generateSummaryStats(insights: AgentInsight[], tasks: AgentTask[], agents: Agent[]) {
  return {
    total_agents: agents.length,
    active_agents: agents.filter(a => a.status === 'active').length,
    total_insights: insights.length,
    unread_insights: insights.filter(i => !i.is_read).length,
    critical_insights: insights.filter(i => i.severity === 'critical').length,
    high_priority_insights: insights.filter(i => i.severity === 'high').length,
    completed_tasks: tasks.filter(t => t.status === 'completed').length,
    failed_tasks: tasks.filter(t => t.status === 'failed').length,
    task_success_rate: tasks.length > 0 ? 
      (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0
  };
}

// Helper function to map insight_type to severity
function mapInsightTypeToSeverity(insightType: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (insightType) {
    case 'quality_issue':
      return 'high';
    case 'anomaly_detected':
      return 'critical';
    case 'alert':
      return 'high';
    case 'recommendation':
      return 'medium';
    case 'trend_analysis':
      return 'medium';
    default:
      return 'medium';
  }
}

function generateFallbackReport(
  insights: AgentInsight[], 
  tasks: AgentTask[], 
  agents: Agent[],
  requestData: ExecutiveInsightsRequest
): string {
  const summaryStats = generateSummaryStats(insights, tasks, agents);
  const criticalInsights = insights.filter(i => i.severity === 'critical');
  const recentInsights = insights.slice(0, 10);
  
  return `
# Executive Intelligence Report
*Generated: ${new Date().toLocaleString()}*

## Executive Summary
This report analyzes ${insights.length} agent insights, ${tasks.length} tasks, and ${agents.length} AI agents to provide strategic business intelligence.

## Key Metrics
- **Active Agents**: ${summaryStats.active_agents}/${summaryStats.total_agents}
- **Task Success Rate**: ${summaryStats.task_success_rate.toFixed(1)}%
- **Critical Issues**: ${summaryStats.critical_insights}
- **Unread Insights**: ${summaryStats.unread_insights}

## Critical Issues Requiring Attention
${criticalInsights.length > 0 ? criticalInsights.slice(0, 5).map(insight => 
  `### ${insight.title}\n**Severity**: ${insight.severity.toUpperCase()}\n**Description**: ${insight.description}\n**Generated**: ${new Date(insight.created_at).toLocaleDateString()}\n`
).join('\n') : 'No critical issues identified at this time.'}

## Recent Agent Discoveries
${recentInsights.map(insight => 
  `- **${insight.title}** (${insight.severity}): ${insight.description.substring(0, 100)}${insight.description.length > 100 ? '...' : ''}`
).join('\n')}

## Agent Performance Overview
${agents.map(agent => {
  const agentInsights = insights.filter(i => i.agent_id === agent.id);
  const agentTasks = tasks.filter(t => t.agent_id === agent.id);
  return `- **${agent.name}** (${agent.type}): ${agentInsights.length} insights, ${agentTasks.filter(t => t.status === 'completed').length} completed tasks`;
}).join('\n')}

## Recommendations
1. **Immediate Actions**: Review ${summaryStats.critical_insights} critical issues identified by agents
2. **Operational Efficiency**: ${summaryStats.task_success_rate < 80 ? 'Investigate task failures to improve agent performance' : 'Agent performance is optimal'}
3. **Data Management**: Process ${summaryStats.unread_insights} unread insights for complete visibility
4. **Strategic Planning**: Leverage agent discoveries for data-driven decision making

---
*This report was generated using local analysis. For enhanced AI-powered insights, please configure your X.AI API key.*
  `;
}
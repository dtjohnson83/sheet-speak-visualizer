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
  severity: 'low' | 'medium' | 'high' | 'critical';
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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const requestData: ExecutiveInsightsRequest = await req.json();
    
    // Fetch agent insights, tasks, and agents
    const [insightsResult, tasksResult, agentsResult] = await Promise.all([
      supabaseClient
        .from('agent_insights')
        .select('*, ai_agents!agent_id(user_id)')
        .eq('ai_agents.user_id', user.id)
        .order('created_at', { ascending: false }),
      supabaseClient
        .from('agent_tasks')
        .select('*, ai_agents!agent_id(user_id)')
        .eq('ai_agents.user_id', user.id)
        .order('created_at', { ascending: false }),
      supabaseClient
        .from('ai_agents')
        .select('*')
        .eq('user_id', user.id)
    ]);

    if (insightsResult.error || tasksResult.error || agentsResult.error) {
      console.error('Database errors:', {
        insights: insightsResult.error,
        tasks: tasksResult.error, 
        agents: agentsResult.error
      });
      throw new Error(`Failed to fetch agent data: ${insightsResult.error?.message || tasksResult.error?.message || agentsResult.error?.message}`);
    }

    const insights: AgentInsight[] = insightsResult.data || [];
    const tasks: AgentTask[] = tasksResult.data || [];
    const agents: Agent[] = agentsResult.data || [];

    // Generate executive report using AI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const xaiApiKey = Deno.env.get('XAI_API_KEY');

    if (!openAIApiKey && !xaiApiKey) {
      throw new Error('No AI API key configured');
    }

    const executiveContext = generateExecutiveContext(insights, tasks, agents, requestData);
    
    const systemPrompt = `You are an executive AI assistant generating strategic insights reports based on AI agent discoveries and analysis. Focus on:

1. **Business Impact Assessment**: Quantify the business implications of agent findings
2. **Strategic Recommendations**: Provide actionable insights for leadership decisions
3. **Risk & Opportunity Analysis**: Highlight critical risks and growth opportunities
4. **Agent Performance Summary**: Evaluate the effectiveness of your AI agent workforce
5. **Trend Analysis**: Identify patterns and emerging issues requiring attention

Generate a comprehensive executive report that transforms technical agent insights into strategic business intelligence. Use clear, business-focused language that executives can act upon immediately.

Context: ${requestData.domainContext || 'General business intelligence'}
Timeframe: ${requestData.timeframe || 'Current period'}
Focus Areas: ${requestData.focusAreas?.join(', ') || 'All areas'}`;

    const userPrompt = `Based on the following AI agent intelligence, generate an executive insights report:

${executiveContext}

Structure the report with:
1. Executive Summary (key findings and immediate actions)
2. Critical Issues (high-priority items requiring attention)
3. Strategic Opportunities (growth and optimization opportunities)
4. Agent Performance Overview (which agents are providing most value)
5. Trend Analysis (patterns and emerging issues)
6. Recommendations (specific actionable next steps)

Focus on business impact and actionable intelligence rather than technical details.`;

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
            model: 'grok-beta',
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

  // Categorize insights by severity and type
  const criticalInsights = recentInsights.filter(i => i.severity === 'critical');
  const highInsights = recentInsights.filter(i => i.severity === 'high');
  const mediumInsights = recentInsights.filter(i => i.severity === 'medium');

  // Analyze task performance
  const completedTasks = recentTasks.filter(t => t.status === 'completed');
  const failedTasks = recentTasks.filter(t => t.status === 'failed');
  const successRate = recentTasks.length > 0 ? (completedTasks.length / recentTasks.length) * 100 : 0;

  // Group insights by type
  const insightsByType = recentInsights.reduce((acc, insight) => {
    if (!acc[insight.type]) acc[insight.type] = [];
    acc[insight.type].push(insight);
    return acc;
  }, {} as Record<string, AgentInsight[]>);

  // Agent performance analysis
  const agentPerformance = agents.map(agent => {
    const agentInsights = recentInsights.filter(i => i.agent_id === agent.id);
    const agentTasks = recentTasks.filter(t => t.agent_id === agent.id);
    const agentSuccessRate = agentTasks.length > 0 ? 
      (agentTasks.filter(t => t.status === 'completed').length / agentTasks.length) * 100 : 0;
    
    return {
      name: agent.name,
      type: agent.type,
      status: agent.status,
      insights_generated: agentInsights.length,
      tasks_completed: agentTasks.filter(t => t.status === 'completed').length,
      success_rate: agentSuccessRate,
      critical_findings: agentInsights.filter(i => i.severity === 'critical').length
    };
  });

  return `
## Agent Intelligence Summary (${requestData.timeframe || 'Current Period'})

### Overall Metrics:
- Total Agents: ${agents.length}
- Active Agents: ${agents.filter(a => a.status === 'active').length}
- Recent Insights: ${recentInsights.length}
- Task Success Rate: ${successRate.toFixed(1)}%

### Critical Findings (${criticalInsights.length} items):
${criticalInsights.slice(0, 5).map(i => 
  `- ${i.title}: ${i.description.substring(0, 100)}...`
).join('\n')}

### High Priority Issues (${highInsights.length} items):
${highInsights.slice(0, 3).map(i => 
  `- ${i.title}: ${i.description.substring(0, 100)}...`
).join('\n')}

### Insight Categories:
${Object.entries(insightsByType).map(([type, insights]) => 
  `- ${type}: ${insights.length} insights`
).join('\n')}

### Agent Performance Overview:
${agentPerformance.map(agent => 
  `- ${agent.name} (${agent.type}): ${agent.insights_generated} insights, ${agent.success_rate.toFixed(1)}% success rate${agent.critical_findings > 0 ? `, ${agent.critical_findings} critical findings` : ''}`
).join('\n')}

### Recent Task Activity:
- Completed: ${completedTasks.length}
- Failed: ${failedTasks.length}
- Success Rate: ${successRate.toFixed(1)}%

### Unread Insights: ${recentInsights.filter(i => !i.is_read).length}
  `;
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
*This report was generated using local analysis. For enhanced AI-powered insights, please configure your OpenAI API key.*
  `;
}
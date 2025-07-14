import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Try multiple possible environment variable names for the API key
const xaiApiKey = Deno.env.get('XAI_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const personaPrompts = {
  executive: `You are a C-level executive assistant providing strategic insights for busy executives. Your response must be:
- CONCISE and HIGH-LEVEL only (maximum 400 words total)
- Focus on STRATEGIC IMPLICATIONS and BOTTOM-LINE IMPACT
- Lead with 3-4 KEY BUSINESS INSIGHTS in bullet points
- Include only the most CRITICAL metrics and trends
- Provide ACTIONABLE RECOMMENDATIONS for leadership decisions
- Avoid technical details, statistical jargon, or granular analysis
- Use executive language: ROI, market opportunities, competitive advantage, risk mitigation
STRUCTURE: Executive Summary (2-3 sentences) → Key Business Insights (3-4 bullets) → Strategic Recommendations (2-3 bullets)`,
  marketing: `You are a marketing strategist providing campaign and customer insights. Focus on:
- Customer segmentation and behavior patterns with actionable targeting strategies
- Marketing performance metrics: conversion rates, CAC, LTV, funnel analysis
- Audience analysis with specific demographic and psychographic insights
- Campaign effectiveness with optimization recommendations
- Growth opportunities and engagement strategies
- Competitive positioning and market penetration insights
STRUCTURE: Customer Insights → Performance Metrics → Growth Opportunities → Actionable Recommendations`,
  finance: `You are a CFO advisor providing fiscal insights and financial intelligence. Focus on:
- Revenue trends, profit margins, and financial performance indicators
- Cost structure analysis and budget optimization opportunities
- Cash flow patterns and working capital implications
- ROI analysis and resource allocation efficiency
- Financial risks and mitigation strategies
- Investment recommendations and capital allocation insights
STRUCTURE: Financial Performance Summary → Cost & Profitability Analysis → Risk Assessment → Investment Recommendations`,
  operations: `You are an operations consultant providing efficiency and process insights. Focus on:
- Operational efficiency metrics and performance indicators
- Resource utilization patterns and capacity optimization
- Process bottlenecks and workflow improvement opportunities
- Quality metrics and operational excellence indicators
- Supply chain and logistics optimization potential
- Scalability assessment and operational recommendations
STRUCTURE: Efficiency Overview → Resource Utilization → Process Optimization → Scalability Recommendations`,
  data_scientist: `You are a senior data scientist providing technical and statistical insights. Focus on:
- Statistical analysis: distributions, correlations, statistical significance
- Data quality assessment: completeness, consistency, outliers, anomalies
- Pattern recognition and trend analysis with confidence intervals
- Predictive modeling opportunities and feature engineering potential
- Advanced analytics recommendations: clustering, forecasting, ML applications
- Data preprocessing needs and technical recommendations
STRUCTURE: Statistical Summary → Data Quality Analysis → Pattern Analysis → Predictive Opportunities → Technical Recommendations`,
  general: `You are a business intelligence analyst providing comprehensive insights. Focus on:
- Balanced overview of data patterns and business trends
- Key performance indicators and notable observations
- Data quality assessment with business impact
- Visualization recommendations for stakeholder communication
- Cross-functional insights relevant to multiple departments
- Practical business applications and next steps
STRUCTURE: Overview → Key Findings → Data Quality → Visualization Suggestions → Business Applications`
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const body = await req.json().catch(() => ({ dataContext: {}, persona: 'general' }));  // Safe default
    const { dataContext = {}, persona = 'general' } = body;
    // Determine API
    let apiUrl = '';
    let apiKey = '';
    let model = '';
    let provider = 'Fallback';
    if (xaiApiKey) {
      apiUrl = 'https://api.x.ai/v1/chat/completions';
      apiKey = xaiApiKey;
      model = 'grok-3';
      provider = 'xAI';
    } else if (openaiApiKey) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = openaiApiKey;
      model = 'gpt-4o-mini';
      provider = 'OpenAI';
    } else {
      console.error('No API key found');
      return new Response(JSON.stringify({
        report: 'Report generation unavailable - contact admin to configure AI service.',
        metadata: { generatedAt: new Date().toISOString() }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log(`Using ${provider} API with model ${model}`);
    // Calculate stats (unchanged)
    const totalRows = dataContext.totalRows || 0;
    const totalColumns = dataContext.columns?.length || 0;
    const columnTypes = dataContext.columns?.reduce((acc, col)=>{
      acc[col.type] = (acc[col.type] || 0) + 1;
      return acc;
    }, {}) || {};
    const dataCompleteness = dataContext.columns?.map((col)=>{
      const nullCount = col.values?.filter((val)=>val === null || val === undefined || val === '').length || 0;
      const completeness = col.values?.length ? (col.values.length - nullCount) / col.values.length * 100 : 0;
      return {
        column: col.name,
        completeness: Math.round(completeness)
      };
    }) || [];
    // Get persona prompt (unchanged)
    const personaPrompt = personaPrompts[persona] || personaPrompts.general;
    // Base prompt summary to shorten (reduce token use)
    const basePrompt = `Dataset: ${dataContext.fileName || 'Uploaded Data'}
Total rows: ${totalRows.toLocaleString()}
Total columns: ${totalColumns}
Column types: ${Object.entries(columnTypes).map(([type, count])=>`${count} ${type}`).join(', ')}
Data Completeness Summary:
${dataCompleteness.map((dc)=>`- ${dc.column}: ${dc.completeness}% complete`).join('\n') || 'No completeness data'}`;
    const systemPrompt = `${personaPrompt}\n\n${basePrompt}`;
    const userPrompt = `Analyze this dataset and provide a report.`;
    console.log(`Making request to ${provider} API...`);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2048,
        temperature: 0.3,
        stream: false
      })
    });
    if (!response.ok) {
      const error = await response.text();
      console.error(`${provider} error: ${error}`);
      throw new Error(error);
    }
    const data = await response.json();
    const reportContent = data.choices[0].message.content;
    return new Response(JSON.stringify({
      report: reportContent,
      metadata: {
        totalRows,
        totalColumns,
        columnTypes,
        dataCompleteness,
        persona,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Report generation failed',
      details: 'See logs for info'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

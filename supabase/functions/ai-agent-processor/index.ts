import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const xaiApiKey = Deno.env.get('XAI_API_KEY');

// Enhanced security headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 50, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userRequests.count >= maxRequests) {
    return false;
  }

  userRequests.count++;
  return true;
}

function sanitizeError(error: any): string {
  const message = error?.message || error?.toString() || 'Unknown error';
  // Remove sensitive information
  return message.replace(/key|token|secret|password/gi, '[REDACTED]').substring(0, 200);
}

interface AgentTask {
  id: string;
  agent_id: string;
  dataset_id?: string;
  task_type: string;
  parameters: any;
  scheduled_at: string;
}

interface Dataset {
  id: string;
  data: any[];
  columns: any[];
  user_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request body to check for data context
    const requestBody = await req.json().catch(() => ({}));
    const dataContext = requestBody.data_context;
    
    // Get pending agent tasks with prioritization (manual tasks first)
    const { data: tasks, error: tasksError } = await supabase
      .from('agent_tasks')
      .select(`
        *,
        ai_agents!inner(*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('created_at', { ascending: false }) // Newer tasks first
      .limit(20); // Increased from 5 to 20 for better throughput

    if (tasksError) {
      const sanitizedError = sanitizeError(tasksError);
      console.error('Error fetching tasks:', sanitizedError);
      throw new Error(sanitizedError);
    }

    console.log(`Processing ${tasks?.length || 0} pending tasks`);

    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No pending tasks to process',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const processedTasks = [];

    for (const task of tasks) {
      try {
        console.log(`Processing task ${task.id} of type ${task.task_type}`);
        
        // Mark task as running
        await supabase
          .from('agent_tasks')
          .update({ 
            status: 'running', 
            started_at: new Date().toISOString() 
          })
          .eq('id', task.id);

        let result = null;
        let insights = [];

        // Process based on task type
        switch (task.task_type) {
          case 'analyze_data':
            result = await processDataAnalysis(task, supabase);
            insights = await generateInsightsFromAnalysis(result, task, supabase);
            break;
          case 'generate_insights':
            insights = await generateInsights(task, supabase);
            break;
          case 'detect_anomalies':
            insights = await detectAnomalies(task, supabase);
            break;
          case 'analyze_trends':
            insights = await analyzeTrends(task, supabase);
            break;
          case 'assess_data_quality':
            result = await processDataAnalysis(task, supabase);
            insights = await generateInsightsFromAnalysis(result, task, supabase);
            break;
          case 'predictive_forecast':
            insights = await generateInsights(task, supabase);
            break;
          case 'find_correlations':
            insights = await generateInsights(task, supabase);
            break;
          case 'create_visualization':
            insights = await generateInsights(task, supabase);
            break;
          case 'report_generation':
            insights = await processReportGeneration(task, supabase, dataContext);
            break;
          default:
            console.log(`Unknown task type: ${task.task_type}`);
            // Still process unknown types as basic data analysis
            result = await processDataAnalysis(task, supabase);
            insights = await generateInsightsFromAnalysis(result, task, supabase);
        }

        // Save insights if generated
        if (insights.length > 0) {
          for (const insight of insights) {
            const { data: savedInsight } = await supabase
              .from('agent_insights')
              .insert({
                agent_id: task.agent_id,
                dataset_id: task.dataset_id,
                task_id: task.id,
                ...insight
              })
              .select()
              .single();

            // Evaluate and send alerts for this insight
            if (savedInsight) {
              await evaluateAndSendAlert(savedInsight, task, supabase);
            }
          }
        }

        // Mark task as completed
        await supabase
          .from('agent_tasks')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            result: result as any
          })
          .eq('id', task.id);

        // Log activity
        await supabase
          .from('agent_activity_log')
          .insert({
            agent_id: task.agent_id,
            activity_type: 'completed',
            description: `Completed ${task.task_type} task`,
            metadata: { task_id: task.id, insights_generated: insights.length }
          });

        processedTasks.push(task.id);
        console.log(`Task ${task.id} completed successfully`);

      } catch (taskError) {
        console.error(`Error processing task ${task.id}:`, taskError);
        
        // Mark task as failed
        await supabase
          .from('agent_tasks')
          .update({ 
            status: 'failed',
            error_message: taskError.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', task.id);

        // Log error activity
        await supabase
          .from('agent_activity_log')
          .insert({
            agent_id: task.agent_id,
            activity_type: 'error',
            description: `Failed to process ${task.task_type} task`,
            metadata: { task_id: task.id, error: taskError.message }
          });
      }
    }

    return new Response(JSON.stringify({ 
      message: `Processed ${processedTasks.length} tasks`,
      processed: processedTasks.length,
      task_ids: processedTasks
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const sanitizedError = sanitizeError(error);
    console.error('Error in ai-agent-processor:', sanitizedError);
    return new Response(JSON.stringify({ 
      error: sanitizedError,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processDataAnalysis(task: AgentTask, supabase: any) {
  // Basic data analysis processing
  if (!task.dataset_id) return null;

  const { data: dataset, error } = await supabase
    .from('saved_datasets')
    .select('*')
    .eq('id', task.dataset_id)
    .single();

  if (error || !dataset) return null;

  const data = dataset.data as any[];
  const columns = dataset.columns as any[];

  // Perform basic statistical analysis
  const numericColumns = columns.filter(col => col.type === 'numeric');
  const stats = {};

  for (const col of numericColumns) {
    const values = data.map(row => Number(row[col.name])).filter(val => !isNaN(val));
    if (values.length > 0) {
      const sorted = values.sort((a, b) => a - b);
      stats[col.name] = {
        count: values.length,
        mean: values.reduce((sum, val) => sum + val, 0) / values.length,
        median: sorted[Math.floor(sorted.length / 2)],
        min: Math.min(...values),
        max: Math.max(...values),
        std: calculateStandardDeviation(values)
      };
    }
  }

  return { analysis_type: 'statistical_summary', statistics: stats };
}

async function generateInsightsFromAnalysis(analysisResult: any, task: AgentTask, supabase: any) {
  // Convert statistical analysis results into insights
  if (!analysisResult || !analysisResult.statistics) return [];
  
  const insights = [];
  const stats = analysisResult.statistics;
  
  // Generate insights from statistical analysis
  for (const [columnName, columnStats] of Object.entries(stats)) {
    const stat = columnStats as any;
    
    // Insight about data distribution
    if (stat.std && stat.mean) {
      const variabilityRatio = stat.std / stat.mean;
      if (variabilityRatio > 0.5) {
        insights.push({
          insight_type: 'summary',
          title: `High Variability in ${columnName}`,
          description: `${columnName} shows high variability with a standard deviation of ${stat.std.toFixed(2)}, indicating diverse data points ranging from ${stat.min} to ${stat.max}.`,
          confidence_score: 0.8,
          priority: 6,
          data: { 
            column: columnName, 
            variability_ratio: variabilityRatio,
            statistics: stat
          }
        });
      } else if (variabilityRatio < 0.1) {
        insights.push({
          insight_type: 'summary',
          title: `Low Variability in ${columnName}`,
          description: `${columnName} shows consistent values with low variability (std: ${stat.std.toFixed(2)}), indicating stable data around the mean of ${stat.mean.toFixed(2)}.`,
          confidence_score: 0.8,
          priority: 4,
          data: { 
            column: columnName, 
            variability_ratio: variabilityRatio,
            statistics: stat
          }
        });
      }
    }
    
    // Insight about data range
    if (stat.max && stat.min) {
      const range = stat.max - stat.min;
      insights.push({
        insight_type: 'summary',
        title: `Data Range Analysis for ${columnName}`,
        description: `${columnName} spans a range of ${range.toFixed(2)} units, from ${stat.min} to ${stat.max}, with an average of ${stat.mean.toFixed(2)}.`,
        confidence_score: 0.9,
        priority: 5,
        data: {
          column: columnName,
          range: range,
          statistics: stat
        }
      });
    }
  }
  
  // Overall dataset insight
  const columnCount = Object.keys(stats).length;
  if (columnCount > 0) {
    insights.push({
      insight_type: 'summary',
      title: `Statistical Analysis Complete`,
      description: `Analyzed ${columnCount} numeric columns in your dataset. The analysis reveals patterns in data distribution, variability, and ranges across all measured variables.`,
      confidence_score: 1.0,
      priority: 3,
      data: {
        analyzed_columns: columnCount,
        analysis_type: 'statistical_summary',
        timestamp: new Date().toISOString()
      }
    });
  }
  
  return insights;
}

async function generateInsights(task: AgentTask, supabase: any) {
  // Generate AI-powered insights
  if (!task.dataset_id) return [];

  const { data: dataset } = await supabase
    .from('saved_datasets')
    .select('*')
    .eq('id', task.dataset_id)
    .single();

  if (!dataset) return [];

  const insights = [];
  const data = dataset.data as any[];
  const columns = dataset.columns as any[];

  // Generate sample insights based on data patterns
  const numericColumns = columns.filter(col => col.type === 'numeric');
  
  if (numericColumns.length > 0) {
    const sampleColumn = numericColumns[0];
    const values = data.map(row => Number(row[sampleColumn.name])).filter(val => !isNaN(val));
    
    if (values.length > 0) {
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const trend = values.slice(-10).reduce((sum, val) => sum + val, 0) / Math.min(10, values.length);
      
      if (trend > mean * 1.1) {
        insights.push({
          insight_type: 'trend',
          title: `Upward Trend in ${sampleColumn.name}`,
          description: `${sampleColumn.name} shows an upward trend in recent data points, with recent values averaging ${trend.toFixed(2)} compared to overall mean of ${mean.toFixed(2)}.`,
          confidence_score: 0.75,
          priority: 6,
          data: { column: sampleColumn.name, trend_direction: 'up', recent_average: trend, overall_average: mean }
        });
      }
    }
  }

  return insights;
}

async function detectAnomalies(task: AgentTask, supabase: any) {
  // Detect anomalies in data
  if (!task.dataset_id) return [];

  const { data: dataset } = await supabase
    .from('saved_datasets')
    .select('*')
    .eq('id', task.dataset_id)
    .single();

  if (!dataset) return [];

  const insights = [];
  const data = dataset.data as any[];
  const columns = dataset.columns as any[];

  // Simple anomaly detection using z-score
  const numericColumns = columns.filter(col => col.type === 'numeric');
  
  for (const column of numericColumns) {
    const values = data.map(row => Number(row[column.name])).filter(val => !isNaN(val));
    
    if (values.length > 3) {
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const std = calculateStandardDeviation(values);
      
      const anomalies = values.filter(val => Math.abs(val - mean) > std * 2);
      
      if (anomalies.length > 0) {
        insights.push({
          insight_type: 'anomaly',
          title: `Anomalies Detected in ${column.name}`,
          description: `Found ${anomalies.length} potential anomalies in ${column.name} that deviate significantly from the mean (${mean.toFixed(2)}).`,
          confidence_score: 0.8,
          priority: 7,
          data: { 
            column: column.name, 
            anomaly_count: anomalies.length, 
            mean: mean, 
            std: std,
            anomalous_values: anomalies.slice(0, 5) // Show first 5
          }
        });
      }
    }
  }

  return insights;
}

async function analyzeTrends(task: AgentTask, supabase: any) {
  // Analyze trends in time-series data
  if (!task.dataset_id) return [];

  const { data: dataset } = await supabase
    .from('saved_datasets')
    .select('*')
    .eq('id', task.dataset_id)
    .single();

  if (!dataset) return [];

  const insights = [];
  const data = dataset.data as any[];
  const columns = dataset.columns as any[];

  // Find date columns for trend analysis
  const dateColumns = columns.filter(col => col.type === 'date');
  const numericColumns = columns.filter(col => col.type === 'numeric');

  if (dateColumns.length > 0 && numericColumns.length > 0) {
    const dateColumn = dateColumns[0];
    const numericColumn = numericColumns[0];

    // Sort data by date
    const sortedData = data
      .filter(row => row[dateColumn.name] && row[numericColumn.name])
      .sort((a, b) => new Date(a[dateColumn.name]).getTime() - new Date(b[dateColumn.name]).getTime());

    if (sortedData.length > 2) {
      const firstValue = Number(sortedData[0][numericColumn.name]);
      const lastValue = Number(sortedData[sortedData.length - 1][numericColumn.name]);
      const percentChange = ((lastValue - firstValue) / firstValue) * 100;

      insights.push({
        insight_type: 'trend',
        title: `Time Series Trend Analysis`,
        description: `${numericColumn.name} has ${percentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}% over the time period.`,
        confidence_score: 0.7,
        priority: 5,
        data: {
          date_column: dateColumn.name,
          value_column: numericColumn.name,
          percent_change: percentChange,
          first_value: firstValue,
          last_value: lastValue,
          data_points: sortedData.length
        }
      });
    }
  }

  return insights;
}

async function evaluateAndSendAlert(insight: any, task: AgentTask, supabase: any) {
  try {
    // Get alert configurations for this agent
    const { data: alertConfigs } = await supabase
      .from('agent_alert_configs')
      .select('*')
      .eq('agent_id', task.agent_id)
      .eq('is_enabled', true);

    if (!alertConfigs || alertConfigs.length === 0) {
      return; // No alert configurations
    }

    // Check cooldown period for recent alerts
    const cooldownTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour default
    const { data: recentAlerts } = await supabase
      .from('alert_notifications')
      .select('created_at')
      .eq('agent_id', task.agent_id)
      .eq('alert_type', insight.insight_type)
      .gte('created_at', cooldownTime.toISOString())
      .limit(1);

    if (recentAlerts && recentAlerts.length > 0) {
      console.log(`Alert cooldown active for agent ${task.agent_id}, insight type ${insight.insight_type}`);
      return;
    }

    // Evaluate each alert configuration
    for (const config of alertConfigs) {
      if (shouldTriggerAlert(insight, config)) {
        const channels = [];
        
        if (config.email_enabled) channels.push('email');
        if (config.webhook_enabled && config.webhook_url) channels.push('webhook');

        if (channels.length === 0) continue;

        // Send alert notification
        const alertPayload = {
          agentId: task.agent_id,
          insightId: insight.id,
          alertType: insight.insight_type,
          severity: mapPriorityToSeverity(insight.priority),
          title: insight.title,
          message: insight.description,
          channels,
          webhookUrl: config.webhook_url
        };

        try {
          const response = await supabase.functions.invoke('send-alert-notification', {
            body: alertPayload
          });

          if (response.error) {
            console.error('Failed to send alert:', response.error);
          } else {
            console.log(`Alert sent for insight ${insight.id}`);
          }
        } catch (error) {
          console.error('Error invoking alert function:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error in evaluateAndSendAlert:', error);
  }
}

function shouldTriggerAlert(insight: any, config: any): boolean {
  // Map priority to severity
  const severity = mapPriorityToSeverity(insight.priority);
  
  // Check if insight type matches config
  if (config.alert_type !== 'all' && config.alert_type !== insight.insight_type) {
    return false;
  }

  // Check severity threshold
  const severityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
  const insightSeverityLevel = severityOrder[severity] || 1;
  const thresholdLevel = severityOrder[config.severity_threshold] || 2;

  if (insightSeverityLevel < thresholdLevel) {
    return false;
  }

  // Check specific thresholds based on insight type
  const thresholds = config.thresholds || {};
  
  switch (insight.insight_type) {
    case 'anomaly':
      const anomalyCount = insight.data?.anomaly_count || 0;
      return anomalyCount >= (thresholds.min_anomalies || 1);
      
    case 'trend':
      const percentChange = Math.abs(insight.data?.percent_change || 0);
      return percentChange >= (thresholds.min_trend_change || 10);
      
    case 'data_quality_issue':
      const affectedRows = insight.data?.affected_rows || 0;
      const totalRows = insight.data?.total_rows || 1;
      const affectedPercentage = (affectedRows / totalRows) * 100;
      return affectedPercentage >= (thresholds.min_affected_percentage || 5);
      
    default:
      return true; // Default: trigger for all insights if severity matches
  }
}

function mapPriorityToSeverity(priority: number): string {
  if (priority >= 8) return 'high';
  if (priority >= 6) return 'medium';
  return 'low';
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

async function processReportGeneration(task: AgentTask, supabase: any, dataContext: any) {
  const insights = [];
  
  try {
    const { templateId, scheduleId } = task.parameters;
    
    // Fetch template configuration
    const { data: template, error: templateError } = await supabase
      .from('report_templates')
      .select('*')
      .eq('id', templateId)
      .single();
        
    if (templateError || !template) {
      throw new Error(`Failed to fetch template: ${templateError?.message || 'Template not found'}`);
    }
    
    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from('report_executions')
      .insert({
        template_id: templateId,
        schedule_id: scheduleId,
        user_id: template.user_id,
        status: 'processing'
      })
      .select()
      .single();
        
    if (executionError) {
      throw new Error(`Failed to create execution record: ${executionError.message}`);
    }
    
    const startTime = Date.now();
    
    // Get dataset if specified
    let dataset = null;
    if (template.source_dataset_id) {
      const { data: datasetData } = await supabase
        .from('saved_datasets')
        .select('*')
        .eq('id', template.source_dataset_id)
        .single();
      dataset = datasetData;
    } else if (dataContext) {
      dataset = {
        data: dataContext.data,
        columns: dataContext.columns,
        name: dataContext.fileName || 'Dataset'
      };
    }
    
    if (!dataset) {
      throw new Error('No dataset available for report generation');
    }
    
    // Generate report based on template type
    let reportContent;
    let fileName;
    let contentType;
    
    if (template.template_type === 'excel') {
      const result = await generateExcelReport(template, dataset);
      reportContent = result.content;
      fileName = `${template.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (template.template_type === 'pdf') {
      const result = await generatePDFReport(template, dataset);
      reportContent = result.content;
      fileName = `${template.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      contentType = 'application/pdf';
    } else {
      const result = await generateCSVReport(template, dataset);
      reportContent = result.content;
      fileName = `${template.name}_${new Date().toISOString().split('T')[0]}.csv`;
      contentType = 'text/csv';
    }
    
    // Store file in Supabase storage
    const filePath = `${template.user_id}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(filePath, reportContent, {
        contentType: contentType,
        upsert: true
      });
        
    if (uploadError) {
      throw new Error(`Failed to upload report: ${uploadError.message}`);
    }
    
    const generationTime = Date.now() - startTime;
    
    // Update execution record
    await supabase
      .from('report_executions')
      .update({
        status: 'completed',
        file_path: filePath,
        file_size: typeof reportContent === 'string' ? reportContent.length : reportContent.byteLength,
        generation_time_ms: generationTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', execution.id);
    
    // Update metrics
    await updateReportMetrics(templateId, true, generationTime, supabase);
    
    insights.push({
      insight_type: 'report_generated',
      title: 'Report Generated Successfully',
      description: `${template.name} report has been generated and saved successfully.`,
      confidence_score: 1.0,
      priority: 5,
      data: {
        templateName: template.name,
        fileName,
        filePath,
        generationTimeMs: generationTime,
        fileSize: typeof reportContent === 'string' ? reportContent.length : reportContent.byteLength,
        templateType: template.template_type
      }
    });
    
  } catch (error) {
    console.error('Report generation failed:', error);
    
    // Update execution record with error
    if (task.parameters?.templateId) {
      await supabase
        .from('report_executions')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('template_id', task.parameters.templateId)
        .eq('status', 'processing');
        
      // Update metrics
      await updateReportMetrics(task.parameters.templateId, false, 0, supabase);
    }
    
    insights.push({
      insight_type: 'report_error',
      title: 'Report Generation Failed',
      description: `Failed to generate report: ${error.message}`,
      confidence_score: 1.0,
      priority: 8,
      data: {
        error: error.message,
        templateId: task.parameters?.templateId
      }
    });
  }
  
  return insights;
}

async function generateExcelReport(template: any, dataset: any) {
  // Simple CSV-like content for now (could be enhanced with proper Excel generation)
  const data = dataset.data || [];
  const columns = dataset.columns || [];
  
  let csvContent = columns.map(col => col.name || col).join(',') + '\n';
  
  for (const row of data) {
    const rowValues = columns.map(col => {
      const value = row[col.name || col];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    });
    csvContent += rowValues.join(',') + '\n';
  }
  
  // Apply transformations if specified
  if (template.transformations && template.transformations.length > 0) {
    // Could add transformation logic here
  }
  
  return {
    content: new TextEncoder().encode(csvContent),
    contentType: 'text/csv'
  };
}

async function generatePDFReport(template: any, dataset: any) {
  // Simple text-based PDF content (could be enhanced with proper PDF generation)
  const data = dataset.data || [];
  const columns = dataset.columns || [];
  
  let content = `Report: ${template.name}\n`;
  content += `Generated: ${new Date().toLocaleString()}\n\n`;
  content += `Dataset: ${dataset.name}\n`;
  content += `Records: ${data.length}\n`;
  content += `Columns: ${columns.length}\n\n`;
  
  // Add summary statistics
  for (const col of columns.slice(0, 5)) { // First 5 columns
    const colName = col.name || col;
    const values = data.map(row => row[colName]).filter(v => v != null);
    content += `${colName}: ${values.length} values\n`;
  }
  
  return {
    content: new TextEncoder().encode(content),
    contentType: 'text/plain'
  };
}

async function generateCSVReport(template: any, dataset: any) {
  const data = dataset.data || [];
  const columns = dataset.columns || [];
  
  let csvContent = columns.map(col => col.name || col).join(',') + '\n';
  
  for (const row of data) {
    const rowValues = columns.map(col => {
      const value = row[col.name || col];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    });
    csvContent += rowValues.join(',') + '\n';
  }
  
  return {
    content: csvContent,
    contentType: 'text/csv'
  };
}

async function updateReportMetrics(templateId: string, success: boolean, generationTime: number, supabase: any) {
  try {
    // Get current metrics or create new
    const { data: currentMetrics } = await supabase
      .from('report_metrics')
      .select('*')
      .eq('template_id', templateId)
      .single();
    
    if (currentMetrics) {
      // Update existing metrics
      const newTotalRuns = currentMetrics.total_runs + 1;
      const newSuccessfulRuns = currentMetrics.successful_runs + (success ? 1 : 0);
      const newFailedRuns = currentMetrics.failed_runs + (success ? 0 : 1);
      const newAvgTime = success 
        ? Math.round((currentMetrics.avg_generation_time_ms * currentMetrics.successful_runs + generationTime) / newSuccessfulRuns)
        : currentMetrics.avg_generation_time_ms;
      
      await supabase
        .from('report_metrics')
        .update({
          total_runs: newTotalRuns,
          successful_runs: newSuccessfulRuns,
          failed_runs: newFailedRuns,
          avg_generation_time_ms: newAvgTime,
          last_run_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('template_id', templateId);
    } else {
      // Create new metrics record
      const { data: template } = await supabase
        .from('report_templates')
        .select('user_id')
        .eq('id', templateId)
        .single();
      
      if (template) {
        await supabase
          .from('report_metrics')
          .insert({
            template_id: templateId,
            user_id: template.user_id,
            total_runs: 1,
            successful_runs: success ? 1 : 0,
            failed_runs: success ? 0 : 1,
            avg_generation_time_ms: success ? generationTime : 0,
            last_run_at: new Date().toISOString()
          });
      }
    }
  } catch (error) {
    console.error('Failed to update report metrics:', error);
  }
}
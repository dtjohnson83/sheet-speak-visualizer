import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const xaiApiKey = Deno.env.get('XAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get pending agent tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('agent_tasks')
      .select(`
        *,
        ai_agents!inner(*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .limit(5);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw tasksError;
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
          default:
            console.log(`Unknown task type: ${task.task_type}`);
        }

        // Save insights if generated
        if (insights.length > 0) {
          for (const insight of insights) {
            await supabase
              .from('agent_insights')
              .insert({
                agent_id: task.agent_id,
                dataset_id: task.dataset_id,
                task_id: task.id,
                ...insight
              });
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
    console.error('Error in ai-agent-processor:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
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

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}
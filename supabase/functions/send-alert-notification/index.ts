import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from 'npm:resend@4.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertNotificationRequest {
  agentId: string;
  insightId?: string;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  channels: string[];
  webhookUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const {
      agentId,
      insightId,
      alertType,
      severity,
      title,
      message,
      channels,
      webhookUrl
    }: AlertNotificationRequest = await req.json();

    console.log(`Processing alert notification for agent ${agentId}`);

    // Get agent and user information
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select(`
        *,
        profiles!inner(email, full_name)
      `)
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error(`Agent not found: ${agentError?.message}`);
    }

    // Get user alert preferences
    const { data: preferences } = await supabase
      .from('user_alert_preferences')
      .select('*')
      .eq('user_id', agent.user_id)
      .single();

    const deliveryStatus: Record<string, string> = {};
    const deliveredChannels: string[] = [];

    // Send email notification
    if (channels.includes('email') && preferences?.email_enabled && resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🚨 ${severity.toUpperCase()} Alert</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">From your AI Agent: ${agent.name}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
              <h2 style="color: #495057; margin-top: 0;">${title}</h2>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid ${severity === 'high' ? '#dc3545' : severity === 'medium' ? '#fd7e14' : '#0d6efd'};">
                <p style="margin: 0; color: #495057; line-height: 1.6;">${message}</p>
              </div>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <p style="margin: 0; font-size: 14px; color: #6c757d;">
                  Alert Type: <strong>${alertType}</strong> | 
                  Severity: <strong style="color: ${severity === 'high' ? '#dc3545' : severity === 'medium' ? '#fd7e14' : '#0d6efd'};">${severity}</strong>
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #adb5bd;">
                  Generated at ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        `;

        const { error: emailError } = await resend.emails.send({
          from: 'AI Alerts <alerts@yourdomain.com>',
          to: [agent.profiles.email],
          subject: `🚨 ${severity.toUpperCase()} Alert: ${title}`,
          html: emailHtml,
        });

        if (emailError) {
          throw emailError;
        }

        deliveryStatus.email = 'sent';
        deliveredChannels.push('email');
        console.log(`Email alert sent to ${agent.profiles.email}`);
      } catch (emailError) {
        console.error('Email delivery failed:', emailError);
        deliveryStatus.email = 'failed';
      }
    }

    // Send webhook notification
    if (channels.includes('webhook') && webhookUrl) {
      try {
        const webhookPayload = {
          agentId,
          agentName: agent.name,
          alertType,
          severity,
          title,
          message,
          timestamp: new Date().toISOString(),
          insightId
        };

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'AI-Agent-Alerts/1.0'
          },
          body: JSON.stringify(webhookPayload),
        });

        if (!webhookResponse.ok) {
          throw new Error(`Webhook returned ${webhookResponse.status}`);
        }

        deliveryStatus.webhook = 'sent';
        deliveredChannels.push('webhook');
        console.log(`Webhook alert sent to ${webhookUrl}`);
      } catch (webhookError) {
        console.error('Webhook delivery failed:', webhookError);
        deliveryStatus.webhook = 'failed';
      }
    }

    // Save notification record
    const { error: notificationError } = await supabase
      .from('alert_notifications')
      .insert({
        agent_id: agentId,
        insight_id: insightId,
        alert_type: alertType,
        severity,
        title,
        message,
        notification_channels: channels,
        delivery_status: deliveryStatus,
        delivered_at: deliveredChannels.length > 0 ? new Date().toISOString() : null
      });

    if (notificationError) {
      console.error('Failed to save notification record:', notificationError);
    }

    return new Response(JSON.stringify({
      success: true,
      delivered_channels: deliveredChannels,
      delivery_status: deliveryStatus,
      message: `Alert sent via ${deliveredChannels.join(', ') || 'no channels'}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-alert-notification:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
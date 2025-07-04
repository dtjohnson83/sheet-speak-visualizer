-- Add email_address column to agent_alert_configs table
ALTER TABLE agent_alert_configs 
ADD COLUMN email_address TEXT;
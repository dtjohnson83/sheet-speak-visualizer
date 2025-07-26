-- Phase 1: Emergency Cleanup - Remove Duplicates First

-- Clear the massive task backlog completely to start fresh
DELETE FROM agent_tasks 
WHERE status = 'pending';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status_scheduled 
ON agent_tasks (status, scheduled_at) 
WHERE status IN ('pending', 'running');

-- Add index for user-based queries
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_lookup 
ON agent_tasks (agent_id, created_at DESC);

-- Add unique constraint to prevent duplicate agent-dataset-task combinations for pending tasks
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_tasks_unique_pending 
ON agent_tasks (agent_id, dataset_id, task_type) 
WHERE status = 'pending';
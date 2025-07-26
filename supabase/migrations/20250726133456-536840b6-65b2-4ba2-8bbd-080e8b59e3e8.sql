-- Phase 1: Emergency Cleanup and Add Constraints

-- First, clear the massive task backlog (keep only recent manual tasks)
DELETE FROM agent_tasks 
WHERE status = 'pending' 
AND (
  parameters->>'auto_scheduled' = 'true' 
  OR created_at < NOW() - INTERVAL '1 hour'
);

-- Add unique constraint to prevent duplicate agent-dataset-task combinations for pending tasks
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_tasks_unique_pending 
ON agent_tasks (agent_id, dataset_id, task_type) 
WHERE status = 'pending';

-- Add index for better performance on task queries
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status_scheduled 
ON agent_tasks (status, scheduled_at) 
WHERE status IN ('pending', 'running');

-- Add index for user-based queries
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_lookup 
ON agent_tasks (agent_id, created_at DESC);

-- Add check constraint to prevent too many pending tasks per agent
ALTER TABLE agent_tasks 
ADD CONSTRAINT IF NOT EXISTS check_reasonable_task_count 
CHECK (
  (SELECT COUNT(*) FROM agent_tasks at2 
   WHERE at2.agent_id = agent_tasks.agent_id 
   AND at2.status = 'pending') < 100
);
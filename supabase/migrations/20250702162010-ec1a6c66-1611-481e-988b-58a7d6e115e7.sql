-- Enable realtime for agent tables
ALTER TABLE public.agent_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.agent_insights REPLICA IDENTITY FULL;
ALTER TABLE public.ai_agents REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_agents;
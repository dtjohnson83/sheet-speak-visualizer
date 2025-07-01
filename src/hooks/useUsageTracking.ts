import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface UsageData {
  usesRemaining: number;
  totalUses: number;
  isLoading: boolean;
}

export const useUsageTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [usage, setUsage] = useState<UsageData>({
    usesRemaining: 0,
    totalUses: 0,
    isLoading: true
  });

  const fetchUsage = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_usage_tracking')
        .select('uses_remaining, total_uses')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching usage:', error);
        return;
      }

      if (data) {
        setUsage({
          usesRemaining: data.uses_remaining,
          totalUses: data.total_uses,
          isLoading: false
        });
      } else {
        // Initialize usage tracking for new user
        const { data: newUsage, error: insertError } = await supabase
          .from('user_usage_tracking')
          .insert({
            user_id: user.id,
            uses_remaining: 3,
            total_uses: 0
          })
          .select('uses_remaining, total_uses')
          .single();

        if (insertError) {
          console.error('Error initializing usage:', insertError);
          return;
        }

        if (newUsage) {
          setUsage({
            usesRemaining: newUsage.uses_remaining,
            totalUses: newUsage.total_uses,
            isLoading: false
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchUsage:', error);
      setUsage(prev => ({ ...prev, isLoading: false }));
    }
  };

  const decrementUsage = async (): Promise<boolean> => {
    if (!user) return false;

    // Admins have unlimited usage
    if (isAdmin) {
      return true;
    }

    if (usage.usesRemaining <= 0) {
      toast({
        title: "Usage Limit Reached",
        description: "You've reached your free usage limit. Please upgrade to continue using AI features.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_usage_tracking')
        .update({
          uses_remaining: usage.usesRemaining - 1,
          total_uses: usage.totalUses + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select('uses_remaining, total_uses')
        .single();

      if (error) {
        console.error('Error updating usage:', error);
        toast({
          title: "Error",
          description: "Failed to update usage. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      if (data) {
        setUsage(prev => ({
          ...prev,
          usesRemaining: data.uses_remaining,
          totalUses: data.total_uses
        }));

        if (data.uses_remaining === 0) {
          toast({
            title: "Usage Limit Reached",
            description: "You've used all your free AI interactions. Upgrade to continue using AI features.",
            variant: "destructive",
          });
        } else if (data.uses_remaining === 1) {
          toast({
            title: "Almost at limit",
            description: "You have 1 AI interaction remaining in your free tier.",
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error in decrementUsage:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [user]);

  return {
    ...usage,
    isAdmin,
    isLoading: usage.isLoading || roleLoading,
    decrementUsage,
    refreshUsage: fetchUsage
  };
};
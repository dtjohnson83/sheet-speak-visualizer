import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'user' | 'admin';

interface UserRoleData {
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export const useUserRole = () => {
  const { user } = useAuth();
  const [roleData, setRoleData] = useState<UserRoleData>({
    role: null,
    isAdmin: false,
    isLoading: true
  });

  const fetchUserRole = async () => {
    if (!user) {
      setRoleData({ role: null, isAdmin: false, isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        return;
      }

      const role = data?.role as UserRole || 'user';
      setRoleData({
        role,
        isAdmin: role === 'admin',
        isLoading: false
      });
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setRoleData({ role: 'user', isAdmin: false, isLoading: false });
    }
  };

  const promoteToAdmin = async (userId: string): Promise<boolean> => {
    try {
      // Security check: Only admins can promote others (except first admin case)
      if (!roleData.isAdmin) {
        // Check if there are any existing admins
        const { data: existingAdmins, error: adminCheckError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('role', 'admin')
          .limit(1);

        if (adminCheckError) {
          console.error('Error checking for existing admins:', adminCheckError);
          return false;
        }

        // Only allow self-promotion if no admins exist and user is promoting themselves
        if (existingAdmins && existingAdmins.length > 0) {
          console.error('Unauthorized: Only admins can promote users');
          return false;
        }

        if (userId !== user?.id) {
          console.error('Unauthorized: Can only self-promote when no admins exist');
          return false;
        }
      }

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'admin'
        });

      if (error) {
        console.error('Error promoting user to admin:', error);
        return false;
      }

      // Log to audit table
      try {
        await supabase
          .from('user_role_audit_log')
          .insert({
            user_id: userId,
            promoted_by: user?.id,
            action: 'promote_to_admin'
          });
        console.log(`Role change: User ${userId} promoted to admin by ${user?.id}`);
      } catch (err) {
        console.warn('Failed to log role change:', err);
      }

      // Refresh current user's role if they promoted themselves
      if (userId === user?.id) {
        await fetchUserRole();
      }

      return true;
    } catch (error) {
      console.error('Error in promoteToAdmin:', error);
      return false;
    }
  };

  const removeAdminRole = async (userId: string): Promise<boolean> => {
    try {
      // Security check: Only admins can remove admin roles
      if (!roleData.isAdmin) {
        console.error('Unauthorized: Only admins can remove admin roles');
        return false;
      }

      // Prevent removing the last admin (except self-demotion)
      if (userId !== user?.id) {
        const { data: adminCount, error: countError } = await supabase
          .from('user_roles')
          .select('id', { count: 'exact' })
          .eq('role', 'admin');

        if (countError) {
          console.error('Error checking admin count:', countError);
          return false;
        }

        if ((adminCount?.length || 0) <= 1) {
          console.error('Cannot remove the last admin');
          return false;
        }
      }

      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'user' })
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        console.error('Error removing admin role:', error);
        return false;
      }

      // Log to audit table
      try {
        await supabase
          .from('user_role_audit_log')
          .insert({
            user_id: userId,
            promoted_by: user?.id,
            action: 'remove_admin_role'
          });
        console.log(`Role change: Admin role removed from user ${userId} by ${user?.id}`);
      } catch (err) {
        console.warn('Failed to log role change:', err);
      }

      // Refresh current user's role if they demoted themselves
      if (userId === user?.id) {
        await fetchUserRole();
      }

      return true;
    } catch (error) {
      console.error('Error in removeAdminRole:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [user]);

  return {
    ...roleData,
    promoteToAdmin,
    removeAdminRole,
    refreshRole: fetchUserRole
  };
};
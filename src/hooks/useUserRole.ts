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
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'user' })
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        console.error('Error removing admin role:', error);
        return false;
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
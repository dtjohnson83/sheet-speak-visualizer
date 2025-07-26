import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Shield, UserPlus, Users, Settings, AlertTriangle, Lock } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  uses_remaining: number;
  total_uses: number;
}

export const AdminPanel = () => {
  const { user } = useAuth();
  const { isAdmin, promoteToAdmin } = useUserRole();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [promotingUserId, setPromotingUserId] = useState<string>('');

  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      // Fetch all users with their roles and usage data
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name
        `);

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const { data: usage } = await supabase
        .from('user_usage_tracking')
        .select('user_id, uses_remaining, total_uses');

      if (profiles) {
        const usersData = profiles.map(profile => {
          const userRole = roles?.find(r => r.user_id === profile.id);
          const userUsage = usage?.find(u => u.user_id === profile.id);
          
          return {
            ...profile,
            role: userRole?.role || 'user',
            uses_remaining: userUsage?.uses_remaining || 0,
            total_uses: userUsage?.total_uses || 0
          };
        });
        
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users data.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handlePromoteUser = async (userId: string, userEmail: string) => {
    const success = await promoteToAdmin(userId);
    if (success) {
      toast({
        title: "Success",
        description: `${userEmail} promoted to admin successfully.`,
      });
      fetchUsers(); // Refresh the list
      
      // Log the promotion for security audit
      console.log(`SECURITY AUDIT: User ${userEmail} (${userId}) promoted to admin by ${user?.email} (${user?.id})`);
    } else {
      toast({
        title: "Error",
        description: "Failed to promote user to admin. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handlePromoteCurrentUser = async () => {
    if (!user) return;
    
    const success = await promoteToAdmin(user.id);
    if (success) {
      toast({
        title: "Success",
        description: "You are now an admin!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to promote to admin.",
        variant: "destructive",
      });
    }
  };

  const resetUserUsage = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase
        .from('user_usage_tracking')
        .update({ uses_remaining: 3, total_uses: 0 })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Usage reset for ${userEmail}.`,
      });
      fetchUsers();
      
      // Log the usage reset for security audit
      console.log(`SECURITY AUDIT: Usage reset for user ${userEmail} (${userId}) by ${user?.email} (${user?.id})`);
    } catch (error) {
      console.error('Error resetting usage:', error);
      toast({
        title: "Error",
        description: "Failed to reset user usage.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            You need admin privileges to access this panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to promote yourself to admin for testing purposes.
            </p>
            <Button 
              onClick={handlePromoteCurrentUser}
              className="w-full"
              variant="outline"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Make Me Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Dashboard
          </CardTitle>
          <CardDescription>
            Manage users and their AI usage limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">Admin Access</Badge>
            <span className="text-sm text-muted-foreground">
              You have unlimited AI usage
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            View and manage all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={fetchUsers} disabled={loading}>
              <Settings className="h-4 w-4 mr-2" />
              Refresh Users
            </Button>
            
            <div className="space-y-2">
              {users.map((userData) => (
                <div key={userData.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{userData.full_name || userData.email}</div>
                    <div className="text-sm text-muted-foreground">{userData.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={userData.role === 'admin' ? 'default' : 'secondary'}>
                        {userData.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {userData.uses_remaining} uses remaining | {userData.total_uses} total uses
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {userData.role !== 'admin' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-amber-600 border-amber-200 hover:bg-amber-50"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Make Admin
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                              Promote User to Admin
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              You are about to promote <strong>{userData.email}</strong> to admin status. 
                              This will give them full access to the admin panel and the ability to manage other users.
                              <br /><br />
                              <span className="text-red-600 font-medium">This action cannot be undone without admin intervention.</span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handlePromoteUser(userData.id, userData.email)}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Confirm Promotion
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          Reset Usage
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset User Usage</AlertDialogTitle>
                          <AlertDialogDescription>
                            Reset AI usage for <strong>{userData.email}</strong>? This will:
                            <br />• Set their remaining uses to 3
                            <br />• Reset their total usage count to 0
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => resetUserUsage(userData.id, userData.email)}
                          >
                            Reset Usage
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
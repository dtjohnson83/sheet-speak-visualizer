import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Eye, Activity, Clock, User } from 'lucide-react';

interface SecurityEvent {
  id: string;
  user_id: string;
  promoted_by: string;
  action: string;
  created_at: string;
}

interface SecurityMetrics {
  totalAdmins: number;
  recentPromotions: number;
  totalUsers: number;
  recentActivity: SecurityEvent[];
}

export const SecurityDashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalAdmins: 0,
    recentPromotions: 0,
    totalUsers: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(false);

  const fetchSecurityMetrics = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      // Get total admin count
      const { data: adminRoles, error: adminError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin');

      // Get total user count
      const { data: allRoles, error: userError } = await supabase
        .from('user_roles')
        .select('id');

      // Get recent role changes from audit log
      const { data: auditLogs, error: auditError } = await supabase
        .from('user_role_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (adminError || userError) {
        console.error('Error fetching security metrics:', { adminError, userError });
        return;
      }

      // Calculate recent promotions (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentPromotions = auditLogs?.filter(log => 
        log.action === 'promote_to_admin' && 
        new Date(log.created_at) > weekAgo
      ).length || 0;

      setMetrics({
        totalAdmins: adminRoles?.length || 0,
        recentPromotions,
        totalUsers: allRoles?.length || 0,
        recentActivity: auditLogs || []
      });
    } catch (error) {
      console.error('Error fetching security metrics:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSecurityMetrics();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Admin privileges required to view security dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
          <CardDescription>
            Monitor security events and user management activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchSecurityMetrics} disabled={loading} className="mb-4">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Metrics
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Total Admins</span>
                </div>
                <div className="text-2xl font-bold">{metrics.totalAdmins}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Total Users</span>
                </div>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium">Recent Promotions (7d)</span>
                </div>
                <div className="text-2xl font-bold">{metrics.recentPromotions}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Security Activity
          </CardTitle>
          <CardDescription>
            Latest role changes and administrative actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent security activity recorded
              </p>
            ) : (
              metrics.recentActivity.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {event.action === 'promote_to_admin' ? (
                        <Shield className="h-4 w-4 text-amber-600" />
                      ) : (
                        <User className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="text-sm font-medium">
                        {event.action === 'promote_to_admin' ? 'Admin Promotion' : 'Role Change'}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {event.action.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(event.created_at).toLocaleDateString()} {new Date(event.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {metrics.recentPromotions > 2 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> {metrics.recentPromotions} admin promotions in the last 7 days. 
            This is higher than normal and should be reviewed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
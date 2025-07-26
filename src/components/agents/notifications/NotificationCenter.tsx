import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  TrendingUp,
  Download,
  X,
  CheckSquare
} from 'lucide-react';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'task_completed' | 'insight_generated' | 'report_ready' | 'agent_error' | 'schedule_reminder';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  metadata?: {
    agentId?: string;
    taskId?: string;
    insightId?: string;
    reportPath?: string;
    downloadUrl?: string;
  };
}

export const NotificationCenter = () => {
  const { user } = useAuth();
  const { tasks, insights, markInsightRead } = useAIAgents();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate notifications from tasks and insights
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];

      // Recent completed tasks (last 24 hours)
      const recentCompletedTasks = tasks.filter(task => 
        task.status === 'completed' && 
        new Date(task.updated_at || task.created_at).getTime() > Date.now() - 24*60*60*1000
      );

      recentCompletedTasks.forEach(task => {
        newNotifications.push({
          id: `task-${task.id}`,
          type: 'task_completed',
          title: 'Task Completed',
          message: `${task.task_type.replace('_', ' ')} task finished successfully`,
          timestamp: new Date(task.updated_at || task.created_at),
          isRead: false,
          metadata: { taskId: task.id, agentId: task.agent_id }
        });
      });

      // Recent failed tasks
      const recentFailedTasks = tasks.filter(task => 
        task.status === 'failed' && 
        new Date(task.updated_at || task.created_at).getTime() > Date.now() - 24*60*60*1000
      );

      recentFailedTasks.forEach(task => {
        newNotifications.push({
          id: `task-error-${task.id}`,
          type: 'agent_error',
          title: 'Task Failed',
          message: `${task.task_type.replace('_', ' ')} task encountered an error`,
          timestamp: new Date(task.updated_at || task.created_at),
          isRead: false,
          metadata: { taskId: task.id, agentId: task.agent_id }
        });
      });

      // New insights (unread)
      const unreadInsights = insights.filter(insight => !insight.is_read);
      unreadInsights.forEach(insight => {
        newNotifications.push({
          id: `insight-${insight.id}`,
          type: 'insight_generated',
          title: 'New Insight Generated',
          message: insight.title,
          timestamp: new Date(insight.created_at),
          isRead: false,
          metadata: { insightId: insight.id, agentId: insight.agent_id }
        });
      });

      // Sort by timestamp (newest first)
      newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.isRead).length);
    };

    generateNotifications();
  }, [tasks, insights]);

  // Real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const tasksChannel = supabase
      .channel('notification-tasks')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agent_tasks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new.status === 'completed') {
            toast({
              title: "Task Completed! ✅",
              description: `${payload.new.task_type.replace('_', ' ')} finished successfully`,
            });
          } else if (payload.new.status === 'failed') {
            toast({
              title: "Task Failed ❌",
              description: `${payload.new.task_type.replace('_', ' ')} encountered an error`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    const insightsChannel = supabase
      .channel('notification-insights')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_insights',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          toast({
            title: "New Insight! 💡",
            description: payload.new.title,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(insightsChannel);
    };
  }, [user?.id, toast]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - (notifications.find(n => n.id === notificationId && !n.isRead) ? 1 : 0)));
  };

  const handleNotificationClick = async (notification: Notification) => {
    markAsRead(notification.id);
    
    // Handle specific actions based on notification type
    if (notification.type === 'insight_generated' && notification.metadata?.insightId) {
      await markInsightRead(notification.metadata.insightId);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'insight_generated': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'report_ready': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'agent_error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-muted-foreground hover:text-foreground"
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No notifications yet</p>
              <p className="text-sm text-muted-foreground">
                You'll receive updates when agents complete tasks or generate insights
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer border-b transition-colors ${
                    !notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {notification.metadata?.downloadUrl && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(notification.metadata.downloadUrl, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
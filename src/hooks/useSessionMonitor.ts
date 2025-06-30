
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useSessionMonitor = () => {
  const { user, signOut } = useAuth();
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const WARNING_TIME = 25 * 60 * 1000; // 25 minutes

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      warningShownRef.current = false;
    };

    const checkSession = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;

      if (timeSinceActivity >= SESSION_TIMEOUT) {
        toast.error('Session expired. Please sign in again.');
        signOut();
      } else if (timeSinceActivity >= WARNING_TIME && !warningShownRef.current) {
        warningShownRef.current = true;
        toast.warning('Your session will expire in 5 minutes due to inactivity.');
      }
    };

    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check session every minute
    const interval = setInterval(checkSession, 60000);

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(interval);
    };
  }, [user, signOut]);
};

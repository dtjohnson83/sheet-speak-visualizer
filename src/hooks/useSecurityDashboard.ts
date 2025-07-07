import { useState, useEffect, useCallback } from 'react';
import { useSecurityTesting } from './useSecurityTesting';
import { useAuditLogger } from './useAuditLogger';
import { logger } from '@/lib/logger';

interface SecurityDashboardData {
  overallScore: number;
  lastTestRun: number;
  recentThreats: number;
  activeSessions: number;
  criticalIssues: number;
  testResults: any[];
  isLoading: boolean;
}

interface SecurityAlert {
  id: string;
  type: 'security' | 'audit' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
}

export const useSecurityDashboard = () => {
  const { runSecurityTests, isRunning } = useSecurityTesting();
  const { logSecurityEvent } = useAuditLogger();
  
  const [dashboardData, setDashboardData] = useState<SecurityDashboardData>({
    overallScore: 0,
    lastTestRun: 0,
    recentThreats: 0,
    activeSessions: 1,
    criticalIssues: 0,
    testResults: [],
    isLoading: false
  });

  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-scan functionality
  useEffect(() => {
    if (!autoScanEnabled) return;

    const autoScanInterval = setInterval(() => {
      performAutomatedSecurityScan();
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => clearInterval(autoScanInterval);
  }, [autoScanEnabled]);

  const loadDashboardData = useCallback(async () => {
    setDashboardData(prev => ({ ...prev, isLoading: true }));

    try {
      // Load previous test results from localStorage
      const savedResults = localStorage.getItem('security-test-results');
      const savedData = savedResults ? JSON.parse(savedResults) : null;

      if (savedData) {
        setDashboardData(prev => ({
          ...prev,
          overallScore: savedData.overallScore || 0,
          lastTestRun: savedData.timestamp || 0,
          criticalIssues: savedData.criticalIssues || 0,
          testResults: savedData.results || [],
          isLoading: false
        }));
      } else {
        setDashboardData(prev => ({ ...prev, isLoading: false }));
      }

      // Load security alerts
      const savedAlerts = localStorage.getItem('security-alerts');
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }

      logSecurityEvent('dashboard_loaded', 'low');
    } catch (error) {
      logger.error('Failed to load dashboard data', { error });
      setDashboardData(prev => ({ ...prev, isLoading: false }));
    }
  }, [logSecurityEvent]);

  const performManualSecurityScan = useCallback(async () => {
    logSecurityEvent('manual_security_scan_started', 'low');
    
    try {
      const results = await runSecurityTests();
      
      const newDashboardData = {
        overallScore: results.overallScore,
        lastTestRun: Date.now(),
        recentThreats: results.criticalIssues + results.highIssues,
        activeSessions: 1, // Would be dynamic in real implementation
        criticalIssues: results.criticalIssues,
        testResults: results.results,
        isLoading: false
      };

      setDashboardData(newDashboardData);

      // Save results to localStorage
      localStorage.setItem('security-test-results', JSON.stringify({
        ...newDashboardData,
        results: results.results,
        timestamp: Date.now()
      }));

      // Generate alerts for critical issues
      if (results.criticalIssues > 0 || results.highIssues > 0) {
        const newAlert: SecurityAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'security',
          severity: results.criticalIssues > 0 ? 'critical' : 'high',
          message: `Security scan found ${results.criticalIssues} critical and ${results.highIssues} high severity issues`,
          timestamp: Date.now(),
          resolved: false
        };
        
        addAlert(newAlert);
      }

      logSecurityEvent('manual_security_scan_completed', 'low', {
        overallScore: results.overallScore,
        criticalIssues: results.criticalIssues,
        highIssues: results.highIssues
      });

      return results;
    } catch (error) {
      logger.error('Security scan failed', { error });
      throw error;
    }
  }, [runSecurityTests, logSecurityEvent]);

  const performAutomatedSecurityScan = useCallback(async () => {
    logSecurityEvent('automated_security_scan_started', 'low');
    
    try {
      const results = await runSecurityTests();
      
      // Only update dashboard if there are significant changes
      const currentScore = dashboardData.overallScore;
      const scoreDifference = Math.abs(results.overallScore - currentScore);
      
      if (scoreDifference >= 10 || results.criticalIssues > 0) {
        setDashboardData(prev => ({
          ...prev,
          overallScore: results.overallScore,
          lastTestRun: Date.now(),
          criticalIssues: results.criticalIssues,
          testResults: results.results
        }));

        localStorage.setItem('security-test-results', JSON.stringify({
          overallScore: results.overallScore,
          criticalIssues: results.criticalIssues,
          results: results.results,
          timestamp: Date.now()
        }));

        // Alert for score degradation or critical issues
        if (results.overallScore < currentScore - 15 || results.criticalIssues > 0) {
          const newAlert: SecurityAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'security',
            severity: results.criticalIssues > 0 ? 'critical' : 'high',
            message: `Automated scan detected security degradation - Score: ${results.overallScore}%`,
            timestamp: Date.now(),
            resolved: false
          };
          
          addAlert(newAlert);
        }
      }

      logSecurityEvent('automated_security_scan_completed', 'low', {
        overallScore: results.overallScore,
        scoreDifference,
        criticalIssues: results.criticalIssues
      });
    } catch (error) {
      logger.error('Automated security scan failed', { error });
    }
  }, [runSecurityTests, logSecurityEvent, dashboardData.overallScore]);

  const addAlert = useCallback((alert: SecurityAlert) => {
    setAlerts(prev => {
      const newAlerts = [alert, ...prev.slice(0, 49)]; // Keep only last 50 alerts
      localStorage.setItem('security-alerts', JSON.stringify(newAlerts));
      return newAlerts;
    });

    logSecurityEvent('security_alert_generated', alert.severity as any, {
      alertId: alert.id,
      alertType: alert.type,
      message: alert.message
    });
  }, [logSecurityEvent]);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => {
      const updated = prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      );
      localStorage.setItem('security-alerts', JSON.stringify(updated));
      return updated;
    });

    logSecurityEvent('security_alert_resolved', 'low', { alertId });
  }, [logSecurityEvent]);

  const clearResolvedAlerts = useCallback(() => {
    setAlerts(prev => {
      const unresolved = prev.filter(alert => !alert.resolved);
      localStorage.setItem('security-alerts', JSON.stringify(unresolved));
      return unresolved;
    });

    logSecurityEvent('resolved_alerts_cleared', 'low');
  }, [logSecurityEvent]);

  const toggleAutoScan = useCallback((enabled: boolean) => {
    setAutoScanEnabled(enabled);
    localStorage.setItem('auto-scan-enabled', enabled.toString());
    
    logSecurityEvent('auto_scan_toggled', 'low', { enabled });
  }, [logSecurityEvent]);

  const getSecurityRecommendations = useCallback(() => {
    const { testResults } = dashboardData;
    const recommendations: string[] = [];

    testResults.forEach(result => {
      if (!result.passed && result.recommendation) {
        recommendations.push(result.recommendation);
      }
    });

    // Add general recommendations based on score
    if (dashboardData.overallScore < 70) {
      recommendations.push('Consider running a comprehensive security audit');
    }
    
    if (dashboardData.criticalIssues > 0) {
      recommendations.push('Address critical security issues immediately');
    }

    const unresolvedCriticalAlerts = alerts.filter(
      alert => !alert.resolved && alert.severity === 'critical'
    ).length;

    if (unresolvedCriticalAlerts > 0) {
      recommendations.push('Review and resolve critical security alerts');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }, [dashboardData, alerts]);

  // Load auto-scan preference on mount
  useEffect(() => {
    const savedAutoScan = localStorage.getItem('auto-scan-enabled');
    if (savedAutoScan) {
      setAutoScanEnabled(savedAutoScan === 'true');
    }
  }, []);

  return {
    dashboardData,
    alerts: alerts.filter(alert => !alert.resolved),
    resolvedAlerts: alerts.filter(alert => alert.resolved),
    autoScanEnabled,
    isScanning: isRunning,
    performManualSecurityScan,
    resolveAlert,
    clearResolvedAlerts,
    toggleAutoScan,
    getSecurityRecommendations,
    refreshDashboard: loadDashboardData
  };
};
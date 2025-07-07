import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { logger } from '@/lib/logger';

interface SecurityThreat {
  id: string;
  type: 'rate_limit' | 'suspicious_activity' | 'malicious_content' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  resolved: boolean;
}

interface SecurityMetrics {
  threatCount: number;
  lastThreatTime: number;
  failedLogins: number;
  suspiciousActivities: number;
}

export const SecurityMonitor: React.FC = () => {
  const { user } = useAuth();
  const { logSecurityEvent } = useAuditLogger();
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    threatCount: 0,
    lastThreatTime: 0,
    failedLogins: 0,
    suspiciousActivities: 0
  });

  const monitoringInterval = useRef<NodeJS.Timeout>();
  const threatDetectionEnabled = useRef(true);

  // Security monitoring patterns
  const securityPatterns = {
    // Monitor for XSS attempts
    xssAttempts: [
      /<script[^>]*>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /document\.cookie/gi,
      /window\.location/gi
    ],
    
    // Monitor for SQL injection attempts
    sqlInjectionAttempts: [
      /union\s+select/gi,
      /insert\s+into/gi,
      /drop\s+table/gi,
      /delete\s+from/gi,
      /update\s+set/gi
    ],
    
    // Monitor for suspicious patterns
    suspiciousPatterns: [
      /eval\s*\(/gi,
      /function\s*constructor/gi,
      /\.constructor\s*\(/gi,
      /base64/gi,
      /atob\s*\(/gi
    ]
  };

  // Monitor DOM mutations for suspicious injections
  useEffect(() => {
    if (!threatDetectionEnabled.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for suspicious script injections
              if (element.tagName === 'SCRIPT') {
                const threat: SecurityThreat = {
                  id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  type: 'malicious_content',
                  severity: 'critical',
                  description: 'Suspicious script injection detected',
                  timestamp: Date.now(),
                  resolved: false
                };
                
                addThreat(threat);
                logSecurityEvent('script_injection_detected', 'critical', {
                  element: element.outerHTML.substring(0, 200)
                });
              }
              
              // Check for suspicious attributes
              const attributes = element.attributes;
              for (let i = 0; i < attributes.length; i++) {
                const attr = attributes[i];
                if (attr.name.startsWith('on') && attr.value) {
                  const threat: SecurityThreat = {
                    id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'malicious_content',
                    severity: 'high',
                    description: 'Suspicious event handler detected',
                    timestamp: Date.now(),
                    resolved: false
                  };
                  
                  addThreat(threat);
                  logSecurityEvent('suspicious_event_handler', 'high', {
                    attribute: attr.name,
                    value: attr.value.substring(0, 100)
                  });
                }
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'onload', 'onerror', 'onmouseover']
    });

    return () => observer.disconnect();
  }, [logSecurityEvent]);

  // Monitor network requests for suspicious activity
  useEffect(() => {
    if (!threatDetectionEnabled.current) return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      
      // Monitor for suspicious URL patterns
      if (typeof url === 'string') {
        securityPatterns.suspiciousPatterns.forEach(pattern => {
          if (pattern.test(url)) {
            const threat: SecurityThreat = {
              id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'suspicious_activity',
              severity: 'medium',
              description: 'Suspicious network request detected',
              timestamp: Date.now(),
              resolved: false
            };
            
            addThreat(threat);
            logSecurityEvent('suspicious_network_request', 'medium', {
              url: url.substring(0, 200)
            });
          }
        });
      }
      
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [logSecurityEvent]);

  // Monitor console for suspicious activity
  useEffect(() => {
    if (!threatDetectionEnabled.current) return;

    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check for security-related errors
      const message = args.join(' ');
      if (message.includes('CSP') || message.includes('Content Security Policy')) {
        const threat: SecurityThreat = {
          id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'suspicious_activity',
          severity: 'medium',
          description: 'Content Security Policy violation detected',
          timestamp: Date.now(),
          resolved: false
        };
        
        addThreat(threat);
        logSecurityEvent('csp_violation', 'medium', {
          message: message.substring(0, 200)
        });
      }
      
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, [logSecurityEvent]);

  // Add threat to state and trigger alerts
  const addThreat = (threat: SecurityThreat) => {
    setThreats(prev => [threat, ...prev.slice(0, 99)]); // Keep only last 100 threats
    
    setMetrics(prev => ({
      ...prev,
      threatCount: prev.threatCount + 1,
      lastThreatTime: threat.timestamp,
      suspiciousActivities: threat.type === 'suspicious_activity' ? prev.suspiciousActivities + 1 : prev.suspiciousActivities
    }));

    // Trigger alerts for high severity threats
    if (threat.severity === 'high' || threat.severity === 'critical') {
      triggerSecurityAlert(threat);
    }
  };

  // Trigger security alerts
  const triggerSecurityAlert = (threat: SecurityThreat) => {
    logger.security('High severity security threat detected', {
      threatId: threat.id,
      type: threat.type,
      severity: threat.severity,
      description: threat.description,
      userId: user?.id
    });

    // In a real implementation, this would trigger:
    // - Email notifications to security team
    // - Slack/Discord alerts
    // - SIEM system integration
    // - Automatic response measures
  };

  // Periodic security health check
  useEffect(() => {
    monitoringInterval.current = setInterval(() => {
      performSecurityHealthCheck();
    }, 60000); // Every minute

    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
    };
  }, [user]);

  const performSecurityHealthCheck = () => {
    const checks = {
      httpsEnabled: window.location.protocol === 'https:',
      cookieSecure: document.cookie.includes('Secure'),
      contentSecurityPolicy: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
      mixedContent: checkForMixedContent(),
      suspiciousElements: checkForSuspiciousElements()
    };

    const failedChecks = Object.entries(checks).filter(([_, passed]) => !passed);
    
    if (failedChecks.length > 0) {
      logSecurityEvent('security_health_check_failed', 'medium', {
        failedChecks: failedChecks.map(([check]) => check),
        userId: user?.id
      });
    }
  };

  const checkForMixedContent = (): boolean => {
    if (window.location.protocol !== 'https:') return true;
    
    const resources = document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]');
    return resources.length === 0;
  };

  const checkForSuspiciousElements = (): boolean => {
    const suspiciousSelectors = [
      'script[src*="data:"]',
      'iframe[src*="javascript:"]',
      '*[onclick*="eval"]',
      '*[onload*="eval"]'
    ];

    return !suspiciousSelectors.some(selector => document.querySelector(selector));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      threatDetectionEnabled.current = false;
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
    };
  }, []);

  // This component doesn't render anything visible but runs security monitoring
  return null;
};
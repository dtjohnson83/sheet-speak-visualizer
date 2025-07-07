import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { sanitizeText, sanitizeHTML } from '@/lib/security';

interface SecurityTestResult {
  testName: string;
  passed: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation?: string;
  details?: any;
}

interface SecurityTestSuite {
  results: SecurityTestResult[];
  overallScore: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
}

export const useSecurityTesting = () => {
  const { user } = useAuth();
  const { logSecurityEvent } = useAuditLogger();
  const [isRunning, setIsRunning] = useState(false);

  // Test input sanitization
  const testInputSanitization = useCallback((): SecurityTestResult => {
    const testInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '"><script>alert("xss")</script>',
      'onerror="alert(\'xss\')"',
      'data:text/html,<script>alert("xss")</script>',
      '${alert("xss")}',
      '{{constructor.constructor("alert(\'xss\')")()}}',
      'eval("alert(\'xss\')")'
    ];

    let vulnerabilitiesFound = 0;
    const details = [];

    testInputs.forEach(input => {
      const sanitized = sanitizeText(input);
      if (sanitized.includes('<script>') || sanitized.includes('javascript:') || sanitized.includes('eval(')) {
        vulnerabilitiesFound++;
        details.push({ input, sanitized, vulnerable: true });
      } else {
        details.push({ input, sanitized, vulnerable: false });
      }
    });

    const passed = vulnerabilitiesFound === 0;
    const severity = vulnerabilitiesFound > 3 ? 'critical' : vulnerabilitiesFound > 1 ? 'high' : 'medium';

    return {
      testName: 'Input Sanitization',
      passed,
      severity,
      description: passed 
        ? 'Input sanitization is working correctly'
        : `Found ${vulnerabilitiesFound} sanitization vulnerabilities`,
      recommendation: !passed 
        ? 'Review and enhance input sanitization functions'
        : undefined,
      details
    };
  }, []);

  // Test HTML sanitization
  const testHTMLSanitization = useCallback((): SecurityTestResult => {
    const testHTML = [
      '<div onclick="alert(\'xss\')">Click me</div>',
      '<iframe src="javascript:alert(\'xss\')"></iframe>',
      '<img src="x" onerror="alert(\'xss\')">',
      '<link rel="stylesheet" href="javascript:alert(\'xss\')">',
      '<script src="data:text/javascript,alert(\'xss\')"></script>',
      '<object data="javascript:alert(\'xss\')"></object>'
    ];

    let vulnerabilitiesFound = 0;
    const details = [];

    testHTML.forEach(html => {
      const sanitized = sanitizeHTML(html);
      if (
        sanitized.includes('onclick=') || 
        sanitized.includes('onerror=') || 
        sanitized.includes('javascript:') ||
        sanitized.includes('<script') ||
        sanitized.includes('<iframe')
      ) {
        vulnerabilitiesFound++;
        details.push({ html, sanitized, vulnerable: true });
      } else {
        details.push({ html, sanitized, vulnerable: false });
      }
    });

    const passed = vulnerabilitiesFound === 0;
    const severity = vulnerabilitiesFound > 2 ? 'critical' : vulnerabilitiesFound > 0 ? 'high' : 'low';

    return {
      testName: 'HTML Sanitization',
      passed,
      severity,
      description: passed 
        ? 'HTML sanitization is working correctly'
        : `Found ${vulnerabilitiesFound} HTML sanitization vulnerabilities`,
      recommendation: !passed 
        ? 'Review and enhance HTML sanitization functions'
        : undefined,
      details
    };
  }, []);

  // Test Content Security Policy
  const testContentSecurityPolicy = useCallback((): SecurityTestResult => {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
    const cspHeader = cspMeta?.content;

    if (!cspHeader) {
      return {
        testName: 'Content Security Policy',
        passed: false,
        severity: 'high',
        description: 'No Content Security Policy detected',
        recommendation: 'Implement a strong Content Security Policy to prevent XSS attacks'
      };
    }

    const requiredDirectives = [
      'default-src',
      'script-src',
      'style-src',
      'img-src',
      'connect-src'
    ];

    const missingDirectives = requiredDirectives.filter(directive => 
      !cspHeader.includes(directive)
    );

    const hasUnsafeInline = cspHeader.includes("'unsafe-inline'");
    const hasUnsafeEval = cspHeader.includes("'unsafe-eval'");
    const allowsAllSources = cspHeader.includes('*');

    const issues = [];
    if (missingDirectives.length > 0) issues.push(`Missing directives: ${missingDirectives.join(', ')}`);
    if (hasUnsafeInline) issues.push('Contains unsafe-inline');
    if (hasUnsafeEval) issues.push('Contains unsafe-eval');
    if (allowsAllSources) issues.push('Allows all sources (*)');

    const passed = issues.length === 0;
    const severity = hasUnsafeEval || allowsAllSources ? 'high' : issues.length > 2 ? 'medium' : 'low';

    return {
      testName: 'Content Security Policy',
      passed,
      severity,
      description: passed 
        ? 'Content Security Policy is properly configured'
        : `CSP issues found: ${issues.join(', ')}`,
      recommendation: !passed 
        ? 'Review and strengthen Content Security Policy configuration'
        : undefined,
      details: { cspHeader, issues }
    };
  }, []);

  // Test HTTPS and secure connections
  const testSecureConnections = useCallback((): SecurityTestResult => {
    const isHTTPS = window.location.protocol === 'https:';
    const issues = [];

    if (!isHTTPS) {
      issues.push('Connection is not using HTTPS');
    }

    // Check for mixed content
    const httpResources = document.querySelectorAll(
      'img[src^="http:"], script[src^="http:"], link[href^="http:"], iframe[src^="http:"]'
    );

    if (httpResources.length > 0) {
      issues.push(`Found ${httpResources.length} HTTP resources in HTTPS page`);
    }

    // Check cookie security
    const cookies = document.cookie;
    const hasSecureCookies = cookies.includes('Secure');
    const hasHttpOnlyCookies = cookies.includes('HttpOnly');

    if (cookies && !hasSecureCookies) {
      issues.push('Cookies are not marked as Secure');
    }

    const passed = issues.length === 0;
    const severity = !isHTTPS ? 'critical' : issues.length > 1 ? 'high' : 'medium';

    return {
      testName: 'Secure Connections',
      passed,
      severity,
      description: passed 
        ? 'All connections are secure'
        : `Security issues: ${issues.join(', ')}`,
      recommendation: !passed 
        ? 'Ensure all connections use HTTPS and cookies are properly secured'
        : undefined,
      details: { isHTTPS, httpResourcesCount: httpResources.length, hasSecureCookies, hasHttpOnlyCookies }
    };
  }, []);

  // Test authentication security
  const testAuthenticationSecurity = useCallback((): SecurityTestResult => {
    const issues = [];
    
    // Check if user session is properly managed
    if (user) {
      // Check if tokens are stored securely (not in localStorage for sensitive data)
      const localStorageKeys = Object.keys(localStorage);
      const suspiciousKeys = localStorageKeys.filter(key => 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('key')
      );

      if (suspiciousKeys.length > 0) {
        issues.push(`Potentially sensitive data in localStorage: ${suspiciousKeys.join(', ')}`);
      }

      // Check session timeout (if implemented)
      // This would need to be implemented based on your auth system
    }

    const passed = issues.length === 0;
    const severity = issues.length > 2 ? 'high' : issues.length > 0 ? 'medium' : 'low';

    return {
      testName: 'Authentication Security',
      passed,
      severity,
      description: passed 
        ? 'Authentication security checks passed'
        : `Auth security issues: ${issues.join(', ')}`,
      recommendation: !passed 
        ? 'Review authentication token storage and session management'
        : undefined,
      details: { isAuthenticated: !!user }
    };
  }, [user]);

  // Test for potential DOM manipulation vulnerabilities
  const testDOMSecurity = useCallback((): SecurityTestResult => {
    const issues = [];
    
    // Check for dangerous innerHTML usage
    const elementsWithInnerHTML = document.querySelectorAll('*');
    let dangerousInnerHTML = 0;
    
    elementsWithInnerHTML.forEach(element => {
      if (element.innerHTML.includes('<script>') || element.innerHTML.includes('javascript:')) {
        dangerousInnerHTML++;
      }
    });

    if (dangerousInnerHTML > 0) {
      issues.push(`Found ${dangerousInnerHTML} elements with potentially dangerous innerHTML`);
    }

    // Check for eval() usage in global scope
    const originalEval = window.eval;
    let evalUsageDetected = false;
    
    window.eval = (...args) => {
      evalUsageDetected = true;
      return originalEval(...args);
    };

    // Restore original eval after a short delay
    setTimeout(() => {
      window.eval = originalEval;
    }, 100);

    if (evalUsageDetected) {
      issues.push('eval() usage detected');
    }

    const passed = issues.length === 0;
    const severity = dangerousInnerHTML > 0 || evalUsageDetected ? 'high' : 'low';

    return {
      testName: 'DOM Security',
      passed,
      severity,
      description: passed 
        ? 'DOM security checks passed'
        : `DOM security issues: ${issues.join(', ')}`,
      recommendation: !passed 
        ? 'Avoid using innerHTML with untrusted content and eval() function'
        : undefined,
      details: { dangerousInnerHTML, evalUsageDetected }
    };
  }, []);

  // Run complete security test suite
  const runSecurityTests = useCallback(async (): Promise<SecurityTestSuite> => {
    setIsRunning(true);
    
    logSecurityEvent('security_test_suite_started', 'low', {
      userId: user?.id,
      timestamp: Date.now()
    });

    try {
      const tests = [
        testInputSanitization,
        testHTMLSanitization,
        testContentSecurityPolicy,
        testSecureConnections,
        testAuthenticationSecurity,
        testDOMSecurity
      ];

      const results = tests.map(test => test());
      
      // Calculate metrics
      const criticalIssues = results.filter(r => !r.passed && r.severity === 'critical').length;
      const highIssues = results.filter(r => !r.passed && r.severity === 'high').length;
      const mediumIssues = results.filter(r => !r.passed && r.severity === 'medium').length;
      const lowIssues = results.filter(r => !r.passed && r.severity === 'low').length;
      
      const totalTests = results.length;
      const passedTests = results.filter(r => r.passed).length;
      const overallScore = Math.round((passedTests / totalTests) * 100);

      const testSuite: SecurityTestSuite = {
        results,
        overallScore,
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues
      };

      logSecurityEvent('security_test_suite_completed', 'low', {
        userId: user?.id,
        overallScore,
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues,
        timestamp: Date.now()
      });

      return testSuite;
    } finally {
      setIsRunning(false);
    }
  }, [
    user,
    logSecurityEvent,
    testInputSanitization,
    testHTMLSanitization,
    testContentSecurityPolicy,
    testSecureConnections,
    testAuthenticationSecurity,
    testDOMSecurity
  ]);

  return {
    runSecurityTests,
    isRunning,
    testInputSanitization,
    testHTMLSanitization,
    testContentSecurityPolicy,
    testSecureConnections,
    testAuthenticationSecurity,
    testDOMSecurity
  };
};
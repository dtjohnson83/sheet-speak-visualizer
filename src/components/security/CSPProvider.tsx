import React, { useEffect } from 'react';
import { logger } from '@/lib/logger';

interface CSPProviderProps {
  children: React.ReactNode;
  nonce?: string;
}

// Content Security Policy configuration
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'", 
    "'unsafe-inline'", // Required for Vite in development
    "'unsafe-eval'", // Required for Vite in development
    'https://unpkg.com', // For potential CDN libraries
    'https://cdn.jsdelivr.net' // For potential CDN libraries
  ],
  'style-src': [
    "'self'", 
    "'unsafe-inline'", // Required for CSS-in-JS and Tailwind
    'https://fonts.googleapis.com'
  ],
  'img-src': [
    "'self'", 
    'data:', 
    'https:', 
    'blob:' // For dynamic image generation
  ],
  'font-src': [
    "'self'", 
    'https://fonts.gstatic.com',
    'data:'
  ],
  'connect-src': [
    "'self'",
    'https://jkgqjeadviqmxwmwwkma.supabase.co', // Supabase API
    'wss://jkgqjeadviqmxwmwwkma.supabase.co', // Supabase realtime
    'https://api.openai.com', // OpenAI API if used
    'https://api.anthropic.com' // Anthropic API if used
  ],
  'frame-src': [
    "'self'",
    'https://jkgqjeadviqmxwmwwkma.supabase.co' // Supabase auth
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"], // Prevents embedding in iframes
  'upgrade-insecure-requests': [] // Automatically upgrade HTTP to HTTPS
};

// Security headers configuration
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
};

export const CSPProvider: React.FC<CSPProviderProps> = ({ children, nonce }) => {
  useEffect(() => {
    // Generate CSP string
    const cspString = Object.entries(CSP_DIRECTIVES)
      .map(([directive, sources]) => {
        if (sources.length === 0) {
          return directive;
        }
        
        // Add nonce to script-src if provided
        if (directive === 'script-src' && nonce) {
          sources.push(`'nonce-${nonce}'`);
        }
        
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');

    // Apply CSP via meta tag (backup for development)
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingCSP) {
      const cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      cspMeta.setAttribute('content', cspString);
      document.head.appendChild(cspMeta);
      
      logger.info('Content Security Policy applied', { csp: cspString });
    }

    // Apply additional security headers via meta tags where possible
    Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
      const existingHeader = document.querySelector(`meta[http-equiv="${header}"]`);
      if (!existingHeader) {
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', header);
        meta.setAttribute('content', value);
        document.head.appendChild(meta);
      }
    });

    // Set up CSP violation reporting
    document.addEventListener('securitypolicyviolation', (event) => {
      logger.security('CSP Violation Detected', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        sample: event.sample,
        disposition: event.disposition,
        timestamp: Date.now()
      });
      
      // In production, report violations to security monitoring service
      if (import.meta.env.PROD) {
        reportCSPViolation(event);
      }
    });

    // Monitor for inline script/style violations
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for inline scripts without nonce
              if (element.tagName === 'SCRIPT' && element.textContent && !element.getAttribute('nonce')) {
                logger.security('Inline script without nonce detected', {
                  script: element.textContent.substring(0, 200),
                  src: element.getAttribute('src')
                });
              }
              
              // Check for inline styles (potential security risk)
              if (element.hasAttribute('style')) {
                const styleContent = element.getAttribute('style') || '';
                if (styleContent.includes('javascript:') || styleContent.includes('expression(')) {
                  logger.security('Suspicious inline style detected', {
                    style: styleContent.substring(0, 200),
                    element: element.tagName
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
      attributeFilter: ['style', 'onclick', 'onload', 'onerror']
    });

    return () => {
      observer.disconnect();
    };
  }, [nonce]);

  return <>{children}</>;
};

// Report CSP violations to monitoring service
const reportCSPViolation = async (event: SecurityPolicyViolationEvent) => {
  try {
    const violationReport = {
      'csp-report': {
        'document-uri': event.documentURI,
        'referrer': event.referrer,
        'violated-directive': event.violatedDirective,
        'effective-directive': event.effectiveDirective,
        'original-policy': event.originalPolicy,
        'disposition': event.disposition,
        'blocked-uri': event.blockedURI,
        'line-number': event.lineNumber,
        'column-number': event.columnNumber,
        'source-file': event.sourceFile,
        'status-code': 0,
        'script-sample': event.sample || ''
      }
    };

    // In a real implementation, send to your CSP violation endpoint
    // await fetch('/api/csp-violations', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(violationReport)
    // });
    
    console.warn('CSP Violation Report:', violationReport);
  } catch (error) {
    logger.error('Failed to report CSP violation', { error });
  }
};

// Utility function to generate nonce for scripts
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// HOC for components that need CSP-compliant inline scripts
export const withCSPNonce = <P extends object>(
  Component: React.ComponentType<P & { nonce?: string }>
) => {
  return (props: P) => {
    const nonce = generateNonce();
    return <Component {...props} nonce={nonce} />;
  };
};
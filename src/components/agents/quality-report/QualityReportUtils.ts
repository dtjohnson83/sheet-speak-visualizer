import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle,
  Database,
  Shield,
  FileCheck,
  Clock,
  BarChart3,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high': return React.createElement(AlertTriangle, { className: "h-4 w-4 text-destructive" });
    case 'medium': return React.createElement(AlertCircle, { className: "h-4 w-4 text-orange-500" });
    case 'low': return React.createElement(AlertCircle, { className: "h-4 w-4 text-blue-500" });
    default: return React.createElement(CheckCircle, { className: "h-4 w-4 text-green-500" });
  }
};

export const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'high': return React.createElement(Badge, { variant: "destructive" }, "High Priority");
    case 'medium': return React.createElement(Badge, { variant: "default" }, "Medium Priority");
    case 'low': return React.createElement(Badge, { variant: "secondary" }, "Low Priority");
    default: return React.createElement(Badge, { variant: "outline" }, "Info");
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Completeness': return React.createElement(Database, { className: "h-4 w-4" });
    case 'Validity': return React.createElement(Shield, { className: "h-4 w-4" });
    case 'Conformity': return React.createElement(FileCheck, { className: "h-4 w-4" });
    case 'Consistency': return React.createElement(CheckCircle, { className: "h-4 w-4" });
    case 'Uniqueness': return React.createElement(FileText, { className: "h-4 w-4" });
    case 'Freshness': return React.createElement(Clock, { className: "h-4 w-4" });
    default: return React.createElement(BarChart3, { className: "h-4 w-4" });
  }
};
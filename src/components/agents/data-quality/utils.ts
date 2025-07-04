import React from 'react';
import { 
  XCircle, 
  CheckCircle, 
  AlertTriangle,
  Database,
  FileText,
  Clock
} from 'lucide-react';

export const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-700 dark:text-green-300';
  if (score >= 70) return 'text-orange-700 dark:text-orange-300';
  return 'text-red-700 dark:text-red-300';
};

export const getScoreBgColor = (score: number) => {
  if (score >= 90) return 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700';
  if (score >= 70) return 'bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700';
  return 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700';
};

export const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high': return React.createElement(XCircle, { className: "h-4 w-4 text-red-700 dark:text-red-300" });
    case 'medium': return React.createElement(AlertTriangle, { className: "h-4 w-4 text-orange-700 dark:text-orange-300" });
    case 'low': return React.createElement(AlertTriangle, { className: "h-4 w-4 text-blue-700 dark:text-blue-300" });
    default: return React.createElement(CheckCircle, { className: "h-4 w-4 text-green-700 dark:text-green-300" });
  }
};

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'completeness': return React.createElement(Database, { className: "h-4 w-4" });
    case 'consistency': return React.createElement(CheckCircle, { className: "h-4 w-4" });
    case 'accuracy': return React.createElement(CheckCircle, { className: "h-4 w-4" });
    case 'uniqueness': return React.createElement(FileText, { className: "h-4 w-4" });
    case 'timeliness': return React.createElement(Clock, { className: "h-4 w-4" });
    default: return React.createElement(AlertTriangle, { className: "h-4 w-4" });
  }
};
export interface MLInsight {
  id: string;
  type: 'anomaly' | 'pattern' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  column?: string;
  action?: string;
  impact: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MLAnalysisResult {
  insights: MLInsight[];
  anomalies: Array<{
    column: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
    examples: any[];
  }>;
  patterns: Array<{
    type: string;
    description: string;
    confidence: number;
    columns: string[];
  }>;
  predictions: Array<{
    metric: string;
    prediction: number;
    confidence: number;
    timeframe: string;
  }>;
}
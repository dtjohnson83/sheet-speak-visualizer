
import React from 'react';
import { EnhancedDataContextManager } from '@/components/ai-context/EnhancedDataContextManager';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface TabContentAIProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  showContextSetup: boolean;
  onContextReady: (context: any) => void;
  onSkipContext: () => void;
  onAIUsed: () => void;
}

export const TabContentAI: React.FC<TabContentAIProps> = ({
  data,
  columns,
  fileName,
  showContextSetup,
  onContextReady,
  onSkipContext,
  onAIUsed
}) => {
  if (showContextSetup) {
    return (
      <EnhancedDataContextManager
        data={data}
        columns={columns}
        fileName={fileName}
        onContextReady={onContextReady}
        onSkip={onSkipContext}
      />
    );
  }

  return (
    <div className="text-center p-6">
      <h3 className="text-lg font-medium mb-2">AI Context Ready</h3>
      <p className="text-gray-600">
        Your AI context has been configured. You can now use the AI Chat and AI Report tabs for enhanced insights.
      </p>
    </div>
  );
};

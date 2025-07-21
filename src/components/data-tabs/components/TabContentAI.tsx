import React from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { AIDataChat } from '@/components/AIDataChat';
import { AISummaryReport } from '@/components/AISummaryReport';
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
  return (
    <>
      <TabsContent value="ai-chat" className="space-y-4">
        {showContextSetup ? (
          <EnhancedDataContextManager
            data={data}
            columns={columns}
            fileName={fileName}
            onContextReady={onContextReady}
            onSkip={onSkipContext}
          />
        ) : (
          <Card className="p-6" onClick={onAIUsed}>
            <AIDataChat 
              data={data} 
              columns={columns}
              fileName={fileName}
            />
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="ai-report" className="space-y-4">
        <div onClick={onAIUsed}>
          <AISummaryReport 
            data={data} 
            columns={columns}
            fileName={fileName}
          />
        </div>
      </TabsContent>
    </>
  );
};
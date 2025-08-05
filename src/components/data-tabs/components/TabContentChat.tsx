import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { EnhancedPlatformChatbot } from '@/components/chat/EnhancedPlatformChatbot';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface TabContentChatProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
}

export const TabContentChat: React.FC<TabContentChatProps> = ({
  data,
  columns,
  fileName
}) => {
  return (
    <TabsContent value="chat" className="space-y-4">
      <div className="h-[600px] w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">AI Data Assistant</h3>
          <p className="text-muted-foreground">
            Click the chat button in the bottom right to start a conversation about your data.
          </p>
        </div>
      </div>
      <EnhancedPlatformChatbot data={data} columns={columns} />
    </TabsContent>
  );
};
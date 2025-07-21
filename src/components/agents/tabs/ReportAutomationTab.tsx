
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ReportAutomationAgent } from '../report-automation/ReportAutomationAgent';

export const ReportAutomationTab = () => {
  return (
    <TabsContent value="report-automation" className="space-y-4">
      <ReportAutomationAgent />
    </TabsContent>
  );
};

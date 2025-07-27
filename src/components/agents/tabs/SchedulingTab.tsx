import React from 'react';
import { SchedulingDashboard } from '../scheduling/SchedulingDashboard';

export const SchedulingTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Agent Scheduling</h2>
        <p className="text-muted-foreground">
          Manage when and how often your agents run automatically
        </p>
      </div>
      <SchedulingDashboard />
    </div>
  );
};
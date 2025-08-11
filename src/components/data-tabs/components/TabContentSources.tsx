// src/components/data-tabs/components/TabContentSources.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { DataSourcesTab } from '@/components/data-sources/DataSourcesTab';
import CleanAndScorePanel from '@/components/data/CleanAndScorePanel';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface TabContentSourcesProps {
  selectedDataSource: string;
  showDataSourceDialog: boolean;
  onDataSourceSelect: (type: string) => void;
  onDataSourceDialogChange: (open: boolean) => void;
  onDataLoaded: (data: DataRow[], columns: ColumnInfo[], name: string, worksheet?: string) => void;
  /** Set to false if you want only the button and not the inline panel */
  showInlineCleanPanel?: boolean;
}

export const TabContentSources: React.FC<TabContentSourcesProps> = ({
  selectedDataSource,
  showDataSourceDialog,
  onDataSourceSelect,
  onDataSourceDialogChange,
  onDataLoaded,
  showInlineCleanPanel = true, // default: show the panel under Data Sources
}) => {
  return (
    <TabsContent value="data-sources" className="space-y-4">
      {/* Header + Clean button */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Data Sources</h3>
          <Link
            to="/app/clean"
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            title="Open Clean & Score page"
          >
            Clean &amp; Score
          </Link>
        </div>
      </Card>

      {/* Existing Data Sources UI */}
      <Card className="p-6">
        <DataSourcesTab
          selectedDataSource={selectedDataSource}
          showDataSourceDialog={showDataSourceDialog}
          onDataSourceSelect={onDataSourceSelect}
          onDataSourceDialogChange={onDataSourceDialogChange}
          onDataLoaded={onDataLoaded}
        />
      </Card>

      {/* OPTIONAL: Inline Clean & Score panel inside the Data Sources tab */}
      {showInlineCleanPanel && (
        <Card className="p-6">
          <CleanAndScorePanel />
        </Card>
      )}
    </TabsContent>
  );
};

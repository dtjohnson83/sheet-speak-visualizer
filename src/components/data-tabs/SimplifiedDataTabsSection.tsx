import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, MessageSquare, Layout } from 'lucide-react';
import { TabContentPreview } from './components/TabContentPreview';
import { TabContentDashboard } from './components/TabContentDashboard';
import { QuestionBasedAnalytics } from '@/components/visualization/QuestionBasedAnalytics';
import { TabContentSources } from './components/TabContentSources';
import { TabContentSavedDatasets } from './components/TabContentSavedDatasets';
import { DataTabsSectionProps } from './types';

export const SimplifiedDataTabsSection = ({
  data,
  columns,
  fileName,
  worksheetName,
  tiles,
  filters,
  currentDatasetId,
  selectedDataSource,
  showDataSourceDialog,
  onAddTile,
  onRemoveTile,
  onUpdateTile,
  onFiltersChange,
  onLoadDashboard,
  onColumnTypeChange,
  onDataSourceSelect,
  onDataSourceDialogChange,
  onDataLoaded,
  onAIUsed,
}: DataTabsSectionProps) => {
  const [activeTab, setActiveTab] = React.useState("data");

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="ask" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Ask & Visualize
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Data Tab */}
        <Tabs defaultValue="preview" className="w-full">
          <div className={activeTab === "data" ? "block" : "hidden"}>
            <TabsList className="mb-4">
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
              <TabsTrigger value="saved">Saved Datasets</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabContentSources
              selectedDataSource={selectedDataSource}
              showDataSourceDialog={showDataSourceDialog}
              onDataSourceSelect={onDataSourceSelect}
              onDataSourceDialogChange={onDataSourceDialogChange}
              onDataLoaded={onDataLoaded}
            />

            <TabContentSavedDatasets
              data={data}
              columns={columns}
              fileName={fileName}
              worksheetName={worksheetName}
              onLoadDataset={(dataset) => {
                onDataLoaded(dataset.data, dataset.columns, dataset.file_name, dataset.worksheet_name);
              }}
            />

            <TabContentPreview
              data={data}
              columns={columns}
              fileName={fileName}
              onColumnTypeChange={onColumnTypeChange}
            />
          </div>
        </Tabs>

        {/* Ask & Visualize Tab */}
        <div className={activeTab === "ask" ? "block" : "hidden"}>
          <QuestionBasedAnalytics
            data={data}
            columns={columns}
            datasetName={fileName}
            onAddTile={onAddTile}
            onAIUsed={onAIUsed}
          />
        </div>

        {/* Dashboard Tab */}
        <div className={activeTab === "dashboard" ? "block" : "hidden"}>
          <TabContentDashboard
            data={data}
            columns={columns}
            tiles={tiles}
            filters={filters}
            currentDatasetId={currentDatasetId}
            onRemoveTile={onRemoveTile}
            onUpdateTile={onUpdateTile}
            onFiltersChange={onFiltersChange}
            onLoadDashboard={onLoadDashboard}
          />
        </div>
      </Tabs>
    </div>
  );
};
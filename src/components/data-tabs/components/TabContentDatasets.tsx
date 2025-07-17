
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiDatasetManager } from '@/components/dataset/MultiDatasetManager';
import { DatasetComparison } from '@/components/dataset/DatasetComparison';
import { DatasetMergeDialog } from '@/components/dataset/DatasetMergeDialog';
import { SmartDataIntegration } from '@/components/semantic/SmartDataIntegration';
import { useMultiDatasetActions } from '@/hooks/useMultiDatasetActions';
import { DatasetInfo } from '@/contexts/AppStateContext';
import { Database, GitMerge, Shuffle, Zap } from 'lucide-react';

export const TabContentDatasets = () => {
  const {
    getAllDatasets,
    getActiveDataset,
    selectDataset,
    removeDataset,
    markDatasetAsSaved,
    addDataset
  } = useMultiDatasetActions();
  
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [selectedDatasets, setSelectedDatasets] = useState<[DatasetInfo, DatasetInfo] | null>(null);

  const datasets = getAllDatasets();
  const activeDataset = getActiveDataset();

  const handleMergeDatasets = (dataset1: DatasetInfo, dataset2: DatasetInfo) => {
    setSelectedDatasets([dataset1, dataset2]);
    setMergeDialogOpen(true);
  };

  const handleMergeComplete = (mergedDataset: DatasetInfo) => {
    const datasetId = addDataset(
      mergedDataset.data,
      mergedDataset.columns,
      mergedDataset.fileName,
      mergedDataset.worksheetName,
      mergedDataset.name
    );
    selectDataset(datasetId);
    setMergeDialogOpen(false);
    setSelectedDatasets(null);
  };

  const handleDatasetSelect = (dataset: DatasetInfo) => {
    selectDataset(dataset.id);
  };

  if (datasets.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dataset Management
            </CardTitle>
            <CardDescription>
              Load your first dataset to start managing multiple datasets, comparing data, and discovering relationships.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No datasets loaded yet</p>
              <p className="text-sm text-muted-foreground">
                Go to the Sources tab to upload or connect your first dataset
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Manage
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <GitMerge className="h-4 w-4" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="merge" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Merge
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Relationships
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <MultiDatasetManager
            datasets={datasets}
            activeDatasetId={activeDataset?.id || ''}
            onDatasetSelect={handleDatasetSelect}
            onDatasetRemove={removeDataset}
            onDatasetSave={markDatasetAsSaved}
          />
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          {datasets.length >= 2 ? (
            <DatasetComparison 
              datasets={datasets} 
              onMerge={handleMergeDatasets}
              onCreateChart={(data, type, title) => {
                console.log('Chart creation requested:', { data, type, title });
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Dataset Comparison</CardTitle>
                <CardDescription>
                  You need at least 2 datasets to compare them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Load more datasets to enable comparison features.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="merge" className="space-y-4">
          {datasets.length >= 2 ? (
            <Card>
              <CardHeader>
                <CardTitle>Dataset Merging</CardTitle>
                <CardDescription>
                  Select two datasets to merge them together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {datasets.map((dataset, index) => (
                    <div key={dataset.id} className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium">{dataset.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {dataset.rowCount.toLocaleString()} rows • {dataset.columnCount} columns
                        </p>
                        {index < datasets.length - 1 && (
                          <Button
                            onClick={() => handleMergeDatasets(dataset, datasets[index + 1])}
                            className="mt-2"
                            size="sm"
                          >
                            Merge with {datasets[index + 1].name}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Dataset Merging</CardTitle>
                <CardDescription>
                  You need at least 2 datasets to merge them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Load more datasets to enable merging features.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <SmartDataIntegration 
            datasets={datasets}
            activeDatasetId={activeDataset?.id || ''}
          />
        </TabsContent>
      </Tabs>

      {selectedDatasets && (
        <DatasetMergeDialog
          open={mergeDialogOpen}
          onOpenChange={setMergeDialogOpen}
          dataset1={selectedDatasets[0]}
          dataset2={selectedDatasets[1]}
          onMerge={handleMergeComplete}
        />
      )}
    </div>
  );
};

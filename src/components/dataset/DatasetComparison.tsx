import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, BarChart3, Database, GitMerge, TableProperties } from 'lucide-react';
import { DatasetInfo } from '@/contexts/AppStateContext';
import { ColumnInfo } from '@/pages/Index';

interface DatasetComparisonProps {
  datasets: DatasetInfo[];
  onMerge: (dataset1: DatasetInfo, dataset2: DatasetInfo) => void;
  onCreateChart: (datasets: DatasetInfo[]) => void;
}

export const DatasetComparison: React.FC<DatasetComparisonProps> = ({
  datasets,
  onMerge,
  onCreateChart,
}) => {
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState<'schema' | 'data' | 'stats'>('schema');

  const selectedDatasetObjects = useMemo(() => {
    return datasets.filter(d => selectedDatasets.includes(d.id));
  }, [datasets, selectedDatasets]);

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDatasets(prev => {
      if (prev.includes(datasetId)) {
        return prev.filter(id => id !== datasetId);
      } else if (prev.length < 4) {
        return [...prev, datasetId];
      }
      return prev;
    });
  };

  const getColumnCompatibility = (columns1: ColumnInfo[], columns2: ColumnInfo[]) => {
    const common = columns1.filter(col1 => 
      columns2.find(col2 => col2.name === col1.name && col2.type === col1.type)
    );
    const unique1 = columns1.filter(col1 => 
      !columns2.find(col2 => col2.name === col1.name)
    );
    const unique2 = columns2.filter(col2 => 
      !columns1.find(col1 => col1.name === col2.name)
    );
    
    return { common, unique1, unique2 };
  };

  const renderSchemaComparison = () => {
    if (selectedDatasetObjects.length < 2) return null;

    return (
      <div className="space-y-4">
        {selectedDatasetObjects.map((dataset, index) => (
          <Card key={dataset.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                {dataset.name}
                <Badge variant="outline">{dataset.columns.length} columns</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dataset.columns.map((col) => (
                  <Badge key={col.name} variant="secondary">
                    {col.name} ({col.type})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {selectedDatasetObjects.length === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Compatibility Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const { common, unique1, unique2 } = getColumnCompatibility(
                  selectedDatasetObjects[0].columns,
                  selectedDatasetObjects[1].columns
                );
                
                return (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Common Columns ({common.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {common.map((col) => (
                          <Badge key={col.name} variant="default">
                            {col.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Unique to {selectedDatasetObjects[0].name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {unique1.map((col) => (
                          <Badge key={col.name} variant="outline">
                            {col.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Unique to {selectedDatasetObjects[1].name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {unique2.map((col) => (
                          <Badge key={col.name} variant="outline">
                            {col.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderDataStats = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedDatasetObjects.map((dataset) => (
          <Card key={dataset.id}>
            <CardHeader>
              <CardTitle>{dataset.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rows:</span>
                  <span className="font-medium">{dataset.rowCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Columns:</span>
                  <span className="font-medium">{dataset.columnCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">File:</span>
                  <span className="font-medium text-sm">{dataset.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Modified:</span>
                  <span className="font-medium text-sm">
                    {new Date(dataset.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Dataset Comparison</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select up to 4 datasets to compare their schemas, data, and create multi-dataset visualizations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((dataset) => (
          <Card
            key={dataset.id}
            className={`cursor-pointer transition-all ${
              selectedDatasets.includes(dataset.id)
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleDatasetSelect(dataset.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{dataset.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rows:</span>
                  <span>{dataset.rowCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Columns:</span>
                  <span>{dataset.columnCount}</span>
                </div>
                <Badge variant={dataset.isSaved ? 'default' : 'secondary'} className="w-fit">
                  {dataset.isSaved ? 'Saved' : 'Unsaved'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDatasetObjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedDatasetObjects.length === 2 && (
                <Button
                  onClick={() => onMerge(selectedDatasetObjects[0], selectedDatasetObjects[1])}
                  className="flex items-center gap-2"
                >
                  <GitMerge className="h-4 w-4" />
                  Merge Datasets
                </Button>
              )}
              {selectedDatasetObjects.length >= 2 && (
                <Button
                  onClick={() => onCreateChart(selectedDatasetObjects)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Create Multi-Dataset Chart
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDatasetObjects.length > 0 && (
        <Tabs value={compareMode} onValueChange={(value) => setCompareMode(value as any)}>
          <TabsList>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schema" className="space-y-4">
            <ScrollArea className="h-[400px]">
              {renderSchemaComparison()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            {renderDataStats()}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
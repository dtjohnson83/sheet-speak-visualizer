import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ChartConfiguration } from './ChartConfiguration';
import { ChartRenderer } from './ChartRenderer';
import { BarChart3, LineChart, PieChart, ScatterChart, TrendingUp, Database } from 'lucide-react';
import { DatasetInfo } from '@/contexts/AppStateContext';
import { ColumnInfo, DataRow } from '@/pages/Index';

interface MultiDatasetChartGeneratorProps {
  datasets: DatasetInfo[];
  onCreateChart: (chartConfig: any) => void;
}

type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'histogram' | 'heatmap' | 'treemap';

interface DatasetMapping {
  datasetId: string;
  xColumn: string;
  yColumn: string;
  seriesColumn?: string;
  color?: string;
}

export const MultiDatasetChartGenerator: React.FC<MultiDatasetChartGeneratorProps> = ({
  datasets,
  onCreateChart,
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartTitle, setChartTitle] = useState('Multi-Dataset Chart');
  const [datasetMappings, setDatasetMappings] = useState<DatasetMapping[]>(
    datasets.map((dataset, index) => ({
      datasetId: dataset.id,
      xColumn: '',
      yColumn: '',
      seriesColumn: '',
      color: `hsl(${index * 60}, 70%, 50%)`,
    }))
  );
  const [combineMethod, setCombineMethod] = useState<'overlay' | 'merge'>('overlay');

  const chartTypeOptions = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'area', label: 'Area Chart', icon: TrendingUp },
  ];

  const combinedData = useMemo(() => {
    if (combineMethod === 'merge') {
      // Merge datasets with common columns
      const allData: DataRow[] = [];
      datasetMappings.forEach(mapping => {
        const dataset = datasets.find(d => d.id === mapping.datasetId);
        if (dataset && mapping.xColumn && mapping.yColumn) {
          dataset.data.forEach(row => {
            allData.push({
              ...row,
              _dataset: dataset.name,
              _datasetId: dataset.id,
            });
          });
        }
      });
      return allData;
    }
    
    // Overlay datasets (separate series)
    return datasetMappings.map(mapping => {
      const dataset = datasets.find(d => d.id === mapping.datasetId);
      if (!dataset || !mapping.xColumn || !mapping.yColumn) return null;
      
      return {
        name: dataset.name,
        data: dataset.data.map(row => ({
          x: row[mapping.xColumn],
          y: row[mapping.yColumn],
          series: mapping.seriesColumn ? row[mapping.seriesColumn] : dataset.name,
          _dataset: dataset.name,
        })),
        color: mapping.color,
      };
    }).filter(Boolean);
  }, [datasets, datasetMappings, combineMethod]);

  const combinedColumns = useMemo(() => {
    const allColumns: ColumnInfo[] = [];
    const columnMap = new Map<string, ColumnInfo>();

    datasetMappings.forEach(mapping => {
      const dataset = datasets.find(d => d.id === mapping.datasetId);
      if (dataset) {
        dataset.columns.forEach(col => {
          if (!columnMap.has(col.name)) {
            columnMap.set(col.name, col);
          }
        });
      }
    });

    columnMap.forEach(col => allColumns.push(col));
    
    // Add metadata columns
    allColumns.push(
      { name: '_dataset', type: 'categorical' },
      { name: '_datasetId', type: 'categorical' }
    );

    return allColumns;
  }, [datasets, datasetMappings]);

  const updateDatasetMapping = (index: number, updates: Partial<DatasetMapping>) => {
    setDatasetMappings(prev => {
      const newMappings = [...prev];
      newMappings[index] = { ...newMappings[index], ...updates };
      return newMappings;
    });
  };

  const removeDatasetMapping = (index: number) => {
    setDatasetMappings(prev => prev.filter((_, i) => i !== index));
  };

  const addDatasetMapping = () => {
    const availableDatasets = datasets.filter(d => 
      !datasetMappings.find(m => m.datasetId === d.id)
    );
    
    if (availableDatasets.length > 0) {
      const newMapping: DatasetMapping = {
        datasetId: availableDatasets[0].id,
        xColumn: '',
        yColumn: '',
        seriesColumn: '',
        color: `hsl(${datasetMappings.length * 60}, 70%, 50%)`,
      };
      setDatasetMappings(prev => [...prev, newMapping]);
    }
  };

  const handleCreateChart = () => {
    const validMappings = datasetMappings.filter(m => m.xColumn && m.yColumn);
    
    if (validMappings.length === 0) return;

    const chartConfig = {
      type: chartType,
      title: chartTitle,
      datasetMappings: validMappings,
      combineMethod,
      data: combinedData,
      columns: combinedColumns,
      isMultiDataset: true,
    };

    onCreateChart(chartConfig);
  };

  const renderDatasetMappings = () => {
    return (
      <div className="space-y-4">
        {datasetMappings.map((mapping, index) => {
          const dataset = datasets.find(d => d.id === mapping.datasetId);
          if (!dataset) return null;

          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    {dataset.name}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDatasetMapping(index)}
                    disabled={datasetMappings.length === 1}
                  >
                    Remove
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>X-Axis Column</Label>
                    <Select
                      value={mapping.xColumn}
                      onValueChange={(value) => updateDatasetMapping(index, { xColumn: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataset.columns.map((col) => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name} ({col.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Y-Axis Column</Label>
                    <Select
                      value={mapping.yColumn}
                      onValueChange={(value) => updateDatasetMapping(index, { yColumn: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataset.columns.filter(col => col.type === 'numeric').map((col) => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name} ({col.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Series Column (Optional)</Label>
                    <Select
                      value={mapping.seriesColumn}
                      onValueChange={(value) => updateDatasetMapping(index, { seriesColumn: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {dataset.columns.filter(col => col.type === 'categorical').map((col) => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name} ({col.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: mapping.color }}
                      />
                      <Input
                        type="color"
                        value={mapping.color}
                        onChange={(e) => updateDatasetMapping(index, { color: e.target.value })}
                        className="w-16 h-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button
          onClick={addDatasetMapping}
          variant="outline"
          className="w-full"
          disabled={datasetMappings.length >= datasets.length}
        >
          Add Dataset
        </Button>
      </div>
    );
  };

  const renderPreview = () => {
    if (datasetMappings.every(m => !m.xColumn || !m.yColumn)) {
      return (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Configure dataset mappings to see preview
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ChartRenderer
              type={chartType}
              data={Array.isArray(combinedData) ? combinedData.slice(0, 100) : []}
              columns={combinedColumns}
              title={chartTitle}
              width={400}
              height={250}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Multi-Dataset Chart Generator</h3>
        <p className="text-sm text-muted-foreground">
          Create visualizations that combine data from multiple datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Chart Title</Label>
          <Input
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            placeholder="Enter chart title"
          />
        </div>

        <div>
          <Label>Combine Method</Label>
          <Select value={combineMethod} onValueChange={(value) => setCombineMethod(value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overlay">Overlay (Separate Series)</SelectItem>
              <SelectItem value="merge">Merge (Combined Data)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Chart Type</Label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
          {chartTypeOptions.map((option) => (
            <Button
              key={option.value}
              variant={chartType === option.value ? 'default' : 'outline'}
              onClick={() => setChartType(option.value as ChartType)}
              className="flex flex-col items-center gap-2 h-auto py-3"
            >
              <option.icon className="h-4 w-4" />
              <span className="text-xs">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="configure" className="w-full">
        <TabsList>
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configure" className="space-y-4">
          {renderDatasetMappings()}
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          {renderPreview()}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleCreateChart}
          disabled={datasetMappings.every(m => !m.xColumn || !m.yColumn)}
        >
          Create Chart
        </Button>
      </div>
    </div>
  );
};
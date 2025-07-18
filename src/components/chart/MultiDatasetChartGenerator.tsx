
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartRenderer } from './ChartRenderer';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface MultiDatasetChartGeneratorProps {
  datasets: {
    id: string;
    name: string;
    data: DataRow[];
    columns: ColumnInfo[];
  }[];
  onChartCreate: (chartData: any, chartType: string, chartTitle: string) => void;
}

export const MultiDatasetChartGenerator: React.FC<MultiDatasetChartGeneratorProps> = ({
  datasets,
  onChartCreate
}) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartTitle, setChartTitle] = useState('Combined Chart');
  const [chartData, setChartData] = useState<any[] | null>(null);

  const handleChartTypeChange = (value: string) => {
    setChartType(value);
  };

  const handleXAxisChange = (value: string) => {
    setXAxis(value);
  };

  const handleYAxisChange = (value: string) => {
    setYAxis(value);
  };

  const generateCombinedColumns = (): ColumnInfo[] => {
    const allColumns = new Map<string, ColumnInfo>();
    
    datasets.forEach(dataset => {
      dataset.columns.forEach(col => {
        if (!allColumns.has(col.name)) {
          allColumns.set(col.name, {
            name: col.name,
            type: col.type,
            values: []
          });
        }
      });
    });
    
    return Array.from(allColumns.values());
  };

  const combinedColumns = generateCombinedColumns();

  const generateChartData = useCallback(() => {
    if (!xAxis || !yAxis) return;

    const combinedData: any[] = [];

    datasets.forEach(dataset => {
      dataset.data.forEach(row => {
        const xValue = row[xAxis];
        const yValue = row[yAxis];

        if (xValue !== undefined && yValue !== undefined) {
          combinedData.push({
            dataset: dataset.name,
            [xAxis]: xValue,
            [yAxis]: yValue,
          });
        }
      });
    });

    setChartData(combinedData);
  }, [xAxis, yAxis, datasets]);

  const handleCreateChart = () => {
    if (chartData) {
      onChartCreate(chartData, chartType, chartTitle);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chart Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="chart-title">Chart Title</Label>
            <Input
              id="chart-title"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="Enter chart title"
            />
          </div>

          <div>
            <Label htmlFor="chart-type">Chart Type</Label>
            <Select onValueChange={handleChartTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="scatter">Scatter Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="x-axis">X-Axis</Label>
            <Select onValueChange={handleXAxisChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select X-Axis" />
              </SelectTrigger>
              <SelectContent>
                {combinedColumns.map((column) => (
                  <SelectItem key={column.name} value={column.name}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="y-axis">Y-Axis</Label>
            <Select onValueChange={handleYAxisChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Y-Axis" />
              </SelectTrigger>
              <SelectContent>
                {combinedColumns.map((column) => (
                  <SelectItem key={column.name} value={column.name}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={generateChartData} className="w-full">
            Generate Chart Data
          </Button>
        </CardContent>
      </Card>

      {chartData && xAxis && yAxis && (
        <Card>
          <CardHeader>
            <CardTitle>Chart Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <ChartRenderer
                chartType={chartType}
                data={chartData}
                columns={combinedColumns}
                xColumn={xAxis}
                yColumn={yAxis}
                sortColumn=""
                sortDirection="asc"
                series={[]}
                aggregationMethod="sum"
                showDataLabels={true}
                supportsMultipleSeries={false}
                chartColors={['#3B82F6', '#EF4444', '#10B981', '#F59E0B']}
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button onClick={handleCreateChart}>
                Add to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

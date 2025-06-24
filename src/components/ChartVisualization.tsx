
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface ChartVisualizationProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const ChartVisualization = ({ data, columns }: ChartVisualizationProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [xColumn, setXColumn] = useState<string>('');
  const [yColumn, setYColumn] = useState<string>('');

  const numericColumns = columns.filter(col => col.type === 'numeric');
  const categoricalColumns = columns.filter(col => col.type === 'categorical' || col.type === 'text');
  const dateColumns = columns.filter(col => col.type === 'date');

  const chartColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#ff0000', '#00ffff', '#ff00ff', '#ffff00', '#0000ff'
  ];

  const prepareChartData = () => {
    if (!xColumn || !yColumn) return [];

    const xCol = columns.find(col => col.name === xColumn);
    const yCol = columns.find(col => col.name === yColumn);

    if (!xCol || !yCol) return [];

    if (chartType === 'pie') {
      // For pie charts, group by category and sum values
      const grouped = data.reduce((acc, row) => {
        const category = row[xColumn]?.toString() || 'Unknown';
        const value = Number(row[yColumn]) || 0;
        acc[category] = (acc[category] || 0) + value;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(grouped).map(([name, value]) => ({
        name,
        value,
        [yColumn]: value
      }));
    }

    // For other charts, use data as-is but ensure numeric values
    return data.map(row => ({
      ...row,
      [xColumn]: xCol.type === 'numeric' ? Number(row[xColumn]) || 0 : row[xColumn],
      [yColumn]: Number(row[yColumn]) || 0
    })).filter(row => row[xColumn] !== null && row[yColumn] !== null);
  };

  const chartData = prepareChartData();

  const renderChart = () => {
    if (!xColumn || !yColumn || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Select columns to display chart</p>
        </div>
      );
    }

    const commonProps = {
      width: 800,
      height: 400,
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xColumn} 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yColumn} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xColumn}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yColumn} 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xColumn} 
                type="number"
                domain={['dataMin', 'dataMax']}
              />
              <YAxis 
                dataKey={yColumn} 
                type="number"
                domain={['dataMin', 'dataMax']}
              />
              <Tooltip />
              <Scatter dataKey={yColumn} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Data Visualization</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Chart Type</label>
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">X-Axis</label>
            <Select value={xColumn} onValueChange={setXColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {(chartType === 'scatter' ? [...numericColumns, ...dateColumns] : [...categoricalColumns, ...dateColumns]).map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name} ({col.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Y-Axis</label>
            <Select value={yColumn} onValueChange={setYColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {numericColumns.map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name} ({col.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={() => {
                if (!xColumn && categoricalColumns.length > 0) {
                  setXColumn(categoricalColumns[0].name);
                }
                if (!yColumn && numericColumns.length > 0) {
                  setYColumn(numericColumns[0].name);
                }
              }}
              disabled={!columns.length}
              className="w-full"
            >
              Auto-select
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h4 className="text-lg font-medium">
            {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
          </h4>
          {xColumn && yColumn && (
            <p className="text-sm text-gray-600">
              {xColumn} vs {yColumn} • {chartData.length} data points
            </p>
          )}
        </div>
        
        <div className="w-full overflow-x-auto">
          {renderChart()}
        </div>
      </Card>
    </div>
  );
};

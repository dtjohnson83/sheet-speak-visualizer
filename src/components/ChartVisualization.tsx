
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface ChartVisualizationProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const ChartVisualization = ({ data, columns }: ChartVisualizationProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'stacked-bar'>('bar');
  const [xColumn, setXColumn] = useState<string>('');
  const [yColumn, setYColumn] = useState<string>('');
  const [stackColumn, setStackColumn] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const numericColumns = columns.filter(col => col.type === 'numeric');
  const categoricalColumns = columns.filter(col => col.type === 'categorical' || col.type === 'text');
  const dateColumns = columns.filter(col => col.type === 'date');

  const chartColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#ff0000', '#00ffff', '#ff00ff', '#ffff00', '#0000ff'
  ];

  const isValidNumber = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return false;
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  };

  const sortData = (dataToSort: DataRow[]) => {
    if (!sortColumn || sortColumn === 'none') return dataToSort;
    
    return [...dataToSort].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;
      
      // Handle numeric values
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Handle string values
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const prepareChartData = () => {
    if (!xColumn || !yColumn) return [];

    const xCol = columns.find(col => col.name === xColumn);
    const yCol = columns.find(col => col.name === yColumn);

    if (!xCol || !yCol) return [];

    console.log('Preparing chart data for:', { xColumn, yColumn, chartType });

    // Apply sorting first
    const sortedData = sortData(data);

    if (chartType === 'heatmap') {
      // For heatmap, we need both x and y as categorical and a numeric value
      const heatmapData = sortedData.reduce((acc, row) => {
        const xValue = row[xColumn]?.toString() || 'Unknown';
        const yValue = row[yColumn]?.toString() || 'Unknown';
        const key = `${xValue}_${yValue}`;
        
        // Use the first numeric column as the value, or count occurrences
        let value = 1;
        const firstNumericCol = numericColumns[0];
        if (firstNumericCol) {
          const numValue = Number(row[firstNumericCol.name]);
          if (isValidNumber(numValue)) {
            value = numValue;
          }
        }
        
        acc[key] = (acc[key] || 0) + value;
        return acc;
      }, {} as Record<string, number>);

      const result = Object.entries(heatmapData).map(([key, value]) => {
        const [x, y] = key.split('_');
        return { x, y, value };
      });

      console.log('Heatmap data prepared:', result);
      return result;
    }

    if (chartType === 'stacked-bar') {
      if (!stackColumn) return [];
      
      // Group data by x-axis value and stack by stack column
      const grouped = sortedData.reduce((acc, row) => {
        const xValue = row[xColumn]?.toString() || 'Unknown';
        const stackValue = row[stackColumn]?.toString() || 'Unknown';
        const yValue = Number(row[yColumn]);
        
        if (!isValidNumber(yValue)) return acc;
        
        if (!acc[xValue]) {
          acc[xValue] = { [xColumn]: xValue };
        }
        
        acc[xValue][stackValue] = (acc[xValue][stackValue] || 0) + yValue;
        return acc;
      }, {} as Record<string, any>);

      const result = Object.values(grouped);
      console.log('Stacked bar data prepared:', result);
      return result;
    }

    if (chartType === 'pie') {
      // For pie charts, group by category and sum values
      const grouped = sortedData.reduce((acc, row) => {
        const category = row[xColumn]?.toString() || 'Unknown';
        const value = Number(row[yColumn]);
        if (isValidNumber(value)) {
          acc[category] = (acc[category] || 0) + value;
        }
        return acc;
      }, {} as Record<string, number>);

      const result = Object.entries(grouped)
        .filter(([, value]) => isValidNumber(value))
        .map(([name, value]) => ({
          name,
          value,
          [yColumn]: value
        }));

      console.log('Pie chart data prepared:', result);
      return result;
    }

    // For other charts, filter and validate data
    const processedData = sortedData
      .map(row => {
        let xValue = row[xColumn];
        let yValue = row[yColumn];

        // Process X value based on column type
        if (xCol.type === 'numeric') {
          xValue = Number(xValue);
          if (!isValidNumber(xValue)) return null;
        } else if (xCol.type === 'date') {
          // Keep as string for non-scatter charts, convert for scatter
          if (chartType === 'scatter') {
            const date = new Date(xValue);
            if (isNaN(date.getTime())) return null;
            xValue = date.getTime();
          }
        }

        // Process Y value (should always be numeric)
        yValue = Number(yValue);
        if (!isValidNumber(yValue)) return null;

        return {
          ...row,
          [xColumn]: xValue,
          [yColumn]: yValue
        };
      })
      .filter(row => row !== null);

    console.log('Chart data prepared:', processedData);
    return processedData;
  };

  const chartData = prepareChartData();

  const renderHeatmap = () => {
    if (!chartData.length) return null;

    // Get unique x and y values
    const xValues = [...new Set(chartData.map(d => d.x))];
    const yValues = [...new Set(chartData.map(d => d.y))];
    
    // Calculate cell size based on container
    const cellWidth = Math.max(40, 600 / xValues.length);
    const cellHeight = Math.max(30, 400 / yValues.length);

    // Find min and max values for color scaling
    const values = chartData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const getColor = (value: number) => {
      const intensity = (value - minValue) / (maxValue - minValue);
      const opacity = 0.2 + (intensity * 0.8);
      return `rgba(136, 132, 216, ${opacity})`;
    };

    return (
      <div className="overflow-auto">
        <svg width={xValues.length * cellWidth + 100} height={yValues.length * cellHeight + 100}>
          {/* Y-axis labels */}
          {yValues.map((yVal, yIndex) => (
            <text
              key={yVal}
              x={80}
              y={yIndex * cellHeight + cellHeight / 2 + 20}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="12"
              fill="#666"
            >
              {yVal}
            </text>
          ))}
          
          {/* X-axis labels */}
          {xValues.map((xVal, xIndex) => (
            <text
              key={xVal}
              x={xIndex * cellWidth + cellWidth / 2 + 90}
              y={yValues.length * cellHeight + 40}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize="12"
              fill="#666"
              transform={`rotate(-45, ${xIndex * cellWidth + cellWidth / 2 + 90}, ${yValues.length * cellHeight + 40})`}
            >
              {xVal}
            </text>
          ))}
          
          {/* Heatmap cells */}
          {chartData.map((point, index) => {
            const xIndex = xValues.indexOf(point.x);
            const yIndex = yValues.indexOf(point.y);
            
            return (
              <g key={index}>
                <rect
                  x={xIndex * cellWidth + 90}
                  y={yIndex * cellHeight + 20}
                  width={cellWidth - 2}
                  height={cellHeight - 2}
                  fill={getColor(point.value)}
                  stroke="#fff"
                  strokeWidth={1}
                />
                <text
                  x={xIndex * cellWidth + cellWidth / 2 + 90}
                  y={yIndex * cellHeight + cellHeight / 2 + 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#333"
                >
                  {point.value.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderStackedBar = () => {
    if (!stackColumn || !chartData.length) return null;

    // Get all unique stack values to create bars
    const stackValues = [...new Set(data.map(row => row[stackColumn]?.toString()).filter(Boolean))];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          width={800}
          height={400}
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
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
          {stackValues.map((stackVal, index) => (
            <Bar 
              key={stackVal}
              dataKey={stackVal} 
              stackId="stack"
              fill={chartColors[index % chartColors.length]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

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
      case 'heatmap':
        return renderHeatmap();

      case 'stacked-bar':
        return renderStackedBar();

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
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                dataKey={yColumn} 
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Scatter 
                dataKey={yColumn} 
                fill="#8884d8"
                name={`${yColumn} vs ${xColumn}`}
              />
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
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Chart Type</label>
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="stacked-bar">Stacked Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
                <SelectItem value="heatmap">Heatmap</SelectItem>
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
                {(chartType === 'heatmap' ? [...categoricalColumns, ...numericColumns] : numericColumns).map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name} ({col.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {chartType === 'stacked-bar' && (
            <div>
              <label className="block text-sm font-medium mb-2">Stack By</label>
              <Select value={stackColumn} onValueChange={setStackColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {categoricalColumns.map((col) => (
                    <SelectItem key={col.name} value={col.name}>
                      {col.name} ({col.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <Select value={sortColumn} onValueChange={setSortColumn}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {columns.map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name} ({col.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-2">Sort Direction</label>
            <Button
              variant="outline"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              disabled={!sortColumn || sortColumn === 'none'}
              className="flex items-center justify-center space-x-2"
            >
              {sortDirection === 'asc' ? (
                <>
                  <ArrowUp className="h-4 w-4" />
                  <span>Asc</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4" />
                  <span>Desc</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={() => {
              if (!xColumn && categoricalColumns.length > 0) {
                setXColumn(categoricalColumns[0].name);
              }
              if (!yColumn && numericColumns.length > 0) {
                setYColumn(numericColumns[0].name);
              }
              if (chartType === 'stacked-bar' && !stackColumn && categoricalColumns.length > 1) {
                setStackColumn(categoricalColumns[1].name);
              }
              if (sortColumn === 'none' && numericColumns.length > 0) {
                setSortColumn(numericColumns[0].name);
              }
            }}
            disabled={!columns.length}
          >
            Auto-select
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h4 className="text-lg font-medium">
            {chartType.charAt(0).toUpperCase() + chartType.slice(1).replace('-', ' ')} Chart
          </h4>
          {xColumn && yColumn && (
            <p className="text-sm text-gray-600">
              {xColumn} vs {yColumn} • {chartData.length} data points
              {chartType === 'stacked-bar' && stackColumn && ` • Stacked by ${stackColumn}`}
              {sortColumn && sortColumn !== 'none' && ` • Sorted by ${sortColumn} (${sortDirection})`}
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

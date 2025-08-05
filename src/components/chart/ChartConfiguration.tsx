
import React from 'react';
import { ColumnInfo } from '@/pages/Index';
import { ChartTypeSelector } from './config/ChartTypeSelector';
import { AxisConfiguration } from './config/AxisConfiguration';
import { AxisLabelConfiguration } from './config/AxisLabelConfiguration';
import { SpecializedConfiguration } from './config/SpecializedConfiguration';
import { SortConfiguration } from './config/SortConfiguration';
import { StyleConfiguration } from './config/StyleConfiguration';
import { AggregationConfiguration } from './AggregationConfiguration';
import { AggregationMethod } from './AggregationConfiguration';
import { validateChartRequirements } from '@/lib/chartTypeInfo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ChartConfigurationProps {
  chartType: string;
  xColumn: string;
  setXColumn: (value: string) => void;
  yColumn: string;
  setYColumn: (value: string) => void;
  zColumn?: string;
  setZColumn?: (value: string) => void;
  stackColumn: string;
  setStackColumn: (value: string) => void;
  sankeyTargetColumn: string;
  setSankeyTargetColumn: (value: string) => void;
  valueColumn: string;
  setValueColumn: (value: string) => void;
  sortColumn: string;
  setSortColumn: (value: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (value: 'asc' | 'desc') => void;
  setChartType: (value: any) => void;
  showDataLabels: boolean;
  setShowDataLabels: (value: boolean) => void;
  supportsDataLabels: boolean;
  selectedPalette: string;
  setSelectedPalette: (value: string) => void;
  histogramBins: number;
  setHistogramBins: (value: number) => void;
  xAxisLabel: string;
  setXAxisLabel: (value: string) => void;
  yAxisLabel: string;
  setYAxisLabel: (value: string) => void;
  aggregationMethod: AggregationMethod;
  setAggregationMethod: (value: AggregationMethod) => void;
  columns: ColumnInfo[];
  numericColumns: ColumnInfo[];
  categoricalColumns: ColumnInfo[];
  dateColumns: ColumnInfo[];
  data: any[];
}

export const ChartConfiguration = ({
  chartType,
  setChartType,
  xColumn,
  setXColumn,
  yColumn,
  setYColumn,
  zColumn,
  setZColumn,
  stackColumn,
  setStackColumn,
  valueColumn,
  setValueColumn,
  sortColumn,
  setSortColumn,
  sortDirection,
  setSortDirection,
  showDataLabels,
  setShowDataLabels,
  supportsDataLabels,
  selectedPalette,
  setSelectedPalette,
  histogramBins,
  setHistogramBins,
  xAxisLabel,
  setXAxisLabel,
  yAxisLabel,
  setYAxisLabel,
  aggregationMethod,
  setAggregationMethod,
  columns,
  numericColumns,
  categoricalColumns,
  dateColumns,
  data,
  sankeyTargetColumn,
  setSankeyTargetColumn
}: ChartConfigurationProps) => {
  // Validate current chart configuration
  const validation = validateChartRequirements(
    chartType,
    xColumn,
    yColumn,
    columns,
    data.length
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <ChartTypeSelector
          chartType={chartType}
          setChartType={setChartType}
          columns={columns}
          xColumn={xColumn}
          yColumn={yColumn}
          dataLength={data.length}
        />

      <AxisConfiguration
        chartType={chartType}
        xColumn={xColumn}
        setXColumn={setXColumn}
        yColumn={yColumn}
        setYColumn={setYColumn}
        zColumn={zColumn}
        setZColumn={setZColumn}
        numericColumns={numericColumns}
        categoricalColumns={categoricalColumns}
        dateColumns={dateColumns}
      />

        <SpecializedConfiguration
          chartType={chartType}
          stackColumn={stackColumn}
          setStackColumn={setStackColumn}
          valueColumn={valueColumn}
          setValueColumn={setValueColumn}
          histogramBins={histogramBins}
          setHistogramBins={setHistogramBins}
          numericColumns={numericColumns}
          categoricalColumns={categoricalColumns}
        />

        <SortConfiguration
          sortColumn={sortColumn}
          setSortColumn={setSortColumn}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          columns={columns}
        />
      </div>

      {/* Validation Feedback */}
      {validation.issues.length > 0 && (
        <Alert className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="font-medium mb-1">Chart Setup Issues:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validation.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
            {validation.suggestions.length > 0 && (
              <div className="mt-2">
                <div className="font-medium mb-1">Suggestions:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validation.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {validation.isValid && (xColumn || chartType === 'kpi') && (yColumn || chartType === 'histogram' || chartType === 'kpi') && (
        <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <span className="font-medium">Chart is ready!</span> Your data configuration looks good for this chart type.
          </AlertDescription>
        </Alert>
      )}

      <AggregationConfiguration
        aggregationMethod={aggregationMethod}
        setAggregationMethod={setAggregationMethod}
        yColumn={yColumn}
        chartType={chartType}
        numericColumns={numericColumns}
      />

      <AxisLabelConfiguration
        xColumn={xColumn}
        yColumn={yColumn}
        xAxisLabel={xAxisLabel}
        setXAxisLabel={setXAxisLabel}
        yAxisLabel={yAxisLabel}
        setYAxisLabel={setYAxisLabel}
        chartType={chartType}
      />

      <StyleConfiguration
        selectedPalette={selectedPalette}
        setSelectedPalette={setSelectedPalette}
        showDataLabels={showDataLabels}
        setShowDataLabels={setShowDataLabels}
        supportsDataLabels={supportsDataLabels}
      />
    </>
  );
};


import { useState, useMemo, useEffect } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { WorksheetData } from '@/types/worksheet';
import { DataSourceSelector } from './DataSourceSelector';
import { MultiWorksheetSelector } from './MultiWorksheetSelector';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'lucide-react';
import { detectCrossWorksheetRelations, JoinConfiguration } from '@/lib/crossWorksheetRelations';
import { joinWorksheetData, JoinedDataset } from '@/lib/dataJoiner';

interface ChartDataManagerProps {
  worksheets: WorksheetData[];
  selectedWorksheet: WorksheetData | null;
  onDataSourceChange: (data: DataRow[], columns: ColumnInfo[]) => void;
  onColumnSelectionReset: () => void;
}

export const ChartDataManager = ({
  worksheets,
  selectedWorksheet,
  onDataSourceChange,
  onColumnSelectionReset
}: ChartDataManagerProps) => {
  const [chartDataSource, setChartDataSource] = useState<WorksheetData | null>(null);
  const [selectedWorksheets, setSelectedWorksheets] = useState<string[]>([]);
  const [joinConfig, setJoinConfig] = useState<JoinConfiguration | null>(null);

  // Initialize chart data source when selectedWorksheet changes
  useEffect(() => {
    if (selectedWorksheet && !chartDataSource) {
      setChartDataSource(selectedWorksheet);
    }
  }, [selectedWorksheet, chartDataSource]);

  // Detect relationships between worksheets
  const crossWorksheetRelations = useMemo(() => {
    if (worksheets.length > 1) {
      try {
        return detectCrossWorksheetRelations(worksheets);
      } catch (error) {
        console.error('Error detecting cross-worksheet relations:', error);
        return [];
      }
    }
    return [];
  }, [worksheets]);

  // Create joined dataset when multiple worksheets are selected
  const joinedDataset = useMemo<JoinedDataset | null>(() => {
    if (joinConfig && selectedWorksheets.length > 1) {
      try {
        return joinWorksheetData(worksheets, joinConfig);
      } catch (error) {
        console.error('Failed to join worksheets:', error);
        return null;
      }
    }
    return null;
  }, [worksheets, joinConfig, selectedWorksheets]);

  // Update parent when data changes
  useEffect(() => {
    const activeData = joinedDataset?.data || chartDataSource?.data || [];
    const activeColumns = joinedDataset?.columns || chartDataSource?.columns || [];
    onDataSourceChange(activeData, activeColumns);
  }, [joinedDataset, chartDataSource, onDataSourceChange]);

  const handleSingleWorksheetChange = (worksheet: WorksheetData | null) => {
    setChartDataSource(worksheet);
    setSelectedWorksheets([]);
    setJoinConfig(null);
    onColumnSelectionReset();
  };

  const handleMultiWorksheetChange = (worksheetIds: string[]) => {
    setSelectedWorksheets(worksheetIds);
    if (worksheetIds.length === 0) {
      setJoinConfig(null);
    }
    setChartDataSource(null);
    onColumnSelectionReset();
  };

  return (
    <>
      {worksheets.length > 1 && (
        <MultiWorksheetSelector
          worksheets={worksheets}
          relations={crossWorksheetRelations}
          selectedWorksheets={selectedWorksheets}
          joinConfig={joinConfig}
          onWorksheetsChange={handleMultiWorksheetChange}
          onJoinConfigChange={setJoinConfig}
          onSingleWorksheetChange={handleSingleWorksheetChange}
        />
      )}
      
      {worksheets.length === 1 && (
        <DataSourceSelector
          worksheets={worksheets}
          selectedWorksheet={chartDataSource}
          onWorksheetChange={handleSingleWorksheetChange}
        />
      )}

      {joinedDataset && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Link className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800 dark:text-blue-200">Joined Dataset</span>
            <Badge variant="secondary">{joinedDataset.data.length} rows, {joinedDataset.columns.length} columns</Badge>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 whitespace-pre-line">
            {joinedDataset.joinSummary}
          </p>
        </Card>
      )}
    </>
  );
};


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Link, ArrowRight, Info } from 'lucide-react';
import { WorksheetData } from '@/types/worksheet';
import { CrossWorksheetRelation, JoinConfiguration } from '@/lib/crossWorksheetRelations';

interface MultiWorksheetSelectorProps {
  worksheets: WorksheetData[];
  relations: CrossWorksheetRelation[];
  selectedWorksheets: string[];
  joinConfig: JoinConfiguration | null;
  onWorksheetsChange: (worksheets: string[]) => void;
  onJoinConfigChange: (config: JoinConfiguration | null) => void;
  onSingleWorksheetChange: (worksheet: WorksheetData | null) => void;
}

export const MultiWorksheetSelector = ({
  worksheets,
  relations,
  selectedWorksheets,
  joinConfig,
  onWorksheetsChange,
  onJoinConfigChange,
  onSingleWorksheetChange
}: MultiWorksheetSelectorProps) => {
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [selectedSingle, setSelectedSingle] = useState<string>('');

  const handleModeChange = (newMode: 'single' | 'multi') => {
    setMode(newMode);
    if (newMode === 'single') {
      onWorksheetsChange([]);
      onJoinConfigChange(null);
    } else {
      onSingleWorksheetChange(null);
      setSelectedSingle('');
    }
  };

  const handleSingleSelection = (worksheetId: string) => {
    setSelectedSingle(worksheetId);
    const worksheet = worksheets.find(ws => ws.id === worksheetId);
    onSingleWorksheetChange(worksheet || null);
  };

  const handleWorksheetToggle = (worksheetId: string, checked: boolean) => {
    if (checked) {
      onWorksheetsChange([...selectedWorksheets, worksheetId]);
    } else {
      onWorksheetsChange(selectedWorksheets.filter(id => id !== worksheetId));
    }
  };

  const createJoinConfig = () => {
    if (selectedWorksheets.length < 2) return;

    const primaryWorksheet = selectedWorksheets[0];
    const joins = selectedWorksheets.slice(1).map(wsId => {
      const relation = relations.find(r => 
        (r.sourceWorksheet === primaryWorksheet && r.targetWorksheet === wsId) ||
        (r.targetWorksheet === primaryWorksheet && r.sourceWorksheet === wsId)
      );

      return {
        worksheet: wsId,
        relation: relation || {
          id: `auto-${primaryWorksheet}-${wsId}`,
          sourceWorksheet: primaryWorksheet,
          sourceColumn: 'id',
          targetWorksheet: wsId,
          targetColumn: 'id',
          confidence: 0.5,
          joinType: 'inner' as const,
          relationshipType: 'one-to-many' as const,
          description: 'Auto-suggested join'
        },
        joinType: 'left' as const
      };
    });

    onJoinConfigChange({
      primaryWorksheet,
      joins
    });
  };

  const availableRelations = relations.filter(r => 
    selectedWorksheets.includes(r.sourceWorksheet) && 
    selectedWorksheets.includes(r.targetWorksheet)
  );

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chart Data Source</h3>
          <div className="flex space-x-2">
            <Button
              variant={mode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('single')}
            >
              Single Sheet
            </Button>
            <Button
              variant={mode === 'multi' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('multi')}
            >
              Multiple Sheets
            </Button>
          </div>
        </div>

        {mode === 'single' ? (
          <div>
            <Select value={selectedSingle} onValueChange={handleSingleSelection}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50">
                <SelectValue placeholder="Select a worksheet..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50">
                {worksheets.map((worksheet) => (
                  <SelectItem key={worksheet.id} value={worksheet.id}>
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>{worksheet.fileName} - {worksheet.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {worksheet.data.length} rows
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select worksheets to combine:</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {worksheets.map((worksheet) => (
                  <div key={worksheet.id} className="flex items-center space-x-3 p-2 border rounded">
                    <Checkbox
                      checked={selectedWorksheets.includes(worksheet.id)}
                      onCheckedChange={(checked) => 
                        handleWorksheetToggle(worksheet.id, !!checked)
                      }
                    />
                    <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{worksheet.name}</span>
                      <div className="text-xs text-gray-500">
                        {worksheet.fileName} • {worksheet.data.length} rows
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedWorksheets.length >= 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data Relationships</span>
                  <Button size="sm" onClick={createJoinConfig}>
                    <Link className="h-4 w-4 mr-1" />
                    Auto-Join
                  </Button>
                </div>

                {availableRelations.length > 0 ? (
                  <div className="space-y-2">
                    {availableRelations.slice(0, 3).map((relation) => {
                      const sourceWs = worksheets.find(ws => ws.id === relation.sourceWorksheet);
                      const targetWs = worksheets.find(ws => ws.id === relation.targetWorksheet);
                      return (
                        <div key={relation.id} className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                          <Link className="h-3 w-3 text-blue-500" />
                          <span>
                            {sourceWs?.name}.{relation.sourceColumn} → {targetWs?.name}.{relation.targetColumn}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(relation.confidence * 100)}% match
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : selectedWorksheets.length >= 2 && (
                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                    <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium">No automatic relationships found</p>
                      <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                        You can still combine the sheets, but you may need to configure joins manually.
                      </p>
                    </div>
                  </div>
                )}

                {joinConfig && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="flex items-center space-x-2 text-sm text-green-800 dark:text-green-200">
                      <ArrowRight className="h-4 w-4" />
                      <span className="font-medium">Join Configuration Ready</span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {joinConfig.joins.length} worksheet(s) will be joined to create combined dataset
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

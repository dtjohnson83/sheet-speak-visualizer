
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit3, Check, X, Brain, Info } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';
import { useColumnTypeFeedback } from '@/hooks/useColumnTypeFeedback';
import { LearningEngine } from '@/services/learningEngine';

interface ColumnTypeOverrideProps {
  columns: ColumnInfo[];
  onColumnTypeChange: (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => void;
  datasetName?: string;
}

export const ColumnTypeOverride = ({ columns, onColumnTypeChange, datasetName }: ColumnTypeOverrideProps) => {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [tempType, setTempType] = useState<'numeric' | 'date' | 'categorical' | 'text'>('text');
  const [originalTypes, setOriginalTypes] = useState<Record<string, string>>({});
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});
  
  const { submitFeedback, isSubmitting, getFeedbackForColumn } = useColumnTypeFeedback();

  // Store original types when component mounts
  useEffect(() => {
    const types: Record<string, string> = {};
    columns.forEach(column => {
      if (!originalTypes[column.name]) {
        types[column.name] = column.type;
      }
    });
    setOriginalTypes(prev => ({ ...prev, ...types }));
    
    // Load confidence scores for each column
    const loadConfidenceScores = async () => {
      const scores: Record<string, number> = {};
      for (const column of columns) {
        const confidence = await LearningEngine.getClassificationConfidence(column.name, column.type);
        scores[column.name] = confidence;
      }
      setConfidenceScores(scores);
    };
    loadConfidenceScores();
  }, [columns]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'numeric': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'date': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'categorical': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'text': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleEditStart = (columnName: string, currentType: 'numeric' | 'date' | 'categorical' | 'text') => {
    setEditingColumn(columnName);
    setTempType(currentType);
  };

  const handleEditConfirm = () => {
    if (editingColumn) {
      const originalType = originalTypes[editingColumn] || columns.find(c => c.name === editingColumn)?.type;
      const correctedType = tempType;
      
      // Submit feedback if the type was changed from original
      if (originalType && originalType !== correctedType) {
        // For now, we'll use empty sample values since ColumnInfo doesn't have data property
        // This would need to be passed from parent component in a real implementation
        const sampleValues: string[] = [];
        
        submitFeedback({
          columnName: editingColumn,
          originalType,
          correctedType,
          sampleValues,
          datasetName,
        });
      }
      
      onColumnTypeChange(editingColumn, tempType);
      setEditingColumn(null);
    }
  };

  const handleEditCancel = () => {
    setEditingColumn(null);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold">Column Types</h4>
            <Tooltip>
              <TooltipTrigger>
                <Brain className="h-4 w-4 text-primary" />
              </TooltipTrigger>
              <TooltipContent>
                <p>AI learns from your corrections to improve future classifications</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">
            Click the edit button to manually override column types
          </p>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {columns.map((column) => {
            const confidence = confidenceScores[column.name] || 0.5;
            const feedbackCount = getFeedbackForColumn(column.name).length;
            const hasBeenCorrected = originalTypes[column.name] && originalTypes[column.name] !== column.type;
            
            return (
              <div key={column.name} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate" title={column.name}>
                      {column.name}
                    </p>
                    {hasBeenCorrected && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Brain className="h-3 w-3 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This column was corrected and the AI learned from it</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {confidence < 0.7 && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-yellow-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Low confidence classification - please review</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {editingColumn === column.name ? (
                      <div className="flex items-center gap-2">
                        <Select value={tempType} onValueChange={(value: any) => setTempType(value)}>
                          <SelectTrigger className="w-32 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="numeric">Numeric</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="categorical">Categorical</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={handleEditConfirm} 
                          className="h-7 w-7 p-0"
                          disabled={isSubmitting}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleEditCancel} className="h-7 w-7 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Badge className={`${getTypeColor(column.type)} text-xs border-0`}>
                            {column.type}
                          </Badge>
                          <span className={`text-xs ${getConfidenceColor(confidence)}`}>
                            {Math.round(confidence * 100)}%
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditStart(column.name, column.type)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {feedbackCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {feedbackCount} correction{feedbackCount !== 1 ? 's' : ''} provided
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

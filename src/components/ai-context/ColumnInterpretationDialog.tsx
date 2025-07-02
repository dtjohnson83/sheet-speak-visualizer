import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Database, TrendingUp, Hash, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';

export interface ColumnContext {
  name: string;
  description: string;
  businessMeaning: string;
  dataType: 'numeric' | 'date' | 'categorical' | 'text';
  isPrimary: boolean;
  isKPI: boolean;
  unit?: string;
  expectedRange?: string;
  relationship?: string;
}

interface ColumnInterpretationDialogProps {
  columns: ColumnInfo[];
  onInterpretationComplete: (interpretations: ColumnContext[]) => void;
  onSkip: () => void;
}

const BUSINESS_MEANINGS = {
  numeric: [
    'Revenue/Sales Amount',
    'Quantity/Count',
    'Cost/Expense',
    'Rate/Percentage',
    'Score/Rating',
    'Time Duration',
    'Distance/Size',
    'Weight/Volume',
    'Price/Value',
    'Performance Metric'
  ],
  date: [
    'Transaction Date',
    'Created Date',
    'Modified Date',
    'Due Date',
    'Start Date',
    'End Date',
    'Birth Date',
    'Event Date',
    'Reporting Period',
    'Deadline'
  ],
  categorical: [
    'Category/Type',
    'Status/State',
    'Region/Location',
    'Department/Division',
    'Product/Service',
    'Customer Segment',
    'Priority Level',
    'Classification',
    'Source/Channel',
    'User Role'
  ],
  text: [
    'Name/Title',
    'Description',
    'Address',
    'Email',
    'Phone Number',
    'Comments/Notes',
    'Code/ID',
    'URL/Link',
    'Free Text',
    'Instructions'
  ]
};

export const ColumnInterpretationDialog = ({ 
  columns, 
  onInterpretationComplete, 
  onSkip 
}: ColumnInterpretationDialogProps) => {
  const [interpretations, setInterpretations] = useState<ColumnContext[]>([]);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [ambiguousColumns, setAmbiguousColumns] = useState<string[]>([]);
  const [primaryDateColumn, setPrimaryDateColumn] = useState<string>('');

  useEffect(() => {
    // Initialize interpretations and detect ambiguous columns
    const dateColumns = columns.filter(col => col.type === 'date').map(col => col.name);
    const ambiguous = columns.filter(col => {
      const lowerName = col.name.toLowerCase();
      return (
        lowerName.includes('id') ||
        lowerName.includes('value') ||
        lowerName.includes('amount') ||
        lowerName.includes('date') ||
        lowerName.includes('number') ||
        lowerName.includes('code') ||
        lowerName.includes('type') ||
        lowerName.match(/^[a-z]$/) || // Single letter columns
        lowerName.match(/column\d+/) || // Generic column names
        lowerName.length < 3 // Very short names
      );
    }).map(col => col.name);

    setAmbiguousColumns(ambiguous);
    if (dateColumns.length === 1) {
      setPrimaryDateColumn(dateColumns[0]);
    }

    // Initialize interpretations with smart defaults
    const initialInterpretations = columns.map(col => ({
      name: col.name,
      description: '',
      businessMeaning: '',
      dataType: col.type,
      isPrimary: false,
      isKPI: false,
      unit: '',
      expectedRange: '',
      relationship: ''
    }));

    setInterpretations(initialInterpretations);
  }, [columns]);

  const updateInterpretation = (field: keyof ColumnContext, value: any) => {
    setInterpretations(prev => prev.map((interp, idx) => 
      idx === currentColumnIndex 
        ? { ...interp, [field]: value }
        : interp
    ));
  };

  const currentColumn = columns[currentColumnIndex];
  const currentInterpretation = interpretations[currentColumnIndex];
  const dateColumns = columns.filter(col => col.type === 'date');
  const isLastColumn = currentColumnIndex === columns.length - 1;
  const isAmbiguous = ambiguousColumns.includes(currentColumn?.name);

  const handleNext = () => {
    if (isLastColumn) {
      // Mark primary date column
      const finalInterpretations = interpretations.map(interp => ({
        ...interp,
        isPrimary: interp.name === primaryDateColumn || interp.isPrimary
      }));
      onInterpretationComplete(finalInterpretations);
    } else {
      setCurrentColumnIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentColumnIndex(prev => Math.max(0, prev - 1));
  };

  const handleSkipColumn = () => {
    if (isLastColumn) {
      onInterpretationComplete(interpretations);
    } else {
      setCurrentColumnIndex(prev => prev + 1);
    }
  };

  const getColumnIcon = (type: string) => {
    switch (type) {
      case 'numeric': return <TrendingUp className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'categorical': return <Database className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const getSampleValues = (column: ColumnInfo) => {
    return column.values.slice(0, 5).map(val => 
      val === null || val === undefined ? 'null' : String(val)
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Column Interpretation
          <Badge variant="outline" className="ml-auto">
            {currentColumnIndex + 1} of {columns.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Help AI understand what each column represents for better analysis and insights.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {isAmbiguous && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This column name appears ambiguous. Providing context will significantly improve AI analysis quality.
            </AlertDescription>
          </Alert>
        )}

        {dateColumns.length > 1 && (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Multiple date columns detected. Please identify the primary date column for time-series analysis.
              <Select value={primaryDateColumn} onValueChange={setPrimaryDateColumn}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select primary date column" />
                </SelectTrigger>
                <SelectContent>
                  {dateColumns.map(col => (
                    <SelectItem key={col.name} value={col.name}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            {getColumnIcon(currentColumn.type)}
            <div>
              <h3 className="font-semibold text-lg">{currentColumn.name}</h3>
              <Badge variant="outline" className="text-xs">
                {currentColumn.type}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Sample Values</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {getSampleValues(currentColumn).map((value, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Data Statistics</Label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total values: {currentColumn.values.length} | 
                Unique: {new Set(currentColumn.values).size}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Column Description</Label>
              <Input
                id="description"
                placeholder="What does this column represent?"
                value={currentInterpretation?.description || ''}
                onChange={(e) => updateInterpretation('description', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="businessMeaning">Business Meaning</Label>
              <Select 
                value={currentInterpretation?.businessMeaning || ''} 
                onValueChange={(value) => updateInterpretation('businessMeaning', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business meaning" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_MEANINGS[currentColumn.type as keyof typeof BUSINESS_MEANINGS]?.map(meaning => (
                    <SelectItem key={meaning} value={meaning}>
                      {meaning}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentColumn.type === 'numeric' && (
              <>
                <div>
                  <Label htmlFor="unit">Unit/Currency</Label>
                  <Input
                    id="unit"
                    placeholder="e.g., USD, units, percentage"
                    value={currentInterpretation?.unit || ''}
                    onChange={(e) => updateInterpretation('unit', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="expectedRange">Expected Range</Label>
                  <Input
                    id="expectedRange"
                    placeholder="e.g., 0-100, >0, 1000-50000"
                    value={currentInterpretation?.expectedRange || ''}
                    onChange={(e) => updateInterpretation('expectedRange', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isKPI"
                checked={currentInterpretation?.isKPI || false}
                onChange={(e) => updateInterpretation('isKPI', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isKPI">This is a Key Performance Indicator (KPI)</Label>
            </div>

            <div>
              <Label htmlFor="relationship">Relationship to Other Columns</Label>
              <Textarea
                id="relationship"
                placeholder="How does this column relate to others? e.g., 'Sum of X and Y', 'Foreign key to table Z'"
                value={currentInterpretation?.relationship || ''}
                onChange={(e) => updateInterpretation('relationship', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentColumnIndex === 0}
            >
              Previous
            </Button>
            <Button variant="outline" onClick={handleSkipColumn}>
              Skip This Column
            </Button>
            <Button variant="outline" onClick={onSkip}>
              Skip All
            </Button>
          </div>

          <Button onClick={handleNext} className="flex items-center gap-2">
            {isLastColumn ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Complete Setup
              </>
            ) : (
              <>
                Next Column
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileText, Table } from 'lucide-react';
import { ExportOptions } from './ExportTypes';

interface ExportConfigurationProps {
  options: ExportOptions;
  onChange: (options: ExportOptions) => void;
}

export const ExportConfiguration = ({ options, onChange }: ExportConfigurationProps) => {
  const updateOptions = (key: keyof ExportOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div className="space-y-2">
        <Label>Export Format</Label>
        <Select 
          value={options.format} 
          onValueChange={(value: 'pdf' | 'csv' | 'excel') => updateOptions('format', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PDF Report
              </div>
            </SelectItem>
            <SelectItem value="csv">
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                CSV Data
              </div>
            </SelectItem>
            <SelectItem value="excel">
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Excel Spreadsheet
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Options */}
      <div className="space-y-3">
        <Label>Include in Export</Label>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="charts"
            checked={options.includeCharts}
            onCheckedChange={(checked) => updateOptions('includeCharts', !!checked)}
          />
          <Label htmlFor="charts">Quality Score Charts</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="trends"
            checked={options.includeTrends}
            onCheckedChange={(checked) => updateOptions('includeTrends', !!checked)}
          />
          <Label htmlFor="trends">Trend Analysis</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="heatmap"
            checked={options.includeHeatmap}
            onCheckedChange={(checked) => updateOptions('includeHeatmap', !!checked)}
          />
          <Label htmlFor="heatmap">Issues Heatmap</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="recommendations"
            checked={options.includeRecommendations}
            onCheckedChange={(checked) => updateOptions('includeRecommendations', !!checked)}
          />
          <Label htmlFor="recommendations">Fix Recommendations</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="rawdata"
            checked={options.includeRawData}
            onCheckedChange={(checked) => updateOptions('includeRawData', !!checked)}
          />
          <Label htmlFor="rawdata">Raw Issue Data</Label>
        </div>
      </div>

      <Separator />

      {/* Time Range */}
      <div className="space-y-2">
        <Label>Time Range</Label>
        <Select 
          value={options.timeRange} 
          onValueChange={(value: 'current' | 'last_7_days' | 'last_30_days') => 
            updateOptions('timeRange', value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Analysis</SelectItem>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
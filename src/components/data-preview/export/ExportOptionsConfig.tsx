import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExportOptionsConfigProps {
  exportFileName: string;
  onFileNameChange: (name: string) => void;
  includeHeaders: boolean;
  onIncludeHeadersChange: (include: boolean) => void;
  dateFormat: 'iso' | 'local' | 'short';
  onDateFormatChange: (format: 'iso' | 'local' | 'short') => void;
}

export const ExportOptionsConfig = ({
  exportFileName,
  onFileNameChange,
  includeHeaders,
  onIncludeHeadersChange,
  dateFormat,
  onDateFormatChange
}: ExportOptionsConfigProps) => {
  return (
    <div className="space-y-4">
      {/* File Name */}
      <div className="space-y-2">
        <Label htmlFor="filename" className="text-sm font-semibold">File Name</Label>
        <Input
          id="filename"
          value={exportFileName}
          onChange={(e) => onFileNameChange(e.target.value)}
          placeholder="Enter filename (without extension)"
        />
      </div>

      {/* Options */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">Export Options</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="headers"
              checked={includeHeaders}
              onCheckedChange={(checked) => onIncludeHeadersChange(!!checked)}
            />
            <Label htmlFor="headers" className="text-sm">Include column headers</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="date-format" className="text-sm">Date format:</Label>
            <Select value={dateFormat} onValueChange={onDateFormatChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local (MM/DD/YYYY HH:MM:SS)</SelectItem>
                <SelectItem value="short">Short (MM/DD/YYYY)</SelectItem>
                <SelectItem value="iso">ISO (YYYY-MM-DDTHH:MM:SS.sssZ)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sanitizeChartTitle } from '@/lib/security';

interface SecureChartTitleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SecureChartTitle = ({ value, onChange, placeholder = "Enter chart title" }: SecureChartTitleProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeChartTitle(e.target.value);
    setLocalValue(sanitized);
    onChange(sanitized);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="chart-title">Chart Title</Label>
      <Input
        id="chart-title"
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={100}
        className="w-full"
      />
      {localValue.length > 80 && (
        <p className="text-sm text-yellow-600">
          Warning: Title is getting long ({localValue.length}/100 characters)
        </p>
      )}
    </div>
  );
};

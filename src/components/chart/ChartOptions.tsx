
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ColorPaletteSelector } from './ColorPaletteSelector';

interface ChartOptionsProps {
  showDataLabels: boolean;
  setShowDataLabels: (value: boolean) => void;
  supportsDataLabels: boolean;
  selectedPalette: string;
  setSelectedPalette: (value: string) => void;
}

export const ChartOptions = ({
  showDataLabels,
  setShowDataLabels,
  supportsDataLabels,
  selectedPalette,
  setSelectedPalette
}: ChartOptionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <ColorPaletteSelector
        selectedPalette={selectedPalette}
        onPaletteChange={setSelectedPalette}
      />

      {supportsDataLabels && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch
              id="data-labels"
              checked={showDataLabels}
              onCheckedChange={setShowDataLabels}
            />
            <Label htmlFor="data-labels" className="text-sm font-medium">
              Show data labels on chart
            </Label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Display values directly on chart elements for easier reading
          </p>
        </div>
      )}
    </div>
  );
};

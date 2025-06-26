
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ColorPalette {
  name: string;
  colors: string[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    name: 'Default',
    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000', '#00ffff', '#ff00ff', '#ffff00', '#0000ff']
  },
  {
    name: 'Ocean',
    colors: ['#0077be', '#00a8cc', '#4dd0e1', '#81c784', '#aed581', '#c5e1a5', '#e6ee9c', '#fff176', '#ffb74d', '#ff8a65']
  },
  {
    name: 'Sunset',
    colors: ['#ff6b35', '#f7931e', '#ffc649', '#c5d86d', '#91c7b1', '#6bb6ad', '#498693', '#2c5f7c', '#1a4663', '#0f2a44']
  },
  {
    name: 'Forest',
    colors: ['#2d5016', '#3e6b1f', '#4f7942', '#638b5a', '#7aa16b', '#94b49f', '#a9c4a9', '#c1d5c1', '#d4e2d4', '#e8f0e8']
  },
  {
    name: 'Corporate',
    colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
  },
  {
    name: 'Pastel',
    colors: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#d4baff', '#ffbaff', '#c4baff', '#baffff', '#ffbaf0']
  },
  {
    name: 'Vibrant',
    colors: ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#34495e', '#e67e22', '#16a085']
  },
  {
    name: 'Monochrome',
    colors: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#d5dbdb', '#ecf0f1', '#f8f9fa', '#e9ecef', '#dee2e6']
  }
];

interface ColorPaletteSelectorProps {
  selectedPalette: string;
  onPaletteChange: (palette: string) => void;
}

export const ColorPaletteSelector = ({ selectedPalette, onPaletteChange }: ColorPaletteSelectorProps) => {
  const selectedPaletteData = COLOR_PALETTES.find(p => p.name === selectedPalette) || COLOR_PALETTES[0];

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Color Palette</label>
      <Select value={selectedPalette} onValueChange={onPaletteChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg z-50">
          {COLOR_PALETTES.map((palette) => (
            <SelectItem key={palette.name} value={palette.name}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {palette.colors.slice(0, 5).map((color, index) => (
                    <div
                      key={index}
                      className="w-3 h-3 rounded-sm border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span>{palette.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Preview of selected palette */}
      <div className="mt-2 p-2 bg-gray-50 rounded-md">
        <div className="text-xs text-gray-600 mb-1">Preview:</div>
        <div className="flex gap-1">
          {selectedPaletteData.colors.map((color, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded border border-gray-200"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

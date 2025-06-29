
import { ChartOptions } from '../ChartOptions';

interface ChartOptionsSectionProps {
  showDataLabels: boolean;
  setShowDataLabels: (value: boolean) => void;
  supportsDataLabels: boolean;
  selectedPalette: string;
  setSelectedPalette: (value: string) => void;
}

export const ChartOptionsSection = ({
  showDataLabels,
  setShowDataLabels,
  supportsDataLabels,
  selectedPalette,
  setSelectedPalette
}: ChartOptionsSectionProps) => {
  return (
    <ChartOptions
      showDataLabels={showDataLabels}
      setShowDataLabels={setShowDataLabels}
      supportsDataLabels={supportsDataLabels}
      selectedPalette={selectedPalette}
      setSelectedPalette={setSelectedPalette}
    />
  );
};

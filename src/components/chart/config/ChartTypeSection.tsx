
import { ChartTypeSelector } from '../ChartTypeSelector';

interface ChartTypeSectionProps {
  chartType: string;
  setChartType: (value: any) => void;
}

export const ChartTypeSection = ({
  chartType,
  setChartType
}: ChartTypeSectionProps) => {
  return (
    <ChartTypeSelector
      chartType={chartType}
      setChartType={setChartType}
    />
  );
};

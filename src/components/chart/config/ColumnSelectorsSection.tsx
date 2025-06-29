
import { ColumnInfo } from '@/pages/Index';
import { ColumnSelectors } from '../ColumnSelectors';

interface ColumnSelectorsSectionProps {
  chartType: string;
  xColumn: string;
  setXColumn: (value: string) => void;
  yColumn: string;
  setYColumn: (value: string) => void;
  stackColumn: string;
  setStackColumn: (value: string) => void;
  valueColumn: string;
  setValueColumn: (value: string) => void;
  numericColumns: ColumnInfo[];
  categoricalColumns: ColumnInfo[];
  dateColumns: ColumnInfo[];
}

export const ColumnSelectorsSection = ({
  chartType,
  xColumn,
  setXColumn,
  yColumn,
  setYColumn,
  stackColumn,
  setStackColumn,
  valueColumn,
  setValueColumn,
  numericColumns,
  categoricalColumns,
  dateColumns
}: ColumnSelectorsSectionProps) => {
  return (
    <ColumnSelectors
      chartType={chartType}
      xColumn={xColumn}
      setXColumn={setXColumn}
      yColumn={yColumn}
      setYColumn={setYColumn}
      stackColumn={stackColumn}
      setStackColumn={setStackColumn}
      valueColumn={valueColumn}
      setValueColumn={setValueColumn}
      numericColumns={numericColumns}
      categoricalColumns={categoricalColumns}
      dateColumns={dateColumns}
    />
  );
};


import { Button } from '@/components/ui/button';
import { ColumnInfo } from '@/pages/Index';

interface AutoSelectSectionProps {
  columns: ColumnInfo[];
  numericColumns: ColumnInfo[];
  categoricalColumns: ColumnInfo[];
  dateColumns: ColumnInfo[];
  chartType: string;
  xColumn: string;
  yColumn: string;
  stackColumn: string;
  valueColumn: string;
  sortColumn: string;
  setXColumn: (value: string) => void;
  setYColumn: (value: string) => void;
  setStackColumn: (value: string) => void;
  setValueColumn: (value: string) => void;
  setSortColumn: (value: string) => void;
}

export const AutoSelectSection = ({
  columns,
  numericColumns,
  categoricalColumns,
  dateColumns,
  chartType,
  xColumn,
  yColumn,
  stackColumn,
  valueColumn,
  sortColumn,
  setXColumn,
  setYColumn,
  setStackColumn,
  setValueColumn,
  setSortColumn
}: AutoSelectSectionProps) => {
  const autoSelect = () => {
    console.log('Auto-select triggered with available columns:', {
      categoricalColumns: categoricalColumns.map(col => col.name),
      numericColumns: numericColumns.map(col => col.name),
      dateColumns: dateColumns.map(col => col.name)
    });

    // Auto-select X column based on chart type
    if (!xColumn) {
      if (chartType === 'scatter') {
        // For scatter plots, X should be numeric or date
        const availableXColumns = [...numericColumns, ...dateColumns];
        if (availableXColumns.length > 0) {
          console.log('Auto-selecting X column for scatter:', availableXColumns[0].name);
          setXColumn(availableXColumns[0].name);
        }
      } else {
        // For other charts, X should be categorical or date
        const availableXColumns = [...categoricalColumns, ...dateColumns];
        if (availableXColumns.length > 0) {
          console.log('Auto-selecting X column:', availableXColumns[0].name);
          setXColumn(availableXColumns[0].name);
        }
      }
    }

    // Auto-select Y column based on chart type
    if (!yColumn) {
      if (chartType === 'heatmap') {
        // For heatmaps, Y can be categorical or numeric
        const availableYColumns = [...categoricalColumns, ...numericColumns];
        if (availableYColumns.length > 0) {
          console.log('Auto-selecting Y column for heatmap:', availableYColumns[0].name);
          setYColumn(availableYColumns[0].name);
        }
      } else if (chartType === 'sankey') {
        // For sankey, target should be categorical and different from source
        const availableYColumns = categoricalColumns.filter(col => col.name !== xColumn);
        if (availableYColumns.length > 0) {
          console.log('Auto-selecting Y column for sankey:', availableYColumns[0].name);
          setYColumn(availableYColumns[0].name);
        }
      } else {
        // For most charts, Y should be numeric
        if (numericColumns.length > 0) {
          console.log('Auto-selecting Y column:', numericColumns[0].name);
          setYColumn(numericColumns[0].name);
        }
      }
    }

    // Auto-select stack column for stacked bar charts
    if (chartType === 'stacked-bar' && !stackColumn) {
      const availableStackColumns = categoricalColumns.filter(col => col.name !== xColumn);
      if (availableStackColumns.length > 0) {
        console.log('Auto-selecting stack column:', availableStackColumns[0].name);
        setStackColumn(availableStackColumns[0].name);
      }
    }

    // Auto-select value column for charts that need it
    if ((chartType === 'heatmap' || chartType === 'sankey') && !valueColumn) {
      if (numericColumns.length > 0) {
        const availableValueColumns = numericColumns.filter(col => col.name !== yColumn);
        const columnToSelect = availableValueColumns.length > 0 ? availableValueColumns[0] : numericColumns[0];
        console.log('Auto-selecting value column:', columnToSelect.name);
        setValueColumn(columnToSelect.name);
      }
    }

    // Auto-select sort column
    if (sortColumn === 'none' && numericColumns.length > 0) {
      console.log('Auto-selecting sort column:', numericColumns[0].name);
      setSortColumn(numericColumns[0].name);
    }
  };

  return (
    <div className="flex justify-end mb-8">
      <Button 
        onClick={autoSelect}
        disabled={!columns.length}
      >
        Auto-select
      </Button>
    </div>
  );
};

import { LucideIcon } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface TabInfo {
  id: string;
  label: string;
  icon: LucideIcon;
  badge: number | null;
}

export interface TierInfo {
  title: string;
  description: string;
  icon: LucideIcon;
  color: 'blue' | 'teal' | 'green' | 'amber';
  tabs: TabInfo[];
}

export interface DataTabsSectionProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  worksheetName: string;
  tiles: any[];
  filters: any[];
  currentDatasetId: string;
  showContextSetup: boolean;
  selectedDataSource: string;
  showDataSourceDialog: boolean;
  onAddTile: (tile: any) => void;
  onRemoveTile: (id: string) => void;
  onUpdateTile: (id: string, updates: any) => void;
  onFiltersChange: (filters: any[]) => void;
  onLoadDashboard: (tiles: any[], filters: any[], data?: DataRow[], columns?: ColumnInfo[]) => void;
  onContextReady: (context: any) => void;
  onSkipContext: () => void;
  onColumnTypeChange: (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => void;
  onDataSourceSelect: (type: string) => void;
  onDataSourceDialogChange: (open: boolean) => void;
  onDataLoaded: (loadedData: DataRow[], detectedColumns: ColumnInfo[], name: string, worksheet?: string) => void;
  onAIUsed?: () => void;
}

export type ProgressStatus = 'complete' | 'active' | 'pending';

import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { AppLayout } from '@/components/layout/AppLayout';

export interface DataRow {
  [key: string]: any;
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'date' | 'categorical' | 'text';
  values: any[];
}

const Index = () => {
  // Initialize session monitoring
  useSessionMonitor();

  return <AppLayout />;
};

export default Index;

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { ValidityCheck } from '../quality-checks/ValidityCheck';
import { ConformityCheck } from '../quality-checks/ConformityCheck';
import { AnomalyDetectionCheck } from '../quality-checks/AnomalyDetectionCheck';
import { FreshnessCheck } from '../quality-checks/FreshnessCheck';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface AdvancedChecksTabProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const AdvancedChecksTab = ({ data, columns }: AdvancedChecksTabProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAllChecks = async () => {
    console.log('Refresh All button clicked');
    setIsRefreshing(true);
    
    try {
      // Force re-render of all check components by changing the key
      setRefreshKey(prev => prev + 1);
      console.log('Refresh key updated');
      
      // Add a small delay to show the refreshing state
      setTimeout(() => {
        setIsRefreshing(false);
        console.log('Refresh completed');
      }, 500);
    } catch (error) {
      console.error('Error during refresh:', error);
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Advanced Quality Checks Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Advanced Quality Checks
              </CardTitle>
              <CardDescription>
                7 comprehensive quality dimensions beyond traditional metrics
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshAllChecks}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh All'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Advanced Quality Checks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ValidityCheck key={`validity-${refreshKey}`} data={data} columns={columns} />
        <ConformityCheck key={`conformity-${refreshKey}`} data={data} columns={columns} />
        <AnomalyDetectionCheck key={`anomaly-${refreshKey}`} data={data} columns={columns} />
        <FreshnessCheck key={`freshness-${refreshKey}`} data={data} columns={columns} />
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { DataPreview } from '@/components/DataPreview';
import { EnhancedDataModelDashboard } from '@/components/data-model/EnhancedDataModelDashboard';
import { useEnhancedDatasetManager } from '@/hooks/useEnhancedDatasetManager';
import { useTutorialProgress } from '@/hooks/useTutorialProgress';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface TabContentPreviewProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  onColumnTypeChange: (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => void;
}

export const TabContentPreview: React.FC<TabContentPreviewProps> = ({
  data,
  columns,
  fileName,
  onColumnTypeChange
}) => {
  const enhancedManager = useEnhancedDatasetManager();
  const { markQualityUnderstood, markRelationshipsDiscovered } = useTutorialProgress();
  
  // Get current dataset and quality profile from enhanced manager
  const currentDataset = enhancedManager.currentDataset;
  const qualityProfile = currentDataset ? enhancedManager.getQualityProfile(currentDataset.id) : null;

  // Load enhanced dataset when data changes
  useEffect(() => {
    // Only load if we have valid data and it's not empty
    if (data && data.length > 0 && columns && columns.length > 0 && fileName) {
      console.log('Loading enhanced dataset for:', fileName, 'with', data.length, 'rows');
      enhancedManager.loadEnhancedDataset(data, columns, fileName);
    }
  }, [data, columns, fileName, enhancedManager]);

  // Mark quality understood when quality profile is available
  useEffect(() => {
    if (qualityProfile) {
      markQualityUnderstood();
    }
  }, [qualityProfile, markQualityUnderstood]);

  // Enhanced column type change handler
  const handleEnhancedColumnTypeChange = async (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => {
    // Update basic column type first
    onColumnTypeChange(columnName, newType);
    
    // Update enhanced dataset if available
    if (currentDataset) {
      await enhancedManager.updateColumnType(currentDataset.id, columnName, newType);
    }
  };

  // Enhanced relationship discovery handler with tutorial tracking
  const handleDiscoverRelationships = async () => {
    const result = await enhancedManager.discoverRelationships();
    if (result.success && result.confirmed && result.confirmed.length > 0) {
      markRelationshipsDiscovered();
    }
    return result;
  };

  return (
    <TabsContent value="preview" className="space-y-4">
      {/* Enhanced Data Model Dashboard */}
      <Card className="p-6">
        <EnhancedDataModelDashboard
          dataset={currentDataset}
          qualityProfile={qualityProfile}
          relationships={enhancedManager.discoveredRelationships}
          isAnalyzing={enhancedManager.isAnalyzing}
          analysisProgress={enhancedManager.analysisProgress}
          onDiscoverRelationships={handleDiscoverRelationships}
        />
      </Card>

      {/* Traditional Data Preview */}
      <Card className="p-6">
        <DataPreview 
          data={data} 
          columns={columns} 
          fileName={fileName}
          onColumnTypeChange={handleEnhancedColumnTypeChange}
        />
      </Card>
    </TabsContent>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Target, 
  Heart,
  Play,
  Info,
  Database
} from 'lucide-react';
import { demoDatasets, getDemoDatasetCategories, getDemoDatasetsByCategory, DemoDataset } from '@/data/demoDatasets';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DemoDatasetSelectorProps {
  onDatasetSelect: (data: DataRow[], columns: ColumnInfo[], name: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Target,
  Heart
};

export const DemoDatasetSelector: React.FC<DemoDatasetSelectorProps> = ({
  onDatasetSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedDataset, setExpandedDataset] = useState<string | null>(null);
  const categories = getDemoDatasetCategories();

  const handleDatasetLoad = (dataset: DemoDataset) => {
    onDatasetSelect(dataset.data, dataset.columns, dataset.name);
  };

  const getFilteredDatasets = () => {
    if (selectedCategory === 'all') {
      return demoDatasets;
    }
    return getDemoDatasetsByCategory(selectedCategory);
  };

  const DatasetCard = ({ dataset }: { dataset: DemoDataset }) => {
    const IconComponent = iconMap[dataset.icon] || Database;
    const isExpanded = expandedDataset === dataset.id;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{dataset.name}</CardTitle>
                <CardDescription className="text-sm">
                  {dataset.description}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary">{dataset.category}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            <span>{dataset.data.length} records</span>
            <span>•</span>
            <span>{dataset.columns.length} columns</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {dataset.suggestedCharts.slice(0, 3).map((chart, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {chart}
              </Badge>
            ))}
            {dataset.suggestedCharts.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{dataset.suggestedCharts.length - 3} more
              </Badge>
            )}
          </div>

          {isExpanded && (
            <div className="space-y-3 pt-3 border-t">
              <div>
                <h4 className="font-medium text-sm mb-2">Business Context</h4>
                <p className="text-sm text-muted-foreground">{dataset.businessContext}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Learning Objectives</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {dataset.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => handleDatasetLoad(dataset)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Load Dataset
            </Button>
            <Button
              variant="outline"
              onClick={() => setExpandedDataset(isExpanded ? null : dataset.id)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Explore with Sample Data</h3>
        <p className="text-sm text-muted-foreground">
          Get started quickly with pre-loaded datasets covering common business scenarios
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Datasets</TabsTrigger>
          <TabsTrigger value="Sales & Marketing">Sales</TabsTrigger>
          <TabsTrigger value="E-commerce">E-commerce</TabsTrigger>
          <TabsTrigger value="Finance">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4 mt-6">
          <div className="grid gap-4">
            {getFilteredDatasets().map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
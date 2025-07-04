import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, FileText, Cloud, Zap, HardDrive } from 'lucide-react';
import { DataSourceType } from '@/types/dataSources';

interface DataSourceOption {
  type: string;
  name: string;
  description: string;
  category: DataSourceType;
  icon: React.ReactNode;
  status: 'available' | 'coming_soon' | 'premium';
}

interface DataSourceSelectorProps {
  onSelect: (type: string) => void;
  selectedType?: string;
}

const dataSourceOptions: DataSourceOption[] = [
  {
    type: 'file',
    name: 'File Upload',
    description: 'Excel, CSV, and other file formats',
    category: 'file',
    icon: <FileText className="h-4 w-4" />,
    status: 'available'
  },
  {
    type: 'json',
    name: 'JSON Data',
    description: 'JSON files, URLs, or direct input',
    category: 'file',
    icon: <FileText className="h-4 w-4" />,
    status: 'available'
  },
  {
    type: 'postgresql',
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL databases',
    category: 'database',
    icon: <Database className="h-4 w-4" />,
    status: 'available'
  },
  {
    type: 'mysql',
    name: 'MySQL',
    description: 'Connect to MySQL databases',
    category: 'database',
    icon: <Database className="h-4 w-4" />,
    status: 'coming_soon'
  },
  {
    type: 'google_sheets',
    name: 'Google Sheets',
    description: 'Import from Google Sheets',
    category: 'cloud_storage',
    icon: <Cloud className="h-4 w-4" />,
    status: 'available'
  },
  {
    type: 'salesforce',
    name: 'Salesforce',
    description: 'CRM and sales data',
    category: 'api',
    icon: <Zap className="h-4 w-4" />,
    status: 'coming_soon'
  },
  {
    type: 'google_analytics',
    name: 'Google Analytics',
    description: 'Website analytics data',
    category: 'api',
    icon: <Zap className="h-4 w-4" />,
    status: 'coming_soon'
  },
  {
    type: 'aws_s3',
    name: 'AWS S3',
    description: 'Files from S3 buckets',
    category: 'cloud_storage',
    icon: <HardDrive className="h-4 w-4" />,
    status: 'coming_soon'
  }
];

const categoryIcons = {
  file: <FileText className="h-5 w-5" />,
  database: <Database className="h-5 w-5" />,
  api: <Zap className="h-5 w-5" />,
  cloud_storage: <Cloud className="h-5 w-5" />,
  stream: <HardDrive className="h-5 w-5" />
};

export const DataSourceSelector = ({ onSelect, selectedType }: DataSourceSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<DataSourceType | 'all'>('all');

  const categories = ['all', ...Array.from(new Set(dataSourceOptions.map(opt => opt.category)))] as (DataSourceType | 'all')[];
  
  const filteredOptions = selectedCategory === 'all' 
    ? dataSourceOptions 
    : dataSourceOptions.filter(opt => opt.category === selectedCategory);

  const availableOptions = filteredOptions.filter(opt => opt.status === 'available');
  const comingSoonOptions = filteredOptions.filter(opt => opt.status === 'coming_soon');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as DataSourceType | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="file">Files</SelectItem>
            <SelectItem value="database">Databases</SelectItem>
            <SelectItem value="api">APIs</SelectItem>
            <SelectItem value="cloud_storage">Cloud Storage</SelectItem>
            <SelectItem value="stream">Real-time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {availableOptions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Available Data Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableOptions.map((option) => (
              <Card 
                key={option.type}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedType === option.type ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelect(option.type)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <CardTitle className="text-base">{option.name}</CardTitle>
                    </div>
                    <Badge variant="default" className="text-xs">
                      Available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{option.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {comingSoonOptions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comingSoonOptions.map((option) => (
              <Card key={option.type} className="opacity-60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <CardTitle className="text-base">{option.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{option.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
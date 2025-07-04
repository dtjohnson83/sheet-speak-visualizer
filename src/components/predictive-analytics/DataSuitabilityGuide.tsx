import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DataSuitabilityGuideProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const DataSuitabilityGuide = ({ data, columns }: DataSuitabilityGuideProps) => {
  const checkDataSuitability = () => {
    const results = {
      revenueColumns: [] as string[],
      customerColumns: [] as string[],
      volumeColumns: [] as string[],
      numericColumns: columns.filter(c => c.type === 'numeric').length,
      totalRows: data.length,
      suggestions: [] as string[]
    };

    // Check for revenue-related columns
    const revenueKeywords = ['revenue', 'sales', 'income', 'price', 'amount', 'cost', 'total'];
    results.revenueColumns = columns
      .filter(col => revenueKeywords.some(keyword => col.name.toLowerCase().includes(keyword)))
      .map(col => col.name);

    // Check for customer-related columns
    const customerKeywords = ['customer', 'user', 'client'];
    results.customerColumns = columns
      .filter(col => customerKeywords.some(keyword => col.name.toLowerCase().includes(keyword)))
      .map(col => col.name);

    // Check for volume-related columns
    const volumeKeywords = ['volume', 'quantity', 'count'];
    results.volumeColumns = columns
      .filter(col => volumeKeywords.some(keyword => col.name.toLowerCase().includes(keyword)))
      .map(col => col.name);

    // Generate suggestions
    if (results.revenueColumns.length === 0) {
      results.suggestions.push('Add columns with revenue, sales, price, or amount data');
    }
    if (results.numericColumns < 2) {
      results.suggestions.push('Ensure columns with numbers are marked as "numeric" type');
    }
    if (results.totalRows < 10) {
      results.suggestions.push('Upload more data rows (minimum 10+ recommended)');
    }
    if (results.customerColumns.length === 0 && results.volumeColumns.length === 0) {
      results.suggestions.push('Include customer or volume/quantity data for better predictions');
    }

    return results;
  };

  const suitability = checkDataSuitability();
  const isGoodForPredictions = suitability.revenueColumns.length > 0 && 
                               suitability.numericColumns > 0 && 
                               suitability.totalRows > 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isGoodForPredictions ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          Data Suitability Analysis
        </CardTitle>
        <CardDescription>
          Check if your data is suitable for predictive analytics
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Revenue/Financial Columns</span>
            <Badge variant={suitability.revenueColumns.length > 0 ? "default" : "secondary"}>
              {suitability.revenueColumns.length} found
            </Badge>
          </div>
          {suitability.revenueColumns.length > 0 && (
            <div className="text-xs text-muted-foreground ml-4">
              {suitability.revenueColumns.join(', ')}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Numeric Columns</span>
            <Badge variant={suitability.numericColumns > 0 ? "default" : "secondary"}>
              {suitability.numericColumns} found
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Data Rows</span>
            <Badge variant={suitability.totalRows > 10 ? "default" : "secondary"}>
              {suitability.totalRows} rows
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Customer Columns</span>
            <Badge variant={suitability.customerColumns.length > 0 ? "default" : "outline"}>
              {suitability.customerColumns.length} found
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Volume Columns</span>
            <Badge variant={suitability.volumeColumns.length > 0 ? "default" : "outline"}>
              {suitability.volumeColumns.length} found
            </Badge>
          </div>
        </div>

        {suitability.suggestions.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">Suggestions to improve predictions:</span>
            </div>
            <ul className="text-xs space-y-1 text-muted-foreground">
              {suitability.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-700">
            <strong>Best practices:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Include columns with keywords: revenue, sales, price, amount, cost</li>
              <li>• Ensure numeric columns are properly typed</li>
              <li>• Have at least 10+ rows of data</li>
              <li>• Include time-series data for better trends</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
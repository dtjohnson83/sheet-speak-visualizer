import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Sparkles } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/types/data';

interface NaturalLanguageQueryProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onQueryResult: (data: DataRow[]) => void;
}

export const NaturalLanguageQuery = ({ data, columns, onQueryResult }: NaturalLanguageQueryProps) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const { toast } = useToast();

  const sampleQueries = [
    "Show me the average of [numeric column]",
    "Filter rows where [column] is greater than [value]",
    "Show only rows with [category] equal to [value]",
    "Sort by [column] in descending order",
    "Show top 10 rows by [numeric column]"
  ];

  const processNaturalLanguageQuery = async (queryText: string) => {
    console.log('Processing query:', queryText);
    setIsProcessing(true);
    setLastQuery(queryText);
    
    try {
      let filteredData = [...data];
      const lowerQuery = queryText.toLowerCase();
      
      // Basic keyword-based parsing
      const numericColumns = columns.filter(col => col.type === 'numeric');
      const categoricalColumns = columns.filter(col => col.type === 'categorical' || col.type === 'text');
      
      // Handle "average" queries
      if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
        const numericCol = numericColumns.find(col => 
          lowerQuery.includes(col.name.toLowerCase())
        );
        
        if (numericCol) {
          const values = data.map(row => Number(row[numericCol.name])).filter(val => !isNaN(val));
          const average = values.reduce((sum, val) => sum + val, 0) / values.length;
          
          toast({
            title: "Query Result",
            description: `Average ${numericCol.name}: ${average.toFixed(2)}`,
          });
          
          // Show all data for visualization
          onQueryResult(filteredData);
          return;
        }
      }
      
      // Handle "filter" or "where" queries
      if (lowerQuery.includes('filter') || lowerQuery.includes('where')) {
        // Extract column names and values from query
        const words = queryText.split(' ');
        let columnName = '';
        let filterValue = '';
        let operator = 'equals';
        
        // Find column name
        for (const col of columns) {
          if (lowerQuery.includes(col.name.toLowerCase())) {
            columnName = col.name;
            break;
          }
        }
        
        // Determine operator
        if (lowerQuery.includes('greater than') || lowerQuery.includes('>')) {
          operator = 'greater';
        } else if (lowerQuery.includes('less than') || lowerQuery.includes('<')) {
          operator = 'less';
        } else if (lowerQuery.includes('equal') || lowerQuery.includes('=')) {
          operator = 'equals';
        }
        
        // Extract value (look for numbers or quoted strings)
        const numberMatch = queryText.match(/\d+\.?\d*/);
        const quotedMatch = queryText.match(/"([^"]+)"|'([^']+)'/);
        
        if (numberMatch) {
          filterValue = numberMatch[0];
        } else if (quotedMatch) {
          filterValue = quotedMatch[1] || quotedMatch[2];
        }
        
        if (columnName && filterValue) {
          filteredData = data.filter(row => {
            const cellValue = row[columnName];
            const numericValue = Number(cellValue);
            const numericFilter = Number(filterValue);
            
            switch (operator) {
              case 'greater':
                return !isNaN(numericValue) && !isNaN(numericFilter) && numericValue > numericFilter;
              case 'less':
                return !isNaN(numericValue) && !isNaN(numericFilter) && numericValue < numericFilter;
              case 'equals':
              default:
                return cellValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
            }
          });
          
          toast({
            title: "Query Result",
            description: `Filtered to ${filteredData.length} rows`,
          });
        }
      }
      
      // Handle "sort" queries
      if (lowerQuery.includes('sort')) {
        const columnName = columns.find(col => 
          lowerQuery.includes(col.name.toLowerCase())
        )?.name;
        
        if (columnName) {
          const descending = lowerQuery.includes('descending') || lowerQuery.includes('desc');
          
          filteredData.sort((a, b) => {
            const aVal = a[columnName];
            const bVal = b[columnName];
            
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return descending ? bVal - aVal : aVal - bVal;
            }
            
            const aStr = aVal?.toString() || '';
            const bStr = bVal?.toString() || '';
            return descending ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
          });
          
          toast({
            title: "Query Result",
            description: `Sorted by ${columnName} ${descending ? 'descending' : 'ascending'}`,
          });
        }
      }
      
      // Handle "top N" queries
      const topMatch = lowerQuery.match(/top (\d+)/);
      if (topMatch) {
        const n = parseInt(topMatch[1]);
        filteredData = filteredData.slice(0, n);
        
        toast({
          title: "Query Result",
          description: `Showing top ${n} rows`,
        });
      }
      
      // Update query history
      setQueryHistory(prev => [queryText, ...prev.slice(0, 4)]);
      onQueryResult(filteredData);
      
    } catch (error) {
      console.error('Error processing query:', error);
      toast({
        title: "Error",
        description: "Failed to process the query. Please try a different approach.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      processNaturalLanguageQuery(query.trim());
    }
  };

  const resetData = () => {
    onQueryResult(data);
    setLastQuery('');
    toast({
      title: "Data Reset",
      description: "Showing all original data",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">Natural Language Query</h3>
        <p className="text-gray-600 mb-4">
          Ask questions about your data in plain English
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="e.g., Show me the average sales by month"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isProcessing}
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={isProcessing || !query.trim()}>
          <Search className="h-4 w-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Query'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={resetData}
          disabled={isProcessing}
        >
          Reset
        </Button>
      </form>

      {lastQuery && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-blue-700">Last Query:</span>
            <span className="text-blue-600">{lastQuery}</span>
          </div>
        </Card>
      )}

      {queryHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Recent Queries</h4>
          <div className="flex flex-wrap gap-2">
            {queryHistory.map((historyQuery, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => setQuery(historyQuery)}
              >
                {historyQuery}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium mb-2">Sample Queries</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sampleQueries.map((sample, index) => (
            <Card 
              key={index}
              className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setQuery(sample)}
            >
              <p className="text-sm text-gray-600">{sample}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

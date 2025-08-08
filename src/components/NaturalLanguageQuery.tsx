import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Network, Sparkles } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import { GraphRAGQueryEngine } from '@/components/graph/GraphRAGQueryEngine';

interface NaturalLanguageQueryProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onQueryResult: (data: DataRow[]) => void;
}

interface QueryMode {
  id: 'basic' | 'graph';
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NaturalLanguageQuery: React.FC<NaturalLanguageQueryProps> = ({
  data,
  columns,
  onQueryResult
}) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<'basic' | 'graph'>('graph');
  const { toast } = useToast();

  const queryModes: QueryMode[] = [
    {
      id: 'basic',
      name: 'Basic Query',
      description: 'Traditional keyword-based querying',
      icon: Search
    },
    {
      id: 'graph',
      name: 'GraphRAG',
      description: 'AI-powered graph-based intelligent querying',
      icon: Network
    }
  ];

  const generateSampleQueries = (): string[] => {
    if (!columns || columns.length === 0) {
      return ["Upload data to see sample queries"];
    }
    
    const queries: string[] = [];
    const numericColumns = columns.filter(col => col.type === 'numeric');
    const categoricalColumns = columns.filter(col => col.type === 'categorical');
    
    if (numericColumns.length > 0) {
      queries.push(`Show me the average of ${numericColumns[0].name}`);
      queries.push(`Show top 10 rows by ${numericColumns[0].name}`);
    }
    
    if (categoricalColumns.length > 0) {
      const firstCatValues = categoricalColumns[0].values || [];
      if (firstCatValues.length > 0) {
        queries.push(`Show only rows where ${categoricalColumns[0].name} equals ${firstCatValues[0]}`);
      }
    }
    
    if (columns.length > 0) {
      queries.push(`Sort by ${columns[0].name} in descending order`);
      queries.push(`Filter rows where ${columns[0].name} is not empty`);
    }
    
    return queries.slice(0, 5); // Limit to 5 queries
  };

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

  // Show GraphRAG component when in graph mode
  if (selectedMode === 'graph') {
    return <GraphRAGQueryEngine data={data} columns={columns} onQueryResult={onQueryResult} />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Natural Language Query
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Query Mode Selector */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Query Engine:</h4>
          <div className="flex gap-2">
            {queryModes.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <Button
                  key={mode.id}
                  variant={selectedMode === mode.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMode(mode.id)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {mode.name}
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {queryModes.find(m => m.id === selectedMode)?.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            id="query-input"
            name="naturalLanguageQuery"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask questions about your data in plain English..."
            disabled={isProcessing}
            className="flex-1"
            autoComplete="off"
          />
          <Button 
            type="submit" 
            disabled={isProcessing || !query.trim()}
            size="sm"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={resetData}
            size="sm"
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
            {generateSampleQueries().map((sample, index) => (
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
      </CardContent>
    </Card>
  );
};

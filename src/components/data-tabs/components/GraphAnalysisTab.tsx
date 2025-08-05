import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraphRAGQueryEngine } from '@/components/graph/GraphRAGQueryEngine';
import { Network, Brain, Search } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface GraphAnalysisTabProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  onQueryResult?: (results: any) => void;
}

export const GraphAnalysisTab: React.FC<GraphAnalysisTabProps> = ({
  data,
  columns,
  fileName,
  onQueryResult
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>Graph Analysis & Knowledge Discovery</CardTitle>
          </div>
          <CardDescription>
            Explore relationships and patterns in your data using advanced graph analytics and natural language queries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <Search className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium mb-1">Natural Language Queries</h3>
              <p className="text-sm text-muted-foreground">Ask questions about your data in plain English</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Network className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium mb-1">Relationship Discovery</h3>
              <p className="text-sm text-muted-foreground">Automatically detect connections and patterns</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium mb-1">Knowledge Graph</h3>
              <p className="text-sm text-muted-foreground">Build and explore semantic relationships</p>
            </div>
          </div>
          
          <GraphRAGQueryEngine
            data={data}
            columns={columns}
            onQueryResult={onQueryResult}
          />
        </CardContent>
      </Card>
    </div>
  );
};
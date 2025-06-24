
import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { ChartVisualization } from '@/components/ChartVisualization';
import { NaturalLanguageQuery } from '@/components/NaturalLanguageQuery';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface DataRow {
  [key: string]: any;
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'date' | 'categorical' | 'text';
  values: any[];
}

const Index = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);

  const handleDataLoaded = (loadedData: DataRow[], detectedColumns: ColumnInfo[], name: string) => {
    console.log('Data loaded:', { loadedData, detectedColumns, name });
    setData(loadedData);
    setColumns(detectedColumns);
    setFileName(name);
    setFilteredData(loadedData);
  };

  const handleQueryResult = (queryData: DataRow[]) => {
    console.log('Query result:', queryData);
    setFilteredData(queryData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sheet Speak Visualizer
          </h1>
          <p className="text-lg text-gray-600">
            Upload Excel files, visualize data, and query with natural language
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </Card>

          {data.length > 0 && (
            <>
              <Card className="p-6">
                <NaturalLanguageQuery 
                  data={data} 
                  columns={columns} 
                  onQueryResult={handleQueryResult}
                />
              </Card>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Data Preview</TabsTrigger>
                  <TabsTrigger value="charts">Visualizations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-4">
                  <Card className="p-6">
                    <DataPreview 
                      data={filteredData} 
                      columns={columns} 
                      fileName={fileName}
                    />
                  </Card>
                </TabsContent>
                
                <TabsContent value="charts" className="space-y-4">
                  <Card className="p-6">
                    <ChartVisualization 
                      data={filteredData} 
                      columns={columns}
                    />
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

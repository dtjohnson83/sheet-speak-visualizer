import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Database, Link, Plus } from 'lucide-react';
import { DatasetInfo } from '@/contexts/AppStateContext';
import { ColumnInfo, DataRow } from '@/pages/Index';

interface DatasetMergeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataset1: DatasetInfo;
  dataset2: DatasetInfo;
  onMerge: (mergedDataset: DatasetInfo) => void;
}

type JoinType = 'inner' | 'left' | 'right' | 'full';

export const DatasetMergeDialog: React.FC<DatasetMergeDialogProps> = ({
  open,
  onOpenChange,
  dataset1,
  dataset2,
  onMerge,
}) => {
  const [mergedName, setMergedName] = useState(`${dataset1.name} + ${dataset2.name}`);
  const [joinType, setJoinType] = useState<JoinType>('inner');
  const [joinColumn1, setJoinColumn1] = useState<string>('');
  const [joinColumn2, setJoinColumn2] = useState<string>('');
  const [mergeType, setMergeType] = useState<'join' | 'union'>('join');

  const commonColumns = useMemo(() => {
    return dataset1.columns.filter(col1 => 
      dataset2.columns.find(col2 => col2.name === col1.name && col2.type === col1.type)
    );
  }, [dataset1.columns, dataset2.columns]);

  const canUnion = useMemo(() => {
    return dataset1.columns.length === dataset2.columns.length &&
           dataset1.columns.every(col1 => 
             dataset2.columns.find(col2 => col2.name === col1.name && col2.type === col1.type)
           );
  }, [dataset1.columns, dataset2.columns]);

  const performJoin = (type: JoinType, col1: string, col2: string): DataRow[] => {
    const result: DataRow[] = [];
    const data1 = dataset1.data;
    const data2 = dataset2.data;

    if (type === 'inner') {
      data1.forEach(row1 => {
        const matchingRows = data2.filter(row2 => row1[col1] === row2[col2]);
        matchingRows.forEach(row2 => {
          const combined = { ...row1 };
          Object.keys(row2).forEach(key => {
            if (key !== col2) {
              combined[key === col1 ? key : `${dataset2.name}_${key}`] = row2[key];
            }
          });
          result.push(combined);
        });
      });
    } else if (type === 'left') {
      data1.forEach(row1 => {
        const matchingRows = data2.filter(row2 => row1[col1] === row2[col2]);
        if (matchingRows.length > 0) {
          matchingRows.forEach(row2 => {
            const combined = { ...row1 };
            Object.keys(row2).forEach(key => {
              if (key !== col2) {
                combined[key === col1 ? key : `${dataset2.name}_${key}`] = row2[key];
              }
            });
            result.push(combined);
          });
        } else {
          const combined = { ...row1 };
          dataset2.columns.forEach(col => {
            if (col.name !== col2) {
              combined[col.name === col1 ? col.name : `${dataset2.name}_${col.name}`] = null;
            }
          });
          result.push(combined);
        }
      });
    }
    // Add other join types as needed

    return result;
  };

  const performUnion = (): DataRow[] => {
    return [...dataset1.data, ...dataset2.data];
  };

  const generateMergedColumns = (): ColumnInfo[] => {
    if (mergeType === 'union') {
      return dataset1.columns;
    }

    const columns: ColumnInfo[] = [...dataset1.columns];
    dataset2.columns.forEach(col2 => {
      if (col2.name !== joinColumn2) {
        const existingCol = columns.find(col => col.name === col2.name);
        if (!existingCol) {
          columns.push({
            ...col2,
            name: col2.name === joinColumn1 ? col2.name : `${dataset2.name}_${col2.name}`
          });
        }
      }
    });

    return columns;
  };

  const handleMerge = () => {
    let mergedData: DataRow[];
    
    if (mergeType === 'union') {
      mergedData = performUnion();
    } else {
      mergedData = performJoin(joinType, joinColumn1, joinColumn2);
    }

    const mergedColumns = generateMergedColumns();

    const mergedDataset: DatasetInfo = {
      id: `merged_${Date.now()}`,
      name: mergedName,
      fileName: `${mergedName}.merged`,
      worksheetName: 'Merged Data',
      data: mergedData,
      columns: mergedColumns,
      isSaved: false,
      lastModified: new Date(),
      rowCount: mergedData.length,
      columnCount: mergedColumns.length,
    };

    onMerge(mergedDataset);
    onOpenChange(false);
  };

  const previewData = useMemo(() => {
    if (mergeType === 'union') {
      return performUnion().slice(0, 5);
    }
    
    if (joinColumn1 && joinColumn2) {
      return performJoin(joinType, joinColumn1, joinColumn2).slice(0, 5);
    }
    
    return [];
  }, [mergeType, joinType, joinColumn1, joinColumn2]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Merge Datasets</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  {dataset1.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rows:</span>
                    <span>{dataset1.rowCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Columns:</span>
                    <span>{dataset1.columnCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  {dataset2.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rows:</span>
                    <span>{dataset2.rowCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Columns:</span>
                    <span>{dataset2.columnCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="mergedName">Merged Dataset Name</Label>
              <Input
                id="mergedName"
                value={mergedName}
                onChange={(e) => setMergedName(e.target.value)}
                placeholder="Enter name for merged dataset"
              />
            </div>

            <Tabs value={mergeType} onValueChange={(value) => setMergeType(value as any)}>
              <TabsList>
                <TabsTrigger value="join">Join</TabsTrigger>
                <TabsTrigger value="union" disabled={!canUnion}>
                  Union {!canUnion && '(incompatible schemas)'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="join" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Join Column from {dataset1.name}</Label>
                    <Select value={joinColumn1} onValueChange={setJoinColumn1}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataset1.columns.map((col) => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name} ({col.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Join Type</Label>
                    <Select value={joinType} onValueChange={(value) => setJoinType(value as JoinType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inner">Inner Join</SelectItem>
                        <SelectItem value="left">Left Join</SelectItem>
                        <SelectItem value="right">Right Join</SelectItem>
                        <SelectItem value="full">Full Join</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Join Column from {dataset2.name}</Label>
                    <Select value={joinColumn2} onValueChange={setJoinColumn2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataset2.columns.map((col) => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name} ({col.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {commonColumns.length > 0 && (
                  <div>
                    <Label>Common Columns (suggested for joining)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonColumns.map((col) => (
                        <Badge
                          key={col.name}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => {
                            setJoinColumn1(col.name);
                            setJoinColumn2(col.name);
                          }}
                        >
                          {col.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="union">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Union will combine all rows from both datasets. The datasets have identical schemas.
                  </p>
                  
                  <div>
                    <Label>Estimated Result</Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Total Rows:</span>
                        <span>{(dataset1.rowCount + dataset2.rowCount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Columns:</span>
                        <span>{dataset1.columnCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {previewData.length > 0 && (
              <div>
                <Label>Preview (first 5 rows)</Label>
                <div className="mt-2 max-h-48 overflow-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {generateMergedColumns().map((col) => (
                          <th key={col.name} className="px-2 py-1 text-left">
                            {col.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-t">
                          {generateMergedColumns().map((col) => (
                            <td key={col.name} className="px-2 py-1">
                              {row[col.name] !== null ? String(row[col.name]) : 'null'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMerge}
            disabled={
              !mergedName ||
              (mergeType === 'join' && (!joinColumn1 || !joinColumn2))
            }
          >
            Merge Datasets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
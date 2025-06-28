import { WorksheetData } from '@/types/worksheet';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { CrossWorksheetRelation, JoinConfiguration } from './crossWorksheetRelations';

export interface JoinedDataset {
  data: DataRow[];
  columns: ColumnInfo[];
  sourceWorksheets: string[];
  joinSummary: string;
}

export const joinWorksheetData = (
  worksheets: WorksheetData[],
  config: JoinConfiguration
): JoinedDataset => {
  const primaryWorksheet = worksheets.find(ws => ws.id === config.primaryWorksheet);
  if (!primaryWorksheet) {
    throw new Error('Primary worksheet not found');
  }

  let resultData = [...primaryWorksheet.data];
  let resultColumns = [...primaryWorksheet.columns.map(col => ({
    ...col,
    name: `${primaryWorksheet.name}.${col.name}`,
    originalName: col.name,
    worksheet: primaryWorksheet.name
  }))];
  
  const sourceWorksheets = [primaryWorksheet.id];
  const joinSummary: string[] = [`Started with ${primaryWorksheet.name} (${resultData.length} rows)`];

  // Apply each join sequentially
  for (const join of config.joins) {
    const targetWorksheet = worksheets.find(ws => ws.id === join.worksheet);
    if (!targetWorksheet) continue;

    const beforeCount = resultData.length;
    
    resultData = performJoin(
      resultData,
      targetWorksheet.data,
      join.relation,
      join.joinType,
      primaryWorksheet.name,
      targetWorksheet.name
    );

    // Add columns from the joined worksheet
    const newColumns = targetWorksheet.columns.map(col => ({
      ...col,
      name: `${targetWorksheet.name}.${col.name}`,
      originalName: col.name,
      worksheet: targetWorksheet.name
    }));
    
    resultColumns = [...resultColumns, ...newColumns];
    sourceWorksheets.push(targetWorksheet.id);
    
    joinSummary.push(
      `${join.joinType.toUpperCase()} JOIN with ${targetWorksheet.name} on ${join.relation.sourceColumn} = ${join.relation.targetColumn} (${beforeCount} → ${resultData.length} rows)`
    );
  }

  return {
    data: resultData,
    columns: resultColumns,
    sourceWorksheets,
    joinSummary: joinSummary.join('\n')
  };
};

const performJoin = (
  leftData: DataRow[],
  rightData: DataRow[],
  relation: CrossWorksheetRelation,
  joinType: 'inner' | 'left' | 'right' | 'outer',
  leftPrefix: string,
  rightPrefix: string
): DataRow[] => {
  const result: DataRow[] = [];
  const leftKey = relation.sourceColumn;
  const rightKey = relation.targetColumn;

  // Create lookup maps for right data
  const rightLookup = new Map<any, DataRow[]>();
  rightData.forEach(row => {
    const key = row[rightKey];
    if (key != null) {
      if (!rightLookup.has(key)) {
        rightLookup.set(key, []);
      }
      rightLookup.get(key)!.push(row);
    }
  });

  // Process left data
  const processedRightKeys = new Set();
  
  leftData.forEach(leftRow => {
    const leftKeyValue = leftRow[leftKey];
    const rightMatches = rightLookup.get(leftKeyValue) || [];
    
    if (rightMatches.length > 0) {
      // Found matches
      rightMatches.forEach(rightRow => {
        const joinedRow: DataRow = {};
        
        // Add left data with prefix
        Object.entries(leftRow).forEach(([key, value]) => {
          joinedRow[`${leftPrefix}.${key}`] = value;
        });
        
        // Add right data with prefix
        Object.entries(rightRow).forEach(([key, value]) => {
          joinedRow[`${rightPrefix}.${key}`] = value;
        });
        
        result.push(joinedRow);
      });
      
      processedRightKeys.add(leftKeyValue);
    } else if (joinType === 'left' || joinType === 'outer') {
      // Left join: keep left row with null right values
      const joinedRow: DataRow = {};
      
      Object.entries(leftRow).forEach(([key, value]) => {
        joinedRow[`${leftPrefix}.${key}`] = value;
      });
      
      // Add null values for right columns
      rightData[0] && Object.keys(rightData[0]).forEach(key => {
        joinedRow[`${rightPrefix}.${key}`] = null;
      });
      
      result.push(joinedRow);
    }
  });

  // Handle right outer join
  if (joinType === 'right' || joinType === 'outer') {
    rightData.forEach(rightRow => {
      const rightKeyValue = rightRow[rightKey];
      if (!processedRightKeys.has(rightKeyValue)) {
        const joinedRow: DataRow = {};
        
        // Add null values for left columns
        leftData[0] && Object.keys(leftData[0]).forEach(key => {
          joinedRow[`${leftPrefix}.${key}`] = null;
        });
        
        // Add right data
        Object.entries(rightRow).forEach(([key, value]) => {
          joinedRow[`${rightPrefix}.${key}`] = value;
        });
        
        result.push(joinedRow);
      }
    });
  }

  return result;
};

export const suggestJoinConfiguration = (
  worksheets: WorksheetData[],
  relations: CrossWorksheetRelation[]
): JoinConfiguration[] => {
  if (worksheets.length < 2) return [];

  const suggestions: JoinConfiguration[] = [];
  
  // Find the worksheet with the most relationships as primary
  const worksheetRelationCounts = worksheets.map(ws => ({
    worksheet: ws,
    relationCount: relations.filter(r => 
      r.sourceWorksheet === ws.id || r.targetWorksheet === ws.id
    ).length
  }));
  
  const primaryWs = worksheetRelationCounts
    .sort((a, b) => b.relationCount - a.relationCount)[0]?.worksheet;
    
  if (!primaryWs) return suggestions;

  // Create join configuration
  const joins = relations
    .filter(r => r.sourceWorksheet === primaryWs.id || r.targetWorksheet === primaryWs.id)
    .filter(r => r.confidence > 0.5)
    .slice(0, 3) // Limit to avoid complexity
    .map(relation => ({
      worksheet: relation.sourceWorksheet === primaryWs.id ? relation.targetWorksheet : relation.sourceWorksheet,
      relation,
      joinType: 'left' as const
    }));

  if (joins.length > 0) {
    suggestions.push({
      primaryWorksheet: primaryWs.id,
      joins
    });
  }

  return suggestions;
};

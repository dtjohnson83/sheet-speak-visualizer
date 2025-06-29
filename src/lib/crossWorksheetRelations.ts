
import { WorksheetData } from '@/types/worksheet';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface CrossWorksheetRelation {
  id: string;
  sourceWorksheet: string;
  sourceColumn: string;
  targetWorksheet: string;
  targetColumn: string;
  confidence: number;
  joinType: 'inner' | 'left' | 'right' | 'outer';
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many';
  description: string;
}

export interface JoinConfiguration {
  primaryWorksheet: string;
  joins: Array<{
    worksheet: string;
    relation: CrossWorksheetRelation;
    joinType: 'inner' | 'left' | 'right' | 'outer';
  }>;
}

export const detectCrossWorksheetRelations = (worksheets: WorksheetData[]): CrossWorksheetRelation[] => {
  const relations: CrossWorksheetRelation[] = [];
  
  // Compare each worksheet with every other worksheet
  for (let i = 0; i < worksheets.length; i++) {
    for (let j = i + 1; j < worksheets.length; j++) {
      const ws1 = worksheets[i];
      const ws2 = worksheets[j];
      
      // Find potential matching columns
      const potentialMatches = findMatchingColumns(ws1, ws2);
      
      potentialMatches.forEach(match => {
        relations.push({
          id: `${ws1.id}-${ws2.id}-${match.col1}-${match.col2}`,
          sourceWorksheet: ws1.id,
          sourceColumn: match.col1,
          targetWorksheet: ws2.id,
          targetColumn: match.col2,
          confidence: match.confidence,
          joinType: 'inner',
          relationshipType: match.relationshipType,
          description: `${ws1.name}.${match.col1} → ${ws2.name}.${match.col2} (${match.confidence.toFixed(2)} confidence)`
        });
      });
    }
  }
  
  return relations.sort((a, b) => b.confidence - a.confidence);
};

const findMatchingColumns = (ws1: WorksheetData, ws2: WorksheetData) => {
  const matches: Array<{
    col1: string;
    col2: string;
    confidence: number;
    relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many';
  }> = [];
  
  ws1.columns.forEach(col1 => {
    ws2.columns.forEach(col2 => {
      // Skip if different data types
      if (col1.type !== col2.type) return;
      
      // Check for name-based matches
      const nameMatch = calculateNameSimilarity(col1.name, col2.name);
      if (nameMatch > 0.6) {
        const valueMatch = calculateValueOverlap(
          col1.values.slice(0, 100), 
          col2.values.slice(0, 100)
        );
        
        if (valueMatch > 0.3) {
          const relationshipType = determineRelationshipType(col1.values, col2.values);
          matches.push({
            col1: col1.name,
            col2: col2.name,
            confidence: (nameMatch * 0.6 + valueMatch * 0.4),
            relationshipType
          });
        }
      }
      
      // Check for ID-based relationships
      if (col1.name.toLowerCase().includes('id') || col2.name.toLowerCase().includes('id')) {
        const valueMatch = calculateValueOverlap(
          col1.values.slice(0, 100),
          col2.values.slice(0, 100)
        );
        
        if (valueMatch > 0.5) {
          const relationshipType = determineRelationshipType(col1.values, col2.values);
          matches.push({
            col1: col1.name,
            col2: col2.name,
            confidence: Math.min(0.9, valueMatch + 0.2),
            relationshipType
          });
        }
      }
    });
  });
  
  return matches;
};

const calculateNameSimilarity = (name1: string, name2: string): number => {
  const n1 = name1.toLowerCase().trim();
  const n2 = name2.toLowerCase().trim();
  
  if (n1 === n2) return 1.0;
  
  // Check for common patterns
  const patterns = [
    { pattern: /_?id$/i, replacement: '' },
    { pattern: /^id_?/i, replacement: '' },
    { pattern: /_name$/i, replacement: '' },
    { pattern: /_code$/i, replacement: '' }
  ];
  
  let clean1 = n1;
  let clean2 = n2;
  
  patterns.forEach(({ pattern, replacement }) => {
    clean1 = clean1.replace(pattern, replacement);
    clean2 = clean2.replace(pattern, replacement);
  });
  
  if (clean1 === clean2) return 0.9;
  
  // Simple substring matching
  if (clean1.includes(clean2) || clean2.includes(clean1)) return 0.7;
  
  return 0;
};

const calculateValueOverlap = (values1: any[], values2: any[]): number => {
  const set1 = new Set(values1.filter(v => v != null));
  const set2 = new Set(values2.filter(v => v != null));
  
  if (set1.size === 0 || set2.size === 0) return 0;
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

const determineRelationshipType = (values1: any[], values2: any[]): 'one-to-one' | 'one-to-many' | 'many-to-many' => {
  const uniqueValues1 = new Set(values1.filter(v => v != null));
  const uniqueValues2 = new Set(values2.filter(v => v != null));
  
  const ratio1 = uniqueValues1.size / values1.length;
  const ratio2 = uniqueValues2.size / values2.length;
  
  if (ratio1 > 0.9 && ratio2 > 0.9) return 'one-to-one';
  if (ratio1 > 0.9 || ratio2 > 0.9) return 'one-to-many';
  
  return 'many-to-many';
};

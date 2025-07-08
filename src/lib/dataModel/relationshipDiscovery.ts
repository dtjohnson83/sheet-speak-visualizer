// Automatic Relationship Discovery Engine
import { DataRow } from '@/pages/Index';
import { EnhancedColumnInfo, DatasetRelationship } from '@/types/dataModel';

export interface RelationshipCandidate {
  sourceColumn: string;
  targetDatasetId: string;
  targetColumn: string;
  confidence: number;
  evidenceType: 'name_similarity' | 'value_overlap' | 'referential_integrity' | 'pattern_match';
  evidence: string[];
  suggestedType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
}

/**
 * Automatic relationship discovery between datasets
 */
export class RelationshipDiscoveryEngine {
  
  /**
   * Discover relationships between multiple datasets
   */
  static discoverRelationships(
    datasets: Array<{
      id: string;
      name: string;
      data: DataRow[];
      columns: EnhancedColumnInfo[];
    }>
  ): RelationshipCandidate[] {
    const candidates: RelationshipCandidate[] = [];
    
    // Compare each dataset with every other dataset
    for (let i = 0; i < datasets.length; i++) {
      for (let j = i + 1; j < datasets.length; j++) {
        const sourceDataset = datasets[i];
        const targetDataset = datasets[j];
        
        // Find relationships in both directions
        candidates.push(...this.findRelationshipsBetween(sourceDataset, targetDataset));
        candidates.push(...this.findRelationshipsBetween(targetDataset, sourceDataset));
      }
    }
    
    // Sort by confidence and remove duplicates
    return candidates
      .sort((a, b) => b.confidence - a.confidence)
      .filter((candidate, index, array) => 
        array.findIndex(other => 
          other.sourceColumn === candidate.sourceColumn && 
          other.targetDatasetId === candidate.targetDatasetId && 
          other.targetColumn === candidate.targetColumn
        ) === index
      );
  }
  
  /**
   * Find relationships between two specific datasets
   */
  private static findRelationshipsBetween(
    sourceDataset: {
      id: string;
      name: string;
      data: DataRow[];
      columns: EnhancedColumnInfo[];
    },
    targetDataset: {
      id: string;
      name: string;
      data: DataRow[];
      columns: EnhancedColumnInfo[];
    }
  ): RelationshipCandidate[] {
    const candidates: RelationshipCandidate[] = [];
    
    sourceDataset.columns.forEach(sourceColumn => {
      targetDataset.columns.forEach(targetColumn => {
        const candidate = this.analyzeColumnRelationship(
          sourceColumn,
          sourceDataset.data,
          targetColumn,
          targetDataset.data,
          targetDataset.id
        );
        
        if (candidate) {
          candidates.push(candidate);
        }
      });
    });
    
    return candidates;
  }
  
  /**
   * Analyze potential relationship between two columns
   */
  private static analyzeColumnRelationship(
    sourceColumn: EnhancedColumnInfo,
    sourceData: DataRow[],
    targetColumn: EnhancedColumnInfo,
    targetData: DataRow[],
    targetDatasetId: string
  ): RelationshipCandidate | null {
    const evidence: string[] = [];
    let confidence = 0;
    let evidenceType: RelationshipCandidate['evidenceType'] = 'value_overlap';
    
    // Extract values for comparison
    const sourceValues = sourceData.map(row => row[sourceColumn.name])
      .filter(v => v !== null && v !== undefined && v !== '');
    const targetValues = targetData.map(row => row[targetColumn.name])
      .filter(v => v !== null && v !== undefined && v !== '');
    
    if (sourceValues.length === 0 || targetValues.length === 0) {
      return null;
    }
    
    // 1. Name similarity analysis
    const nameSimilarity = this.calculateNameSimilarity(sourceColumn.name, targetColumn.name);
    if (nameSimilarity > 0.7) {
      confidence += nameSimilarity * 40;
      evidence.push(`Column names are similar (${(nameSimilarity * 100).toFixed(0)}% match)`);
      evidenceType = 'name_similarity';
    }
    
    // 2. Value overlap analysis
    const sourceSet = new Set(sourceValues.map(v => String(v).toLowerCase()));
    const targetSet = new Set(targetValues.map(v => String(v).toLowerCase()));
    const intersection = new Set([...sourceSet].filter(x => targetSet.has(x)));
    
    const overlapRatio = intersection.size / Math.min(sourceSet.size, targetSet.size);
    if (overlapRatio > 0.1) {
      confidence += overlapRatio * 30;
      evidence.push(`${intersection.size} overlapping values (${(overlapRatio * 100).toFixed(1)}% overlap)`);
      if (evidenceType === 'value_overlap') evidenceType = 'value_overlap';
    }
    
    // 3. Type compatibility
    if (sourceColumn.type === targetColumn.type) {
      confidence += 10;
      evidence.push('Compatible data types');
    }
    
    // 4. Semantic type compatibility
    if (sourceColumn.semanticType === targetColumn.semanticType) {
      confidence += 15;
      evidence.push('Compatible semantic types');
    }
    
    // 5. Pattern matching for common relationships
    const patternMatch = this.detectPatternRelationship(sourceColumn.name, targetColumn.name);
    if (patternMatch) {
      confidence += 20;
      evidence.push(patternMatch.description);
      evidenceType = 'pattern_match';
    }
    
    // 6. Referential integrity check
    const integrityCheck = this.checkReferentialIntegrity(sourceValues, targetValues);
    if (integrityCheck.isValid) {
      confidence += 25;
      evidence.push(`Referential integrity: ${integrityCheck.description}`);
      evidenceType = 'referential_integrity';
    }
    
    // Determine relationship type
    const suggestedType = this.determineRelationshipType(sourceValues, targetValues, intersection);
    
    // Only return candidates with reasonable confidence
    if (confidence >= 30 && evidence.length > 0) {
      return {
        sourceColumn: sourceColumn.name,
        targetDatasetId,
        targetColumn: targetColumn.name,
        confidence: Math.min(100, confidence),
        evidenceType,
        evidence,
        suggestedType
      };
    }
    
    return null;
  }
  
  /**
   * Calculate similarity between column names
   */
  private static calculateNameSimilarity(name1: string, name2: string): number {
    const normalize = (name: string) => 
      name.toLowerCase()
        .replace(/[_-]/g, '')
        .replace(/id$/i, '')
        .replace(/key$/i, '')
        .trim();
    
    const norm1 = normalize(name1);
    const norm2 = normalize(name2);
    
    if (norm1 === norm2) return 1;
    
    // Levenshtein distance
    const matrix = Array(norm2.length + 1).fill(null).map(() => Array(norm1.length + 1).fill(null));
    
    for (let i = 0; i <= norm1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= norm2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= norm2.length; j++) {
      for (let i = 1; i <= norm1.length; i++) {
        const indicator = norm1[i - 1] === norm2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    const distance = matrix[norm2.length][norm1.length];
    const maxLength = Math.max(norm1.length, norm2.length);
    return maxLength > 0 ? 1 - (distance / maxLength) : 0;
  }
  
  /**
   * Detect common relationship patterns
   */
  private static detectPatternRelationship(
    sourceName: string, 
    targetName: string
  ): { description: string } | null {
    const source = sourceName.toLowerCase();
    const target = targetName.toLowerCase();
    
    // Common ID relationship patterns
    const idPatterns = [
      { pattern: /(.+)_id$/, target: /^\1$/ },
      { pattern: /^id$/, target: /(.+)/ },
      { pattern: /(.+)_key$/, target: /^\1$/ },
      { pattern: /(.+)_ref$/, target: /^\1$/ }
    ];
    
    for (const { pattern, target: targetPattern } of idPatterns) {
      const match = source.match(pattern);
      if (match && targetPattern.test(target)) {
        return { description: 'Foreign key relationship pattern detected' };
      }
    }
    
    // Hierarchical patterns
    if ((source.includes('parent') && target.includes('child')) ||
        (source.includes('category') && target.includes('subcategory'))) {
      return { description: 'Hierarchical relationship pattern detected' };
    }
    
    return null;
  }
  
  /**
   * Check referential integrity between columns
   */
  private static checkReferentialIntegrity(
    sourceValues: any[], 
    targetValues: any[]
  ): { isValid: boolean; description: string } {
    const sourceSet = new Set(sourceValues.map(v => String(v)));
    const targetSet = new Set(targetValues.map(v => String(v)));
    
    // Check if all source values exist in target (foreign key constraint)
    const missingInTarget = [...sourceSet].filter(v => !targetSet.has(v));
    if (missingInTarget.length === 0) {
      return { 
        isValid: true, 
        description: 'All source values exist in target (valid foreign key)' 
      };
    }
    
    // Check if all target values exist in source (reverse foreign key)
    const missingInSource = [...targetSet].filter(v => !sourceSet.has(v));
    if (missingInSource.length === 0) {
      return { 
        isValid: true, 
        description: 'All target values exist in source (valid reverse foreign key)' 
      };
    }
    
    // Partial referential integrity
    const validReferences = sourceSet.size - missingInTarget.length;
    const integrityRatio = validReferences / sourceSet.size;
    
    if (integrityRatio > 0.8) {
      return { 
        isValid: true, 
        description: `High referential integrity (${(integrityRatio * 100).toFixed(1)}% valid references)` 
      };
    }
    
    return { isValid: false, description: 'Low referential integrity' };
  }
  
  /**
   * Determine the type of relationship based on value cardinality
   */
  private static determineRelationshipType(
    sourceValues: any[], 
    targetValues: any[], 
    intersection: Set<string>
  ): 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many' {
    const sourceUnique = new Set(sourceValues).size;
    const targetUnique = new Set(targetValues).size;
    
    const sourceUniqueRatio = sourceUnique / sourceValues.length;
    const targetUniqueRatio = targetUnique / targetValues.length;
    
    // One-to-one: both sides have mostly unique values
    if (sourceUniqueRatio > 0.9 && targetUniqueRatio > 0.9) {
      return 'one-to-one';
    }
    
    // One-to-many: source is more unique than target
    if (sourceUniqueRatio > 0.8 && targetUniqueRatio < 0.8) {
      return 'one-to-many';
    }
    
    // Many-to-one: target is more unique than source
    if (targetUniqueRatio > 0.8 && sourceUniqueRatio < 0.8) {
      return 'many-to-one';
    }
    
    // Many-to-many: both sides have low uniqueness
    return 'many-to-many';
  }
  
  /**
   * Validate a relationship candidate with additional data
   */
  static validateRelationship(
    candidate: RelationshipCandidate,
    sourceData: DataRow[],
    targetData: DataRow[]
  ): { isValid: boolean; confidence: number; issues: string[] } {
    const issues: string[] = [];
    let adjustedConfidence = candidate.confidence;
    
    // Additional validation logic would go here
    // For example, statistical tests, domain validation rules, etc.
    
    return {
      isValid: adjustedConfidence >= 50,
      confidence: adjustedConfidence,
      issues
    };
  }
}
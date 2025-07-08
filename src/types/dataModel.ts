// Enhanced Data Modeling Types - Core data modeling interfaces
import { DataRow, ColumnInfo } from '@/pages/Index';

// ===== ENHANCED COLUMN METADATA =====
export interface ColumnConstraint {
  type: 'required' | 'unique' | 'range' | 'format' | 'custom';
  rule: string | number | RegExp;
  message?: string;
}

export interface ColumnStatistics {
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mode?: any;
  nullCount: number;
  uniqueCount: number;
  distribution?: Record<string, number>;
  outliers?: any[];
}

export interface ColumnRelationship {
  targetDatasetId: string;
  targetColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  confidence: number;
  discovered: boolean;
}

export interface EnhancedColumnInfo extends ColumnInfo {
  // Enhanced metadata
  constraints?: ColumnConstraint[];
  statistics?: ColumnStatistics;
  relationships?: ColumnRelationship[];
  
  // Semantic information
  semanticType?: 'identifier' | 'measure' | 'dimension' | 'temporal' | 'geospatial';
  displayName?: string;
  description?: string;
  unit?: string;
  format?: string;
  
  // Quality information
  qualityScore?: number;
  qualityIssues?: string[];
  
  // Version tracking
  version?: number;
  lastModified?: Date;
}

// ===== DATA QUALITY PROFILES =====
export interface DataQualityProfile {
  completeness: number; // 0-1 score
  validity: number; // 0-1 score
  consistency: number; // 0-1 score
  accuracy: number; // 0-1 score
  overallScore: number;
  issues: QualityIssue[];
  recommendations: string[];
  lastAssessed: Date;
}

export interface QualityIssue {
  type: 'missing_values' | 'invalid_format' | 'inconsistent_type' | 'outlier' | 'duplicate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedRows: number[];
  suggestedFix?: string;
}

// ===== DATASET SCHEMA VERSIONING =====
export interface DatasetSchema {
  version: number;
  columns: EnhancedColumnInfo[];
  relationships: DatasetRelationship[];
  qualityProfile: DataQualityProfile;
  created: Date;
  modified: Date;
  checksum: string;
}

export interface DatasetRelationship {
  sourceColumn: string;
  targetDatasetId: string;
  targetColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  confidence: number;
  discovered: boolean;
  validated: boolean;
}

// ===== ENHANCED DATASET INTERFACES =====
export interface EnhancedDataset {
  // Core properties (backward compatibility)
  id: string;
  name: string;
  description?: string;
  data: DataRow[];
  columns: EnhancedColumnInfo[];
  
  // Enhanced properties
  schema: DatasetSchema;
  qualityProfile: DataQualityProfile;
  relationships: DatasetRelationship[];
  
  // Storage optimization
  storageType: 'jsonb' | 'columnar' | 'hybrid';
  compressionLevel?: number;
  indexedColumns?: string[];
  
  // Caching strategy
  accessPattern: 'hot' | 'warm' | 'cold';
  lastAccessed: Date;
  accessCount: number;
  
  // Metadata
  source: {
    type: 'file' | 'api' | 'database' | 'generated';
    origin: string;
    importedAt: Date;
  };
  
  // Version tracking
  version: number;
  versionHistory: DatasetVersion[];
  
  // Audit trail
  created: Date;
  modified: Date;
  createdBy: string;
  modifiedBy: string;
}

export interface DatasetVersion {
  version: number;
  changes: string[];
  schema: DatasetSchema;
  created: Date;
  createdBy: string;
  rowCount: number;
  checksum: string;
}

// ===== TYPE-SAFE DATA INTERFACES =====
export interface TypedDataValue {
  raw: any;
  typed: any;
  valid: boolean;
  errors?: string[];
}

export interface TypedDataRow {
  [columnName: string]: TypedDataValue;
}

export interface TypedDataset {
  id: string;
  schema: DatasetSchema;
  rows: TypedDataRow[];
  typingErrors: number;
  validationWarnings: string[];
}

// ===== COLUMNAR STORAGE PATTERNS =====
export interface ColumnStore {
  [columnName: string]: {
    values: any[];
    nullMask: boolean[];
    statistics: ColumnStatistics;
    encoding: 'raw' | 'dictionary' | 'rle' | 'delta';
    compressed: boolean;
  };
}

export interface HybridDataset extends EnhancedDataset {
  columnStore?: ColumnStore;
  useColumnarForAnalytics: boolean;
  columnarThreshold: number; // Row count threshold to switch to columnar
}

// ===== CACHING INTERFACES =====
export interface CacheEntry<T = any> {
  key: string;
  data: T;
  tier: 'memory' | 'local' | 'remote';
  expiry: Date;
  accessCount: number;
  lastAccessed: Date;
  size: number;
}

export interface CacheStrategy {
  hotDataMemoryLimit: number; // MB
  warmDataLocalLimit: number; // MB
  coldDataRemoteOnly: boolean;
  ttl: {
    hot: number; // minutes
    warm: number; // hours
    cold: number; // days
  };
}

// ===== BACKWARD COMPATIBILITY =====
export type LegacyDataRow = DataRow;
export type LegacyColumnInfo = ColumnInfo;

// Helper type to maintain compatibility while allowing enhanced features
export type CompatibleDataset = {
  // Legacy properties (required for backward compatibility)
  id: string;
  name: string;
  description?: string;
  data: DataRow[];
  columns: ColumnInfo[];
  
  // Enhanced properties (optional for gradual adoption)
  enhanced?: {
    schema?: DatasetSchema;
    qualityProfile?: DataQualityProfile;
    relationships?: DatasetRelationship[];
    storageOptimization?: {
      type: 'jsonb' | 'columnar' | 'hybrid';
      compression?: number;
    };
    caching?: {
      pattern: 'hot' | 'warm' | 'cold';
      lastAccessed: Date;
    };
  };
};
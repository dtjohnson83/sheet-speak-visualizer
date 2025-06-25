
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface HierarchyRelation {
  parentColumn: string;
  childColumn: string;
  confidence: number;
  type: 'naming' | 'reference' | 'nested';
  description: string;
}

export interface HierarchyNode {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  children: HierarchyNode[];
  count: number;
}

export const detectHierarchies = (data: DataRow[], columns: ColumnInfo[]): HierarchyRelation[] => {
  const relations: HierarchyRelation[] = [];
  
  // 1. Detect naming-based hierarchies (parent/child, category/subcategory, etc.)
  const namingPatterns = [
    { parent: /parent/i, child: /child/i },
    { parent: /category/i, child: /subcategory/i },
    { parent: /group/i, child: /subgroup/i },
    { parent: /department/i, child: /subdepartment/i },
    { parent: /region/i, child: /area/i },
    { parent: /country/i, child: /state|province|city/i },
    { parent: /manager/i, child: /employee/i },
  ];

  for (const pattern of namingPatterns) {
    const parentCols = columns.filter(col => pattern.parent.test(col.name));
    const childCols = columns.filter(col => pattern.child.test(col.name));
    
    for (const parentCol of parentCols) {
      for (const childCol of childCols) {
        if (parentCol.name !== childCol.name) {
          relations.push({
            parentColumn: parentCol.name,
            childColumn: childCol.name,
            confidence: 0.8,
            type: 'naming',
            description: `Detected hierarchy based on column names: ${parentCol.name} → ${childCol.name}`
          });
        }
      }
    }
  }

  // 2. Detect reference-based hierarchies (ID relationships)
  const idColumns = columns.filter(col => 
    col.name.toLowerCase().includes('id') || 
    col.name.toLowerCase().endsWith('_id')
  );

  for (const idCol of idColumns) {
    // Look for potential parent column (remove 'id' suffix and look for matching column)
    const baseName = idCol.name.replace(/_?id$/i, '');
    const potentialParent = columns.find(col => 
      col.name.toLowerCase() === baseName.toLowerCase() ||
      col.name.toLowerCase() === baseName.toLowerCase() + '_name' ||
      col.name.toLowerCase() === baseName.toLowerCase() + 'name'
    );

    if (potentialParent && potentialParent.name !== idCol.name) {
      // Check if the ID values actually reference the parent values
      const idValues = new Set(data.map(row => row[idCol.name]).filter(v => v != null));
      const parentValues = new Set(data.map(row => row[potentialParent.name]).filter(v => v != null));
      
      // Calculate how many ID values have corresponding parent values
      const matchCount = Array.from(idValues).filter(id => 
        data.some(row => row[potentialParent.name] === id)
      ).length;
      
      const confidence = idValues.size > 0 ? matchCount / idValues.size : 0;
      
      if (confidence > 0.3) {
        relations.push({
          parentColumn: potentialParent.name,
          childColumn: idCol.name,
          confidence: Math.min(confidence, 0.9),
          type: 'reference',
          description: `ID reference relationship: ${potentialParent.name} referenced by ${idCol.name}`
        });
      }
    }
  }

  // 3. Detect nested hierarchies (path-like structures)
  const pathColumns = columns.filter(col => 
    col.name.toLowerCase().includes('path') ||
    col.name.toLowerCase().includes('breadcrumb') ||
    data.some(row => typeof row[col.name] === 'string' && 
      (row[col.name].includes('/') || row[col.name].includes(' > ') || row[col.name].includes('::'))
    )
  );

  for (const pathCol of pathColumns) {
    // Check if we can extract hierarchy levels from the path
    const samplePaths = data
      .map(row => row[pathCol.name])
      .filter(path => typeof path === 'string' && path.length > 0)
      .slice(0, 10);

    if (samplePaths.length > 0) {
      const separators = ['/', ' > ', '::', '|', '\\'];
      const separator = separators.find(sep => 
        samplePaths.some(path => path.includes(sep))
      );

      if (separator) {
        relations.push({
          parentColumn: pathCol.name,
          childColumn: pathCol.name + '_levels',
          confidence: 0.7,
          type: 'nested',
          description: `Hierarchical path structure detected in ${pathCol.name} using separator "${separator}"`
        });
      }
    }
  }

  // Remove duplicates and sort by confidence
  const uniqueRelations = relations.filter((relation, index, arr) => 
    arr.findIndex(r => 
      r.parentColumn === relation.parentColumn && 
      r.childColumn === relation.childColumn
    ) === index
  );

  return uniqueRelations.sort((a, b) => b.confidence - a.confidence);
};

export const buildHierarchyTree = (
  data: DataRow[], 
  parentColumn: string, 
  childColumn?: string
): HierarchyNode[] => {
  if (!childColumn) {
    // Handle nested path hierarchies
    const pathData = data
      .map(row => row[parentColumn])
      .filter(path => typeof path === 'string' && path.length > 0);

    const separators = ['/', ' > ', '::', '|', '\\'];
    const separator = separators.find(sep => 
      pathData.some(path => path.includes(sep))
    );

    if (!separator) return [];

    const nodeMap = new Map<string, HierarchyNode>();
    
    pathData.forEach(path => {
      const parts = path.split(separator).map(p => p.trim());
      
      parts.forEach((part, index) => {
        const id = parts.slice(0, index + 1).join(separator);
        const parentId = index > 0 ? parts.slice(0, index).join(separator) : undefined;
        
        if (!nodeMap.has(id)) {
          nodeMap.set(id, {
            id,
            name: part,
            parentId,
            level: index,
            children: [],
            count: 0
          });
        }
        
        nodeMap.get(id)!.count++;
      });
    });

    // Build tree structure
    const nodes = Array.from(nodeMap.values());
    const rootNodes: HierarchyNode[] = [];

    nodes.forEach(node => {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  // Handle parent-child column relationships
  const nodeMap = new Map<string, HierarchyNode>();
  
  // First, collect all unique values and their relationships
  data.forEach(row => {
    const parentValue = row[parentColumn];
    const childValue = row[childColumn];
    
    if (parentValue != null) {
      const parentId = String(parentValue);
      if (!nodeMap.has(parentId)) {
        nodeMap.set(parentId, {
          id: parentId,
          name: parentId,
          level: 0,
          children: [],
          count: 0
        });
      }
      nodeMap.get(parentId)!.count++;
    }
    
    if (childValue != null) {
      const childId = String(childValue);
      if (!nodeMap.has(childId)) {
        nodeMap.set(childId, {
          id: childId,
          name: childId,
          parentId: parentValue ? String(parentValue) : undefined,
          level: 1,
          children: [],
          count: 0
        });
      }
      nodeMap.get(childId)!.count++;
    }
  });

  // Build tree structure
  const nodes = Array.from(nodeMap.values());
  const rootNodes: HierarchyNode[] = [];

  nodes.forEach(node => {
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(node);
        node.level = parent.level + 1;
      }
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
};

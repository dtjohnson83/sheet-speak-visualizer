
import { Card } from '@/components/ui/card';
import { HierarchyTreeNode } from './HierarchyTreeNode';
import { buildHierarchyTree, HierarchyRelation } from '@/lib/hierarchyDetection';
import { DataRow } from '@/types/data';

interface HierarchyDisplayProps {
  hierarchies: HierarchyRelation[];
  data: DataRow[];
}

export const HierarchyDisplay = ({ hierarchies, data }: HierarchyDisplayProps) => {
  return (
    <Card className="p-6">
      <h4 className="text-lg font-semibold mb-4">Detected Hierarchies</h4>
      <div className="space-y-6">
        {hierarchies.map((hierarchy, index) => {
          const tree = buildHierarchyTree(
            data,
            hierarchy.parentColumn,
            hierarchy.childColumn !== hierarchy.parentColumn + '_levels' ? hierarchy.childColumn : undefined
          );
          
          return (
            <div key={index} className="border rounded-lg p-4">
              <div className="mb-3">
                <h5 className="font-medium text-gray-900">{hierarchy.description}</h5>
                <p className="text-sm text-gray-600">
                  Confidence: {Math.round(hierarchy.confidence * 100)}% • Type: {hierarchy.type}
                </p>
              </div>
              
              {tree.length > 0 ? (
                <div className="space-y-2">
                  {tree.slice(0, 10).map((node, nodeIndex) => (
                    <HierarchyTreeNode key={nodeIndex} node={node} />
                  ))}
                  {tree.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">
                      ... and {tree.length - 10} more nodes
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hierarchy structure found</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

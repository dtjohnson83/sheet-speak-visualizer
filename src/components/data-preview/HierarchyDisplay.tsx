
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreePine, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { HierarchyDetection, buildHierarchyTree } from '@/lib/hierarchyDetection';
import { HierarchyTreeNode } from './HierarchyTreeNode';

interface HierarchyDisplayProps {
  hierarchies: HierarchyDetection[];
  data: DataRow[];
}

export const HierarchyDisplay = ({ hierarchies, data }: HierarchyDisplayProps) => {
  if (hierarchies.length === 0) return null;

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3 flex items-center">
        <TreePine className="h-5 w-5 mr-2 text-green-600" />
        Detected Hierarchies
      </h4>
      <div className="space-y-4">
        {hierarchies.map((hierarchy, index) => (
          <Collapsible key={index}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Badge className={`${hierarchy.confidence > 0.7 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {(hierarchy.confidence * 100).toFixed(0)}% confidence
                </Badge>
                <span className="font-medium">{hierarchy.parentColumn} → {hierarchy.childColumn}</span>
                <Badge variant="outline" className="text-xs">
                  {hierarchy.type}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600 mb-3">{hierarchy.description}</p>
                <div className="max-h-60 overflow-y-auto">
                  {buildHierarchyTree(data, hierarchy.parentColumn, hierarchy.childColumn !== hierarchy.parentColumn + '_levels' ? hierarchy.childColumn : undefined).map((node, nodeIndex) => (
                    <HierarchyTreeNode key={nodeIndex} node={node} />
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </Card>
  );
};

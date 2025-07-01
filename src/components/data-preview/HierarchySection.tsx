import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreePine, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DataRow } from '@/pages/Index';
import { buildHierarchyTree } from '@/lib/hierarchyDetection';

interface HierarchyInfo {
  parentColumn: string;
  childColumn: string;
  type: string;
  confidence: number;
  description: string;
}

import { HierarchyTreeNode } from './HierarchyTreeNode';

interface HierarchySectionProps {
  hierarchies: HierarchyInfo[];
  showHierarchies: boolean;
  data: DataRow[];
}

export const HierarchySection = ({ hierarchies, showHierarchies, data }: HierarchySectionProps) => {
  if (!showHierarchies || hierarchies.length === 0) return null;

  return (
    <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <h4 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-gray-100">
        <TreePine className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
        Detected Hierarchies
      </h4>
      <div className="space-y-4">
        {hierarchies.map((hierarchy, index) => (
          <Collapsible key={index}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-3">
                <Badge className={`${hierarchy.confidence > 0.7 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                  {(hierarchy.confidence * 100).toFixed(0)}% confidence
                </Badge>
                <span className="font-medium text-gray-900 dark:text-gray-100">{hierarchy.parentColumn} → {hierarchy.childColumn}</span>
                <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {hierarchy.type}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{hierarchy.description}</p>
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
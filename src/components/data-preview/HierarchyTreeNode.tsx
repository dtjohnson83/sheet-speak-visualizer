
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, TreePine } from 'lucide-react';
import { HierarchyNode } from '@/lib/hierarchyDetection';

interface HierarchyTreeNodeProps {
  node: HierarchyNode;
  level?: number;
}

export const HierarchyTreeNode = ({ node, level = 0 }: HierarchyTreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  
  return (
    <div className="border-l border-gray-200 ml-4">
      <div className="flex items-center space-x-2 py-1 pl-4">
        {node.children.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
        <TreePine className="h-4 w-4 text-green-600" />
        <span className="text-sm">{node.name}</span>
        <Badge variant="outline" className="text-xs">
          {node.count}
        </Badge>
      </div>
      {isOpen && node.children.length > 0 && (
        <div className="ml-2">
          {node.children.map((child, index) => (
            <HierarchyTreeNode key={index} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

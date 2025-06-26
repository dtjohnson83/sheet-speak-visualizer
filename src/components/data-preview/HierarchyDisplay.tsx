
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreePine, ArrowRight } from 'lucide-react';
import { HierarchyTreeNode } from './HierarchyTreeNode';
import { DataRow, ColumnInfo } from '@/types/data';
import { HierarchyRelation } from '@/lib/hierarchyDetection';

interface HierarchyDisplayProps {
  hierarchies: HierarchyRelation[];
  data: DataRow[];
}

export const HierarchyDisplay = ({ hierarchies, data }: HierarchyDisplayProps) => {
  if (hierarchies.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <TreePine className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No hierarchical relationships detected in your data.</p>
          <p className="text-sm mt-2">
            Hierarchies are detected when columns contain values that reference other columns.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TreePine className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Detected Hierarchies</h3>
        <Badge variant="secondary">{hierarchies.length}</Badge>
      </div>
      
      <div className="space-y-6">
        {hierarchies.map((hierarchy, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium text-blue-600">{hierarchy.parentColumn}</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-purple-600">{hierarchy.childColumn}</span>
              <Badge variant="outline" className="ml-2">
                {hierarchy.confidence.toFixed(0)}% confidence
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 mb-3">
              <p>Parent values: {hierarchy.parentValues.slice(0, 5).join(', ')}
                {hierarchy.parentValues.length > 5 && ` ... (+${hierarchy.parentValues.length - 5} more)`}
              </p>
              <p>Child values: {hierarchy.childValues.slice(0, 5).join(', ')}
                {hierarchy.childValues.length > 5 && ` ... (+${hierarchy.childValues.length - 5} more)`}
              </p>
            </div>
            
            <HierarchyTreeNode 
              hierarchy={hierarchy} 
              data={data} 
              maxDepth={3}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

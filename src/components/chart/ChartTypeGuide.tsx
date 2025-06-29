
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { ChartTypeInfo, getChartTypeInfo, validateChartRequirements } from '@/lib/chartTypeInfo';
import { ColumnInfo } from '@/pages/Index';

interface ChartTypeGuideProps {
  chartType: string;
  xColumn?: string;
  yColumn?: string;
  columns: ColumnInfo[];
  dataLength: number;
}

export const ChartTypeGuide = ({ chartType, xColumn, yColumn, columns, dataLength }: ChartTypeGuideProps) => {
  const info = getChartTypeInfo(chartType);
  const validation = validateChartRequirements(chartType, xColumn || '', yColumn || '', columns, dataLength);

  if (!info) return null;

  const RequirementStatus = ({ met, children }: { met: boolean; children: React.ReactNode }) => (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className={met ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
        {children}
      </span>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {info.name}
            {validation.isValid ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Ready
              </Badge>
            ) : (
              <Badge variant="destructive">
                Needs Setup
              </Badge>
            )}
          </CardTitle>
        </div>
        <CardDescription>{info.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Requirements Section */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Data Requirements
          </h4>
          <div className="space-y-2">
            {info.requirements.xAxis && (
              <RequirementStatus met={!!xColumn && !validation.issues.some(issue => issue.includes('X-axis'))}>
                <span className="font-medium">{info.requirements.xAxis.label}:</span> {info.requirements.xAxis.type} data
                {xColumn && <span className="text-sm text-gray-500 ml-1">({xColumn})</span>}
              </RequirementStatus>
            )}
            {info.requirements.yAxis && (
              <RequirementStatus met={!!yColumn && !validation.issues.some(issue => issue.includes('Y-axis'))}>
                <span className="font-medium">{info.requirements.yAxis.label}:</span> {info.requirements.yAxis.type} data
                {yColumn && <span className="text-sm text-gray-500 ml-1">({yColumn})</span>}
              </RequirementStatus>
            )}
            {info.requirements.additional?.map((req, index) => (
              <RequirementStatus key={index} met={true}>
                <span className="font-medium">{req.label}:</span> {req.type} data
              </RequirementStatus>
            ))}
            <RequirementStatus met={dataLength >= info.minDataPoints}>
              <span className="font-medium">Minimum data points:</span> {info.minDataPoints} 
              <span className="text-sm text-gray-500 ml-1">(you have {dataLength})</span>
            </RequirementStatus>
          </div>
        </div>

        {/* Validation Issues */}
        {validation.issues.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">Issues to Fix:</h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
              {validation.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {validation.suggestions.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Suggestions:</h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
              {validation.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        {/* Best For Section */}
        <div>
          <h4 className="font-semibold mb-3">Best Used For:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
            {info.bestFor.map((use, index) => (
              <li key={index}>{use}</li>
            ))}
          </ul>
        </div>

        {/* Examples Section */}
        <div>
          <h4 className="font-semibold mb-3">Examples:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {info.examples.map((example, index) => (
              <Badge key={index} variant="outline" className="justify-start p-2 h-auto">
                {example}
              </Badge>
            ))}
          </div>
        </div>

        {/* Common Mistakes */}
        {info.commonMistakes.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 text-orange-700 dark:text-orange-300">Common Mistakes to Avoid:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-orange-600 dark:text-orange-400">
              {info.commonMistakes.map((mistake, index) => (
                <li key={index}>{mistake}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import React from 'react';

interface DataStatusBarProps {
  displayFileName: string;
  dataLength: number;
  columnsLength: number;
  realtimeEnabled: boolean;
}

export const DataStatusBar: React.FC<DataStatusBarProps> = ({
  displayFileName,
  dataLength,
  columnsLength,
  realtimeEnabled
}) => {
  return (
    <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Dataset Active</span>
            {realtimeEnabled && (
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-600">Real-time</span>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {displayFileName} • {dataLength.toLocaleString()} rows • {columnsLength} columns
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Use Ctrl+1-8 for quick tab navigation</span>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Video, Download } from 'lucide-react';

interface RecordingProgressProps {
  isRecording: boolean;
  progress: number;
  currentFrame?: number;
  totalFrames?: number;
  format?: string;
}

export const RecordingProgress: React.FC<RecordingProgressProps> = ({
  isRecording,
  progress,
  currentFrame,
  totalFrames,
  format = 'mp4'
}) => {
  if (!isRecording) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Video className="h-5 w-5 text-red-600 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-800">
                Recording Animation ({format.toUpperCase()})
              </span>
              <span className="text-xs text-red-600">
                {currentFrame && totalFrames ? `${currentFrame}/${totalFrames} frames` : `${Math.round(progress)}%`}
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-red-100"
            />
          </div>
        </div>
        <p className="text-xs text-red-700 mt-2 flex items-center gap-1">
          <Download className="h-3 w-3" />
          Keep the chart visible during recording for best results
        </p>
      </CardContent>
    </Card>
  );
};
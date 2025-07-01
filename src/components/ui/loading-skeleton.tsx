import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  variant?: 'table' | 'chart' | 'card' | 'dashboard';
  count?: number;
}

export const LoadingSkeleton = ({ variant = 'card', count = 1 }: LoadingSkeletonProps) => {
  if (variant === 'table') {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-32" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-6 w-32" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-center space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
};
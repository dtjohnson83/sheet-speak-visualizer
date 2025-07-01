import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataPreviewPaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalEntries: number;
  onPageChange: (page: number) => void;
}

export const DataPreviewPagination = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalEntries,
  onPageChange
}: DataPreviewPaginationProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
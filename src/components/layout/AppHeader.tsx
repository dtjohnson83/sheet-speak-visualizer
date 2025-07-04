import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { FeedbackButton } from '@/components/FeedbackButton';

interface AppHeaderProps {
  isAdmin: boolean;
  usesRemaining: number;
}

export const AppHeader = ({ isAdmin, usesRemaining }: AppHeaderProps) => {
  return (
    <div className="text-center mb-8 relative">
      <div className="absolute top-0 right-0 flex items-center gap-2">
        {isAdmin ? (
          <Badge variant="secondary" className="text-xs">
            Admin - Unlimited AI
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            {usesRemaining} AI uses left
          </Badge>
        )}
        <FeedbackButton />
        <UserMenu />
        <ThemeToggle />
      </div>
      <div className="flex justify-center mb-4">
        <Link to="/">
          <img 
            src="/lovable-uploads/65be9d2d-b287-4742-bf85-d1ce0ab36d06.png" 
            alt="Chartuvo Logo" 
            className="h-16 w-auto md:h-20 lg:h-24 hover:opacity-80 transition-opacity cursor-pointer"
          />
        </Link>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        Upload Excel files, visualize data, and build dashboards
      </p>
    </div>
  );
};
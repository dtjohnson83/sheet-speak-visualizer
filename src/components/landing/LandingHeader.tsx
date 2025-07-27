import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FeedbackButton } from '@/components/FeedbackButton';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const LandingHeader = () => {
  const { user } = useAuth();

  return (
    <header className="relative z-10 px-4 py-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center flex-shrink-0">
          <img 
            src="/lovable-uploads/65be9d2d-b287-4742-bf85-d1ce0ab36d06.png" 
            alt="Chartuvo Logo" 
            className="h-12 w-auto min-w-0 sm:h-16 md:h-20 lg:h-24"
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-wrap">
          <Link to="/about" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-sm px-3 py-2">
              About
            </Button>
          </Link>
          <div className="hidden md:block">
            <FeedbackButton />
          </div>
          {user ? (
            <Link to="/app">
              <Button variant="outline" size="sm" className="text-xs px-2 py-2 sm:text-sm sm:px-3 md:px-4 md:text-base flex-shrink-0">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="text-xs px-2 py-2 sm:text-sm sm:px-3 md:px-4 md:text-base flex-shrink-0">
                Sign In
              </Button>
            </Link>
          )}
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
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
    <div className="mb-8">
      {/* Top status bar */}
      <div className="flex justify-between items-center mb-6 p-4 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/lovable-uploads/65be9d2d-b287-4742-bf85-d1ce0ab36d06.png" 
              alt="Chartuvo Logo" 
              className="h-8 w-auto"
            />
            <span className="font-semibold text-lg">Chartuvo</span>
          </Link>
          <div className="hidden md:block w-px h-6 bg-border"></div>
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground">
              AI-Powered Data Analysis & Visualization Platform
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {isAdmin ? (
            <Badge variant="secondary" className="text-xs font-medium">
              <span className="hidden sm:inline">Admin - </span>Unlimited AI
            </Badge>
          ) : (
            <Badge variant={usesRemaining > 10 ? "default" : usesRemaining > 5 ? "secondary" : "destructive"} className="text-xs font-medium">
              <span className="hidden sm:inline">{usesRemaining} AI uses left</span>
              <span className="sm:hidden">{usesRemaining} uses</span>
            </Badge>
          )}
          <div className="hidden sm:block">
            <FeedbackButton />
          </div>
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>

      {/* Main header content */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Link to="/">
            <img 
              src="/lovable-uploads/65be9d2d-b287-4742-bf85-d1ce0ab36d06.png" 
              alt="Chartuvo Logo" 
              className="h-16 w-auto md:h-20 lg:h-24 hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Data Analysis & Visualization
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect multiple data sources, unlock AI-powered insights with predictive analytics, automate data quality monitoring, and create interactive dashboards with rich visualizations
        </p>
      </div>
    </div>
  );
};
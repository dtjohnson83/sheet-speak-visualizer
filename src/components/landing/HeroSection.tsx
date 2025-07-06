import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Forward Thinking Intelligence</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Connect your data sources and unlock intelligent insights with AI-powered analysis. Get predictive forecasting, 
          automated data quality monitoring, and comprehensive reporting – all supported by interactive visualizations and dashboards.
        </p>
        
        <div className="flex justify-center">
          {user ? (
            <Link to="/app">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Launch Intelligence Hub
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started Free
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
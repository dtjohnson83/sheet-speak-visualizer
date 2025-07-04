import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const CTASection = () => {
  const { user } = useAuth();

  return (
    <section className="px-4 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Transform Your Data?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of users who trust Chartuvo for their data visualization needs.
        </p>
        {user ? (
          <Link to="/app">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Launch Intelligence Hub
            </Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Visualizing Now
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};
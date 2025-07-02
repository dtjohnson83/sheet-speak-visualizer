export const LandingFooter = () => {
  return (
    <footer className="px-4 py-12 bg-gray-900 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/lovable-uploads/b6f37075-7fc7-47ba-9704-f02449e75dfe.png" 
            alt="Chartuvo Logo" 
            className="h-16 w-auto"
          />
        </div>
        <p className="text-gray-400 mb-4">
          Making data visualization accessible to everyone.
        </p>
        <p className="text-gray-500 text-sm">
          © 2024 Charta. Built with ❤️ for data enthusiasts.
        </p>
      </div>
    </footer>
  );
};
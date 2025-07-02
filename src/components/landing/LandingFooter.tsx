export const LandingFooter = () => {
  return (
    <footer className="px-4 py-12 bg-gray-900 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/lovable-uploads/65be9d2d-b287-4742-bf85-d1ce0ab36d06.png" 
            alt="Chartuvo Logo" 
            className="h-12 w-auto md:h-14"
          />
        </div>
        <p className="text-gray-400 mb-4">
          Making data visualization accessible to everyone.
        </p>
        <p className="text-gray-500 text-sm">
          © 2024 Chartuvo. Built with ❤️ for data enthusiasts.
        </p>
      </div>
    </footer>
  );
};
export const HowItWorksSection = () => {
  return (
    <section className="px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            From data upload to intelligent insights in four powerful steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload & Prepare</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Upload Excel files and let AI automatically detect structure, data types, and business context.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get comprehensive AI insights, chat with your data, and generate expert reports from multiple perspectives.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Visualize</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create stunning charts and build interactive dashboards with drag-and-drop tiles and real-time filtering.
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
              4
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Automate</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Deploy AI agents for continuous monitoring, anomaly detection, and automated insight generation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
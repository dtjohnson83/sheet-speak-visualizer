export const HowItWorksSection = () => {
  return (
    <section className="px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            From data upload to intelligent insights in five comprehensive steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative">
          {/* Step 1 */}
          <div className="text-center relative">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Upload & Prepare</h3>
            <p className="text-muted-foreground text-sm">
              Upload data files or connect data sources with automatic data structure detection and business context setup.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center relative">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-4">AI Analysis</h3>
            <p className="text-muted-foreground text-sm">
              Chat with your data and generate comprehensive expert reports from multiple AI perspectives.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center relative">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Visualize</h3>
            <p className="text-muted-foreground text-sm">
              Create interactive charts and build dashboards with drag-and-drop tiles and real-time filtering.
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center relative">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-6">
              4
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Predict & Monitor</h3>
            <p className="text-muted-foreground text-sm">
              Generate predictive forecasts and monitor data quality with automated anomaly detection.
            </p>
          </div>

          {/* Step 5 */}
          <div className="text-center relative">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-6">
              5
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Automate</h3>
            <p className="text-muted-foreground text-sm">
              Deploy AI agents for continuous monitoring and automated insight generation with alerts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeDataProvider } from "@/contexts/RealtimeDataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/security/ErrorBoundary";

// Pages
import Landing from "./pages/Landing";
import About from "./pages/About";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import GuidesHub from "./pages/guides/GuidesHub";
import QuickStartGuide from "./pages/guides/QuickStartGuide";
import AIFeaturesGuide from "./pages/guides/AIFeaturesGuide";
import BestPracticesGuide from "./pages/guides/BestPracticesGuide";
import DataFlowGuide from "./pages/guides/DataFlowGuide";
import AgentsDeepDiveGuide from "./pages/guides/AgentsDeepDiveGuide";

// NEW: Clean & Score page
import CleanPage from "./pages/Clean";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (error instanceof Error && error.message.includes("auth")) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="chartuvo-ui-theme">
        <AuthProvider>
          <RealtimeDataProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/guides" element={<GuidesHub />} />
                  <Route path="/guides/quick-start" element={<QuickStartGuide />} />
                  <Route path="/guides/ai-features" element={<AIFeaturesGuide />} />
                  <Route path="/guides/data-flow" element={<DataFlowGuide />} />
                  <Route path="/guides/agents-deep-dive" element={<AgentsDeepDiveGuide />} />
                  <Route path="/guides/best-practices" element={<BestPracticesGuide />} />

                  {/* Main app */}
                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    }
                  />

                  {/* NEW: Clean & Score page under /app/clean */}
                  <Route
                    path="/app/clean"
                    element={
                      <ProtectedRoute>
                        <CleanPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </RealtimeDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

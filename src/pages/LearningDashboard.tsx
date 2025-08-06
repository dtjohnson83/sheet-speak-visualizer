import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedbackAnalyticsDashboard } from '@/components/analytics/FeedbackAnalyticsDashboard';
import { LearningJobScheduler } from '@/components/learning/LearningJobScheduler';
import { Brain, BarChart3, Cog } from 'lucide-react';

export default function LearningDashboard() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Learning Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage AI learning from user feedback
          </p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            Learning Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <FeedbackAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="scheduler" className="mt-6">
          <LearningJobScheduler />
        </TabsContent>
      </Tabs>
    </div>
  );
}
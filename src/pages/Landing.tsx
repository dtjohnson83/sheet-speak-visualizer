
import { useState } from 'react';
import { VideoModal } from '@/components/VideoModal';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { LearnHelpSection } from '@/components/landing/LearnHelpSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Landing = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <LandingHeader />
      <HeroSection onWatchDemo={() => setIsVideoModalOpen(true)} />
      <FeaturesSection />
      <HowItWorksSection />
      <LearnHelpSection onWatchDemo={() => setIsVideoModalOpen(true)} />
      <CTASection />
      <LandingFooter />

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="https://vimeo.com/1097634521/90b5e70a7c?ts=0&share=copy"
        title="Chartuvo Demo"
      />
    </div>
  );
};

export default Landing;

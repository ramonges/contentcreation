import Header from '@/components/Header';
import HeroSection from '@/components/sections/HeroSection';
import WhySection from '@/components/sections/WhySection';
import ProcessSection from '@/components/sections/ProcessSection';
import FooterSection from '@/components/sections/FooterSection';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0F]">
      <Header />
      <main>
        <HeroSection />
        <WhySection />
        <ProcessSection />
      </main>
      <FooterSection />
    </div>
  );
}

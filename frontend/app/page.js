'use client';

import dynamic from 'next/dynamic';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import FeaturedServices from '../components/FeaturedServices';

const PackagesSection = dynamic(() => import('../components/PackagesSection'), { ssr: true });
const StaffSection = dynamic(() => import('../components/StaffSection'), { ssr: true });
const TestimonialsSection = dynamic(() => import('../components/TestimonialsSection'), { ssr: true });
const ContactSection = dynamic(() => import('../components/ContactSection'), { ssr: true });
const Footer = dynamic(() => import('../components/Footer'), { ssr: true });

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-900">
      <Navbar />
      <Hero />
      <AboutSection />
      <FeaturedServices />
      <PackagesSection />
      <StaffSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}

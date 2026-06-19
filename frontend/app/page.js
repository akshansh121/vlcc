'use client';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import FeaturedServices from '../components/FeaturedServices';
import PackagesSection from '../components/PackagesSection';
import StaffSection from '../components/StaffSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

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

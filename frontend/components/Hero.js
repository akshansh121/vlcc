'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarCheck, Sparkles, ChevronDown, Star, Users, Scissors, Award, ArrowRight } from 'lucide-react';

const stats = [
  { icon: Users, value: '10,000+', label: 'Happy Clients' },
  { icon: Sparkles, value: '50+', label: 'Expert Services' },
  { icon: Scissors, value: '8+', label: 'Expert Staff' },
  { icon: Star, value: '5-Star', label: 'Rated' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">

      {/* Background Image with soft rose overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80"
          alt="Luxury Salon Interior"
          className="w-full h-full object-cover object-center opacity-20"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/20 via-white/50 to-rose-100/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/40 to-transparent" />
      </div>

      {/* Rose ambient glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-rose-400/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-32 flex-1 flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Eyebrow badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center gap-2 bg-rose-500/10 px-4 py-2 rounded-full border border-rose-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-rose-600 animate-pulse" />
              <span className="text-xs font-bold tracking-[0.2em] text-rose-700 uppercase">
                Premium Luxury Salon
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-rose-950 tracking-tight leading-[1.1] mb-6"
          >
            Look beautiful,{' '}
            <span className="italic font-normal text-rose-600">feel</span>{' '}
            <span className="text-rose-500">confident.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-rose-900 text-lg leading-relaxed max-w-md mb-10 font-light"
          >
            Premium beauty services crafted for you. Book your appointment today and let our
            experts transform your look.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Link
              href="/booking"
              className="btn-gold text-base py-3.5 px-8 gap-2"
            >
              <CalendarCheck className="w-5 h-5" />
              Book Appointment
            </Link>
            <Link
              href="/services"
              className="btn-outline-gold text-base py-3.5 px-8"
            >
              Explore Services
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 mt-8 pt-8 border-t border-rose-200/50">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                ))}
              </div>
              <p className="text-rose-800 text-xs">Trusted by <span className="font-bold text-rose-950">10,000+</span> clients</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-36 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-rose-600 text-xs uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-rose-500" />
        </motion.div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="relative z-10 glass-panel border-t border-rose-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-rose-200/40">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className="flex flex-col sm:flex-row items-center gap-2 py-3 px-2 sm:py-5 sm:px-4 lg:px-8 group"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors flex-shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-rose-950 font-bold text-base sm:text-xl font-serif">{value}</p>
                  <p className="text-rose-600 text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

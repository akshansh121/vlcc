'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarCheck, Sparkles, ChevronDown, Star, Users, Scissors, Award } from 'lucide-react';

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

      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80"
          alt="Luxury Salon Interior"
          className="w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/95 via-dark-900/75 to-dark-900/40 hero-overlay-1" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent hero-overlay-2" />
      </div>

      {/* Decorative gold particles */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold-500/40"
            style={{
              top: `${15 + i * 13}%`,
              left: `${8 + i * 7}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-32 flex-1 flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gold-500" />
            <span className="text-gold-500 text-sm font-semibold uppercase tracking-[0.25em]">
              Premium Luxury Salon
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight text-white mb-4"
          >
            Experience{' '}
            <span className="block text-gold-500 italic">Luxury</span>
          </motion.h1>

          <motion.h2
            variants={itemVariants}
            className="font-display text-2xl sm:text-4xl lg:text-5xl font-semibold text-white/90 mb-8"
          >
            Beauty &amp;{' '}
            <span className="text-gold-400">Wellness</span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-gray-300 text-lg leading-relaxed max-w-md mb-10"
          >
            Premium beauty services crafted for you. Book your appointment today and let our
            experts transform your look.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Link
              href="/booking"
              className="btn-gold text-base py-3.5 px-8 gap-2 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 transition-shadow"
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
          <motion.div variants={itemVariants} className="flex items-center gap-4 mt-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-dark-900 bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-dark-900 text-xs font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                ))}
              </div>
              <p className="text-gray-400 text-xs">Trusted by 10,000+ clients</p>
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
        <span className="text-gray-500 text-xs uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-gold-500" />
        </motion.div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="relative z-10 bg-dark-800/90 backdrop-blur-md border-t border-dark-600 hero-stats-bar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-dark-600">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className="flex flex-col sm:flex-row items-center gap-2 py-3 px-2 sm:py-5 sm:px-4 lg:px-8 group"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors flex-shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-white font-bold text-base sm:text-xl font-display">{value}</p>
                  <p className="text-gray-500 text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

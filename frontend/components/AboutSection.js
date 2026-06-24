'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Leaf, Shield, Gem, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'Expert Stylists',
    description:
      'Our internationally trained stylists bring years of mastery in cutting-edge techniques.',
  },
  {
    icon: Leaf,
    title: 'Premium Products',
    description:
      'We use only the finest, cruelty-free products from world-renowned luxury brands.',
  },
  {
    icon: Shield,
    title: 'Hygiene First',
    description:
      'Strict sanitization protocols ensure a safe, spotless experience with every visit.',
  },
  {
    icon: Gem,
    title: 'Luxury Experience',
    description:
      'From ambiance to aftercare, every detail is curated for an indulgent experience.',
  },
];

const highlights = [
  '15+ Years of Excellence in the industry',
  'ISO-certified salon with premium standards',
  'Over 10,000 satisfied clients across Bangalore',
  'Customized treatments for every skin & hair type',
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeRight = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function AboutSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section ref={sectionRef} className="py-24 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="section-subtitle">About Us</motion.p>
          <motion.h2 variants={fadeUp} className="section-title">
            Why Choose{' '}
            <span className="text-rose-500 italic">Beauty World?</span>
          </motion.h2>
          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="h-0.5 w-16 bg-rose-500/40 mx-auto" />
          </motion.div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Image */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={fadeRight}
            className="relative"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={isInView ? { scale: 1, rotate: -12 } : { scale: 0, rotate: -12 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="absolute -top-3 -left-3 sm:-top-5 sm:-left-5 z-10 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex flex-col items-center justify-center shadow-xl shadow-rose-500/30"
            >
              <span className="font-serif text-white text-xl sm:text-2xl font-bold leading-none">15+</span>
              <span className="text-white text-[9px] sm:text-xs font-semibold text-center leading-tight mt-1">Years of<br />Excellence</span>
            </motion.div>

            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80"
                alt="Beauty World Salon Interior"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
              {/* Image overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/20 to-transparent" />
            </div>

            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 glass-panel rounded-xl p-3 sm:p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-rose-950 font-semibold text-sm">Award Winning</p>
                  <p className="text-rose-600 text-xs">Best Salon 2023</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
          >
            <motion.p variants={fadeLeft} className="section-subtitle">Our Story</motion.p>
            <motion.h3
              variants={fadeLeft}
              className="font-serif text-3xl font-light text-rose-950 mb-4 leading-snug"
            >
              Crafting Beauty with{' '}
              <span className="text-rose-500 italic">Passion &amp; Precision</span>
            </motion.h3>

            <motion.p variants={fadeLeft} className="text-rose-800/80 text-sm leading-relaxed mb-6 font-light">
              Since 2009, Beauty World has been a premier destination for luxury beauty
              and wellness. We blend traditional beauty wisdom with modern techniques to deliver
              transformative experiences tailored to each individual.
            </motion.p>

            {/* Highlights */}
            <motion.ul variants={containerVariants} className="space-y-3 mb-10">
              {highlights.map((item) => (
                <motion.li
                  key={item}
                  variants={fadeLeft}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span className="text-rose-800 text-sm">{item}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Feature Cards */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {features.map(({ icon: Icon, title, description }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="glass-panel-interactive rounded-xl p-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-rose-500" />
                  </div>
                  <h4 className="text-rose-950 font-semibold text-sm mb-1.5">{title}</h4>
                  <p className="text-rose-700 text-xs leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

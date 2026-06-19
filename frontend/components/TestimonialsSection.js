'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import axios from 'axios';

/* ── Star Rating ───────────────────────────────────────────────────────────── */
function StarRating({ rating = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.round(rating)
              ? 'text-gold-500 fill-gold-500'
              : 'text-dark-500 fill-dark-500'
          }`}
        />
      ))}
    </div>
  );
}

/* ── Testimonial Card ──────────────────────────────────────────────────────── */
function TestimonialCard({ testimonial }) {
  const avatarUrl =
    testimonial.image ||
    testimonial.avatar ||
    `https://i.pravatar.cc/100?u=${testimonial._id || testimonial.id || testimonial.name}`;

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Quote icon */}
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
          <Quote className="w-5 h-5 text-gold-500" />
        </div>
      </div>

      {/* Stars */}
      <div className="flex justify-center mb-6">
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Review Text */}
      <blockquote className="text-gray-300 text-base sm:text-lg text-center leading-relaxed italic mb-8 min-h-[80px]">
        &ldquo;{testimonial.review || testimonial.message || testimonial.comment || 'Amazing experience!'}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gold-500/40">
          <img
            src={avatarUrl}
            alt={testimonial.name || testimonial.customerName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                testimonial.name || 'Client'
              )}&background=D4AF37&color=0a0a0a&size=100`;
            }}
          />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-sm">
            {testimonial.name || testimonial.customerName || 'Happy Client'}
          </p>
          {(testimonial.designation || testimonial.occupation) && (
            <p className="text-gold-500/70 text-xs mt-0.5">
              {testimonial.designation || testimonial.occupation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Testimonials Section ──────────────────────────────────────────────────── */
export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await axios.get('/api/testimonials');
        const list = data.testimonials || data.data || data;
        setTestimonials(Array.isArray(list) ? list : []);
      } catch {
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const next = useCallback(() => {
    if (!testimonials.length) return;
    setDirection(1);
    setCurrent((c) => (c + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    if (!testimonials.length) return;
    setDirection(-1);
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Auto-rotate every 3 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return;
    intervalRef.current = setInterval(next, 3000);
    return () => clearInterval(intervalRef.current);
  }, [next, testimonials.length]);

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 3000);
  };

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
    resetInterval();
  };

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.3 } }),
  };

  return (
    <section ref={sectionRef} className="bg-dark-900 py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, #D4AF37 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="section-subtitle">Testimonials</p>
          <h2 className="section-title">
            What Our{' '}
            <span className="text-gold-500 italic">Clients Say</span>
          </h2>
          <div className="flex justify-center mt-5">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
          </div>
        </motion.div>

        {/* Carousel */}
        {loading ? (
          <div className="flex flex-col items-center gap-5 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-dark-700" />
            <div className="h-4 w-32 bg-dark-700 rounded" />
            <div className="h-24 w-full max-w-lg bg-dark-700 rounded" />
            <div className="w-14 h-14 rounded-full bg-dark-700" />
            <div className="h-4 w-24 bg-dark-700 rounded" />
          </div>
        ) : testimonials.length > 0 ? (
          <div className="relative">
            {/* Carousel window */}
            <div className="overflow-hidden min-h-[280px] flex items-center">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full"
                >
                  <TestimonialCard testimonial={testimonials[current]} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Prev / Next Arrows */}
            <button
              onClick={() => { prev(); resetInterval(); }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-8 w-9 h-9 rounded-full bg-dark-800 border border-dark-600 hover:border-gold-500 text-gray-400 hover:text-gold-500 flex items-center justify-center transition-all duration-200"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => { next(); resetInterval(); }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-8 w-9 h-9 rounded-full bg-dark-800 border border-dark-600 hover:border-gold-500 text-gray-400 hover:text-gold-500 flex items-center justify-center transition-all duration-200"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-10">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-6 h-2 bg-gold-500'
                      : 'w-2 h-2 bg-dark-600 hover:bg-dark-500'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 text-gold-500/40 mx-auto mb-4" />
            <p className="text-gray-500">Client reviews coming soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}

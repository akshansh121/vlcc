'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from 'lucide-react';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Address',
    value: 'Warisaliganj, Nawada',
    href: 'https://maps.google.com/?q=Warisaliganj+Nawada',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 83404 33268',
    href: 'tel:+918340433268',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'akshansh@gmail.com',
    href: 'mailto:akshansh@gmail.com',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Mon–Sat: 9AM–8PM\nSun: 10AM–6PM',
    href: null,
  },
];

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com', color: 'hover:text-pink-400' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com', color: 'hover:text-blue-400' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com', color: 'hover:text-sky-400' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com', color: 'hover:text-red-400' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function ContactSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      await axios.post('/api/contact', formData);
      toast.success('Message sent! We will get back to you shortly.');
      reset();
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <section ref={sectionRef} className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="section-subtitle">Get In Touch</p>
          <h2 className="section-title">
            Contact{' '}
            <span className="text-rose-500 italic">Us</span>
          </h2>
          <p className="text-rose-700 text-sm max-w-lg mx-auto mt-3 font-light">
            Have a question or want to book a consultation? We&apos;d love to hear from you.
          </p>
          <div className="flex justify-center mt-5">
            <div className="h-0.5 w-16 bg-rose-500/40 mx-auto" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Left: Contact Form ─────────────────────────────────────────── */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
          >
            <motion.h3
              variants={fadeUp}
              className="font-serif text-2xl font-light text-rose-950 mb-6"
            >
              Send Us a Message
            </motion.h3>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* Name */}
              <motion.div variants={fadeUp}>
                <label className="block text-rose-700 text-xs font-bold uppercase tracking-[0.15em] mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className={`input-dark ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                )}
              </motion.div>

              {/* Email + Mobile (side by side) */}
              <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-rose-700 text-xs font-bold uppercase tracking-[0.15em] mb-2">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={`input-dark ${errors.email ? 'border-red-500' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-rose-700 text-xs font-bold uppercase tracking-[0.15em] mb-2">
                    Mobile <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 83404 33268"
                    className={`input-dark ${errors.mobile ? 'border-red-500' : ''}`}
                    {...register('mobile', {
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[+]?[\d\s\-()]{8,15}$/,
                        message: 'Enter a valid mobile number',
                      },
                    })}
                  />
                  {errors.mobile && (
                    <p className="text-red-400 text-xs mt-1">{errors.mobile.message}</p>
                  )}
                </div>
              </motion.div>

              {/* Message */}
              <motion.div variants={fadeUp}>
                <label className="block text-rose-700 text-xs font-bold uppercase tracking-[0.15em] mb-2">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us how we can help you..."
                  className={`input-dark resize-none ${errors.message ? 'border-red-500' : ''}`}
                  {...register('message', {
                    required: 'Message is required',
                    minLength: { value: 10, message: 'Message must be at least 10 characters' },
                  })}
                />
                {errors.message && (
                  <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>
                )}
              </motion.div>

              {/* Submit */}
              <motion.div variants={fadeUp}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold w-full justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </motion.div>

          {/* ── Right: Contact Info + Map ──────────────────────────────────── */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
            className="space-y-6"
          >
            <motion.h3
              variants={fadeUp}
              className="font-serif text-2xl font-light text-rose-950"
            >
              Find Us Here
            </motion.h3>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  className="glass-panel-interactive rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-200 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-rose-600 text-xs font-bold uppercase tracking-wide mb-1">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="text-rose-800 text-sm hover:text-rose-950 transition-colors leading-relaxed"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-rose-800 text-sm leading-relaxed whitespace-pre-line">
                          {value}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Media */}
            <motion.div variants={fadeUp}>
              <p className="text-rose-600 text-xs font-bold uppercase tracking-wide mb-3">
                Follow Us
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map(({ icon: Icon, label, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`w-10 h-10 rounded-full border border-rose-200 bg-white/50 flex items-center justify-center text-rose-500 ${color} hover:border-current hover:bg-white/80 transition-all duration-300 hover:scale-110`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              variants={fadeUp}
              className="rounded-xl overflow-hidden border border-rose-200 relative"
            >
              <iframe
                title="Beauty World Location"
                src="https://www.google.com/maps?q=Warisaliganj%20Nawada&output=embed"
                width="100%"
                height="220"
                style={{ border: 0, filter: 'saturate(0.7) hue-rotate(300deg) brightness(0.98)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Map overlay label */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-rose-200 rounded-lg px-3 py-1.5">
                <p className="text-rose-600 text-xs font-bold">Beauty World</p>
                <p className="text-rose-800 text-[10px]">Warisaliganj, Nawada</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

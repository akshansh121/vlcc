'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
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
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import * as api from '../../lib/api';

// ── Static data ───────────────────────────────────────────────────────────────

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: 'Address',
    value: 'Warisaliganj, Nawada',
    href: 'https://maps.google.com/?q=Warisaliganj+Nawada',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 83404 33268',
    href: 'tel:+918340433268',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'support@sunderdikho.com',
    href: 'mailto:support@sunderdikho.com',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Mon–Sat: 9:00 AM – 8:00 PM\nSun: 10:00 AM – 6:00 PM',
    href: null,
    color: 'text-gold-400',
    bg: 'bg-gold-500/10 border-gold-500/20',
  },
];

const SOCIAL_LINKS = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com', color: 'hover:text-pink-400 hover:border-pink-400' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com', color: 'hover:text-blue-400 hover:border-blue-400' },
  { icon: Twitter, label: 'Twitter/X', href: 'https://twitter.com', color: 'hover:text-sky-400 hover:border-sky-400' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com', color: 'hover:text-red-400 hover:border-red-400' },
];

const BUSINESS_HOURS = [
  { day: 'Monday', hours: '9:00 AM – 8:00 PM', open: true },
  { day: 'Tuesday', hours: '9:00 AM – 8:00 PM', open: true },
  { day: 'Wednesday', hours: '9:00 AM – 8:00 PM', open: true },
  { day: 'Thursday', hours: '9:00 AM – 8:00 PM', open: true },
  { day: 'Friday', hours: '9:00 AM – 8:00 PM', open: true },
  { day: 'Saturday', hours: '9:00 AM – 8:00 PM', open: true },
  { day: 'Sunday', hours: '10:00 AM – 6:00 PM', open: true },
];

const FAQS = [
  {
    question: 'How do I book an appointment?',
    answer:
      'You can book online by adding services to your cart and proceeding to checkout, or call us directly at +91 83404 33268. Walk-ins are also welcome based on availability.',
  },
  {
    question: 'Can I reschedule or cancel my booking?',
    answer:
      'Yes! You can cancel or reschedule up to 4 hours before your appointment at no charge. Late cancellations (under 4 hours) may incur a 20% fee. Visit "My Bookings" in your account to manage appointments.',
  },
  {
    question: 'Do you offer packages and combo deals?',
    answer:
      'Absolutely! We have curated packages that bundle popular services at special prices. Browse our Packages section or ask our staff about current seasonal offers.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major UPI apps (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, Rupay), net banking, and cash. Online bookings require advance payment.',
  },
  {
    question: 'Is parking available at your salon?',
    answer:
      'Yes, complimentary parking is available for customers near our Warisaliganj, Nawada location. Please inform our reception upon arrival.',
  },
  {
    question: 'Do you offer home/doorstep services?',
    answer:
      'We currently offer doorstep services for select treatments within a 10 km radius of our salon. Contact us to check availability and pricing for your area.',
  },
  {
    question: 'Are your products cruelty-free and skin-safe?',
    answer:
      'We use only premium, dermatologist-approved, and largely cruelty-free product lines. Clients with known allergies are advised to inform their stylist before the service begins.',
  },
];

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── FAQ Accordion Item ─────────────────────────────────────────────────────────
function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-dark-600 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-dark-700/50 transition-colors duration-200"
      >
        <span className="text-white font-medium text-sm leading-snug flex-1">{faq.question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-gold-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed border-t border-dark-600 pt-3">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Contact Form ──────────────────────────────────────────────────────────────
function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      await api.submitQuery(formData);
      toast.success('Message sent! We will get back to you within 24 hours.');
      reset();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

      {/* Name */}
      <div>
        <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest mb-2">
          Full Name <span className="text-gold-500">*</span>
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
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Email + Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest mb-2">
            Email <span className="text-gold-500">*</span>
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className={`input-dark ${errors.email ? 'border-red-500' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email',
              },
            })}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest mb-2">
            Mobile <span className="text-gold-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="+91 83404 33268"
            className={`input-dark ${errors.mobile ? 'border-red-500' : ''}`}
            {...register('mobile', {
              required: 'Mobile is required',
              pattern: {
                value: /^[+]?[\d\s\-()\-]{8,15}$/,
                message: 'Enter a valid mobile number',
              },
            })}
          />
          {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile.message}</p>}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest mb-2">
          Subject
        </label>
        <input
          type="text"
          placeholder="What is this about?"
          className="input-dark"
          {...register('subject')}
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest mb-2">
          Message <span className="text-gold-500">*</span>
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
        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-gold w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const hoursRef = useRef(null);
  const faqRef = useRef(null);

  const formInView = useInView(formRef, { once: true, margin: '-60px' });
  const hoursInView = useInView(hoursRef, { once: true, margin: '-60px' });
  const faqInView = useInView(faqRef, { once: true, margin: '-60px' });

  // Determine today's day name
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-dark-900 pt-20">

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative bg-dark-800 border-b border-dark-600 py-20 overflow-hidden"
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gold-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <Sparkles className="w-5 h-5 text-gold-500" />
              <span className="text-gold-500 text-sm font-semibold uppercase tracking-widest">
                Beauty World
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            >
              Get In{' '}
              <span className="text-gold-500 italic">Touch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed"
            >
              We would love to hear from you. Whether you have a question, want to book a
              consultation, or just say hello — we are here for you.
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex justify-center mt-6"
            >
              <div className="h-px w-28 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            </motion.div>

            {/* Quick info pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3 mt-8"
            >
              {[
                { icon: Phone, text: '+91 83404 33268', href: 'tel:+918340433268' },
                { icon: Mail, text: 'support@sunderdikho.com', href: 'mailto:support@sunderdikho.com' },
                { icon: Clock, text: 'Mon–Sat 9AM–8PM', href: null },
              ].map(({ icon: Icon, text, href }) =>
                href ? (
                  <a
                    key={text}
                    href={href}
                    className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 border border-dark-500 hover:border-gold-500/40 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-300 hover:text-white transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5 text-gold-500" />
                    {text}
                  </a>
                ) : (
                  <span
                    key={text}
                    className="flex items-center gap-2 bg-dark-700 border border-dark-500 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-400"
                  >
                    <Icon className="w-3.5 h-3.5 text-gold-500" />
                    {text}
                  </span>
                )
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Form + Info Section ──────────────────────────────────────────── */}
        <section ref={formRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">

            {/* Left: Contact Form */}
            <motion.div
              initial="hidden"
              animate={formInView ? 'visible' : 'hidden'}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="mb-7">
                <h2 className="font-display text-3xl font-bold text-white mb-2">
                  Send Us a Message
                </h2>
                <p className="text-gray-500 text-sm">
                  Fill out the form and we will get back to you within 24 hours.
                </p>
              </motion.div>
              <motion.div variants={fadeUp}>
                <ContactForm />
              </motion.div>
            </motion.div>

            {/* Right: Info, Hours, Map, Social */}
            <motion.div
              initial="hidden"
              animate={formInView ? 'visible' : 'hidden'}
              variants={stagger}
              className="space-y-8"
            >

              {/* Contact Info Cards */}
              <motion.div variants={fadeUp}>
                <h2 className="font-display text-3xl font-bold text-white mb-5">Find Us Here</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONTACT_INFO.map(({ icon: Icon, label, value, href, color, bg }) => (
                    <div
                      key={label}
                      className="bg-dark-800 border border-dark-600 hover:border-dark-500 rounded-xl p-4 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${bg}`}
                        >
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gold-500 text-[10px] font-semibold uppercase tracking-widest mb-1">
                            {label}
                          </p>
                          {href ? (
                            <a
                              href={href}
                              target={href.startsWith('http') ? '_blank' : undefined}
                              rel="noopener noreferrer"
                              className="text-gray-300 text-sm hover:text-white transition-colors leading-relaxed break-words"
                            >
                              {value}
                            </a>
                          ) : (
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                              {value}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Social Media */}
              <motion.div variants={fadeUp}>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
                  Follow Us
                </p>
                <div className="flex items-center gap-3">
                  {SOCIAL_LINKS.map(({ icon: Icon, label, href, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`w-10 h-10 rounded-full border border-dark-500 flex items-center justify-center text-gray-400 ${color} transition-all duration-300 hover:scale-110`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Google Maps Embed */}
              <motion.div variants={fadeUp} className="rounded-xl overflow-hidden border border-dark-600 relative">
                <iframe
                  title="Beauty World Location"
                  src="https://www.google.com/maps?q=Warisaliganj%20Nawada&output=embed"
                  width="100%"
                  height="240"
                  style={{ border: 0, filter: 'grayscale(40%) invert(8%)' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute top-3 left-3 bg-dark-900/90 backdrop-blur-sm border border-gold-500/30 rounded-lg px-3 py-2">
                  <p className="text-gold-500 text-xs font-bold">Beauty World</p>
                  <p className="text-gray-400 text-[10px]">Warisaliganj, Nawada</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Business Hours ───────────────────────────────────────────────── */}
        <section ref={hoursRef} className="bg-dark-800 border-y border-dark-600 py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              animate={hoursInView ? 'visible' : 'hidden'}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="text-center mb-8">
                <p className="section-subtitle">We Are Open</p>
                <h2 className="section-title text-3xl">Business Hours</h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Drop in or book ahead. We are happy to see you any day of the week.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="bg-dark-900 border border-dark-600 rounded-2xl overflow-hidden"
              >
                {BUSINESS_HOURS.map((item, idx) => {
                  const isToday = item.day === today;
                  return (
                    <div
                      key={item.day}
                      className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 ${
                        idx < BUSINESS_HOURS.length - 1 ? 'border-b border-dark-700' : ''
                      } ${isToday ? 'bg-gold-500/5' : 'hover:bg-dark-800/50'} transition-colors duration-200`}
                    >
                      <div className="flex items-center gap-3">
                        {isToday && (
                          <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            isToday ? 'text-gold-400' : 'text-gray-300'
                          }`}
                        >
                          {item.day}
                          {isToday && (
                            <span className="ml-2 text-[10px] bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide font-semibold">
                              Today
                            </span>
                          )}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isToday ? 'text-gold-400' : item.open ? 'text-gray-400' : 'text-red-400'
                        }`}
                      >
                        {item.open ? item.hours : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ Section ──────────────────────────────────────────────────── */}
        <section ref={faqRef} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial="hidden"
            animate={faqInView ? 'visible' : 'hidden'}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-10">
              <p className="section-subtitle">Common Questions</p>
              <h2 className="section-title text-3xl">
                Frequently Asked{' '}
                <span className="text-gold-500 italic">Questions</span>
              </h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto mt-2">
                Everything you need to know about booking, cancellations, and our services.
              </p>
              <div className="flex justify-center mt-5">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-3">
              {FAQS.map((faq, idx) => (
                <FaqItem key={idx} faq={faq} index={idx} />
              ))}
            </motion.div>

            {/* Still have questions CTA */}
            <motion.div
              variants={fadeUp}
              className="mt-10 text-center bg-dark-800 border border-dark-600 rounded-2xl p-8"
            >
              <p className="text-gray-400 text-sm mb-1">Still have questions?</p>
              <h3 className="font-display text-xl font-bold text-white mb-4">
                We are just a message away
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href="tel:+918340433268" className="btn-gold text-sm py-2.5">
                  <Phone className="w-4 h-4" />
                  Call Us
                </a>
                <a
                  href="mailto:support@sunderdikho.com"
                  className="btn-outline-gold text-sm py-2.5"
                >
                  <Mail className="w-4 h-4" />
                  Email Us
                </a>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}

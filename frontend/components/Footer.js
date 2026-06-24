'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Packages', href: '/packages' },
  { label: 'Staff', href: '/staff' },
  { label: 'Contact', href: '/contact' },
  { label: 'Book Now', href: '/booking' },
];

const services = [
  { label: 'Hair Care', href: '/services?category=hair' },
  { label: 'Skin Treatments', href: '/services?category=skin' },
  { label: 'Makeup', href: '/services?category=makeup' },
  { label: 'Nail Art', href: '/services?category=nails' },
  { label: 'Body Wellness', href: '/services?category=body' },
];

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com' },
];

export default function Footer() {
  return (
    <footer className="glass-panel border-t border-rose-200/50 relative overflow-hidden mt-16">
      {/* Decorative top rose line */}
      <div className="h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span className="font-serif text-xl tracking-wider font-bold text-rose-950">Beauty World</span>
            </Link>
            <p className="text-rose-800/80 text-sm leading-relaxed mb-6 font-light">
              Where luxury meets beauty. Experience premium salon services crafted with expertise
              and passion, delivering results that speak for themselves.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/50 border border-rose-200 flex items-center justify-center text-rose-500 hover:border-rose-400 hover:text-rose-700 hover:bg-white/80 transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-rose-900 font-semibold text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-6 h-px bg-rose-400 inline-block" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-rose-700 hover:text-rose-950 text-sm transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-rose-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-rose-900 font-semibold text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-6 h-px bg-rose-400 inline-block" />
              Our Services
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="group flex items-center gap-2 text-rose-700 hover:text-rose-950 text-sm transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-rose-500" />
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-rose-900 font-semibold text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-6 h-px bg-rose-400 inline-block" />
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <span className="text-rose-800/80 text-sm leading-relaxed">
                  Warisaliganj,<br />Nawada
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <a
                  href="tel:+918340433268"
                  className="text-rose-800/80 hover:text-rose-950 text-sm transition-colors"
                >
                  +91 83404 33268
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <a
                  href="mailto:akshansh@gmail.com"
                  className="text-rose-800/80 hover:text-rose-950 text-sm transition-colors"
                >
                  akshansh@gmail.com
                </a>
              </li>
            </ul>

            {/* Hours */}
            <div className="mt-6 p-4 border border-rose-200 rounded-xl bg-white/40 transition-all duration-300 hover:border-rose-300">
              <p className="text-rose-600 text-xs font-bold uppercase tracking-wide mb-2">Working Hours</p>
              <p className="text-rose-800/70 text-xs">Mon – Sat: 9:00 AM – 8:00 PM</p>
              <p className="text-rose-800/70 text-xs">Sunday: 10:00 AM – 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-rose-300/50 to-transparent mb-6" />

        {/* Copyright bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-rose-500 text-xs">
            © 2025 Beauty World. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-rose-500 hover:text-rose-800 text-xs transition-colors">
              Privacy Policy
            </Link>
            <span className="text-rose-300">|</span>
            <Link href="/terms" className="text-rose-500 hover:text-rose-800 text-xs transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative bottom rose line */}
      <div className="h-px bg-gradient-to-r from-transparent via-rose-400/40 to-transparent" />
    </footer>
  );
}

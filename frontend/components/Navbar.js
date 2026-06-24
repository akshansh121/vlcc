'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Sparkles, User, LogOut, Calendar, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Packages', href: '/packages' },
  { label: 'Staff', href: '/staff' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/70 backdrop-blur-md shadow-sm shadow-rose-500/10 border-b border-rose-200/50'
            : 'bg-white/30 backdrop-blur-sm border-b border-rose-200/30'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="rounded-full bg-rose-500/10 p-1.5 border border-rose-500/20 group-hover:border-rose-400 group-hover:bg-rose-500/20 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-display text-xl font-bold text-rose-950 tracking-wide group-hover:text-rose-600 transition-colors duration-300">
                Beauty World
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3.5 py-2 rounded-xl text-sm font-semibold text-rose-800/80 hover:text-rose-950 hover:bg-white/50 border border-transparent hover:border-rose-200/50 tracking-wide transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-rose-700 hover:text-rose-500 transition-colors duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((p) => !p)}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(user?.name)}
                    </div>
                    <span className="text-sm text-rose-800 group-hover:text-rose-950 transition-colors">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-rose-500 transition-transform duration-200 ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 glass-panel rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-rose-200/50">
                          <p className="text-rose-950 font-medium text-sm">{user?.name}</p>
                          <p className="text-rose-600 text-xs truncate">{user?.email}</p>
                        </div>
                        <Link
                          href="/bookings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-rose-800 hover:bg-white/50 hover:text-rose-950 transition-colors text-sm"
                        >
                          <Calendar className="w-4 h-4 text-rose-500" />
                          My Bookings
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-rose-800 hover:bg-white/50 hover:text-rose-950 transition-colors text-sm"
                        >
                          <User className="w-4 h-4 text-rose-500" />
                          Profile
                        </Link>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50/50 hover:text-red-600 transition-colors text-sm border-t border-rose-200/50"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm text-rose-800 hover:text-rose-950 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="btn-gold text-sm py-2 px-4"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Right */}
            <div className="flex md:hidden items-center gap-3">
              <Link href="/cart" className="relative p-2 text-rose-700">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 text-rose-700 hover:text-rose-950 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* Mobile Full-Screen Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-0 z-[60] mesh-bg flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-rose-200/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-600" />
                <span className="font-display text-lg font-bold text-rose-950">Beauty World</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-rose-600 hover:text-rose-950 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 flex flex-col justify-center px-8 gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-2xl font-display font-light text-rose-950 hover:text-rose-600 transition-colors border-b border-rose-200/40"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Bottom Auth */}
            <div className="px-8 pb-10">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-3 border-b border-rose-200/50">
                    <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold">
                      {getInitials(user?.name)}
                    </div>
                    <div>
                      <p className="text-rose-950 font-medium">{user?.name}</p>
                      <p className="text-rose-600 text-xs">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/bookings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-rose-800 py-2"
                  >
                    <Calendar className="w-4 h-4 text-rose-500" /> My Bookings
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-2 text-red-500 py-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-outline-gold w-full justify-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-gold w-full justify-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

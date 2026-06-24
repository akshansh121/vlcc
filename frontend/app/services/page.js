'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, X, SlidersHorizontal, ChevronRight,
  Clock, Star, CheckCircle2, Sparkles, Shield, Leaf, Award, CalendarCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ServiceCard from '../../components/ServiceCard';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../lib/api';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Hair Services', value: 'Hair Services' },
  { label: 'Skin & Face', value: 'Skin & Face' },
  { label: 'Makeup', value: 'Makeup' },
  { label: 'Nail Care', value: 'Nail Care' },
  { label: 'Body Care', value: 'Body Care' },
];

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col animate-pulse">
      <div className="h-48 bg-rose-100/60" />
      <div className="p-4 space-y-3 flex-1">
        <div className="h-5 bg-rose-100 rounded w-3/4" />
        <div className="h-4 bg-rose-50 rounded w-full" />
        <div className="h-4 bg-rose-50 rounded w-2/3" />
        <div className="h-4 bg-rose-50 rounded w-1/3" />
        <div className="h-10 bg-rose-100 rounded-xl mt-4" />
      </div>
    </div>
  );
}

// ── Cart Sidebar ──────────────────────────────────────────────────────────────
function CartSidebar({ open, onClose }) {
  const { items, total, cartCount, removeFromCart, updateQuantity, loading } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white/80 backdrop-blur-md border-l border-rose-200 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-rose-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-rose-500" />
                <h2 className="font-serif text-lg font-bold text-rose-950">
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-2 text-sm font-normal text-rose-500">({cartCount})</span>
                  )}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-rose-600 hover:text-rose-950 transition-colors rounded-lg hover:bg-rose-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <span className="inline-block w-7 h-7 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                  <ShoppingCart className="w-14 h-14 text-rose-300" />
                  <p className="text-rose-600 text-sm">Your cart is empty.</p>
                  <button onClick={onClose} className="btn-gold text-sm py-2">
                    Browse Services
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const svc = item.service || item;
                  const serviceId = item.serviceId || item.service_id || svc._id || svc.id;
                  const qty = item.quantity || 1;
                  const price = svc.discounted_price || svc.original_price || svc.price || 0;
                  return (
                    <div
                      key={serviceId}
                      className="flex items-start gap-3 glass-panel rounded-xl p-3 border border-rose-200"
                    >
                      <div className="w-14 h-14 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {svc.image_url ? (
                          <img src={svc.image_url} alt={svc.name} className="w-full h-full object-cover" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-rose-400/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-rose-950 text-sm font-medium truncate">{svc.name}</p>
                        <p className="text-rose-500 text-sm font-semibold">
                          ₹{parseFloat(price).toLocaleString('en-IN')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(serviceId, qty - 1)}
                            disabled={!serviceId}
                            className="w-6 h-6 rounded-md bg-white/60 border border-rose-200 text-rose-700 text-sm flex items-center justify-center hover:bg-rose-50 transition-colors"
                          >
                            −
                          </button>
                          <span className="text-rose-950 text-sm w-4 text-center">{qty}</span>
                          <button
                            onClick={() => updateQuantity(serviceId, qty + 1)}
                            disabled={!serviceId}
                            className="w-6 h-6 rounded-md bg-white/60 border border-rose-200 text-rose-700 text-sm flex items-center justify-center hover:bg-rose-50 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(serviceId)}
                        disabled={!serviceId}
                        className="p-1 text-rose-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-rose-200 px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-rose-700 text-sm">Subtotal</span>
                  <span className="text-rose-950 font-bold text-lg">
                    ₹{parseFloat(total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="btn-gold w-full justify-center text-sm"
                >
                  View Full Cart
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Service Detail Modal ──────────────────────────────────────────────────────

const DUMMY_DETAILS = {
  whatsIncluded: [
    'Professional consultation before the session',
    'Premium quality products used throughout',
    'Expert beautician with 5+ years experience',
    'Relaxing ambiance & hygienic environment',
    'Post-service care tips & guidance',
  ],
  benefits: [
    'Instantly visible results after one session',
    'Skin-safe, dermatologically tested products',
    'Boosts confidence and natural glow',
    'Long-lasting effect up to 4–6 weeks',
    'Suitable for all skin & hair types',
  ],
  aftercare: [
    'Avoid direct sun exposure for 24 hours',
    'Stay hydrated and moisturize regularly',
    'Follow the personalized aftercare kit provided',
    'Schedule follow-up session for best results',
  ],
};

function ServiceDetailModal({ service, onClose, onAddToCart, onBook }) {
  const [imgError, setImgError] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  if (!service) return null;

  const hasDiscount =
    service.discounted_price &&
    service.original_price &&
    parseFloat(service.discounted_price) < parseFloat(service.original_price);

  const displayPrice = hasDiscount ? service.discounted_price : service.original_price;

  const discountPct = hasDiscount
    ? Math.round(
        ((parseFloat(service.original_price) - parseFloat(service.discounted_price)) /
          parseFloat(service.original_price)) *
          100
      )
    : 0;

  const handleCart = async () => {
    setCartLoading(true);
    try {
      await onAddToCart(service);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="glass-panel border border-rose-200 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* ── Image Header ── */}
          <div className="relative h-56 sm:h-64 w-full flex-shrink-0">
            {service.image_url && !imgError ? (
              <Image
                src={service.image_url}
                alt={service.name}
                fill
                className="object-cover"
                onError={() => setImgError(true)}
                sizes="(max-width: 768px) 100vw, 672px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-100 to-rose-50">
                <Sparkles className="w-16 h-16 text-rose-400/40" />
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              {service.category_name && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {service.category_name}
                </span>
              )}
              {discountPct > 0 && (
                <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {discountPct}% OFF
                </span>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            {/* Title overlay at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 z-10">
              <h2 className="text-rose-950 font-serif font-bold text-2xl leading-tight drop-shadow-sm">
                {service.name}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {service.duration && (
                  <span className="flex items-center gap-1 text-rose-600 text-sm">
                    <Clock size={13} /> {service.duration} min
                  </span>
                )}
                <span className="flex items-center gap-1 text-rose-600 text-sm">
                  <Star size={13} className="fill-rose-500" /> 4.8 (120+ reviews)
                </span>
              </div>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

            {/* Price row */}
            <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              <div className="flex items-baseline gap-2">
                <span className="text-rose-500 font-bold text-2xl">
                  ₹{parseFloat(displayPrice).toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-rose-400 text-sm line-through">
                    ₹{parseFloat(service.original_price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {discountPct > 0 && (
                <span className="text-green-600 text-sm font-semibold">
                  You save ₹{(parseFloat(service.original_price) - parseFloat(service.discounted_price)).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Description */}
            {service.description && (
              <div>
                <h4 className="text-rose-600 font-semibold text-sm mb-2 uppercase tracking-wide">
                  About this service
                </h4>
                <p className="text-rose-800 text-sm leading-relaxed">
                  {service.description}
                  {' '}Our expert team uses the finest, skin-safe products to deliver
                  exceptional results tailored to your individual needs. Every session is
                  designed to leave you feeling refreshed, rejuvenated, and confident.
                </p>
              </div>
            )}

            {/* Highlights row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: 'Safe & Certified', color: 'text-blue-500' },
                { icon: Leaf, label: 'Natural Products', color: 'text-green-500' },
                { icon: Award, label: 'Expert Staff', color: 'text-rose-500' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                  <Icon size={20} className={color} />
                  <span className="text-rose-700 text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* What's Included */}
            <div>
              <h4 className="text-rose-600 font-semibold text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 size={15} /> What's Included
              </h4>
              <ul className="space-y-2">
                {DUMMY_DETAILS.whatsIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-rose-800 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div>
              <h4 className="text-rose-600 font-semibold text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                <Sparkles size={15} /> Key Benefits
              </h4>
              <ul className="space-y-2">
                {DUMMY_DETAILS.benefits.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-rose-800 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Aftercare */}
            <div>
              <h4 className="text-rose-600 font-semibold text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                <Leaf size={15} /> Aftercare Tips
              </h4>
              <ul className="space-y-2">
                {DUMMY_DETAILS.aftercare.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-rose-800 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Footer CTA ── */}
          <div className="flex-shrink-0 border-t border-rose-200 px-5 py-4 flex gap-3">
            <button
              onClick={handleCart}
              disabled={cartLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-white/60 hover:bg-white/80 border border-rose-200 hover:border-rose-400 text-rose-800 font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-60"
            >
              {cartLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart size={16} />
              )}
              {cartLoading ? 'Adding…' : 'Add to Cart'}
            </button>
            <Link
              href="/booking"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <CalendarCheck size={16} />
              Book Now
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const { addToCart, cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Fetch all services on mount
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data } = await api.getServices();
        const list = data.services || data.data || data || [];
        setServices(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        toast.error('Could not load services. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Client-side filtering
  const filtered = useMemo(() => {
    let result = services;
    if (activeCategory) {
      result = result.filter(
        (s) =>
          (s.category_name || s.category || '').toLowerCase() === activeCategory.toLowerCase()
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q) ||
          (s.category_name || s.category || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [services, activeCategory, search]);

  const handleAddToCart = useCallback(
    async (service) => {
      if (!isAuthenticated) {
        toast.error('Please login to add services to your cart.');
        router.replace('/login?redirect=/services');
        return;
      }
      try {
        await addToCart(service);
        toast.success(`${service.name} added to cart!`);
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to add to cart.';
        toast.error(msg);
      }
    },
    [addToCart, isAuthenticated, router]
  );

  return (
    <>
      <Navbar />

      {/* Page Content */}
      <main className="min-h-screen mesh-bg pt-20">

        {/* ── Hero Header ───────────────────────────────────────────────── */}
        <section className="relative glass-panel border-b border-rose-200/50 py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-rose-400/10 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="section-subtitle"
            >
              Beauty World
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="section-title text-3xl sm:text-5xl"
            >
              Our{' '}
              <span className="text-rose-500 italic font-serif">Services</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-rose-700 max-w-lg mx-auto text-sm mt-2 font-light"
            >
              Discover our full range of luxury beauty treatments, crafted to make you look and
              feel extraordinary.
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center mt-5"
            >
              <div className="h-0.5 w-16 bg-rose-500/40 mx-auto" />
            </motion.div>
          </div>
        </section>

        {/* ── Filters Bar ───────────────────────────────────────────────── */}
        <section className="sticky top-[72px] z-30 bg-white/70 backdrop-blur-md border-b border-rose-200/50 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3">

              {/* Search */}
              <div className="relative w-full flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services..."
                  className="input-dark pl-9 py-2.5 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category tabs + cart row */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 pb-0.5 min-w-0">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setActiveCategory(cat.value)}
                      className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        activeCategory === cat.value
                          ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                          : 'bg-white/60 text-rose-700 hover:text-rose-950 hover:bg-white/80 border border-rose-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Cart button */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative flex items-center gap-1.5 bg-white/60 hover:bg-white/80 border border-rose-200 hover:border-rose-400 text-rose-700 hover:text-rose-950 px-3 py-2 rounded-xl transition-all duration-200 text-sm flex-shrink-0"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Services Grid ──────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center gap-5"
            >
              <div className="w-20 h-20 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center">
                <SlidersHorizontal className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <h3 className="text-rose-950 font-serif text-xl font-light mb-1">
                  No Services Found
                </h3>
                <p className="text-rose-600 text-sm max-w-xs">
                  {search
                    ? `No services match "${search}". Try a different keyword.`
                    : `No services in this category yet. Check back soon!`}
                </p>
              </div>
              <div className="flex gap-3">
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="btn-outline-gold text-sm py-2 px-4"
                  >
                    Clear Search
                  </button>
                )}
                {activeCategory && (
                  <button
                    onClick={() => setActiveCategory('')}
                    className="btn-gold text-sm py-2 px-4"
                  >
                    View All Services
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((service) => (
                <motion.div
                  key={service._id || service.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
                  }}
                >
                  <ServiceCard
                    service={service}
                    onAddToCart={handleAddToCart}
                    onCardClick={setSelectedService}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </main>

      <Footer />

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onAddToCart={async (svc) => {
            await handleAddToCart(svc);
          }}
        />
      )}
    </>
  );
}

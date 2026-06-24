'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Clock, ShoppingCart, ArrowRight, Star } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

/* ── Skeleton Card ─────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-rose-100/60" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 bg-rose-100 rounded" />
        <div className="h-5 w-3/4 bg-rose-100 rounded" />
        <div className="h-3 w-full bg-rose-50 rounded" />
        <div className="h-3 w-2/3 bg-rose-50 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-20 bg-rose-100 rounded" />
          <div className="h-9 w-28 bg-rose-100 rounded" />
        </div>
      </div>
    </div>
  );
}

/* ── Service Card ──────────────────────────────────────────────────────────── */
function ServiceCard({ service, index }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add services to cart');
      return;
    }
    setAdding(true);
    try {
      await addToCart(service);
      toast.success(`${service.name} added to cart`);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const discountedPrice = service.discountedPrice ?? service.price;
  const originalPrice = service.price;
  const hasDiscount = discountedPrice < originalPrice;

  const imageUrl =
    service.image ||
    `https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=70`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="glass-panel-interactive rounded-xl overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-950/30 to-transparent" />

        {/* Category Badge */}
        {service.category && (
          <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-rose-200/60">
            {service.category}
          </span>
        )}

        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-rose-950 font-semibold text-base mb-2 leading-snug line-clamp-1">
          {service.name}
        </h3>
        <p className="text-rose-700 text-xs leading-relaxed mb-4 line-clamp-2">
          {service.description || 'Experience a luxurious treatment tailored specifically for you.'}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-rose-600 text-xs">
            {service.duration ? `${service.duration} min` : '45 min'}
          </span>
        </div>

        {/* Price + Button */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-rose-400 text-xs line-through">
                ₹{originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-rose-600 font-bold text-lg">
              ₹{discountedPrice?.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 hover:border-rose-500 text-rose-600 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Featured Services Section ─────────────────────────────────────────────── */
export default function FeaturedServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await axios.get('/api/services?limit=6');
        const list = data.services || data.data || data;
        setServices(Array.isArray(list) ? list.slice(0, 6) : []);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

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
          <p className="section-subtitle">What We Offer</p>
          <h2 className="section-title">
            Featured{' '}
            <span className="text-gold-500 italic">Services</span>
          </h2>
          <p className="text-rose-700 text-sm max-w-lg mx-auto mt-3 font-light">
            Explore our most loved treatments — each one crafted to perfection by our team of expert professionals.
          </p>
          <div className="flex justify-center mt-5">
            <div className="h-0.5 w-16 bg-rose-500/40 mx-auto" />
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <ServiceCard key={service._id || service.id || i} service={service} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Star className="w-10 h-10 text-rose-400/40 mx-auto mb-4" />
            <p className="text-rose-600">Services coming soon. Check back later!</p>
          </div>
        )}

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-2 btn-outline-gold"
          >
            View All Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

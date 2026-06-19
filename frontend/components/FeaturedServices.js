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
    <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-dark-700" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 bg-dark-600 rounded" />
        <div className="h-5 w-3/4 bg-dark-600 rounded" />
        <div className="h-3 w-full bg-dark-700 rounded" />
        <div className="h-3 w-2/3 bg-dark-700 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-20 bg-dark-600 rounded" />
          <div className="h-9 w-28 bg-dark-600 rounded" />
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
      className="bg-dark-800 border border-dark-600 hover:border-gold-500/50 rounded-xl overflow-hidden group transition-colors duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />

        {/* Category Badge */}
        {service.category && (
          <span className="absolute top-3 left-3 bg-dark-900/80 backdrop-blur-sm text-gold-500 text-xs font-semibold px-2.5 py-1 rounded-full border border-gold-500/30">
            {service.category}
          </span>
        )}

        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-gold-500 text-dark-900 text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-base mb-2 leading-snug line-clamp-1">
          {service.name}
        </h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
          {service.description || 'Experience a luxurious treatment tailored specifically for you.'}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-400 text-xs">
            {service.duration ? `${service.duration} min` : '45 min'}
          </span>
        </div>

        {/* Price + Button */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-gray-500 text-xs line-through">
                ₹{originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-gold-500 font-bold text-lg">
              ₹{discountedPrice?.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="flex items-center gap-1.5 bg-gold-500/10 hover:bg-gold-500 border border-gold-500/40 hover:border-gold-500 text-gold-500 hover:text-dark-900 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
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
    <section ref={sectionRef} className="bg-dark-800 py-24">
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
          <p className="text-gray-400 text-sm max-w-lg mx-auto mt-3">
            Explore our most loved treatments — each one crafted to perfection by our team of expert professionals.
          </p>
          <div className="flex justify-center mt-5">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
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
            <Star className="w-10 h-10 text-gold-500/40 mx-auto mb-4" />
            <p className="text-gray-500">Services coming soon. Check back later!</p>
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

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Crown, Check, ArrowRight, Loader2, Package } from 'lucide-react';
import axios from 'axios';

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
function PackageSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-7 animate-pulse space-y-4">
      <div className="h-4 w-20 bg-rose-100 rounded" />
      <div className="h-7 w-40 bg-rose-100 rounded" />
      <div className="h-10 w-32 bg-rose-100 rounded" />
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-3 bg-rose-50 rounded w-full" />
        ))}
      </div>
      <div className="h-11 bg-rose-100 rounded-lg" />
    </div>
  );
}

/* ── Package Card ──────────────────────────────────────────────────────────── */
function PackageCard({ pkg, index }) {
  const tierStyles = {
    silver: {
      wrapper: 'glass-panel hover:border-rose-200',
      badge: 'bg-rose-100/60 text-rose-700 border-rose-200',
      priceColor: 'text-rose-800',
      iconBg: 'bg-rose-100/60',
      iconColor: 'text-rose-500',
      button: 'btn-outline-gold',
    },
    gold: {
      wrapper: 'glass-panel border-rose-400/60 shadow-lg shadow-rose-500/15',
      badge: 'bg-rose-500/20 text-rose-700 border-rose-400/40',
      priceColor: 'text-rose-600',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-500',
      button: 'btn-gold',
    },
    platinum: {
      wrapper: 'glass-panel border-purple-300/60 hover:border-purple-400/60',
      badge: 'bg-purple-500/10 text-purple-700 border-purple-300/50',
      priceColor: 'text-purple-700',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      button: 'btn-outline-gold',
    },
  };

  const detectTier = (name = '', type = '') => {
    const combined = `${name} ${type}`.toLowerCase();
    if (combined.includes('platinum')) return 'platinum';
    if (combined.includes('gold')) return 'gold';
    return 'silver';
  };

  const tier = detectTier(pkg.name, pkg.type);
  const styles = tierStyles[tier];
  const isGold = tier === 'gold';

  const discountedPrice = pkg.discountedPrice ?? pkg.price;
  const hasDiscount = discountedPrice < pkg.price;
  const benefits = pkg.benefits || pkg.features || [];
  const includedServices = pkg.services || pkg.includedServices || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative border-2 rounded-2xl p-7 transition-all duration-300 flex flex-col ${styles.wrapper}`}
    >
      {/* Popular badge */}
      {isGold && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-md shadow-rose-500/30">
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.iconBg}`}>
            <Crown className={`w-4 h-4 ${styles.iconColor}`} />
          </div>
          {pkg.type && (
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${styles.badge}`}>
              {pkg.type}
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl font-semibold text-rose-950 mb-1">{pkg.name}</h3>
        {pkg.description && (
          <p className="text-rose-700 text-xs leading-relaxed line-clamp-2">{pkg.description}</p>
        )}
      </div>

      {/* Pricing */}
      <div className="mb-6">
        {hasDiscount && (
          <span className="text-rose-400 text-sm line-through block">
            ₹{pkg.price?.toLocaleString('en-IN')}
          </span>
        )}
        <div className="flex items-baseline gap-1">
          <span className={`font-serif text-3xl sm:text-4xl font-bold ${styles.priceColor}`}>
            ₹{discountedPrice?.toLocaleString('en-IN')}
          </span>
          <span className="text-rose-600 text-sm">/session</span>
        </div>
        {hasDiscount && (
          <span className="text-green-600 text-xs font-medium mt-1 block">
            Save ₹{(pkg.price - discountedPrice).toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className={`h-px mb-6 ${isGold ? 'bg-rose-400/30' : 'bg-rose-200/50'}`} />

      {/* Benefits */}
      {benefits.length > 0 && (
        <ul className="space-y-2.5 mb-5">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isGold ? 'text-rose-500' : styles.iconColor}`} />
              <span className="text-rose-800 text-xs leading-relaxed">
                {typeof benefit === 'string' ? benefit : benefit.name || benefit.title || ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Included Services */}
      {includedServices.length > 0 && (
        <div className="mb-6">
          <p className="text-rose-600 text-xs uppercase tracking-wide font-semibold mb-2">Includes</p>
          <div className="flex flex-wrap gap-1.5">
            {includedServices.slice(0, 5).map((svc, i) => (
              <span
                key={i}
                className="bg-rose-500/10 border border-rose-200 text-rose-700 text-xs px-2 py-0.5 rounded-md"
              >
                {typeof svc === 'string' ? svc : svc.name || ''}
              </span>
            ))}
            {includedServices.length > 5 && (
              <span className="text-rose-500 text-xs px-2 py-0.5">
                +{includedServices.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto">
        <Link
          href={`/booking?package=${pkg._id || pkg.id}`}
          className={`${styles.button} w-full justify-center`}
        >
          Book Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Packages Section ──────────────────────────────────────────────────────── */
export default function PackagesSection() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data } = await axios.get('/api/packages');
        const list = data.packages || data.data || data;
        setPackages(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to fetch packages:', err);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
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
          <p className="section-subtitle">Value Bundles</p>
          <h2 className="section-title">
            Our{' '}
            <span className="text-gold-500 italic">Packages</span>
          </h2>
          <p className="text-rose-700 text-sm max-w-lg mx-auto mt-3 font-light">
            Choose from our curated packages — designed to deliver the ultimate beauty experience at unbeatable value.
          </p>
          <div className="flex justify-center mt-5">
            <div className="h-0.5 w-16 bg-rose-500/40 mx-auto" />
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <PackageSkeleton key={i} />)}
          </div>
        ) : packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {packages.map((pkg, i) => (
              <PackageCard key={pkg._id || pkg.id || i} pkg={pkg} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-rose-400/40 mx-auto mb-4" />
            <p className="text-rose-600">Packages coming soon. Stay tuned!</p>
          </div>
        )}

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/packages" className="inline-flex items-center gap-2 btn-outline-gold">
            View All Packages
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

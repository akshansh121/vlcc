'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Crown, Check, ArrowRight, Loader2, Package } from 'lucide-react';
import axios from 'axios';

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
function PackageSkeleton() {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl p-7 animate-pulse space-y-4">
      <div className="h-4 w-20 bg-dark-700 rounded" />
      <div className="h-7 w-40 bg-dark-700 rounded" />
      <div className="h-10 w-32 bg-dark-700 rounded" />
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-3 bg-dark-700 rounded w-full" />
        ))}
      </div>
      <div className="h-11 bg-dark-700 rounded-lg" />
    </div>
  );
}

/* ── Package Card ──────────────────────────────────────────────────────────── */
function PackageCard({ pkg, index }) {
  const tierStyles = {
    silver: {
      wrapper: 'bg-dark-800 border-dark-500 hover:border-gray-400/60',
      badge: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
      priceColor: 'text-white',
      iconBg: 'bg-gray-500/20',
      iconColor: 'text-gray-300',
      button: 'btn-outline-gold',
    },
    gold: {
      wrapper: 'bg-gradient-to-b from-dark-800 to-dark-900 border-gold-500 shadow-lg shadow-gold-500/20',
      badge: 'bg-gold-500/20 text-gold-400 border-gold-500/40',
      priceColor: 'text-gold-500',
      iconBg: 'bg-gold-500/20',
      iconColor: 'text-gold-500',
      button: 'btn-gold',
    },
    platinum: {
      wrapper: 'bg-gradient-to-b from-dark-900 to-dark-800 border-purple-500/50 hover:border-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      priceColor: 'text-purple-300',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-300',
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
          <span className="bg-gold-500 text-dark-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-md">
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

        <h3 className="font-display text-xl font-bold text-white mb-1">{pkg.name}</h3>
        {pkg.description && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{pkg.description}</p>
        )}
      </div>

      {/* Pricing */}
      <div className="mb-6">
        {hasDiscount && (
          <span className="text-gray-500 text-sm line-through block">
            ₹{pkg.price?.toLocaleString('en-IN')}
          </span>
        )}
        <div className="flex items-baseline gap-1">
          <span className={`font-display text-3xl sm:text-4xl font-bold ${styles.priceColor}`}>
            ₹{discountedPrice?.toLocaleString('en-IN')}
          </span>
          <span className="text-gray-500 text-sm">/session</span>
        </div>
        {hasDiscount && (
          <span className="text-green-400 text-xs font-medium mt-1 block">
            Save ₹{(pkg.price - discountedPrice).toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className={`h-px mb-6 ${isGold ? 'bg-gold-500/30' : 'bg-dark-600'}`} />

      {/* Benefits */}
      {benefits.length > 0 && (
        <ul className="space-y-2.5 mb-5">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isGold ? 'text-gold-500' : styles.iconColor}`} />
              <span className="text-gray-300 text-xs leading-relaxed">
                {typeof benefit === 'string' ? benefit : benefit.name || benefit.title || ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Included Services */}
      {includedServices.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-2">Includes</p>
          <div className="flex flex-wrap gap-1.5">
            {includedServices.slice(0, 5).map((svc, i) => (
              <span
                key={i}
                className="bg-dark-700 border border-dark-500 text-gray-400 text-xs px-2 py-0.5 rounded-md"
              >
                {typeof svc === 'string' ? svc : svc.name || ''}
              </span>
            ))}
            {includedServices.length > 5 && (
              <span className="text-gray-600 text-xs px-2 py-0.5">
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
    <section ref={sectionRef} className="bg-dark-900 py-24 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="glow-orb w-[480px] h-[480px] -left-40 top-10" />
      <div className="glow-orb w-[420px] h-[420px] -right-32 bottom-0 animate-glow-pulse" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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
          <p className="text-gray-400 text-sm max-w-lg mx-auto mt-3">
            Choose from our curated packages — designed to deliver the ultimate beauty experience at unbeatable value.
          </p>
          <div className="flex justify-center mt-5">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
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
            <Package className="w-10 h-10 text-gold-500/40 mx-auto mb-4" />
            <p className="text-gray-500">Packages coming soon. Stay tuned!</p>
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowRight, Loader2, Package, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import * as api from '../../lib/api';

// ── Skeleton ──────────────────────────────────────────────────────────────────
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

// ── Package Card ──────────────────────────────────────────────────────────────
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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative border-2 rounded-2xl p-7 transition-all duration-300 flex flex-col ${styles.wrapper}`}
    >
      {isGold && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gold-500 text-dark-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-md">
            Most Popular
          </span>
        </div>
      )}

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

      <div className={`h-px mb-6 ${isGold ? 'bg-gold-500/30' : 'bg-dark-600'}`} />

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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPackages()
      .then(({ data }) => {
        const list = data.packages || data.data || data;
        setPackages(Array.isArray(list) ? list : []);
      })
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
            <Link href="/" className="hover:text-gold-500 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">Packages</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="section-subtitle">Value Bundles</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Our <span className="text-gold-500 italic">Packages</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              Curated beauty packages designed to deliver the ultimate experience at unbeatable value. Choose the one that suits you best.
            </p>
            <div className="flex justify-center mt-6">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {[...Array(3)].map((_, i) => <PackageSkeleton key={i} />)}
            </div>
          ) : packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {packages.map((pkg, i) => (
                <PackageCard key={pkg._id || pkg.id || i} pkg={pkg} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <Package className="w-12 h-12 text-gold-500/30 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-display mb-2">No packages yet</p>
              <p className="text-gray-600 text-sm">Check back soon for exciting bundle offers.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

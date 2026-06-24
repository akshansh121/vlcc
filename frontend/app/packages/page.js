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
    <div className="glass-panel rounded-2xl p-7 animate-pulse space-y-4">
      <div className="h-4 w-20 bg-rose-100 rounded" />
      <div className="h-7 w-40 bg-rose-100 rounded" />
      <div className="h-10 w-32 bg-rose-100 rounded" />
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-3 bg-rose-100 rounded w-full" />
        ))}
      </div>
      <div className="h-11 bg-rose-100 rounded-lg" />
    </div>
  );
}

// ── Package Card ──────────────────────────────────────────────────────────────
function PackageCard({ pkg, index }) {
  const tierStyles = {
    silver: {
      wrapper: 'glass-panel hover:border-rose-200',
      badge: 'bg-rose-100 text-rose-600 border-rose-200',
      priceColor: 'text-rose-700',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-500',
      button: 'btn-outline-gold',
    },
    gold: {
      wrapper: 'glass-panel border-rose-400/60 shadow-lg shadow-rose-500/15',
      badge: 'bg-rose-500/20 text-rose-600 border-rose-400/40',
      priceColor: 'text-rose-600',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-500',
      button: 'btn-gold',
    },
    platinum: {
      wrapper: 'glass-panel border-purple-300/60 hover:border-purple-400/60',
      badge: 'bg-purple-100 text-purple-600 border-purple-200',
      priceColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative border-2 rounded-2xl p-7 transition-all duration-300 flex flex-col ${styles.wrapper}`}
    >
      {isGold && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-md shadow-rose-500/30">
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
        <h3 className="font-serif text-xl font-light text-rose-950 mb-1">{pkg.name}</h3>
        {pkg.description && (
          <p className="text-rose-700 text-xs leading-relaxed line-clamp-2">{pkg.description}</p>
        )}
      </div>

      <div className="mb-6">
        {hasDiscount && (
          <span className="text-rose-400 text-sm line-through block">
            ₹{pkg.price?.toLocaleString('en-IN')}
          </span>
        )}
        <div className="flex items-baseline gap-1">
          <span className={`font-serif text-3xl sm:text-4xl font-light ${styles.priceColor}`}>
            ₹{discountedPrice?.toLocaleString('en-IN')}
          </span>
          <span className="text-rose-600 text-sm">/session</span>
        </div>
        {hasDiscount && (
          <span className="text-green-500 text-xs font-medium mt-1 block">
            Save ₹{(pkg.price - discountedPrice).toLocaleString('en-IN')}
          </span>
        )}
      </div>

      <div className="h-px mb-6 bg-rose-400/30" />

      {benefits.length > 0 && (
        <ul className="space-y-2.5 mb-5">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${styles.iconColor}`} />
              <span className="text-rose-800 text-xs leading-relaxed">
                {typeof benefit === 'string' ? benefit : benefit.name || benefit.title || ''}
              </span>
            </li>
          ))}
        </ul>
      )}

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
    <div className="min-h-screen mesh-bg">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-fuchsia-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-rose-500 mb-8">
            <Link href="/" className="hover:text-rose-950 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-rose-800">Packages</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="section-subtitle">Value Bundles</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-rose-950 mb-4">
              Our <span className="text-rose-500 italic">Packages</span>
            </h1>
            <p className="text-rose-700 max-w-xl mx-auto text-sm leading-relaxed font-light">
              Curated beauty packages designed to deliver the ultimate experience at unbeatable value. Choose the one that suits you best.
            </p>
            <div className="flex justify-center mt-6">
              <div className="h-0.5 w-16 bg-rose-500/40 mx-auto" />
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
              <Package className="w-12 h-12 text-rose-400/40 mx-auto mb-4" />
              <p className="text-rose-700 text-lg font-serif font-light mb-2">No packages yet</p>
              <p className="text-rose-500 text-sm">Check back soon for exciting bundle offers.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

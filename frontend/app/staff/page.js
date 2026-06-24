'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, Users, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import * as api from '../../lib/api';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function StaffSkeleton() {
  return (
    <div className="glass-panel border border-rose-200 rounded-2xl p-6 animate-pulse text-center">
      <div className="w-24 h-24 rounded-full bg-rose-100 mx-auto mb-4" />
      <div className="h-4 w-28 bg-rose-100 rounded mx-auto mb-2" />
      <div className="h-3 w-20 bg-rose-50 rounded mx-auto mb-4" />
      <div className="flex flex-wrap gap-1 justify-center">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-5 w-16 bg-rose-100 rounded-full" />
        ))}
      </div>
    </div>
  );
}

// ── Staff Card ────────────────────────────────────────────────────────────────
function StaffCard({ member, index }) {
  const avatarUrl =
    member.image ||
    member.avatar ||
    `https://i.pravatar.cc/150?u=${member._id || member.id || index}`;

  const specializations =
    member.specializations ||
    member.specialization ||
    member.skills ||
    [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="glass-panel border border-rose-200 hover:border-rose-400 rounded-2xl p-6 text-center group transition-all duration-300"
    >
      {/* Avatar */}
      <div className="relative mx-auto w-24 h-24 mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-rose-200 group-hover:border-rose-400 transition-colors duration-300">
          <img
            src={avatarUrl}
            alt={member.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=D4AF37&color=0a0a0a&size=150`;
            }}
          />
        </div>
        {member.experience && (
          <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
            {member.experience}y
          </div>
        )}
      </div>

      <h3 className="text-rose-950 font-semibold text-sm mb-1">{member.name}</h3>
      <p className="text-rose-500 text-xs font-medium mb-3">
        {member.designation || member.role || 'Beauty Expert'}
      </p>

      <div className="h-px bg-rose-200 mb-3 group-hover:bg-rose-300 transition-colors" />

      {specializations.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {(Array.isArray(specializations) ? specializations.slice(0, 4) : [specializations]).map((tag, i) => (
            <span
              key={i}
              className="bg-rose-50 border border-rose-200 text-rose-600 text-[10px] px-2 py-0.5 rounded-full"
            >
              {typeof tag === 'string' ? tag : tag.name || tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStaff()
      .then(({ data }) => {
        const list = data.staff || data.data || data;
        setStaff(Array.isArray(list) ? list : []);
      })
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-rose-600 mb-8">
            <Link href="/" className="hover:text-rose-500 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-rose-800">Our Team</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="section-subtitle">Our Team</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-rose-950 mb-4">
              Meet Our <span className="text-rose-500 italic">Expert Staff</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-4 mb-4">
              <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-rose-400/60" />
              <Award className="w-5 h-5 text-rose-500" />
              <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-rose-400/60" />
            </div>
            <p className="text-rose-700 max-w-xl mx-auto text-sm leading-relaxed">
              Our passionate team of certified professionals bring years of expertise and artistry to every appointment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {[...Array(10)].map((_, i) => <StaffSkeleton key={i} />)}
            </div>
          ) : staff.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {staff.map((member, i) => (
                <StaffCard key={member._id || member.id || i} member={member} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <Users className="w-12 h-12 text-rose-400/50 mx-auto mb-4" />
              <p className="text-rose-700 text-lg font-serif mb-2">Meet our team soon</p>
              <p className="text-rose-500 text-sm">Staff profiles are being set up.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

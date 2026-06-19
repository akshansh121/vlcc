'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Users } from 'lucide-react';
import axios from 'axios';

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
function StaffSkeleton() {
  return (
    <div className="flex-shrink-0 w-56 bg-dark-800 border border-dark-600 rounded-2xl p-5 animate-pulse">
      <div className="w-20 h-20 rounded-full bg-dark-700 mx-auto mb-4" />
      <div className="h-4 w-28 bg-dark-700 rounded mx-auto mb-2" />
      <div className="h-3 w-20 bg-dark-700 rounded mx-auto mb-3" />
      <div className="flex flex-wrap gap-1 justify-center">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-5 w-14 bg-dark-700 rounded-full" />
        ))}
      </div>
    </div>
  );
}

/* ── Staff Card ────────────────────────────────────────────────────────────── */
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="flex-shrink-0 w-56 bg-dark-800 border border-dark-600 hover:border-gold-500/50 rounded-2xl p-5 text-center group transition-all duration-300 cursor-default"
    >
      {/* Avatar */}
      <div className="relative mx-auto w-20 h-20 mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dark-600 group-hover:border-gold-500/60 transition-colors duration-300">
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
        {/* Experience badge */}
        {member.experience && (
          <div className="absolute -bottom-1 -right-1 bg-gold-500 text-dark-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
            {member.experience}y
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-white font-semibold text-sm mb-1 truncate">{member.name}</h3>

      {/* Designation */}
      <p className="text-gold-500 text-xs font-medium mb-3 truncate">
        {member.designation || member.role || 'Beauty Expert'}
      </p>

      {/* Divider */}
      <div className="h-px bg-dark-600 mb-3 group-hover:bg-gold-500/20 transition-colors" />

      {/* Specializations */}
      {specializations.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {(Array.isArray(specializations)
            ? specializations.slice(0, 3)
            : [specializations]
          ).map((tag, i) => (
            <span
              key={i}
              className="bg-dark-700 border border-dark-500 text-gray-400 text-[10px] px-2 py-0.5 rounded-full truncate max-w-full"
            >
              {typeof tag === 'string' ? tag : tag.name || tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Staff Section ─────────────────────────────────────────────────────────── */
export default function StaffSection() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data } = await axios.get('/api/staff');
        const list = data.staff || data.data || data;
        setStaff(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to fetch staff:', err);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  return (
    <section ref={sectionRef} className="bg-dark-800 py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="section-subtitle">Our Team</p>
          <h2 className="section-title">
            Meet Our{' '}
            <span className="text-gold-500 italic">Expert Staff</span>
          </h2>

          {/* Elegant divider */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-gold-500/60" />
            <Award className="w-5 h-5 text-gold-500" />
            <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-gold-500/60" />
          </div>

          <p className="text-gray-400 text-sm max-w-lg mx-auto mt-4">
            Our passionate team of certified professionals bring years of expertise and artistry to
            every appointment.
          </p>
        </motion.div>

        {/* Desktop grid / Mobile horizontal scroll */}
        {loading ? (
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {[...Array(5)].map((_, i) => <StaffSkeleton key={i} />)}
          </div>
        ) : staff.length > 0 ? (
          <>
            {/* Large screens: wrap grid */}
            <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 gap-5">
              {staff.map((member, i) => (
                <StaffCard key={member._id || member.id || i} member={member} index={i} />
              ))}
            </div>

            {/* Small/medium screens: horizontal scroll */}
            <div
              ref={scrollRef}
              className="lg:hidden flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            >
              {staff.map((member, i) => (
                <StaffCard key={member._id || member.id || i} member={member} index={i} />
              ))}
            </div>

            {/* Mobile scroll hint */}
            <p className="lg:hidden text-center text-gray-600 text-xs mt-4">
              Swipe to see more
            </p>
          </>
        ) : (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-gold-500/40 mx-auto mb-4" />
            <p className="text-gray-500">Staff profiles coming soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}

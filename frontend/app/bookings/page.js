'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Calendar,
  Package,
  ShoppingBag,
  Ban,
  ChevronRight,
  Sparkles,
  CreditCard,
  Wallet,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../lib/api';

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50',
    dot: 'bg-yellow-400',
  },
  confirmed: {
    label: 'Confirmed',
    badgeClass: 'bg-blue-900/40 text-blue-400 border-blue-700/50',
    dot: 'bg-blue-400',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-green-900/40 text-green-400 border-green-700/50',
    dot: 'bg-green-400',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-red-900/40 text-red-400 border-red-700/50',
    dot: 'bg-red-400',
  },
};

const ITEMS_PER_PAGE = 6;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return timeStr ? `${formattedDate} at ${timeStr}` : formattedDate;
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status?.toLowerCase()] || {
    label: status || 'Unknown',
    badgeClass: 'bg-dark-700 text-gray-400 border-dark-500',
    dot: 'bg-gray-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ── Booking Card ──────────────────────────────────────────────────────────────

function PaymentBadge({ method, paymentStatus }) {
  const isOnline = method === 'online';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
        isOnline
          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      }`}
    >
      {isOnline ? <CreditCard className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
      {isOnline ? 'Paid Online' : 'Pay After Service'}
      {paymentStatus === 'paid' && isOnline && (
        <span className="ml-0.5 text-emerald-400">·&nbsp;Paid</span>
      )}
    </span>
  );
}

function BookingCard({ booking, onCancelClick }) {
  const status = booking.status?.toLowerCase() || 'pending';
  const canCancel = status === 'pending' || status === 'confirmed';

  const bookingId = booking.id || booking.bookingId || booking._id;
  const displayId = String(bookingId).padStart(6, '0');

  const services = booking.items || booking.services || [];
  const packageName = booking.package?.name || booking.packageName;
  const isPackage = !!packageName || booking.type === 'package';

  const totalAmount = parseFloat(
    booking.final_amount || booking.totalAmount || booking.total || booking.amount || 0
  );

  const paymentMethod = booking.payment_method || booking.paymentMethod;
  const paymentStatus = booking.payment_status || booking.paymentStatus;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="card-dark p-5 sm:p-6"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 text-xs font-mono">#{displayId}</span>
            <StatusBadge status={status} />
            {paymentMethod && (
              <PaymentBadge method={paymentMethod} paymentStatus={paymentStatus} />
            )}
          </div>
          <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDateTime(
              booking.booking_date || booking.bookingDate || booking.date,
              booking.booking_time || booking.bookingTime || booking.time
            )}
          </p>
        </div>

        {/* Amount */}
        {totalAmount > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-gold-400 font-bold text-lg">
              ₹{totalAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-gray-600 text-xs">Total</p>
          </div>
        )}
      </div>

      {/* Services / Package */}
      <div className="mb-4">
        {isPackage ? (
          <div className="flex items-center gap-2 bg-dark-700/60 rounded-sm px-3 py-2">
            <Package className="w-4 h-4 text-gold-500/70 flex-shrink-0" />
            <span className="text-gray-300 text-sm">{packageName}</span>
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1 mb-2">
              <ShoppingBag className="w-3 h-3" /> Services
            </p>
            {services.slice(0, 3).map((item, idx) => {
              const name = item.service_name || item.name || item.service?.name || 'Service';
              const qty = item.quantity || 1;
              return (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500/60 flex-shrink-0" />
                  <span className="text-gray-300 truncate">
                    {name}
                    {qty > 1 && (
                      <span className="text-gray-600 ml-1">×{qty}</span>
                    )}
                  </span>
                </div>
              );
            })}
            {services.length > 3 && (
              <p className="text-gray-600 text-xs pl-3.5">+{services.length - 3} more</p>
            )}
          </div>
        ) : (
          <p className="text-gray-600 text-sm italic">No service details</p>
        )}
      </div>

      {/* Note */}
      {(booking.notes || booking.note) && (
        <p className="text-gray-600 text-xs bg-dark-700/40 border border-dark-600 rounded-sm px-3 py-2 mb-4 line-clamp-2">
          Note: {booking.notes || booking.note}
        </p>
      )}

      {/* Footer Actions */}
      {canCancel && (
        <div className="flex justify-end border-t border-dark-600 pt-4">
          <button
            onClick={() => onCancelClick(booking)}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-medium transition-colors border border-red-900/40 hover:border-red-700/60 px-3 py-1.5 rounded-sm"
          >
            <Ban className="w-3.5 h-3.5" />
            Cancel Booking
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/bookings');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.getMyBookings();
      const list = data.bookings || data.data || data || [];
      setBookings(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Filter bookings by tab
  const filteredBookings =
    activeTab === 'all'
      ? bookings
      : bookings.filter((b) => b.status?.toLowerCase() === activeTab);

  // Pagination
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Tab counts
  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab.key] =
      tab.key === 'all'
        ? bookings.length
        : bookings.filter((b) => b.status?.toLowerCase() === tab.key).length;
    return acc;
  }, {});

  // Cancel booking
  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    const bookingId = cancelTarget.id || cancelTarget._id;
    setCancelling(true);
    try {
      await api.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      setBookings((prev) =>
        prev.map((b) =>
          (b.id || b._id) === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to cancel booking';
      toast.error(msg);
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="section-subtitle flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Appointments
            </p>
            <h1 className="section-title mb-0">My Bookings</h1>
          </div>
          <Link href="/booking" className="btn-gold text-sm py-2.5 self-start sm:self-auto">
            <Calendar className="w-4 h-4" />
            New Booking
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-8 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium whitespace-nowrap transition-all duration-200 border flex-shrink-0 ${
                activeTab === tab.key
                  ? 'bg-gold-500 border-gold-500 text-dark-900 font-semibold'
                  : 'border-dark-600 text-gray-400 hover:border-dark-500 hover:text-gray-200'
              }`}
            >
              {tab.label}
              {tabCounts[tab.key] > 0 && (
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${
                    activeTab === tab.key
                      ? 'bg-dark-900/30 text-dark-900'
                      : 'bg-dark-600 text-gray-400'
                  }`}
                >
                  {tabCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <LoadingSpinner size="lg" label="Loading your bookings..." />
          </div>
        ) : paginatedBookings.length === 0 ? (
          /* ── Empty State ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-dark-700 border border-dark-500 flex items-center justify-center mb-5">
              <Calendar className="w-9 h-9 text-gray-700" />
            </div>
            <h2 className="text-xl font-display font-semibold text-white mb-2">
              {activeTab === 'all' ? 'No bookings yet' : `No ${activeTab} bookings`}
            </h2>
            <p className="text-gray-500 text-sm mb-7 max-w-xs">
              {activeTab === 'all'
                ? "You haven't made any bookings. Book a service or package to get started."
                : `You don't have any ${activeTab} bookings at the moment.`}
            </p>
            {activeTab === 'all' && (
              <Link href="/booking" className="btn-gold text-sm py-2.5 px-6">
                <Sparkles className="w-4 h-4" />
                Book Now
              </Link>
            )}
          </motion.div>
        ) : (
          /* ── Booking Cards Grid ── */
          <div>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedBookings.map((booking) => (
                  <BookingCard
                    key={booking._id || booking.id || booking.bookingId}
                    booking={booking}
                    onCancelClick={(b) => setCancelTarget(b)}
                  />
                ))}
              </div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showSummary
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            )}
          </div>
        )}
      </main>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => !cancelling && setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Booking"
        message={`Are you sure you want to cancel this booking${
          (cancelTarget?.booking_date || cancelTarget?.bookingDate)
            ? ` scheduled for ${formatShortDate(cancelTarget.booking_date || cancelTarget.bookingDate)}`
            : ''
        }? This action cannot be undone.`}
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Booking"
        variant="danger"
        loading={cancelling}
      />

      <Footer />
    </div>
  );
}

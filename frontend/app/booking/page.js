'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle2,
  ShoppingBag,
  Package,
  Plus,
  X,
  Sparkles,
  FileText,
  ArrowRight,
  CreditCard,
  Wallet,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import * as api from '../../lib/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Services' },
  { id: 2, label: 'Date & Time' },
  { id: 3, label: 'Confirm' },
];

function getTodayPlus1() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                step.id < currentStep
                  ? 'bg-gold-500 border-gold-500 text-dark-900'
                  : step.id === currentStep
                  ? 'border-gold-500 text-gold-500 bg-transparent'
                  : 'border-dark-500 text-gray-600 bg-transparent'
              }`}
            >
              {step.id < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.id}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                step.id === currentStep ? 'text-gold-400' : step.id < currentStep ? 'text-gold-600' : 'text-gray-600'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-16 sm:w-24 h-px mx-2 transition-all duration-300 ${
                step.id < currentStep ? 'bg-gold-500' : 'bg-dark-600'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Services / Package Selection ─────────────────────────────────────

function Step1({ mode, setMode, cartItems, selectedPackage, setSelectedPackage, onNext }) {
  const [packages, setPackages] = useState([]);
  const [loadingPkgs, setLoadingPkgs] = useState(false);

  useEffect(() => {
    if (mode === 'package' && packages.length === 0) {
      setLoadingPkgs(true);
      api
        .getPackages()
        .then(({ data }) => {
          const list = data.packages || data.data || data || [];
          setPackages(Array.isArray(list) ? list : []);
        })
        .catch(() => toast.error('Failed to load packages'))
        .finally(() => setLoadingPkgs(false));
    }
  }, [mode, packages.length]);

  const canProceed =
    mode === 'services' ? cartItems.length > 0 : !!selectedPackage;

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="text-2xl font-display font-semibold text-white mb-6">
        What would you like to book?
      </h2>

      {/* Toggle */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setMode('services')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200 ${
            mode === 'services'
              ? 'bg-gold-500 border-gold-500 text-dark-900'
              : 'border-dark-500 text-gray-400 hover:border-gold-500/50 hover:text-gray-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Book Services
        </button>
        <button
          onClick={() => setMode('package')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200 ${
            mode === 'package'
              ? 'bg-gold-500 border-gold-500 text-dark-900'
              : 'border-dark-500 text-gray-400 hover:border-gold-500/50 hover:text-gray-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Book Package
        </button>
      </div>

      {/* Services View */}
      {mode === 'services' && (
        <div>
          {cartItems.length === 0 ? (
            <div className="card-dark p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">Your cart is empty. Add services to book.</p>
              <Link href="/services" className="btn-gold text-sm py-2.5 px-5">
                <Plus className="w-4 h-4" />
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => {
                const service = item.service || item;
                const serviceId = item.service_id || service._id || service.id;
                const price = parseFloat(
                  item.discounted_price || item.original_price || service.discounted_price || service.original_price || 0
                );
                return (
                  <div key={serviceId} className="card-dark p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-gold-500/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{item.service_name || service.name}</p>
                      {item.duration && (
                        <p className="text-gray-500 text-xs">{item.duration} min</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-gold-400 font-semibold text-sm">
                        ₹{(price * (item.quantity || 1)).toLocaleString('en-IN')}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-gray-600 text-xs">x{item.quantity}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/cart"
                  className="text-gold-500 hover:text-gold-400 text-sm inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Edit cart / Add more services
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Package View */}
      {mode === 'package' && (
        <div>
          {loadingPkgs ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="md" label="Loading packages..." />
            </div>
          ) : packages.length === 0 ? (
            <div className="card-dark p-8 text-center">
              <Package className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400">No packages available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packages.map((pkg) => {
                const id = pkg._id || pkg.id;
                const isSelected = selectedPackage?._id === id || selectedPackage?.id === id;
                const price = parseFloat(pkg.discounted_price || pkg.original_price || 0);
                const hasDiscount =
                  pkg.discounted_price &&
                  pkg.original_price &&
                  parseFloat(pkg.discounted_price) < parseFloat(pkg.original_price);

                return (
                  <button
                    key={id}
                    onClick={() => setSelectedPackage(isSelected ? null : pkg)}
                    className={`card-dark p-5 text-left transition-all duration-200 border-2 ${
                      isSelected
                        ? 'border-gold-500 bg-gold-500/5'
                        : 'border-transparent hover:border-dark-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-white font-semibold">{pkg.name}</h3>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0" />
                      )}
                    </div>
                    {pkg.description && (
                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{pkg.description}</p>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-gold-400 font-bold text-lg">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <span className="text-gray-600 text-xs line-through">
                          ₹{parseFloat(pkg.original_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {canProceed && (
        <div className="mt-6 bg-dark-700/60 border border-dark-500 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-400">
            {mode === 'services' ? (
              <>
                <span className="text-white font-medium">{cartItems.length}</span>{' '}
                {cartItems.length === 1 ? 'service' : 'services'} selected
              </>
            ) : (
              <>
                Package: <span className="text-white font-medium">{selectedPackage?.name}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Next */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Select Date & Time
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Step 2: Date & Time ───────────────────────────────────────────────────────

function Step2({ selectedDate, setSelectedDate, selectedTime, setSelectedTime, onNext, onBack }) {
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const minDate = getTodayPlus1();

  const fetchSlots = useCallback(async (date) => {
    if (!date) return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const { data } = await api.getAvailableSlots(date);
      const slotList = data.slots || data.data || data || [];
      setSlots(Array.isArray(slotList) ? slotList : []);
    } catch {
      toast.error('Could not load time slots for the selected date');
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTime('');
    if (date) fetchSlots(date);
  };

  const canProceed = !!selectedDate && !!selectedTime;

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="text-2xl font-display font-semibold text-white mb-6">
        Choose Date &amp; Time
      </h2>

      {/* Date Picker */}
      <div className="mb-8">
        <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
          Select Date
        </label>
        <div className="relative max-w-xs">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="date"
            value={selectedDate}
            min={minDate}
            onChange={handleDateChange}
            className="input-dark pl-10 max-w-xs cursor-pointer"
            style={{ colorScheme: 'dark' }}
          />
        </div>
        {selectedDate && (
          <p className="text-gold-500/70 text-xs mt-1.5">{formatDisplayDate(selectedDate)}</p>
        )}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
            Available Time Slots
          </label>

          {loadingSlots ? (
            <div className="flex items-center gap-3 py-6">
              <LoadingSpinner size="sm" />
              <span className="text-gray-500 text-sm">Loading available slots...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="card-dark p-6 text-center">
              <Clock className="w-10 h-10 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No available slots for this date.</p>
              <p className="text-gray-600 text-xs mt-1">Please select a different date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {slots.map((slot) => {
                const slotTime = slot.slot_time || slot.time || (typeof slot === 'string' ? slot : '');
                const isBooked = !slot.is_available || slot.available === 0;
                const isSelected = selectedTime === slotTime;

                return (
                  <button
                    key={slotTime}
                    onClick={() => !isBooked && setSelectedTime(slotTime)}
                    disabled={isBooked}
                    className={`py-2.5 px-2 rounded-lg text-sm font-medium border text-center transition-all duration-150 ${
                      isBooked
                        ? 'border-dark-600 text-dark-500 bg-dark-800/40 cursor-not-allowed line-through'
                        : isSelected
                        ? 'border-gold-500 bg-gold-500 text-dark-900 font-bold shadow-lg shadow-gold-500/20'
                        : 'border-dark-500 text-gray-300 hover:border-gold-500/50 hover:text-white bg-dark-800'
                    }`}
                  >
                    {slotTime}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-dark-700/60 border border-gold-500/30 rounded-lg px-4 py-3 flex items-center gap-3"
        >
          <Calendar className="w-4 h-4 text-gold-500 flex-shrink-0" />
          <span className="text-gray-300 text-sm">
            <span className="text-white font-medium">{formatDisplayDate(selectedDate)}</span>
            {' at '}
            <span className="text-gold-400 font-semibold">{selectedTime}</span>
          </span>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="btn-outline-gold text-sm py-2.5 px-5">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Review &amp; Confirm
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Step 3: Confirm & Pay ─────────────────────────────────────────────────────

function Step3({
  mode,
  cartItems,
  selectedPackage,
  selectedDate,
  selectedTime,
  appliedOffer,
  onBack,
  onConfirm,
  submitting,
}) {
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pay_after_service');

  const subtotal =
    mode === 'services'
      ? cartItems.reduce((sum, item) => {
          const price = parseFloat(item.discounted_price || item.original_price || 0);
          return sum + price * (item.quantity || 1);
        }, 0)
      : parseFloat(selectedPackage?.discounted_price || selectedPackage?.original_price || 0);

  const discountAmount = appliedOffer
    ? appliedOffer.discountAmount || appliedOffer.discount || 0
    : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="text-2xl font-display font-semibold text-white mb-6">
        Review &amp; Confirm
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-3 space-y-5">
          {/* Services / Package */}
          <div className="card-dark p-5">
            <h3 className="text-gold-500 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              {mode === 'services' ? (
                <><ShoppingBag className="w-3.5 h-3.5" /> Services</>
              ) : (
                <><Package className="w-3.5 h-3.5" /> Package</>
              )}
            </h3>
            {mode === 'services' ? (
              <div className="space-y-2">
                {cartItems.map((item) => {
                  const service = item.service || item;
                  const id = item.service_id || service._id || service.id;
                  const price = parseFloat(item.discounted_price || item.original_price || 0);
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-gray-300 truncate pr-2">{item.service_name || service.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
                      <span className="text-white font-medium flex-shrink-0">
                        ₹{(price * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{selectedPackage?.name}</span>
                <span className="text-white font-medium">
                  ₹{parseFloat(selectedPackage?.discounted_price || selectedPackage?.original_price || 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="card-dark p-5">
            <h3 className="text-gold-500 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Appointment
            </h3>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-white font-medium text-sm">{formatDisplayDate(selectedDate)}</p>
                <p className="text-gold-400 text-sm font-semibold mt-0.5">{selectedTime}</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card-dark p-5">
            <h3 className="text-gold-500 text-xs font-semibold uppercase tracking-wider mb-3">
              Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('pay_after_service')}
                className={`text-left rounded-lg border p-4 transition-all ${
                  paymentMethod === 'pay_after_service'
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-dark-500 hover:border-gold-500/50 bg-dark-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-gold-500" />
                  <span className="text-white text-sm font-semibold">Pay After Service</span>
                </div>
                <p className="text-gray-500 text-xs">
                  Confirm now and pay at the salon after your service.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`text-left rounded-lg border p-4 transition-all ${
                  paymentMethod === 'online'
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-dark-500 hover:border-gold-500/50 bg-dark-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-gold-500" />
                  <span className="text-white text-sm font-semibold">Pay Online</span>
                </div>
                <p className="text-gray-500 text-xs">
                  Mark this booking as paid online and keep a payment reference.
                </p>
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="card-dark p-5">
            <label className="text-gold-500 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Add a Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special requests or notes for our team..."
              rows={3}
              className="input-dark resize-none text-sm mt-2"
              maxLength={500}
            />
          </div>
        </div>

        {/* Right: Price Summary */}
        <div className="lg:col-span-2">
          <div className="card-dark p-5 sticky top-28">
            <h3 className="text-lg font-display font-semibold text-white border-b border-dark-600 pb-3 mb-4">
              Price Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {appliedOffer && discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-400">
                    Discount ({appliedOffer.code || 'Offer'})
                  </span>
                  <span className="text-green-400 font-medium">
                    - ₹{parseFloat(discountAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-dark-600 pt-3 mt-1">
                <span className="text-white font-semibold">Total Payable</span>
                <span className="text-gold-400 font-bold text-xl">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => onConfirm(note, paymentMethod)}
              disabled={submitting}
              className="btn-gold w-full justify-center mt-6 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === 'online' ? 'Pay Online & Book' : 'Confirm Booking'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8">
        <button onClick={onBack} className="btn-outline-gold text-sm py-2.5 px-5">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </motion.div>
  );
}

// ── Booking Confirmation ──────────────────────────────────────────────────────

function BookingConfirmation({ bookingId, onViewBookings }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-16"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-green-900/40 border-2 border-green-500 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-green-400" />
      </motion.div>

      <h2 className="text-3xl font-display font-bold text-white mb-3">Booking Confirmed!</h2>
      <p className="text-gray-400 text-sm mb-3">
        Your appointment has been successfully booked.
      </p>
      {bookingId && (
        <div className="inline-flex items-center gap-2 bg-dark-700 border border-dark-500 rounded-lg px-4 py-2 mb-8">
          <span className="text-gray-500 text-xs">Booking ID:</span>
          <span className="text-gold-400 font-mono font-semibold text-sm">{bookingId}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={onViewBookings} className="btn-gold">
          View My Bookings
          <ArrowRight className="w-4 h-4" />
        </button>
        <Link href="/" className="btn-outline-gold">
          Back to Home
        </Link>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { items: cartItems, appliedOffer, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [mode, setMode] = useState('services'); // 'services' | 'package'
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/booking');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleConfirm = async (note, paymentMethod) => {
    setSubmitting(true);
    try {
      let payload = {
        booking_date: selectedDate,
        booking_time: selectedTime,
        notes: note || '',
        payment_method: paymentMethod,
      };

      if (mode === 'services') {
        payload.items = cartItems.map((item) => ({
          service_id: item.service_id || item.service?.id || item.id,
          quantity: item.quantity || 1,
        }));
      } else {
        // Expand package services into booking items
        const pkgServices = selectedPackage.services || [];
        payload.items = pkgServices.length > 0
          ? pkgServices.map((s) => ({ service_id: s.id, quantity: 1 }))
          : [{ service_id: selectedPackage.id, quantity: 1 }];
      }

      if (appliedOffer) {
        payload.offer_id = appliedOffer.offer_id || appliedOffer.id;
      }

      const { data } = await api.createBooking(payload);
      const booking = data.booking || data.data || data;
      const bookingId =
        booking.bookingId || booking._id || booking.id || 'BW-' + Date.now();

      setConfirmedBookingId(bookingId);
      toast.success(
        paymentMethod === 'online'
          ? 'Online payment recorded and booking confirmed!'
          : 'Booking confirmed. You can pay after service.'
      );

      // Clear cart if service booking
      if (mode === 'services') {
        try {
          await clearCart();
        } catch {
          // Non-critical
        }
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.response?.data?.error || 'Failed to create booking. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
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

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Page Header */}
        {!confirmedBookingId && (
          <div className="mb-10">
            <p className="section-subtitle flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Book Appointment
            </p>
            <h1 className="section-title">Schedule Your Visit</h1>
          </div>
        )}

        {confirmedBookingId ? (
          <BookingConfirmation
            bookingId={confirmedBookingId}
            onViewBookings={() => router.push('/bookings')}
          />
        ) : (
          <div className="card-dark p-6 sm:p-8">
            <StepIndicator currentStep={currentStep} />

            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <Step1
                  key="step1"
                  mode={mode}
                  setMode={setMode}
                  cartItems={cartItems}
                  selectedPackage={selectedPackage}
                  setSelectedPackage={setSelectedPackage}
                  onNext={() => setCurrentStep(2)}
                />
              )}
              {currentStep === 2 && (
                <Step2
                  key="step2"
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <Step3
                  key="step3"
                  mode={mode}
                  cartItems={cartItems}
                  selectedPackage={selectedPackage}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  appliedOffer={appliedOffer}
                  onBack={() => setCurrentStep(2)}
                  onConfirm={handleConfirm}
                  submitting={submitting}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

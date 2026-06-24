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
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : step.id === currentStep
                  ? 'border-rose-500 text-rose-500 bg-transparent'
                  : 'border-rose-200 text-rose-400 bg-transparent'
              }`}
            >
              {step.id < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.id}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                step.id === currentStep ? 'text-rose-500' : step.id < currentStep ? 'text-rose-600' : 'text-rose-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-16 sm:w-24 h-px mx-2 transition-all duration-300 ${
                step.id < currentStep ? 'bg-rose-500' : 'bg-rose-200'
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
      <h2 className="text-2xl font-serif font-semibold text-rose-950 mb-6">
        What would you like to book?
      </h2>

      {/* Toggle */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setMode('services')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200 ${
            mode === 'services'
              ? 'bg-rose-500 border-rose-500 text-white'
              : 'border-rose-200 text-rose-600 hover:border-rose-400'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Book Services
        </button>
        <button
          onClick={() => setMode('package')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200 ${
            mode === 'package'
              ? 'bg-rose-500 border-rose-500 text-white'
              : 'border-rose-200 text-rose-600 hover:border-rose-400'
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
            <div className="glass-panel p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-rose-300 mx-auto mb-3" />
              <p className="text-rose-700 mb-4">Your cart is empty. Add services to book.</p>
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
                  <div key={serviceId} className="glass-panel p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-rose-500/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-rose-950 font-medium text-sm truncate">{item.service_name || service.name}</p>
                      {item.duration && (
                        <p className="text-rose-600 text-xs">{item.duration} min</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-rose-500 font-semibold text-sm">
                        ₹{(price * (item.quantity || 1)).toLocaleString('en-IN')}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-rose-400 text-xs">x{item.quantity}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/cart"
                  className="text-rose-500 hover:text-rose-600 text-sm inline-flex items-center gap-1.5 transition-colors"
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
            <div className="glass-panel p-8 text-center">
              <Package className="w-12 h-12 text-rose-300 mx-auto mb-3" />
              <p className="text-rose-700">No packages available at the moment.</p>
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
                    className={`glass-panel p-5 text-left transition-all duration-200 border-2 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-transparent hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-rose-950 font-semibold">{pkg.name}</h3>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      )}
                    </div>
                    {pkg.description && (
                      <p className="text-rose-600 text-xs mb-3 line-clamp-2">{pkg.description}</p>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-rose-500 font-bold text-lg">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <span className="text-rose-400 text-xs line-through">
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
        <div className="mt-6 glass-panel border-rose-200/50 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
          <div className="text-sm text-rose-700">
            {mode === 'services' ? (
              <>
                <span className="text-rose-950 font-medium">{cartItems.length}</span>{' '}
                {cartItems.length === 1 ? 'service' : 'services'} selected
              </>
            ) : (
              <>
                Package: <span className="text-rose-950 font-medium">{selectedPackage?.name}</span>
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
      <h2 className="text-2xl font-serif font-semibold text-rose-950 mb-6">
        Choose Date &amp; Time
      </h2>

      {/* Date Picker */}
      <div className="mb-8">
        <label className="block text-rose-700 text-xs font-medium uppercase tracking-wider mb-2">
          Select Date
        </label>
        <div className="relative max-w-xs">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
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
          <p className="text-rose-500 text-xs mt-1.5">{formatDisplayDate(selectedDate)}</p>
        )}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <label className="block text-rose-700 text-xs font-medium uppercase tracking-wider mb-3">
            Available Time Slots
          </label>

          {loadingSlots ? (
            <div className="flex items-center gap-3 py-6">
              <LoadingSpinner size="sm" />
              <span className="text-rose-600 text-sm">Loading available slots...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="glass-panel p-6 text-center">
              <Clock className="w-10 h-10 text-rose-300 mx-auto mb-2" />
              <p className="text-rose-700 text-sm">No available slots for this date.</p>
              <p className="text-rose-400 text-xs mt-1">Please select a different date.</p>
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
                        ? 'border-rose-100 text-rose-200 bg-white/20 cursor-not-allowed line-through'
                        : isSelected
                        ? 'border-rose-500 bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20'
                        : 'border-rose-200 text-rose-800 hover:border-rose-400 bg-white/60'
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
          className="mt-6 glass-panel border-rose-300/40 rounded-lg px-4 py-3 flex items-center gap-3"
        >
          <Calendar className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span className="text-rose-700 text-sm">
            <span className="text-rose-950 font-medium">{formatDisplayDate(selectedDate)}</span>
            {' at '}
            <span className="text-rose-500 font-semibold">{selectedTime}</span>
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
      <h2 className="text-2xl font-serif font-semibold text-rose-950 mb-6">
        Review &amp; Confirm
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-3 space-y-5">
          {/* Services / Package */}
          <div className="glass-panel p-5">
            <h3 className="text-rose-600 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
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
                      <span className="text-rose-700 truncate pr-2">{item.service_name || service.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
                      <span className="text-rose-950 font-medium flex-shrink-0">
                        ₹{(price * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-rose-700">{selectedPackage?.name}</span>
                <span className="text-rose-950 font-medium">
                  ₹{parseFloat(selectedPackage?.discounted_price || selectedPackage?.original_price || 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="glass-panel p-5">
            <h3 className="text-rose-600 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Appointment
            </h3>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-rose-950 font-medium text-sm">{formatDisplayDate(selectedDate)}</p>
                <p className="text-rose-500 text-sm font-semibold mt-0.5">{selectedTime}</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-panel p-5">
            <h3 className="text-rose-600 text-xs font-semibold uppercase tracking-wider mb-3">
              Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('pay_after_service')}
                className={`text-left rounded-lg border p-4 transition-all ${
                  paymentMethod === 'pay_after_service'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-rose-200 hover:border-rose-400 bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-950 text-sm font-semibold">Pay After Service</span>
                </div>
                <p className="text-rose-600 text-xs">
                  Confirm now and pay at the salon after your service.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`text-left rounded-lg border p-4 transition-all ${
                  paymentMethod === 'online'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-rose-200 hover:border-rose-400 bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-950 text-sm font-semibold">Pay Online</span>
                </div>
                <p className="text-rose-600 text-xs">
                  Mark this booking as paid online and keep a payment reference.
                </p>
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="glass-panel p-5">
            <label className="text-rose-600 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
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
          <div className="glass-panel p-5 sticky top-28">
            <h3 className="text-lg font-serif font-semibold text-rose-950 border-b border-rose-200 pb-3 mb-4">
              Price Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-rose-700">Subtotal</span>
                <span className="text-rose-950">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {appliedOffer && discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">
                    Discount ({appliedOffer.code || 'Offer'})
                  </span>
                  <span className="text-green-600 font-medium">
                    - ₹{parseFloat(discountAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-rose-200 pt-3 mt-1">
                <span className="text-rose-950 font-semibold">Total Payable</span>
                <span className="text-rose-500 font-bold text-xl">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => onConfirm(note, paymentMethod, finalTotal)}
              disabled={submitting}
              className="btn-gold w-full justify-center mt-6 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-500 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </motion.div>

      <h2 className="text-3xl font-serif font-bold text-rose-950 mb-3">Booking Confirmed!</h2>
      <p className="text-rose-700 text-sm mb-3">
        Your appointment has been successfully booked.
      </p>
      {bookingId && (
        <div className="inline-flex items-center gap-2 glass-panel border-rose-200 rounded-lg px-4 py-2 mb-8">
          <span className="text-rose-600 text-xs">Booking ID:</span>
          <span className="text-rose-500 font-mono font-semibold text-sm">{bookingId}</span>
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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
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
      router.replace('/login?redirect=/booking');
    }
  }, [authLoading, isAuthenticated, router]);

  // Build the common booking payload (items, dates, offer)
  const buildPayload = (note, paymentMethod) => {
    const payload = {
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
      const pkgServices = selectedPackage.services || [];
      payload.items = pkgServices.length > 0
        ? pkgServices.map((s) => ({ service_id: s.id, quantity: 1 }))
        : [{ service_id: selectedPackage.id, quantity: 1 }];
    }
    if (appliedOffer) payload.offer_id = appliedOffer.offer_id || appliedOffer.id;
    return payload;
  };

  // Finish booking after payment (or directly for pay-after-service)
  const finishBooking = async (payload) => {
    const { data } = await api.createBooking(payload);
    const booking = data.booking || data.data || data;
    const bookingId = booking.bookingId || booking._id || booking.id || 'BW-' + Date.now();
    setConfirmedBookingId(bookingId);
    if (mode === 'services') {
      try { await clearCart(); } catch { /* non-critical */ }
    }
  };

  // Load Razorpay checkout.js once
  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handleConfirm = async (note, paymentMethod, finalAmount) => {
    // If online payment but amount is 0 (full discount), skip gateway
    if (paymentMethod === 'online' && finalAmount > 0) {
      setSubmitting(true);
      try {
        const loaded = await loadRazorpay();
        if (!loaded) {
          toast.error('Payment gateway failed to load. Check your connection and try again.');
          setSubmitting(false);
          return;
        }

        const { data: orderData } = await api.createPaymentOrder({ amount: finalAmount });

        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Beauty World',
          description: 'Salon Appointment',
          image: '/logo.png',
          order_id: orderData.order_id,
          handler: async (response) => {
            try {
              const payload = {
                ...buildPayload(note, 'online'),
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              };
              await finishBooking(payload);
              toast.success('Payment successful! Booking confirmed.');
            } catch (err) {
              const msg = err?.response?.data?.message || 'Booking failed after payment.';
              toast.error(`${msg} Save your Payment ID: ${response.razorpay_payment_id} and contact support.`);
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.mobile || '',
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'Pay via UPI',
                  instruments: [{ method: 'upi' }],
                },
                other: {
                  name: 'Other Payment Methods',
                  instruments: [
                    { method: 'card' },
                    { method: 'netbanking' },
                    { method: 'wallet' },
                    { method: 'paylater' },
                  ],
                },
              },
              sequence: ['block.upi', 'block.other'],
              preferences: { show_default_blocks: false },
            },
          },
          theme: { color: '#D4AF37' },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              toast('Payment cancelled.', { icon: 'ℹ️' });
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', () => {
          setSubmitting(false);
          toast.error('Payment failed. Please try again.');
        });
        rzp.open();
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to initiate payment. Please try again.';
        toast.error(msg);
        setSubmitting(false);
      }
      return; // Razorpay callbacks handle state
    }

    // Pay after service (or free booking)
    setSubmitting(true);
    try {
      const method = paymentMethod === 'online' ? 'pay_after_service' : paymentMethod;
      await finishBooking(buildPayload(note, method));
      toast.success('Booking confirmed. You can pay after service.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to create booking. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen mesh-bg">
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
          <div className="glass-panel p-6 sm:p-8">
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

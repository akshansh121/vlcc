'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  X,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getActiveOffers } from '../../lib/api';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    items,
    total,
    loading: cartLoading,
    appliedOffer,
    updateQuantity,
    removeFromCart,
    applyOffer,
    removeOffer,
    fetchCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [applyingOffer, setApplyingOffer] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [offers, setOffers] = useState([]);

  // Load available coupon codes to surface them to the user
  useEffect(() => {
    if (!isAuthenticated) return;
    getActiveOffers()
      .then(({ data }) => setOffers(data.data || data.offers || data || []))
      .catch(() => setOffers([]));
  }, [isAuthenticated]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/cart');
    }
  }, [authLoading, isAuthenticated, router]);

  // Refresh cart on mount
  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQuantityChange = async (serviceId, newQty) => {
    if (updatingItem) return;
    setUpdatingItem(serviceId);
    try {
      await updateQuantity(serviceId, newQty);
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemove = async (serviceId) => {
    if (removingItem) return;
    setRemovingItem(serviceId);
    try {
      await removeFromCart(serviceId);
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleApplyOffer = async (codeArg) => {
    const code = (typeof codeArg === 'string' ? codeArg : couponCode).trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }
    setApplyingOffer(true);
    try {
      const result = await applyOffer(code);
      toast.success(`Offer applied! You saved ₹${result.discount || result.discountAmount || 0}`);
      setCouponCode('');
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.response?.data?.error || 'Invalid or expired coupon code';
      toast.error(msg);
    } finally {
      setApplyingOffer(false);
    }
  };

  // Discount label, e.g. "20% OFF up to ₹500" or "₹150 OFF"
  const formatDiscount = (o) =>
    o.discount_type === 'percentage'
      ? `${o.discount_value}% OFF${o.max_discount ? ` up to ₹${parseFloat(o.max_discount).toLocaleString('en-IN')}` : ''}`
      : `₹${parseFloat(o.discount_value).toLocaleString('en-IN')} OFF`;

  const handleRemoveOffer = () => {
    removeOffer();
    toast.success('Offer removed');
  };

  // Derived totals
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.discounted_price || item.original_price || 0);
    return sum + price * (item.quantity || 1);
  }, 0);

  const discountAmount = appliedOffer
    ? appliedOffer.discountAmount || appliedOffer.discount || 0
    : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

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

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <p className="section-subtitle flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Your Cart
          </p>
          <h1 className="section-title">Shopping Cart</h1>
          {items.length > 0 && (
            <p className="text-gray-400 text-sm">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </div>

        {cartLoading && items.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <LoadingSpinner size="lg" label="Loading your cart..." />
          </div>
        ) : items.length === 0 ? (
          /* ── Empty Cart State ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-dark-700 border border-dark-500 flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-white mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm">
              You haven&apos;t added any services yet. Explore our luxurious treatments and book your
              perfect experience.
            </p>
            <Link href="/services" className="btn-gold">
              <Sparkles className="w-4 h-4" />
              Browse Services
            </Link>
          </motion.div>
        ) : (
          /* ── Cart Content ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items — left 2/3 */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  const service = item.service || item;
                  const serviceId = item.serviceId || item.service_id || service._id || service.id;
                  const price = parseFloat(
                    service.discounted_price || service.original_price || item.price || 0
                  );
                  const originalPrice = service.original_price
                    ? parseFloat(service.original_price)
                    : null;
                  const hasDiscount = originalPrice && price < originalPrice;
                  const qty = item.quantity || 1;
                  const isRemoving = removingItem === serviceId;
                  const isUpdating = updatingItem === serviceId;

                  return (
                    <motion.div
                      key={serviceId}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: isRemoving ? 0.4 : 1, y: 0 }}
                      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      whileHover={{ y: -4 }}
                      className="card-dark p-4 sm:p-5 flex gap-3 sm:gap-4 items-start rounded-2xl border border-dark-600 hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all duration-300"
                    >
                      {/* Service Image */}
                      <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-dark-700">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.service_name || service.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-gold-500/50" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-white font-semibold text-sm sm:text-base leading-tight truncate">
                              {item.service_name || service.name}
                            </h3>
                            {item.duration && (
                              <p className="text-gray-500 text-xs mt-1">{item.duration} min</p>
                            )}
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemove(serviceId)}
                            disabled={!serviceId || isRemoving || isUpdating}
                            className="p-1.5 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-40"
                            aria-label="Remove item"
                          >
                            {isRemoving ? (
                              <span className="inline-block w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Price + Quantity Row */}
                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                          {/* Price */}
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-gold-400 font-bold text-lg">
                              ₹{(price * qty).toLocaleString('en-IN')}
                            </span>
                            {hasDiscount && (
                              <span className="text-gray-600 text-xs line-through">
                                ₹{(originalPrice * qty).toLocaleString('en-IN')}
                              </span>
                            )}
                            {qty > 1 && (
                              <span className="text-gray-500 text-xs">
                                (₹{price.toLocaleString('en-IN')} ea.)
                              </span>
                            )}
                          </div>

                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-1 bg-dark-700 border border-dark-500 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(serviceId, qty - 1)}
                              disabled={!serviceId || isUpdating || isRemoving}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-white text-sm font-semibold">
                              {isUpdating ? (
                                <span className="inline-block w-3 h-3 border border-gold-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                qty
                              )}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(serviceId, qty + 1)}
                              disabled={!serviceId || isUpdating || isRemoving}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Continue Shopping */}
              <div className="pt-2">
                <Link
                  href="/services"
                  className="text-gold-500 hover:text-gold-400 text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary — right 1/3 */}
            <div className="lg:col-span-1">
              <div className="card-dark p-6 sticky top-28 space-y-6 rounded-2xl border border-dark-600 shadow-lg shadow-gold-500/10">
                <h2 className="text-lg font-display font-semibold text-white border-b border-dark-600 pb-4">
                  Order Summary
                </h2>

                {/* Coupon / Offer Input */}
                {!appliedOffer ? (
                  <div className="space-y-2">
                    <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                      Coupon / Offer Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyOffer()}
                        placeholder="Enter code"
                        className="input-dark flex-1 text-sm py-2"
                        disabled={applyingOffer}
                      />
                      <button
                        onClick={() => handleApplyOffer()}
                        disabled={applyingOffer || !couponCode.trim()}
                        className="px-4 py-2 bg-dark-600 border border-dark-500 text-gold-500 hover:border-gold-500 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {applyingOffer ? (
                          <span className="inline-block w-3.5 h-3.5 border border-gold-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Tag className="w-3.5 h-3.5" />
                        )}
                        Apply
                      </button>
                    </div>

                    {/* Available coupon codes */}
                    {offers.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <p className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">
                          Available Offers
                        </p>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
                          {offers.map((o) => {
                            const min = parseFloat(o.min_amount || 0);
                            const usageOk =
                              !o.usage_limit || (o.used_count || 0) < o.usage_limit;
                            const eligible = subtotal >= min && usageOk;
                            const needed = Math.max(0, min - subtotal);

                            return (
                              <button
                                key={o.id}
                                onClick={() => eligible && handleApplyOffer(o.coupon_code)}
                                disabled={!eligible || applyingOffer}
                                className={`w-full text-left rounded-lg border p-3 transition-all duration-200 ${
                                  eligible
                                    ? 'border-dashed border-gold-500/50 bg-gold-500/5 hover:bg-gold-500/10 hover:border-gold-500 cursor-pointer'
                                    : 'border-dark-600 bg-dark-700/40 opacity-70 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-bold text-sm text-gold-400 tracking-wide">
                                    {o.coupon_code}
                                  </span>
                                  <span
                                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                                      eligible
                                        ? 'bg-green-500/15 text-green-400'
                                        : 'bg-dark-600 text-gray-500'
                                    }`}
                                  >
                                    {eligible ? 'Tap to apply' : 'Locked'}
                                  </span>
                                </div>
                                <p className="text-white text-xs font-medium mt-1">
                                  {formatDiscount(o)}
                                </p>
                                {o.title && (
                                  <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-1">
                                    {o.title}
                                  </p>
                                )}
                                {!eligible && needed > 0 && (
                                  <p className="text-amber-400/90 text-[11px] mt-1">
                                    Add ₹{needed.toLocaleString('en-IN')} more to unlock
                                  </p>
                                )}
                                {!eligible && needed <= 0 && (
                                  <p className="text-gray-500 text-[11px] mt-1">
                                    Usage limit reached
                                  </p>
                                )}
                                {eligible && min > 0 && (
                                  <p className="text-gray-500 text-[11px] mt-1">
                                    Min order ₹{min.toLocaleString('en-IN')}
                                  </p>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Applied Offer Badge */
                  <div className="flex items-center justify-between bg-green-900/30 border border-green-700/50 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-green-400 text-xs font-bold uppercase tracking-wider">
                          {appliedOffer.code || appliedOffer.couponCode || 'Offer'}
                        </p>
                        <p className="text-green-300 text-xs">
                          -{' '}
                          {appliedOffer.discountType === 'percentage'
                            ? `${appliedOffer.discountValue || appliedOffer.discount}%`
                            : `₹${(appliedOffer.discountAmount || appliedOffer.discount || 0).toLocaleString('en-IN')}`}{' '}
                          off
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveOffer}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                      aria-label="Remove offer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-3 border-t border-dark-600 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {appliedOffer && discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Offer Discount</span>
                      <span className="text-green-400 font-medium">
                        - ₹{parseFloat(discountAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-dark-600 pt-3 mt-1">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-gold-400 font-bold text-xl">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => router.push('/booking')}
                  className="btn-gold w-full justify-center text-base py-3.5"
                >
                  Proceed to Booking
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-gray-600 text-xs">
                  Secure booking · No hidden charges
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

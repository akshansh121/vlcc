'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const normalizeCartItem = (item) => ({
  ...item,
  _id: item._id || item.id,
  serviceId: item.serviceId || item.service_id || item.service?.id || item.service?._id,
  service: item.service || {
    id: item.service_id,
    name: item.service_name,
    description: item.description,
    original_price: item.original_price,
    discounted_price: item.discounted_price,
    duration: item.duration,
    image_url: item.image_url,
  },
});

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState([]);          // [{ service, quantity }]
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState(null);

  // ── Fetch cart from server ─────────────────────────────────────────────────

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.getCart();
      const cartData = data.cart || data.data || data;
      const nextItems = Array.isArray(cartData.items) ? cartData.items.map(normalizeCartItem) : [];
      setItems(nextItems);
      setTotal(cartData.cart_total || 0);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Bootstrap: load cart whenever auth state changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ── Cart mutations ─────────────────────────────────────────────────────────

  const addToCart = async (service) => {
    setLoading(true);
    try {
      await api.addToCart(service._id || service.id, 1);
      await fetchCart();
    } catch (err) {
      console.error('Failed to add to cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (serviceId) => {
    setLoading(true);
    try {
      await api.removeFromCart(serviceId);
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (serviceId, qty) => {
    setLoading(true);
    try {
      if (qty <= 0) {
        await api.removeFromCart(serviceId);
      } else {
        await api.updateCartItem(serviceId, qty);
      }
      await fetchCart();
    } catch (err) {
      console.error('Failed to update cart item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await api.clearCart();
      setItems([]);
      setTotal(0);
      setAppliedOffer(null);
    } catch (err) {
      console.error('Failed to clear cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const applyOffer = async (couponCode) => {
    try {
      const { data } = await api.applyOffer(couponCode, total);
      const offerData = data.offer || data.data || data;
      setAppliedOffer(offerData);
      // Refresh cart to get updated total from server
      await fetchCart();
      return offerData;
    } catch (err) {
      console.error('Failed to apply offer:', err);
      throw err;
    }
  };

  const removeOffer = () => {
    setAppliedOffer(null);
  };

  // ── Derived values ─────────────────────────────────────────────────────────

  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const value = {
    items,
    total,
    loading,
    appliedOffer,
    cartCount,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyOffer,
    removeOffer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;

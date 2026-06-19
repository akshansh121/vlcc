import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sunderdikho.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Bearer token from localStorage if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 by clearing token and redirecting to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const adminLogin = (data) => api.post('/auth/admin/login', data);
export const googleLogin = (data) => api.post('/auth/google', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/me', data);
export const changePassword = (data) => api.post('/auth/change-password', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// ─── Services ────────────────────────────────────────────────────────────────

export const getServices = (params) => api.get('/services', { params });
export const getService = (id) => api.get(`/services/${id}`);
export const createService = (data) => api.post('/services', data);
export const updateService = (id, data) => api.put(`/services/${id}`, data);
export const deleteService = (id) => api.delete(`/services/${id}`);

// ─── Packages ────────────────────────────────────────────────────────────────

export const getPackages = () => api.get('/packages');
export const getPackage = (id) => api.get(`/packages/${id}`);
export const createPackage = (data) => api.post('/packages', data);
export const updatePackage = (id, data) => api.put(`/packages/${id}`, data);
export const deletePackage = (id) => api.delete(`/packages/${id}`);

// ─── Staff ───────────────────────────────────────────────────────────────────

export const getStaff = () => api.get('/staff');
export const getStaffMember = (id) => api.get(`/staff/${id}`);
export const createStaff = (data) => api.post('/staff', data);
export const updateStaff = (id, data) => api.put(`/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

// ─── Bookings ────────────────────────────────────────────────────────────────

export const getMyBookings = (params) => api.get('/bookings', { params });
export const getAllBookings = (params) => api.get('/bookings/all', { params });
export const getAvailableSlots = (date) => api.get('/bookings/slots', { params: { date } });
export const createBooking = (data) => api.post('/bookings', data);
export const updateBookingStatus = (id, status) => api.put(`/bookings/${id}/status`, { status });
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);

// ─── Cart ────────────────────────────────────────────────────────────────────

export const getCart = () => api.get('/cart');
export const addToCart = (serviceId, qty = 1) => api.post('/cart/add', { service_id: serviceId, quantity: qty });
export const updateCartItem = (serviceId, qty) => {
  if (!serviceId) return Promise.reject(new Error('Service id is required'));
  return api.put(`/cart/${serviceId}`, { quantity: qty });
};
export const removeFromCart = (serviceId) => {
  if (!serviceId) return Promise.reject(new Error('Service id is required'));
  return api.delete(`/cart/${serviceId}`);
};
export const clearCart = () => api.delete('/cart');
export const applyOffer = (couponCode, total) => api.post('/cart/apply-offer', { coupon_code: couponCode, total });

// ─── Offers ──────────────────────────────────────────────────────────────────

export const getActiveOffers = () => api.get('/offers');
export const getAllOffers = (params) => api.get('/offers/all', { params });
export const createOffer = (data) => api.post('/offers', data);
export const updateOffer = (id, data) => {
  if (!id) return Promise.reject(new Error('Offer id is required'));
  return api.put(`/offers/${id}`, data);
};
export const deleteOffer = (id) => {
  if (!id) return Promise.reject(new Error('Offer id is required'));
  return api.delete(`/offers/${id}`);
};
export const validateCoupon = (code, amount) => api.post('/offers/validate', { coupon_code: code, cart_total: amount });

// ─── Testimonials ────────────────────────────────────────────────────────────

export const getTestimonials = () => api.get('/testimonials');
export const createTestimonial = (data) => api.post('/testimonials', data);
export const updateTestimonial = (id, data) => api.put(`/testimonials/${id}`, data);
export const deleteTestimonial = (id) => api.delete(`/testimonials/${id}`);

// ─── Contact ─────────────────────────────────────────────────────────────────

export const submitQuery = (data) => api.post('/contact', data);
export const getQueries = (params) => api.get('/contact', { params });
export const markQueryRead = (id) => api.put(`/contact/${id}/read`);
export const deleteQuery = (id) => api.delete(`/contact/${id}`);

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getDashboard = () => api.get('/admin/dashboard');
export const getUsers = (params) => api.get('/admin/users', { params });
export const toggleBlockUser = (id) => api.put(`/admin/users/${id}/block`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getRevenue = () => api.get('/admin/revenue');

export default api;

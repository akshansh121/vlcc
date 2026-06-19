'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Eye, Download, ChevronLeft, ChevronRight, Calendar, CreditCard, Wallet } from 'lucide-react';
import * as api from '../../../lib/api';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const STATUS_STYLES = {
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const PAYMENT_STATUS_STYLES = {
  paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  unpaid: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  failed: 'bg-red-500/10 text-red-400 border border-red-500/20',
  refunded: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

const PAGE_SIZE = 10;

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
          <h3 className="text-white font-semibold text-base">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}

function PaymentMethodBadge({ method }) {
  if (method === 'online') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
        <CreditCard size={10} /> Pay Online
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
      <Wallet size={10} /> Pay After
    </span>
  );
}

function exportCSV(bookings) {
  const headers = ['ID', 'Customer', 'Email', 'Mobile', 'Services', 'Date', 'Time', 'Amount', 'Status', 'Payment Method', 'Payment Status', 'Payment Ref'];
  const rows = bookings.map((b) => [
    b.id,
    b.user_name || 'N/A',
    b.user_email || 'N/A',
    b.user_mobile || 'N/A',
    Array.isArray(b.items) ? b.items.filter((i) => i.service_name).map((i) => i.service_name).join(' | ') || 'N/A' : 'N/A',
    b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-IN') : 'N/A',
    b.booking_time || 'N/A',
    b.final_amount || b.total_amount || 0,
    b.status || 'pending',
    b.payment_method || 'pay_after_service',
    b.payment_status || 'unpaid',
    b.payment_reference || '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bookings_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewBooking, setViewBooking] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentFilter !== 'all' && { payment_method: paymentFilter }),
        ...(search && { search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      };
      const res = await api.getAllBookings(params);
      const d = res.data;
      setBookings(d.data || d.bookings || []);
      setTotal(d.pagination?.total || d.total || d.count || 0);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, paymentFilter, search, dateFrom, dateTo]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
      if (viewBooking && viewBooking.id === bookingId) {
        setViewBooking((b) => ({ ...b, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">Bookings</h2>
          <p className="text-gray-500 text-sm mt-0.5">{total} total bookings</p>
        </div>
        <button
          onClick={() => exportCSV(bookings)}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-dark-500 text-sm text-gray-300 hover:text-white hover:border-gold-500/40 rounded-lg transition-all"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-dark-800 border border-dark-600 rounded-xl p-1 overflow-x-auto">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${statusFilter === s ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by customer name or email..."
            className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold-500/60 transition-colors"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Payment Method Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500/60 transition-colors"
        >
          <option value="all">All Payments</option>
          <option value="online">Pay Online</option>
          <option value="pay_after_service">Pay After Service</option>
        </select>

        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-gray-500" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500/60 transition-colors"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500/60 transition-colors"
          />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }} className="text-gray-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-dark-700/50">
              <tr>
                {['Booking ID', 'Customer', 'Services', 'Date & Time', 'Amount', 'Payment', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-gray-400 font-medium px-4 py-3 whitespace-nowrap first:pl-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-dark-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-4 py-3 pl-5">
                      <span className="text-gray-400 font-mono text-xs">#{String(b.id).padStart(6, '0')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium whitespace-nowrap">{b.user_name || 'N/A'}</div>
                      <div className="text-gray-500 text-xs">{b.user_email || ''}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <span className="text-gray-300 truncate block">
                        {Array.isArray(b.items) && b.items.some((i) => i.service_name)
                          ? b.items.filter((i) => i.service_name).map((i) => i.service_name).join(', ')
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-white text-xs">
                        {b.booking_date
                          ? new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'N/A'}
                      </div>
                      <div className="text-gray-500 text-xs">{b.booking_time || ''}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-gold-500 font-medium">
                        ₹{(b.final_amount || b.total_amount || 0).toLocaleString('en-IN')}
                      </div>
                      {b.discount_amount > 0 && (
                        <div className="text-green-500 text-xs">-₹{parseFloat(b.discount_amount).toLocaleString('en-IN')} off</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <PaymentMethodBadge method={b.payment_method} />
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${PAYMENT_STATUS_STYLES[b.payment_status] || PAYMENT_STATUS_STYLES.unpaid}`}>
                          {b.payment_status || 'unpaid'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}>
                        {b.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewBooking(b)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 transition-all"
                        >
                          <Eye size={15} />
                        </button>
                        <select
                          value={b.status || 'pending'}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          disabled={updatingId === b.id || b.status === 'cancelled'}
                          className="bg-dark-700 border border-dark-500 rounded-lg px-2 py-1 text-gray-300 text-xs focus:outline-none focus:border-gold-500/60 disabled:opacity-50 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="completed">Complete</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-dark-600">
            <p className="text-gray-500 text-sm">Page {page} of {totalPages} ({total} total)</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-40 hover:bg-dark-700 transition-all">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-40 hover:bg-dark-700 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {viewBooking && (
        <Modal title="Booking Details" onClose={() => setViewBooking(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Booking ID</p>
                <p className="text-white font-mono">#{String(viewBooking.id).padStart(8, '0')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[viewBooking.status] || STATUS_STYLES.pending}`}>
                  {viewBooking.status || 'pending'}
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Customer</p>
                <p className="text-white">{viewBooking.user_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Email</p>
                <p className="text-white break-all">{viewBooking.user_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Mobile</p>
                <p className="text-white">{viewBooking.user_mobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Date</p>
                <p className="text-white">
                  {viewBooking.booking_date
                    ? new Date(viewBooking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Time Slot</p>
                <p className="text-white">{viewBooking.booking_time || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Amount</p>
                <div>
                  <p className="text-gold-500 font-semibold">₹{(viewBooking.final_amount || viewBooking.total_amount || 0).toLocaleString('en-IN')}</p>
                  {viewBooking.discount_amount > 0 && (
                    <p className="text-green-500 text-xs">Saved ₹{parseFloat(viewBooking.discount_amount).toLocaleString('en-IN')}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Payment Method</p>
                <PaymentMethodBadge method={viewBooking.payment_method} />
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Payment Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${PAYMENT_STATUS_STYLES[viewBooking.payment_status] || PAYMENT_STATUS_STYLES.unpaid}`}>
                  {viewBooking.payment_status || 'unpaid'}
                </span>
              </div>
              {viewBooking.payment_reference && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs mb-0.5">Payment Reference</p>
                  <p className="text-white font-mono text-xs break-all">{viewBooking.payment_reference}</p>
                </div>
              )}
            </div>

            {Array.isArray(viewBooking.items) && viewBooking.items.some((i) => i.service_name) && (
              <div>
                <p className="text-gray-500 text-xs mb-2">Services</p>
                <div className="space-y-1.5">
                  {viewBooking.items.filter((i) => i.service_name).map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-dark-700 border border-dark-500 rounded-lg px-3 py-2">
                      <span className="text-white text-sm">{item.service_name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
                      {item.price && (
                        <span className="text-gold-500 text-sm">₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewBooking.notes && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Notes</p>
                <p className="text-gray-300 text-sm bg-dark-700 rounded-lg p-3">{viewBooking.notes}</p>
              </div>
            )}

            {viewBooking.status !== 'cancelled' && (
              <div>
                <p className="text-gray-500 text-xs mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {['confirmed', 'completed', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(viewBooking.id, s)}
                      disabled={viewBooking.status === s || updatingId === viewBooking.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all disabled:opacity-50
                        ${s === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                        ${s === 'completed' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                        ${s === 'cancelled' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                      `}
                    >
                      {s === 'confirmed' ? 'Confirm' : s === 'completed' ? 'Complete' : 'Cancel'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

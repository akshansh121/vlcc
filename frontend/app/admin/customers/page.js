'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Eye, ShieldAlert, ShieldCheck, Trash2, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import * as api from '../../../lib/api';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const normalizeCustomer = (customer) => ({
  ...customer,
  _id: customer._id || customer.id,
  isBlocked: customer.isBlocked ?? customer.is_blocked ?? false,
  createdAt: customer.createdAt || customer.created_at,
  totalBookings: customer.totalBookings ?? customer.bookingCount ?? customer.booking_count ?? 0,
});

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
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

const STATUS_STYLES = {
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [viewBookings, setViewBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({ search, page, limit: PAGE_SIZE });
      const d = res.data;
      const list = d.data || d.users || [];
      setCustomers(Array.isArray(list) ? list.map(normalizeCustomer) : []);
      setTotal(d.pagination?.total || d.total || d.count || 0);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleView = async (c) => {
    setViewCustomer(c);
    setLoadingBookings(true);
    setViewBookings([]);
    try {
      const res = await api.getAllBookings({ userId: c._id || c.id, limit: 20 });
      const d = res.data;
      setViewBookings(d.data || d.bookings || []);
    } catch {
      setViewBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleToggleBlock = async (c) => {
    const customerId = c._id || c.id;
    setTogglingId(customerId);
    try {
      await api.toggleBlockUser(customerId);
      toast.success(`User ${c.isBlocked ? 'unblocked' : 'blocked'} successfully`);
      fetchCustomers();
      if (viewCustomer && viewCustomer._id === customerId) {
        setViewCustomer((prev) => ({ ...prev, isBlocked: !prev.isBlocked }));
      }
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteUser(deleteId);
      toast.success('Customer deleted');
      setDeleteId(null);
      if (viewCustomer && viewCustomer._id === deleteId) setViewCustomer(null);
      fetchCustomers();
    } catch {
      toast.error('Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">Customers</h2>
          <p className="text-gray-500 text-sm mt-0.5">{total} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold-500/60 transition-colors"
        />
        {search && (
          <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-dark-700/50">
              <tr>
                {['Customer', 'Email', 'Mobile', 'Bookings', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-gray-400 font-medium px-4 py-3 whitespace-nowrap first:pl-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-dark-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">No customers found</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-4 py-3 pl-5">
                      <div className="flex items-center gap-2.5">
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-400 text-xs font-semibold uppercase">{c.name?.[0] || '?'}</span>
                          </div>
                        )}
                        <span className="text-white font-medium whitespace-nowrap">{c.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{c.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{c.mobile || c.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-white text-center font-medium">{c.totalBookings || c.bookingCount || 0}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.isBlocked
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {c.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleView(c)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 transition-all"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(c)}
                          disabled={togglingId === (c._id || c.id)}
                          className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${
                            c.isBlocked
                              ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-gray-400 hover:text-orange-400 hover:bg-orange-500/10'
                          }`}
                          title={c.isBlocked ? 'Unblock' : 'Block'}
                        >
                          {c.isBlocked ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
                        </button>
                        <button
                          onClick={() => setDeleteId(c._id || c.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
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
            <p className="text-gray-500 text-sm">Page {page} of {totalPages}</p>
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

      {/* View Customer Modal */}
      {viewCustomer && (
        <Modal title="Customer Details" onClose={() => setViewCustomer(null)}>
          <div className="space-y-5">
            {/* Profile */}
            <div className="flex items-center gap-4">
              {viewCustomer.image ? (
                <img src={viewCustomer.image} alt={viewCustomer.name} className="w-16 h-16 rounded-full object-cover border-2 border-dark-500" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center border-2 border-dark-500">
                  <span className="text-white text-xl font-semibold uppercase">{viewCustomer.name?.[0] || '?'}</span>
                </div>
              )}
              <div>
                <h4 className="text-white font-semibold text-lg">{viewCustomer.name}</h4>
                <p className="text-gray-400 text-sm">{viewCustomer.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    viewCustomer.isBlocked
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {viewCustomer.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                  <span className="text-gray-500 text-xs">
                    Joined {viewCustomer.createdAt ? new Date(viewCustomer.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-0.5">Mobile</p>
                <p className="text-white">{viewCustomer.mobile || viewCustomer.phone || 'N/A'}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-0.5">Total Bookings</p>
                <p className="text-white font-semibold">{viewCustomer.totalBookings || 0}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleBlock(viewCustomer)}
                disabled={togglingId === (viewCustomer._id || viewCustomer.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                  viewCustomer.isBlocked
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {viewCustomer.isBlocked ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
                {viewCustomer.isBlocked ? 'Unblock User' : 'Block User'}
              </button>
              <button
                onClick={() => { setDeleteId(viewCustomer._id || viewCustomer.id); setViewCustomer(null); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                <Trash2 size={15} />
                Delete User
              </button>
            </div>

            {/* Booking History */}
            <div>
              <h5 className="text-white font-medium text-sm mb-2">Booking History</h5>
              {loadingBookings ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-dark-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : viewBookings.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">No bookings found</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {viewBookings.map((b) => (
                    <div key={b._id} className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">
                          {Array.isArray(b.services)
                            ? b.services.map((s) => s.name || s.service?.name || 'Service').join(', ')
                            : 'Booking'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {b.date ? new Date(b.date).toLocaleDateString('en-IN') : 'N/A'}
                          {b.timeSlot ? ` • ${b.timeSlot}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gold-500 text-xs font-medium">₹{(b.totalAmount || b.amount || 0).toLocaleString('en-IN')}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}>
                          {b.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <Modal title="Delete Customer" onClose={() => setDeleteId(null)}>
          <p className="text-gray-300 text-sm mb-2">Are you sure you want to delete this customer?</p>
          <p className="text-red-400 text-xs mb-5">This will also delete all their data and booking history. This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 bg-dark-700 border border-dark-500 text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors">
              {deleting ? 'Deleting...' : 'Delete Customer'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

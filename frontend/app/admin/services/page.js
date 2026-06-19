'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../../../lib/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 1, name: 'Hair Services' },
  { id: 2, name: 'Skin & Face' },
  { id: 3, name: 'Makeup' },
  { id: 4, name: 'Nail Care' },
  { id: 5, name: 'Body Care' },
];
const PAGE_SIZE = 10;

const defaultForm = {
  name: '',
  categoryId: 1,
  description: '',
  duration: '',
  originalPrice: '',
  discountedPrice: '',
  image: '',
  isActive: true,
};

const normalizeService = (service) => ({
  ...service,
  _id: service._id || service.id,
  categoryId: service.categoryId || service.category_id || '',
  category: service.category || service.category_name || 'Uncategorized',
  originalPrice: Number(service.originalPrice ?? service.original_price ?? service.price ?? 0),
  discountedPrice:
    service.discountedPrice ?? service.discounted_price
      ? Number(service.discountedPrice ?? service.discounted_price)
      : '',
  image: service.image || service.image_url || '',
  isActive: service.isActive ?? service.is_active ?? true,
});

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
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

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs font-medium mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold-500/60 transition-colors';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getServices({ search, page, limit: PAGE_SIZE, include_inactive: true });
      const d = res.data;
      const list = d.data || d.services || [];
      setServices(Array.isArray(list) ? list.map(normalizeService) : []);
      setTotal(d.pagination?.total || d.total || d.count || 0);
    } catch {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openAdd = () => {
    setForm(defaultForm);
    setEditService(null);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setForm({
      name: s.name || '',
      categoryId: s.categoryId || '',
      description: s.description || '',
      duration: s.duration || '',
      originalPrice: s.originalPrice || '',
      discountedPrice: s.discountedPrice || '',
      image: s.image || '',
      isActive: s.isActive !== undefined ? s.isActive : true,
    });
    setEditService(s);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditService(null);
    setForm(defaultForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.originalPrice || Number(form.originalPrice) < 0) {
      return toast.error('Original price is required');
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        duration: Number(form.duration) || 60,
        original_price: Number(form.originalPrice) || 0,
        discounted_price: form.discountedPrice !== '' ? Number(form.discountedPrice) : null,
        image_url: form.image || null,
        category_id: form.categoryId ? Number(form.categoryId) : null,
        is_active: form.isActive,
      };
      if (editService) {
        await api.updateService(editService._id, payload);
        toast.success('Service updated');
      } else {
        await api.createService(payload);
        toast.success('Service added');
      }
      closeModal();
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (s) => {
    try {
      await api.updateService(s._id, { is_active: !s.isActive });
      toast.success(`Service ${!s.isActive ? 'activated' : 'deactivated'}`);
      fetchServices();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteService(deleteId);
      toast.success('Service deleted');
      setDeleteId(null);
      fetchServices();
    } catch {
      toast.error('Failed to delete service');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">Services</h2>
          <p className="text-gray-500 text-sm mt-0.5">{total} services total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold text-sm rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search services..."
          className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold-500/60 transition-colors"
        />
        {search && (
          <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-dark-700/50">
              <tr>
                {['Image', 'Name', 'Category', 'Duration', 'Price', 'Status', 'Actions'].map((h) => (
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
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-dark-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No services found
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr key={s._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-4 py-3 pl-5">
                      {s.image ? (
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-10 h-10 rounded-lg object-cover bg-dark-700"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center text-gray-600 text-xs">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-dark-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{s.duration || 0} min</td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">
                        ₹{(s.discountedPrice || s.originalPrice || s.price || 0).toLocaleString('en-IN')}
                      </div>
                      {s.discountedPrice && s.originalPrice && s.discountedPrice < s.originalPrice && (
                        <div className="text-gray-500 text-xs line-through">
                          ₹{s.originalPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          s.isActive !== false ? 'text-emerald-400' : 'text-gray-500'
                        }`}
                      >
                        {s.isActive !== false ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        {s.isActive !== false ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 transition-all"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(s._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-dark-600">
            <p className="text-gray-500 text-sm">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-40 hover:bg-dark-700 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-40 hover:bg-dark-700 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editService ? 'Edit Service' : 'Add Service'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Name" required>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Hair Spa" className={inputClass} required />
            </FormField>
            <FormField label="Category">
              <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClass}>
                <option value="">Uncategorized</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Description">
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Service description..." className={`${inputClass} resize-none`} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Duration (minutes)">
                <input name="duration" type="number" value={form.duration} onChange={handleChange} placeholder="60" min="0" className={inputClass} />
              </FormField>
              <FormField label="Original Price (₹)">
                <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} placeholder="500" min="0" className={inputClass} />
              </FormField>
              <FormField label="Discounted Price (₹)">
                <input name="discountedPrice" type="number" value={form.discountedPrice} onChange={handleChange} placeholder="400" min="0" className={inputClass} />
              </FormField>
            </div>
            <FormField label="Image URL">
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." className={inputClass} />
            </FormField>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-4 h-4 accent-gold-500"
              />
              <label htmlFor="isActive" className="text-gray-300 text-sm">Active (visible to customers)</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 bg-dark-700 border border-dark-500 text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors">
                {saving ? 'Saving...' : editService ? 'Update' : 'Add Service'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <Modal title="Delete Service" onClose={() => setDeleteId(null)}>
          <p className="text-gray-300 text-sm mb-5">Are you sure you want to delete this service? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 bg-dark-700 border border-dark-500 text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

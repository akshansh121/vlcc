'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Star, ToggleLeft, ToggleRight, UserCircle } from 'lucide-react';
import * as api from '../../../lib/api';
import toast from 'react-hot-toast';

const defaultForm = {
  customerName: '',
  image: '',
  rating: 5,
  review: '',
  isActive: true,
};

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

const inputClass = 'w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold-500/60 transition-colors';

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function StarSelector({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={n <= value ? 'text-gold-500 fill-gold-500' : 'text-gray-600'}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= rating ? 'text-gold-500 fill-gold-500' : 'text-gray-600'}
        />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await api.getTestimonials();
      setTestimonials(res.data.data || res.data.testimonials || res.data || []);
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const openAdd = () => {
    setForm(defaultForm);
    setEditItem(null);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setForm({
      customerName: t.customerName || t.name || '',
      image: t.image || '',
      rating: t.rating || 5,
      review: t.review || t.text || '',
      isActive: t.isActive !== undefined ? t.isActive : true,
    });
    setEditItem(t);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm(defaultForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.review.trim()) {
      return toast.error('Customer name and review are required');
    }
    setSaving(true);
    try {
      const payload = { ...form, rating: Number(form.rating) };
      if (editItem) {
        await api.updateTestimonial(editItem._id, payload);
        toast.success('Testimonial updated');
      } else {
        await api.createTestimonial(payload);
        toast.success('Testimonial added');
      }
      closeModal();
      fetchTestimonials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (t) => {
    try {
      await api.updateTestimonial(t._id, { isActive: !t.isActive });
      toast.success(`Testimonial ${!t.isActive ? 'activated' : 'deactivated'}`);
      fetchTestimonials();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteTestimonial(deleteId);
      toast.success('Testimonial deleted');
      setDeleteId(null);
      fetchTestimonials();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">Testimonials</h2>
          <p className="text-gray-500 text-sm mt-0.5">{testimonials.length} reviews</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold text-sm rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-dark-800 border border-dark-600 rounded-xl h-44 animate-pulse" />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-12 text-center">
          <Star size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No testimonials yet</p>
          <button onClick={openAdd} className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold text-sm rounded-lg transition-colors">
            Add First Testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div
              key={t._id}
              className={`bg-dark-800 border rounded-xl p-4 flex flex-col transition-colors ${
                t.isActive !== false ? 'border-dark-600' : 'border-dark-600 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                {t.image ? (
                  <img
                    src={t.image}
                    alt={t.customerName || t.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-dark-600"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div
                  className="w-11 h-11 rounded-full bg-dark-700 border-2 border-dark-600 flex items-center justify-center flex-shrink-0"
                  style={{ display: t.image ? 'none' : 'flex' }}
                >
                  <UserCircle size={20} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{t.customerName || t.name || 'Customer'}</p>
                  <StarDisplay rating={t.rating || 5} />
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    t.isActive !== false
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                  }`}
                >
                  {t.isActive !== false ? 'Active' : 'Hidden'}
                </span>
              </div>

              <p className="text-gray-400 text-sm flex-1 line-clamp-3 mb-4 italic">
                &ldquo;{t.review || t.text || 'No review text'}&rdquo;
              </p>

              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={() => handleToggle(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 transition-all"
                  title={t.isActive !== false ? 'Deactivate' : 'Activate'}
                >
                  {t.isActive !== false ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                <button
                  onClick={() => openEdit(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 transition-all"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(t._id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editItem ? 'Edit Testimonial' : 'Add Testimonial'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Customer Name *">
              <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Jane Doe" className={inputClass} required />
            </FormField>
            <FormField label="Photo URL">
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." className={inputClass} />
            </FormField>
            {form.image && (
              <div className="flex justify-center">
                <img src={form.image} alt="Preview" className="w-14 h-14 rounded-full object-cover border-2 border-dark-500" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
            <FormField label="Rating">
              <StarSelector value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
            </FormField>
            <FormField label="Review *">
              <textarea
                name="review"
                value={form.review}
                onChange={handleChange}
                rows={4}
                placeholder="Write the customer review..."
                className={`${inputClass} resize-none`}
                required
              />
            </FormField>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="testimonialActive" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-gold-500" />
              <label htmlFor="testimonialActive" className="text-gray-300 text-sm">Show on website</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 bg-dark-700 border border-dark-500 text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors">
                {saving ? 'Saving...' : editItem ? 'Update' : 'Add Testimonial'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <Modal title="Delete Testimonial" onClose={() => setDeleteId(null)}>
          <p className="text-gray-300 text-sm mb-5">Are you sure you want to delete this testimonial?</p>
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

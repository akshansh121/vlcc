'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import * as api from '../../../lib/api';
import toast from 'react-hot-toast';

const defaultForm = {
  title: '',
  description: '',
  couponCode: '',
  discountType: 'percentage',
  discountValue: '',
  minAmount: '',
  maxDiscount: '',
  startDate: '',
  endDate: '',
  usageLimit: '',
  isActive: true,
};

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

const inputClass = 'w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold-500/60 transition-colors';

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toInputDate(d) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

const getOfferId = (offer) => offer?._id || offer?.id || offer?.offer_id || offer?.offerId;

const normalizeOffer = (offer) => ({
  ...offer,
  _id: getOfferId(offer),
  couponCode: offer.couponCode || offer.coupon_code || offer.code || '',
  discountType: offer.discountType || offer.discount_type || 'percentage',
  discountValue: Number(offer.discountValue ?? offer.discount_value ?? offer.discount ?? 0),
  minAmount: offer.minAmount ?? offer.min_amount ?? '',
  maxDiscount: offer.maxDiscount ?? offer.max_discount ?? '',
  startDate: offer.startDate || offer.start_date || offer.validFrom || '',
  endDate: offer.endDate || offer.end_date || offer.validTo || '',
  usageLimit: offer.usageLimit ?? offer.usage_limit ?? '',
  isActive: offer.isActive ?? offer.is_active ?? false,
});

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editOffer, setEditOffer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.getAllOffers();
      const list = res.data.data || res.data.offers || res.data || [];
      setOffers(Array.isArray(list) ? list.map(normalizeOffer) : []);
    } catch {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  const openAdd = () => {
    setForm(defaultForm);
    setEditOffer(null);
    setShowModal(true);
  };

  const openEdit = (o) => {
    const normalized = normalizeOffer(o);
    setForm({
      title: normalized.title || '',
      description: normalized.description || '',
      couponCode: normalized.couponCode || '',
      discountType: normalized.discountType || 'percentage',
      discountValue: normalized.discountValue || '',
      minAmount: normalized.minAmount || '',
      maxDiscount: normalized.maxDiscount || '',
      startDate: toInputDate(normalized.startDate),
      endDate: toInputDate(normalized.endDate),
      usageLimit: normalized.usageLimit || '',
      isActive: normalized.isActive !== undefined ? normalized.isActive : true,
    });
    setEditOffer(normalized);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditOffer(null);
    setForm(defaultForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.couponCode.trim()) {
      return toast.error('Title and coupon code are required');
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      return toast.error('Discount value must be greater than 0');
    }
    if (!form.startDate || !form.endDate) {
      return toast.error('Start date and end date are required');
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      return toast.error('End date must be after start date');
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        coupon_code: form.couponCode.toUpperCase(),
        discount_type: form.discountType,
        discount_value: Number(form.discountValue) || 0,
        min_amount: form.minAmount !== '' ? Number(form.minAmount) : null,
        max_discount: form.maxDiscount !== '' ? Number(form.maxDiscount) : null,
        start_date: form.startDate,
        end_date: form.endDate,
        usage_limit: form.usageLimit !== '' ? Number(form.usageLimit) : null,
        is_active: form.isActive,
      };
      if (editOffer) {
        const offerId = getOfferId(editOffer);
        if (!offerId) {
          toast.error('Could not update offer because its id is missing. Please refresh and try again.');
          return;
        }
        await api.updateOffer(offerId, payload);
        toast.success('Offer updated');
      } else {
        await api.createOffer(payload);
        toast.success('Offer created');
      }
      closeModal();
      fetchOffers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (o) => {
    const offerId = getOfferId(o);
    if (!offerId) {
      toast.error('Could not update offer because its id is missing. Please refresh and try again.');
      return;
    }
    try {
      await api.updateOffer(offerId, { is_active: !o.isActive });
      toast.success(`Offer ${!o.isActive ? 'activated' : 'deactivated'}`);
      fetchOffers();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteOffer(deleteId);
      toast.success('Offer deleted');
      setDeleteId(null);
      fetchOffers();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const isExpired = (o) => {
    const end = o.endDate;
    return end && new Date(end) < new Date();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">Offers & Coupons</h2>
          <p className="text-gray-500 text-sm mt-0.5">{offers.length} offers total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold text-sm rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Offer
        </button>
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-dark-700/50">
              <tr>
                {['Title', 'Coupon Code', 'Discount', 'Min Amount', 'Valid Period', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-gray-400 font-medium px-4 py-3 whitespace-nowrap first:pl-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-dark-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">No offers found</td>
                </tr>
              ) : (
                offers.map((o) => (
                  <tr key={getOfferId(o) || o.couponCode || o.title} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-4 py-3 pl-5">
                      <div className="text-white font-medium">{o.title}</div>
                      {o.description && <div className="text-gray-500 text-xs truncate max-w-[200px]">{o.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-dark-700 border border-gold-500/20 text-gold-500 font-mono text-xs px-2.5 py-1 rounded-lg">
                        {o.couponCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">
                      {o.discountType === 'percentage' || o.discountType === 'percent'
                        ? `${o.discountValue}%`
                        : `₹${(o.discountValue || 0).toLocaleString('en-IN')}`}
                      {o.maxDiscount && (
                        <div className="text-gray-500 text-xs">Max ₹{o.maxDiscount}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {o.minAmount ? `₹${o.minAmount.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap">
                      <div>{formatDate(o.startDate)}</div>
                      <div className="text-gray-500">to {formatDate(o.endDate)}</div>
                      {isExpired(o) && (
                        <span className="text-red-400 text-xs">Expired</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(o)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${o.isActive ? 'text-emerald-400' : 'text-gray-500'}`}
                      >
                        {o.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        {o.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(o)} className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 transition-all">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => {
                            const offerId = getOfferId(o);
                            if (!offerId) {
                              toast.error('Could not delete offer because its id is missing. Please refresh and try again.');
                              return;
                            }
                            setDeleteId(offerId);
                          }}
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
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editOffer ? 'Edit Offer' : 'Add Offer'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Title *">
                <input name="title" value={form.title} onChange={handleChange} placeholder="Summer Sale" className={inputClass} required />
              </FormField>
              <FormField label="Coupon Code *">
                <input
                  name="couponCode"
                  value={form.couponCode}
                  onChange={(e) => setForm((f) => ({ ...f, couponCode: e.target.value.toUpperCase() }))}
                  placeholder="SUMMER20"
                  className={`${inputClass} uppercase tracking-widest`}
                  required
                />
              </FormField>
            </div>
            <FormField label="Description">
              <textarea name="description" value={form.description} onChange={handleChange} rows={2} className={`${inputClass} resize-none`} placeholder="Offer details..." />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Discount Type">
                <select name="discountType" value={form.discountType} onChange={handleChange} className={inputClass}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </FormField>
              <FormField label={`Discount Value (${form.discountType === 'percentage' ? '%' : '₹'})`}>
                <input name="discountValue" type="number" value={form.discountValue} onChange={handleChange} placeholder={form.discountType === 'percentage' ? '20' : '200'} min="1" className={inputClass} required />
              </FormField>
              <FormField label="Min Order Amount (₹)">
                <input name="minAmount" type="number" value={form.minAmount} onChange={handleChange} placeholder="500" min="0" className={inputClass} />
              </FormField>
              <FormField label="Max Discount (₹)">
                <input name="maxDiscount" type="number" value={form.maxDiscount} onChange={handleChange} placeholder="300" min="0" className={inputClass} />
              </FormField>
              <FormField label="Start Date">
                <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className={inputClass} required />
              </FormField>
              <FormField label="End Date">
                <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className={inputClass} required />
              </FormField>
              <FormField label="Usage Limit">
                <input name="usageLimit" type="number" value={form.usageLimit} onChange={handleChange} placeholder="100" min="1" className={inputClass} />
              </FormField>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="offerActive" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-gold-500" />
              <label htmlFor="offerActive" className="text-gray-300 text-sm">Active (customers can apply this coupon)</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 bg-dark-700 border border-dark-500 text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors">
                {saving ? 'Saving...' : editOffer ? 'Update Offer' : 'Create Offer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <Modal title="Delete Offer" onClose={() => setDeleteId(null)}>
          <p className="text-gray-300 text-sm mb-5">Are you sure you want to delete this offer? All associated coupons will stop working.</p>
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

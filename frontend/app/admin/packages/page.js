'use client';

import { useState, useEffect } from 'react';
import { Pencil, X, Star, Package } from 'lucide-react';
import * as api from '../../../lib/api';
import toast from 'react-hot-toast';

const TIER_STYLES = {
  silver: {
    border: 'border-gray-400/30',
    badge: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    icon: 'text-gray-400',
    button: 'border-gray-500/30 text-gray-300 hover:border-gray-400/60',
  },
  gold: {
    border: 'border-gold-500/40',
    badge: 'bg-gold-500/10 text-gold-500 border border-gold-500/20',
    icon: 'text-gold-500',
    button: 'border-gold-500/30 text-gold-400 hover:border-gold-500/60',
  },
  platinum: {
    border: 'border-purple-400/30',
    badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    icon: 'text-purple-400',
    button: 'border-purple-500/30 text-purple-300 hover:border-purple-400/60',
  },
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

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPkg, setEditPkg] = useState(null);
  const [form, setForm] = useState({});
  const [benefitInput, setBenefitInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [pkgRes, svcRes] = await Promise.all([api.getPackages(), api.getServices()]);
        setPackages(pkgRes.data.data || pkgRes.data.packages || pkgRes.data || []);
        setAllServices(svcRes.data.data || svcRes.data.services || []);
      } catch {
        toast.error('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const openEdit = (pkg) => {
    setForm({
      name: pkg.name || '',
      description: pkg.description || '',
      type: pkg.type || pkg.name?.toLowerCase() || 'silver',
      originalPrice: pkg.originalPrice || pkg.price || '',
      discountedPrice: pkg.discountedPrice || '',
      benefits: Array.isArray(pkg.benefits) ? [...pkg.benefits] : [],
      services: (pkg.services || []).map((s) => (typeof s === 'object' ? s._id : s)),
    });
    setBenefitInput('');
    setEditPkg(pkg);
  };

  const closeModal = () => {
    setEditPkg(null);
    setForm({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const addBenefit = () => {
    const b = benefitInput.trim();
    if (!b) return;
    setForm((f) => ({ ...f, benefits: [...(f.benefits || []), b] }));
    setBenefitInput('');
  };

  const removeBenefit = (i) => {
    setForm((f) => ({ ...f, benefits: f.benefits.filter((_, idx) => idx !== i) }));
  };

  const toggleService = (id) => {
    setForm((f) => {
      const services = f.services || [];
      return {
        ...f,
        services: services.includes(id) ? services.filter((s) => s !== id) : [...services, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        originalPrice: Number(form.originalPrice) || 0,
        discountedPrice: form.discountedPrice !== '' ? Number(form.discountedPrice) : undefined,
      };
      await api.updatePackage(editPkg._id, payload);
      toast.success('Package updated');
      const res = await api.getPackages();
      setPackages(res.data.data || res.data.packages || res.data || []);
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update package');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-dark-800 border border-dark-600 rounded-xl h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-semibold">Packages</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage Silver, Gold, and Platinum packages</p>
      </div>

      {packages.length === 0 ? (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-12 text-center">
          <Package size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No packages found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const tierKey = (pkg.type || pkg.name || 'silver').toLowerCase();
            const style = TIER_STYLES[tierKey] || TIER_STYLES.silver;
            return (
              <div key={pkg._id} className={`bg-dark-800 border ${style.border} rounded-xl p-5 flex flex-col`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${style.badge}`}>
                      <Star size={10} className={style.icon} />
                      {pkg.type || pkg.name}
                    </span>
                    <h3 className="text-white font-semibold text-lg mt-2">{pkg.name}</h3>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-2">{pkg.description || 'No description'}</p>

                <div className="mb-4">
                  {pkg.discountedPrice && pkg.discountedPrice < (pkg.originalPrice || pkg.price || 0) ? (
                    <div>
                      <span className="text-white text-2xl font-bold">₹{Number(pkg.discountedPrice).toLocaleString('en-IN')}</span>
                      <span className="text-gray-500 text-sm line-through ml-2">₹{(pkg.originalPrice || pkg.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <span className="text-white text-2xl font-bold">₹{(pkg.originalPrice || pkg.price || 0).toLocaleString('en-IN')}</span>
                  )}
                </div>

                {Array.isArray(pkg.benefits) && pkg.benefits.length > 0 && (
                  <ul className="space-y-1.5 mb-4">
                    {pkg.benefits.slice(0, 4).map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.icon} bg-current`} />
                        {b}
                      </li>
                    ))}
                    {pkg.benefits.length > 4 && (
                      <li className="text-gray-500 text-xs">+{pkg.benefits.length - 4} more</li>
                    )}
                  </ul>
                )}

                {Array.isArray(pkg.services) && pkg.services.length > 0 && (
                  <p className="text-gray-500 text-xs mb-4">
                    {pkg.services.length} service{pkg.services.length !== 1 ? 's' : ''} included
                  </p>
                )}

                <button
                  onClick={() => openEdit(pkg)}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-all ${style.button}`}
                >
                  <Pencil size={14} />
                  Edit Package
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editPkg && (
        <Modal title={`Edit ${editPkg.name} Package`} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Name">
                <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
              </FormField>
              <FormField label="Type">
                <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </FormField>
            </div>
            <FormField label="Description">
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Original Price (₹)">
                <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} min="0" className={inputClass} />
              </FormField>
              <FormField label="Discounted Price (₹)">
                <input name="discountedPrice" type="number" value={form.discountedPrice} onChange={handleChange} min="0" className={inputClass} />
              </FormField>
            </div>

            {/* Benefits */}
            <FormField label="Benefits">
              <div className="flex gap-2 mb-2">
                <input
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  placeholder="Add a benefit and press Enter..."
                  className={inputClass}
                />
                <button type="button" onClick={addBenefit} className="px-3 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap">
                  Add
                </button>
              </div>
              {(form.benefits || []).length > 0 && (
                <div className="space-y-1.5">
                  {form.benefits.map((b, i) => (
                    <div key={i} className="flex items-center justify-between bg-dark-700 border border-dark-500 rounded-lg px-3 py-1.5">
                      <span className="text-gray-300 text-sm">{b}</span>
                      <button type="button" onClick={() => removeBenefit(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormField>

            {/* Services */}
            {allServices.length > 0 && (
              <FormField label="Included Services">
                <div className="bg-dark-700 border border-dark-500 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {allServices.map((s) => (
                    <label key={s._id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={(form.services || []).includes(s._id)}
                        onChange={() => toggleService(s._id)}
                        className="w-4 h-4 accent-gold-500"
                      />
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                        {s.name}
                        <span className="text-gray-500 text-xs ml-2">({s.category})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </FormField>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 bg-dark-700 border border-dark-500 text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors">
                {saving ? 'Saving...' : 'Update Package'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

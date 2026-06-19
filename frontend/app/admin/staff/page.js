'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, UserCircle } from 'lucide-react';
import * as api from '../../../lib/api';
import toast from 'react-hot-toast';

const defaultForm = {
  name: '',
  designation: '',
  experienceYears: '',
  description: '',
  specialization: '',
  image: '',
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

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.getStaff();
      setStaff(res.data.data || res.data.staff || res.data || []);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const openAdd = () => {
    setForm(defaultForm);
    setEditMember(null);
    setShowModal(true);
  };

  const openEdit = (m) => {
    setForm({
      name: m.name || '',
      designation: m.designation || '',
      experienceYears: m.experienceYears || '',
      description: m.description || '',
      specialization: m.specialization || '',
      image: m.image || '',
    });
    setEditMember(m);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMember(null);
    setForm(defaultForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const payload = { ...form, experienceYears: Number(form.experienceYears) || 0 };
      if (editMember) {
        await api.updateStaff(editMember._id, payload);
        toast.success('Staff updated');
      } else {
        await api.createStaff(payload);
        toast.success('Staff member added');
      }
      closeModal();
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteStaff(deleteId);
      toast.success('Staff member deleted');
      setDeleteId(null);
      fetchStaff();
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
          <h2 className="text-white text-xl font-semibold">Staff</h2>
          <p className="text-gray-500 text-sm mt-0.5">{staff.length} team members</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold text-sm rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-dark-800 border border-dark-600 rounded-xl h-52 animate-pulse" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-12 text-center">
          <UserCircle size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No staff members found</p>
          <button onClick={openAdd} className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold text-sm rounded-lg transition-colors">
            Add First Staff Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {staff.map((m) => (
            <div key={m._id} className="bg-dark-800 border border-dark-600 rounded-xl p-4 flex flex-col items-center text-center group hover:border-dark-500 transition-colors">
              {m.image ? (
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-dark-600 group-hover:border-gold-500/30 transition-colors"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-20 h-20 rounded-full bg-dark-700 border-2 border-dark-600 flex items-center justify-center mb-3"
                style={{ display: m.image ? 'none' : 'flex' }}
              >
                <UserCircle size={32} className="text-gray-500" />
              </div>

              <h3 className="text-white font-semibold text-sm">{m.name}</h3>
              <p className="text-gold-500 text-xs mt-0.5">{m.designation || 'Staff'}</p>

              {m.experienceYears > 0 && (
                <p className="text-gray-500 text-xs mt-1">
                  {m.experienceYears} yr{m.experienceYears !== 1 ? 's' : ''} experience
                </p>
              )}

              {m.specialization && (
                <span className="mt-2 px-2 py-0.5 bg-dark-700 text-gray-400 text-xs rounded-full border border-dark-500">
                  {m.specialization}
                </span>
              )}

              {m.description && (
                <p className="text-gray-500 text-xs mt-2 line-clamp-2">{m.description}</p>
              )}

              <div className="flex gap-2 mt-4 w-full">
                <button
                  onClick={() => openEdit(m)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dark-500 text-gray-400 hover:text-gold-500 hover:border-gold-500/30 text-xs transition-all"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(m._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dark-500 text-gray-400 hover:text-red-400 hover:border-red-500/30 text-xs transition-all"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editMember ? 'Edit Staff Member' : 'Add Staff Member'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Name *">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className={inputClass} required />
              </FormField>
              <FormField label="Designation">
                <input name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Senior Stylist" className={inputClass} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Experience (Years)">
                <input name="experienceYears" type="number" value={form.experienceYears} onChange={handleChange} placeholder="5" min="0" className={inputClass} />
              </FormField>
              <FormField label="Specialization">
                <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Bridal Makeup" className={inputClass} />
              </FormField>
            </div>
            <FormField label="Description">
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Brief bio..." className={`${inputClass} resize-none`} />
            </FormField>
            <FormField label="Photo URL">
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." className={inputClass} />
            </FormField>
            {form.image && (
              <div className="flex justify-center">
                <img src={form.image} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-dark-500" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 bg-dark-700 border border-dark-500 text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors">
                {saving ? 'Saving...' : editMember ? 'Update' : 'Add Staff'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <Modal title="Delete Staff Member" onClose={() => setDeleteId(null)}>
          <p className="text-gray-300 text-sm mb-5">Are you sure you want to remove this staff member?</p>
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

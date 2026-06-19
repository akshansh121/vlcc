'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Eye, Trash2, Mail, MailOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../../../lib/api';
import toast from 'react-hot-toast';

const PAGE_SIZE = 15;

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

export default function ContactPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [viewQuery, setViewQuery] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE, ...(filter === 'unread' && { isRead: false }) };
      const res = await api.getQueries(params);
      const d = res.data;
      setQueries(d.data || d.queries || []);
      setTotal(d.total || d.count || 0);
      setUnreadTotal(d.unreadCount || 0);
    } catch {
      toast.error('Failed to load contact queries');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchQueries(); }, [fetchQueries]);

  const handleView = async (q) => {
    setViewQuery(q);
    if (!q.isRead) {
      try {
        await api.markQueryRead(q._id);
        setQueries((qs) => qs.map((x) => x._id === q._id ? { ...x, isRead: true } : x));
        setViewQuery((prev) => ({ ...prev, isRead: true }));
        setUnreadTotal((n) => Math.max(0, n - 1));
      } catch {}
    }
  };

  const handleMarkRead = async (q) => {
    setMarkingId(q._id);
    try {
      await api.markQueryRead(q._id);
      setQueries((qs) => qs.map((x) => x._id === q._id ? { ...x, isRead: !x.isRead } : x));
      if (!q.isRead) setUnreadTotal((n) => Math.max(0, n - 1));
      else setUnreadTotal((n) => n + 1);
      toast.success(`Marked as ${q.isRead ? 'unread' : 'read'}`);
    } catch {
      toast.error('Failed to update');
    } finally {
      setMarkingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteQuery(deleteId);
      toast.success('Query deleted');
      setDeleteId(null);
      if (viewQuery && viewQuery._id === deleteId) setViewQuery(null);
      fetchQueries();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">
            Contact Queries
            {unreadTotal > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {unreadTotal > 99 ? '99+' : unreadTotal}
              </span>
            )}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} total queries
            {unreadTotal > 0 && <span className="text-red-400 ml-2">• {unreadTotal} unread</span>}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-dark-800 border border-dark-600 rounded-xl p-1 w-fit">
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${filter === f ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white'}`}
          >
            {f}
            {f === 'unread' && unreadTotal > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {unreadTotal}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-dark-700/50">
              <tr>
                {['', 'Name', 'Email', 'Mobile', 'Message', 'Date', 'Actions'].map((h, i) => (
                  <th key={i} className="text-left text-gray-400 font-medium px-4 py-3 whitespace-nowrap first:pl-3">
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
              ) : queries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    {filter === 'unread' ? 'No unread queries' : 'No queries found'}
                  </td>
                </tr>
              ) : (
                queries.map((q) => (
                  <tr
                    key={q._id}
                    className={`hover:bg-dark-700/30 transition-colors cursor-pointer ${!q.isRead ? 'bg-dark-700/10' : ''}`}
                    onClick={() => handleView(q)}
                  >
                    <td className="pl-3 pr-1 py-3">
                      {q.isRead
                        ? <MailOpen size={15} className="text-gray-500" />
                        : <Mail size={15} className="text-gold-500" />
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`whitespace-nowrap ${!q.isRead ? 'text-white font-semibold' : 'text-gray-300'}`}>
                        {q.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{q.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{q.mobile || q.phone || 'N/A'}</td>
                    <td className="px-4 py-3 max-w-[280px]">
                      <span className={`truncate block text-sm ${!q.isRead ? 'text-gray-200' : 'text-gray-500'}`}>
                        {q.message || 'No message'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {q.createdAt
                        ? new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleView(q)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 transition-all"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleMarkRead(q)}
                          disabled={markingId === q._id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50"
                          title={q.isRead ? 'Mark as Unread' : 'Mark as Read'}
                        >
                          {q.isRead ? <Mail size={15} /> : <MailOpen size={15} />}
                        </button>
                        <button
                          onClick={() => setDeleteId(q._id)}
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

      {/* View Query Modal */}
      {viewQuery && (
        <Modal title="Contact Query" onClose={() => setViewQuery(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                viewQuery.isRead
                  ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  : 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
              }`}>
                {viewQuery.isRead ? <MailOpen size={12} /> : <Mail size={12} />}
                {viewQuery.isRead ? 'Read' : 'Unread'}
              </span>
              <span className="text-gray-500 text-xs">
                {viewQuery.createdAt ? new Date(viewQuery.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-0.5">Name</p>
                <p className="text-white text-sm font-medium">{viewQuery.name || 'N/A'}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-0.5">Mobile</p>
                <p className="text-white text-sm">{viewQuery.mobile || viewQuery.phone || 'N/A'}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3 col-span-2">
                <p className="text-gray-500 text-xs mb-0.5">Email</p>
                <p className="text-white text-sm">{viewQuery.email || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-dark-700 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-2">Message</p>
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{viewQuery.message || 'No message provided'}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleMarkRead(viewQuery)}
                disabled={markingId === viewQuery._id}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-dark-700 border border-dark-500 text-gray-300 hover:text-white hover:border-dark-400 transition-all disabled:opacity-50"
              >
                {viewQuery.isRead ? <Mail size={14} /> : <MailOpen size={14} />}
                {viewQuery.isRead ? 'Mark as Unread' : 'Mark as Read'}
              </button>
              {viewQuery.email && (
                <a
                  href={`mailto:${viewQuery.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-gold-500 hover:bg-gold-600 text-dark-900 transition-all"
                >
                  Reply via Email
                </a>
              )}
            </div>
            <button
              onClick={() => { setDeleteId(viewQuery._id); setViewQuery(null); }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={14} />
              Delete Query
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <Modal title="Delete Query" onClose={() => setDeleteId(null)}>
          <p className="text-gray-300 text-sm mb-5">Are you sure you want to delete this contact query?</p>
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

import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  loading = false,
}) {
  const variantMap = {
    danger: {
      icon: 'text-red-400',
      confirm: 'bg-red-600 hover:bg-red-500 text-white',
    },
    warning: {
      icon: 'text-yellow-400',
      confirm: 'bg-yellow-500 hover:bg-yellow-400 text-black',
    },
    info: {
      icon: 'text-blue-400',
      confirm: 'bg-blue-600 hover:bg-blue-500 text-white',
    },
  };
  const v = variantMap[variant] || variantMap.danger;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center gap-5">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
          <AlertTriangle size={28} className={v.icon} />
        </div>

        {/* Message */}
        <p className="text-gray-300 text-sm leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors duration-150 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${v.confirm}`}
          >
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

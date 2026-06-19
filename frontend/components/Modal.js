import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              className={`relative bg-gray-900 border border-gray-700 rounded-2xl w-full ${maxWidth} shadow-2xl shadow-black/50 flex flex-col max-h-[90vh]`}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
                  <h2 className="text-white font-bold text-xl">{title}</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg p-1.5 transition-colors duration-150"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Close button when no title */}
              {!title && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg p-1.5 transition-colors duration-150 z-10"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              )}

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

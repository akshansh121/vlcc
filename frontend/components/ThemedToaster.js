'use client';

import { Toaster } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const LIGHT = {
  base: {
    background: 'rgba(255,255,255,0.9)',
    color: '#4c0519',
    border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: '12px',
    fontSize: '14px',
    padding: '12px 16px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(244,63,94,0.08)',
  },
  success: { primary: '#f43f5e', secondary: '#fff1f2', border: '1px solid #fecdd3' },
  error: { primary: '#ef4444', secondary: '#fff1f2', border: '1px solid #fca5a5' },
  loading: { primary: '#f43f5e', secondary: '#fff1f2' },
};

const DARK = {
  base: {
    background: '#111111',
    color: '#ffffff',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    fontSize: '14px',
    padding: '12px 16px',
    backdropFilter: 'none',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  success: { primary: '#D4AF37', secondary: '#0a0a0a', border: '1px solid #2a2a2a' },
  error: { primary: '#ef4444', secondary: '#0a0a0a', border: '1px solid #2a2a2a' },
  loading: { primary: '#D4AF37', secondary: '#0a0a0a' },
};

export default function ThemedToaster() {
  const { theme } = useTheme();
  const t = theme === 'dark' ? DARK : LIGHT;

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: t.base,
        success: {
          iconTheme: { primary: t.success.primary, secondary: t.success.secondary },
          style: { ...t.base, border: t.success.border },
        },
        error: {
          iconTheme: { primary: t.error.primary, secondary: t.error.secondary },
          style: { ...t.base, border: t.error.border },
        },
        loading: {
          iconTheme: { primary: t.loading.primary, secondary: t.loading.secondary },
        },
      }}
    />
  );
}

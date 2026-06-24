import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { Toaster } from 'react-hot-toast';
import GoogleAuthWrapper from '../components/GoogleAuthWrapper';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Beauty World | Luxury Salon',
  description:
    'Premium beauty parlour booking — discover world-class hair, skin, and wellness treatments tailored just for you.',
  keywords: ['beauty parlour', 'luxury salon', 'booking', 'hair care', 'skin care', 'Beauty World'],
  authors: [{ name: 'Beauty World' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Beauty World',
  },
  openGraph: {
    title: 'Beauty World | Luxury Salon',
    description: 'Premium beauty parlour booking',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <GoogleAuthWrapper>
        <AuthProvider>
          <CartProvider>
                {children}

            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(255,255,255,0.9)',
                  color: '#4c0519',
                  border: '1px solid rgba(255,255,255,0.6)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  padding: '12px 16px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 32px rgba(244,63,94,0.08)',
                },
                success: {
                  iconTheme: {
                    primary: '#f43f5e',
                    secondary: '#fff1f2',
                  },
                  style: {
                    background: 'rgba(255,255,255,0.9)',
                    color: '#4c0519',
                    border: '1px solid #fecdd3',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff1f2',
                  },
                  style: {
                    background: 'rgba(255,255,255,0.9)',
                    color: '#4c0519',
                    border: '1px solid #fca5a5',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#f43f5e',
                    secondary: '#fff1f2',
                  },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
        </GoogleAuthWrapper>
      </body>
    </html>
  );
}

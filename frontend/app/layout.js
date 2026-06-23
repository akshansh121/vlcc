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
  openGraph: {
    title: 'Beauty World | Luxury Salon',
    description: 'Premium beauty parlour booking',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
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
                  background: '#111111',
                  color: '#ffffff',
                  border: '1px solid #2a2a2a',
                  borderRadius: '4px',
                  fontSize: '14px',
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: {
                    primary: '#D4AF37',
                    secondary: '#111111',
                  },
                  style: {
                    background: '#111111',
                    color: '#ffffff',
                    border: '1px solid #D4AF37',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#111111',
                  },
                  style: {
                    background: '#111111',
                    color: '#ffffff',
                    border: '1px solid #ef4444',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#D4AF37',
                    secondary: '#111111',
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

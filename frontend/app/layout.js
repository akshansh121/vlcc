import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import ThemedToaster from '../components/ThemedToaster';
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
      <head>
        {/* Anti-flash: set dark class before first paint */}
        <script dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}`
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
        <GoogleAuthWrapper>
        <AuthProvider>
          <CartProvider>
                {children}
            <ThemedToaster />
          </CartProvider>
        </AuthProvider>
        </GoogleAuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Scissors,
  Package,
  Users,
  CalendarCheck,
  Tag,
  Star,
  UserCircle,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/services', label: 'Services', icon: Scissors },
  { href: '/admin/packages', label: 'Packages', icon: Package },
  { href: '/admin/staff', label: 'Staff', icon: Users },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/offers', label: 'Offers', icon: Tag },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/customers', label: 'Customers', icon: UserCircle },
  { href: '/admin/contact', label: 'Contact Queries', icon: MessageSquare },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }
      if (user && !['admin', 'super_admin'].includes(user.role)) {
        router.push('/');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://api.sunderdikho.com/api'}/contact?isRead=false&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || data.total || 0);
        }
      } catch {}
    };
    if (isAuthenticated && ['admin', 'super_admin'].includes(user?.role)) fetchUnread();
  }, [isAuthenticated, user, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !['admin', 'super_admin'].includes(user?.role)) return null;

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-dark-800 border-r border-dark-600 z-30 flex flex-col transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-600">
          <div>
            <div className="text-gold-500 font-display text-lg font-semibold leading-tight">
              Beauty World
            </div>
            <div className="text-dark-500 text-xs mt-0.5 uppercase tracking-widest">
              Admin Panel
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-dark-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              const isContact = href === '/admin/contact';
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative
                      ${active
                        ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                        : 'text-gray-400 hover:bg-dark-700 hover:text-white border border-transparent'
                      }`}
                  >
                    <Icon
                      size={18}
                      className={active ? 'text-gold-500' : 'text-gray-500 group-hover:text-gray-300'}
                    />
                    <span className="flex-1">{label}</span>
                    {isContact && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    {active && <ChevronRight size={14} className="text-gold-500" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info + Logout */}
        <div className="border-t border-dark-600 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
              <span className="text-gold-500 text-sm font-semibold uppercase">
                {user?.name?.[0] || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-dark-500 text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen lg:ml-0">
        {/* Top header */}
        <header className="bg-dark-800 border-b border-dark-600 px-4 lg:px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-base font-semibold">
              {navItems.find((n) => isActive(n.href))?.label || 'Admin'}
            </h1>
            <p className="text-dark-500 text-xs mt-0.5">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <span>Welcome,</span>
              <span className="text-gold-500 font-medium">{user?.name?.split(' ')[0] || 'Admin'}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

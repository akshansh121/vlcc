'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Users, CalendarCheck, IndianRupee, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import * as api from '../../lib/api';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#D4AF37', '#c49b2a', '#a67c20', '#7d5d17', '#5c420f', '#f0d050'];

const normalizeDashboard = (raw = {}) => {
  const stats = raw.stats || {
    totalUsers: raw.total_users || 0,
    totalBookings: raw.total_bookings || 0,
    totalRevenue: raw.total_revenue || 0,
    todaysBookings: raw.today_bookings || 0,
    thisMonthRevenue: raw.this_month_revenue || 0,
  };

  return {
    stats,
    monthlyRevenue: (raw.monthlyRevenue || raw.monthly_revenue || []).map((item) => ({
      ...item,
      revenue: Number(item.revenue || 0),
      bookingsCount: Number(item.bookingsCount || item.bookings_count || 0),
    })),
    popularServices: (raw.popularServices || raw.popular_services || []).map((item) => ({
      ...item,
      name: item.name || item.service_name || 'Service',
      count: Number(item.count || item.booking_count || item.total_quantity || 0),
    })),
    recentBookings: (raw.recentBookings || raw.recent_bookings || []).map((booking) => ({
      ...booking,
      _id: booking._id || booking.id,
      customerName: booking.customerName || booking.user_name,
      totalAmount: Number(booking.totalAmount || booking.final_amount || 0),
      date: booking.date || booking.booking_date || booking.created_at,
    })),
  };
};

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className={`bg-dark-800 border border-dark-600 rounded-xl p-5 flex items-start gap-4`}>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-white text-2xl font-semibold mt-0.5 truncate">{value}</p>
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm">
        <p className="text-gray-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.name === 'Revenue' ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      setData(normalizeDashboard(res.data.data || res.data));
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-dark-800 border border-dark-600 rounded-xl h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-800 border border-dark-600 rounded-xl h-72" />
          <div className="bg-dark-800 border border-dark-600 rounded-xl h-72" />
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl h-64" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const monthlyRevenue = data?.monthlyRevenue || [];
  const popularServices = data?.popularServices || [];
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm mt-0.5">Track your beauty parlour performance</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm text-gray-300 hover:text-white hover:border-gold-500/50 transition-all"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={(stats.totalUsers || 0).toLocaleString('en-IN')}
          icon={Users}
          color="bg-blue-600"
          subtitle="Registered customers"
        />
        <StatCard
          title="Total Bookings"
          value={(stats.totalBookings || 0).toLocaleString('en-IN')}
          icon={CalendarCheck}
          color="bg-emerald-600"
          subtitle="All time"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="bg-gold-600"
          subtitle="Completed bookings"
        />
        <StatCard
          title="Today's Bookings"
          value={(stats.todaysBookings || 0).toLocaleString('en-IN')}
          icon={Clock}
          color="bg-purple-600"
          subtitle={new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-gold-500" />
            <h3 className="text-white font-medium">Monthly Revenue</h3>
            <span className="text-gray-500 text-xs ml-auto">Last 12 months</span>
          </div>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={{ stroke: '#2a2a2a' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">
              No revenue data available
            </div>
          )}
        </div>

        {/* Popular Services */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-gold-500" />
            <h3 className="text-white font-medium">Popular Services</h3>
          </div>
          {popularServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={popularServices}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="name"
                >
                  {popularServices.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">
              No service data available
            </div>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <CalendarCheck size={18} className="text-gold-500" />
            Recent Bookings
          </h3>
          <a href="/admin/bookings" className="text-gold-500 text-sm hover:text-gold-400 transition-colors">
            View all
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                {['Customer', 'Services', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left text-gray-500 font-medium pb-3 pr-4 last:pr-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {recentBookings.length > 0 ? (
                recentBookings.slice(0, 5).map((b) => (
                  <tr key={b._id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="py-3 pr-4 text-white font-medium whitespace-nowrap">
                      {b.user?.name || b.customerName || 'N/A'}
                    </td>
                    <td className="py-3 pr-4 text-gray-400 max-w-[200px]">
                      <span className="truncate block">
                        {Array.isArray(b.services)
                          ? b.services.map((s) => s.name || s.service?.name || 'Service').join(', ')
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gold-500 font-medium whitespace-nowrap">
                      ₹{(b.totalAmount || b.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${b.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                          ${b.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
                          ${b.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : ''}
                          ${b.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                        `}
                      >
                        {b.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 whitespace-nowrap">
                      {b.date || b.createdAt
                        ? new Date(b.date || b.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No recent bookings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

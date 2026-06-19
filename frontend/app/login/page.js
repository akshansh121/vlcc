'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Sparkles, Mail, Lock, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

// ── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'user', label: 'Customer Login', icon: Mail },
  { id: 'admin', label: 'Admin Login', icon: ShieldCheck },
];

// ── Reusable input wrapper ────────────────────────────────────────────────────
function FormField({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest">
        {label}
      </label>
      {children}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-xs"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Password input with show/hide toggle ─────────────────────────────────────
function PasswordInput({ registration, error, placeholder = 'Enter your password' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className={`input-dark pl-10 pr-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        {...registration}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── User Login Form ───────────────────────────────────────────────────────────
function UserLoginForm({ onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { login, googleLogin } = useAuth();

  const onSubmit = async (data) => {
    try {
      const user = await login({ email: data.email, password: data.password });
      toast.success(`Welcome back, ${user?.name?.split(' ')[0] || 'there'}!`);
      onSuccess(user);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Invalid email or password. Please try again.';
      toast.error(msg);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const user = await googleLogin(credentialResponse.credential);
      toast.success(`Welcome, ${user?.name?.split(' ')[0] || 'there'}!`);
      onSuccess(user);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Google sign-in failed. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-5">
      {/* Google Sign-In */}
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-2">
          Quick Sign In
        </p>
        <div className="flex justify-center w-full [&>div]:w-full [&>div>div]:w-full [&>div>div>iframe]:w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google sign-in failed. Please try again.')}
            theme="filled_black"
            shape="rectangular"
            size="large"
            text="signin_with"
            width="400"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-600" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-dark-800 px-3 text-gray-500 text-xs">or sign in with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Email */}
        <FormField label="Email Address" error={errors.email?.message}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="email"
              placeholder="you@example.com"
              className={`input-dark pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />
          </div>
        </FormField>

        {/* Password */}
        <FormField label="Password" error={errors.password?.message}>
          <PasswordInput
            registration={register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
            error={errors.password}
          />
        </FormField>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-gold-500 hover:text-gold-400 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-gold w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
}

// ── Admin Login Form ──────────────────────────────────────────────────────────
function AdminLoginForm({ onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { adminLogin } = useAuth();

  const onSubmit = async (data) => {
    try {
      const user = await adminLogin({ email: data.email, password: data.password });
      toast.success(`Welcome, Admin ${user?.name?.split(' ')[0] || ''}!`);
      onSuccess(user, true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Admin credentials are invalid. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Admin notice */}
      <div className="flex items-start gap-3 bg-gold-500/5 border border-gold-500/20 rounded-lg p-3">
        <ShieldCheck className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
        <p className="text-gold-400 text-xs leading-relaxed">
          This area is restricted to authorized administrators only. Unauthorized access attempts
          are logged.
        </p>
      </div>

      {/* Email */}
      <FormField label="Admin Email" error={errors.email?.message}>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="email"
            placeholder="abc@gmail.com"
            className={`input-dark pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
        </div>
      </FormField>

      {/* Password */}
      <FormField label="Admin Password" error={errors.password?.message}>
        <PasswordInput
          registration={register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
          error={errors.password}
          placeholder="Enter admin password"
        />
      </FormField>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full justify-center inline-flex items-center gap-2 bg-dark-700 hover:bg-dark-600 border border-gold-500/40 hover:border-gold-500 text-gold-400 hover:text-gold-300 font-semibold px-6 py-3 rounded-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            Admin Sign In
          </>
        )}
      </button>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('user');
  const router = useRouter();

  const handleSuccess = (user, isAdmin = false) => {
    if (isAdmin || ['admin', 'super_admin'].includes(user?.role)) {
      router.push('/admin/customers');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4 py-12">

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gold-500/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-gold-500/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <Sparkles className="w-7 h-7 text-gold-500 group-hover:scale-110 transition-transform" />
            <span className="font-display text-2xl font-bold text-gold-500 tracking-wide">
              Beauty World
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white text-center">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm mt-1 text-center">
            Sign in to access your account
          </p>
        </div>

        {/* Panel */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-2xl">

          {/* Tab switcher */}
          <div className="flex border-b border-dark-600">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-200 relative ${
                    activeTab === tab.id
                      ? 'text-gold-500 bg-dark-700'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Form area */}
          <div className="p-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'user' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'user' ? 20 : -20 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {activeTab === 'user' ? (
                  <UserLoginForm onSuccess={handleSuccess} />
                ) : (
                  <AdminLoginForm onSuccess={handleSuccess} />
                )}
              </motion.div>
            </AnimatePresence>

            {activeTab === 'user' && (
              <>
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dark-600" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-dark-800 px-3 text-gray-500 text-xs">
                      New to Beauty World?
                    </span>
                  </div>
                </div>

                {/* Register link */}
                <Link
                  href="/register"
                  className="flex items-center justify-center w-full border border-dark-500 hover:border-gold-500/50 text-gray-300 hover:text-white rounded-sm py-2.5 text-sm font-medium transition-all duration-200 hover:bg-dark-700"
                >
                  Create an Account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6 text-gray-500 text-xs">
          <Link href="/" className="hover:text-gold-500 transition-colors">
            Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

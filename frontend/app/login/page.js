'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Sparkles, Mail, Lock } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

// ── Google Icon SVG ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ── Custom Google Login Button ────────────────────────────────────────────────
function GoogleLoginButton({ onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await onSuccess({ access_token: tokenResponse.access_token });
      } catch (err) {
        onError(err);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setLoading(false);
      onError(new Error('Google sign-in was cancelled'));
    },
  });

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => { setLoading(true); login(); }}
      className="w-full flex items-center justify-center gap-3 bg-white/70 hover:bg-white/90 border border-rose-200 hover:border-rose-300 text-rose-800 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span className="group-hover:text-white transition-colors">
        {loading ? 'Signing in...' : 'Continue with Google'}
      </span>
    </button>
  );
}

// ── Reusable input wrapper ────────────────────────────────────────────────────
function FormField({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-rose-700 text-xs font-bold uppercase tracking-[0.15em]">
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
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className={`input-dark pl-10 pr-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        {...registration}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }) {
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

  const handleGoogleSuccess = async ({ access_token }) => {
    try {
      const user = await googleLogin({ access_token });
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
      <GoogleLoginButton
        onSuccess={handleGoogleSuccess}
        onError={() => toast.error('Google sign-in failed. Please try again.')}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-rose-200/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white/70 backdrop-blur-sm px-3 text-rose-500 text-xs rounded">or sign in with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Email */}
        <FormField label="Email Address" error={errors.email?.message}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
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
            className="text-xs text-rose-500 hover:text-rose-700 transition-colors"
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
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = (user) => {
    if (['admin', 'super_admin'].includes(user?.role)) {
      router.replace('/admin/customers');
    } else {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      router.replace(redirect && redirect.startsWith('/') ? redirect : '/');
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-4 py-12">

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-rose-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-fuchsia-400/15 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <div className="rounded-full bg-rose-500/10 p-2 border border-rose-500/20 group-hover:bg-rose-500/20 transition-all">
              <Sparkles className="w-5 h-5 text-rose-600" />
            </div>
            <span className="font-serif text-2xl font-bold text-rose-950 tracking-wide group-hover:text-rose-600 transition-colors">
              Beauty World
            </span>
          </Link>
          <h1 className="font-serif text-3xl font-light text-rose-950 text-center">Welcome Back</h1>
          <p className="text-rose-700 text-sm mt-1 text-center">Sign in to access your account</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl shadow-rose-500/5 p-7">
          <LoginForm onSuccess={handleSuccess} />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-rose-200/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/70 backdrop-blur-sm px-3 text-rose-500 text-xs rounded">New to Beauty World?</span>
            </div>
          </div>

          {/* Register link */}
          <Link
            href="/register"
            className="flex items-center justify-center w-full border border-rose-200 hover:border-rose-400 text-rose-700 hover:text-rose-950 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/60"
          >
            Create an Account
          </Link>
        </div>

        <p className="text-center mt-6 text-rose-500 text-xs">
          <Link href="/" className="hover:text-rose-950 transition-colors">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

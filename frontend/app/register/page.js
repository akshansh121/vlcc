'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  Sparkles,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  Circle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../lib/api';

// ── Password strength helpers ─────────────────────────────────────────────────
const STRENGTH_RULES = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'Number', test: (v) => /\d/.test(v) },
  { label: 'Special character', test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

const STRENGTH_LEVELS = [
  { label: 'Too Weak', color: 'bg-red-500', textColor: 'text-red-400', min: 0 },
  { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-400', min: 1 },
  { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-400', min: 2 },
  { label: 'Good', color: 'bg-lime-500', textColor: 'text-lime-400', min: 3 },
  { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-400', min: 4 },
  { label: 'Very Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400', min: 5 },
];

function getStrength(password) {
  if (!password) return { score: 0, passed: [] };
  const passed = STRENGTH_RULES.filter((r) => r.test(password));
  return { score: passed.length, passed };
}

function PasswordStrengthIndicator({ password }) {
  const { score, passed } = useMemo(() => getStrength(password || ''), [password]);
  const level = STRENGTH_LEVELS[Math.min(score, STRENGTH_LEVELS.length - 1)];
  if (!password) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 space-y-2"
    >
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < score ? level.color : 'bg-rose-100'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold ${level.textColor} min-w-[72px] text-right`}>
          {level.label}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {STRENGTH_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-1.5">
              {ok ? (
                <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
              ) : (
                <Circle className="w-3 h-3 text-rose-300 flex-shrink-0" />
              )}
              <span className={`text-[11px] ${ok ? 'text-green-500' : 'text-rose-400'}`}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function FormField({ label, required, error, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-rose-700 text-xs font-bold uppercase tracking-[0.15em]">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-rose-500 text-[11px]">{hint}</p>}
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

// ── OTP Verification Step ─────────────────────────────────────────────────────
function OtpStep({ email, formData, onBack, onSuccess }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const { register: authRegister } = useAuth();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const updated = [...otp];
    text.split('').forEach((ch, i) => { updated[i] = ch; });
    setOtp(updated);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
    e.preventDefault();
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.sendRegistrationOtp({ email });
      toast.success('New OTP sent! Check your inbox.');
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return toast.error('Please enter the full 6-digit OTP');
    setLoading(true);
    try {
      const user = await authRegister({ ...formData, otp: code });
      toast.success(`Account created! Welcome, ${user?.name?.split(' ')[0] || 'there'}!`);
      onSuccess();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        'Verification failed. Please try again.';
      toast.error(msg);
      if (msg.includes('expired') || msg.includes('Invalid')) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="otp"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold text-rose-950 mb-1">Verify your email</h2>
        <p className="text-rose-700 text-sm">
          We sent a 6-digit code to{' '}
          <span className="text-rose-500 font-medium">{email}</span>
          . Enter it below to activate your account.
        </p>
      </div>

      {/* OTP inputs */}
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-11 h-13 text-center text-xl font-bold rounded-lg border bg-white/70 text-rose-950 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 ${
              digit ? 'border-rose-500 text-rose-600' : 'border-rose-200'
            }`}
            style={{ height: '52px' }}
          />
        ))}
      </div>

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={loading || otp.join('').length < 6}
        className="btn-gold w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify & Create Account'
        )}
      </button>

      {/* Resend */}
      <div className="text-center">
        {resendCooldown > 0 ? (
          <p className="text-rose-600 text-sm">
            Resend OTP in{' '}
            <span className="text-rose-500 font-semibold tabular-nums">{resendCooldown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-1.5 mx-auto text-rose-500 hover:text-rose-700 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Sending…' : 'Resend OTP'}
          </button>
        )}
      </div>

      {/* Back */}
      <button
        onClick={onBack}
        className="w-full text-center text-rose-500 hover:text-rose-700 text-sm transition-colors"
      >
        ← Back to registration form
      </button>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [pendingData, setPendingData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  // Make browser back button step back within the page instead of leaving the app.
  useEffect(() => {
    window.history.replaceState({ regStep: 'form' }, '');
    const handlePop = (e) => {
      const s = e.state?.regStep;
      if (s === 'form' || s === 'otp') setStep(s);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' });

  const watchedPassword = useWatch({ control, name: 'password', defaultValue: '' });

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        mobile: data.mobile.trim(),
        password: data.password,
      };
      await api.sendRegistrationOtp({ email: payload.email });
      toast.success('OTP sent! Check your inbox.');
      setPendingData(payload);
      window.history.pushState({ regStep: 'otp' }, '');
      setStep('otp');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to send OTP. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-4 py-12">

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
          <h1 className="font-serif text-3xl font-light text-rose-950 text-center">
            Create Account
          </h1>
          <p className="text-rose-700 text-sm mt-1 text-center">
            {step === 'otp'
              ? 'Verify your email to complete sign-up'
              : 'Join Beauty World and elevate your beauty experience'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl shadow-rose-500/5">
          <div className="p-7">
            <AnimatePresence mode="wait">
              {step === 'otp' ? (
                <OtpStep
                  key="otp"
                  email={pendingData?.email}
                  formData={pendingData}
                  onBack={() => window.history.back()}
                  onSuccess={() => router.push('/')}
                />
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                    {/* Full Name */}
                    <FormField label="Full Name" required error={errors.fullName?.message}>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Your full name"
                          className={`input-dark pl-10 ${errors.fullName ? 'border-red-500 focus:border-red-500' : ''}`}
                          {...register('fullName', {
                            required: 'Full name is required',
                            minLength: { value: 2, message: 'Name must be at least 2 characters' },
                            maxLength: { value: 60, message: 'Name must be under 60 characters' },
                            pattern: {
                              value: /^[a-zA-Z\s'-]+$/,
                              message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
                            },
                          })}
                        />
                      </div>
                    </FormField>

                    {/* Email */}
                    <FormField label="Email Address" required error={errors.email?.message}>
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

                    {/* Mobile */}
                    <FormField
                      label="Mobile Number"
                      required
                      error={errors.mobile?.message}
                      hint="We'll use this to confirm your bookings"
                    >
                      <div className="flex">
                        <div className="flex items-center gap-1.5 bg-white/60 border border-rose-200 border-r-0 rounded-l-xl px-3 py-3 flex-shrink-0">
                          <span className="text-sm text-rose-700 font-medium">+91</span>
                        </div>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                          <input
                            type="tel"
                            placeholder="98765 43210"
                            maxLength={10}
                            className={`input-dark pl-10 rounded-l-none border-l-0 ${
                              errors.mobile ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                            {...register('mobile', {
                              required: 'Mobile number is required',
                              pattern: {
                                value: /^[6-9]\d{9}$/,
                                message: 'Enter a valid 10-digit Indian mobile number',
                              },
                            })}
                          />
                        </div>
                      </div>
                    </FormField>

                    {/* Password */}
                    <FormField label="Password" required error={errors.password?.message}>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          className={`input-dark pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                          {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {watchedPassword && (
                          <PasswordStrengthIndicator password={watchedPassword} />
                        )}
                      </AnimatePresence>
                    </FormField>

                    {/* Confirm Password */}
                    <FormField label="Confirm Password" required error={errors.confirmPassword?.message}>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Repeat your password"
                          className={`input-dark pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                          {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) =>
                              value === watchedPassword || 'Passwords do not match',
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 transition-colors"
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormField>

                    {/* Terms */}
                    <FormField label="" error={errors.terms?.message}>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            {...register('terms', {
                              required: 'You must accept the Terms & Conditions to continue',
                            })}
                          />
                          <div className="w-5 h-5 border border-rose-300 rounded peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-all duration-200 flex items-center justify-center group-hover:border-rose-400">
                            <svg
                              className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                              fill="none"
                              viewBox="0 0 12 12"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-rose-700 text-sm leading-relaxed">
                          I agree to the{' '}
                          <Link href="/terms" className="text-rose-500 hover:text-rose-700 transition-colors">
                            Terms &amp; Conditions
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-rose-500 hover:text-rose-700 transition-colors">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                    </FormField>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        'Continue with Email Verification'
                      )}
                    </button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-rose-200/60" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white/70 backdrop-blur-sm px-3 text-rose-500 text-xs rounded">
                        Already have an account?
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/login"
                    className="flex items-center justify-center w-full border border-rose-200 hover:border-rose-400 text-rose-700 hover:text-rose-950 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/60"
                  >
                    Sign In Instead
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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

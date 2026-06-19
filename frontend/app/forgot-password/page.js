'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, Sparkles, ArrowLeft, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import * as api from '../../lib/api';

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ['Email', 'Verify OTP', 'New Password'];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                done ? 'bg-gold-500 border-gold-500 text-dark-900'
                  : active ? 'border-gold-500 text-gold-500'
                  : 'border-dark-500 text-gray-600'
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : idx}
              </div>
              <span className={`text-xs hidden sm:block ${active ? 'text-gold-400' : done ? 'text-gold-600' : 'text-gray-600'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-10 sm:w-16 h-px mb-4 ${idx < current ? 'bg-gold-500' : 'bg-dark-600'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Enter email ───────────────────────────────────────────────────────
function StepEmail({ onNext }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await api.forgotPassword({ email });
      toast.success('OTP sent! Check your inbox.');
      onNext(email);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="text-xl font-bold text-white mb-1">Forgot your password?</h2>
      <p className="text-gray-400 text-sm mb-6">
        Enter your email and we'll send you a 6-digit OTP to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input-dark pl-10 w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              Sending OTP...
            </>
          ) : (
            'Send OTP'
          )}
        </button>
      </form>
    </motion.div>
  );
}

// ── Step 2: Enter OTP ─────────────────────────────────────────────────────────
function StepOtp({ email, onNext, onResend }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length < 6) return toast.error('Enter the complete 6-digit OTP');
    setLoading(true);
    try {
      const { data } = await api.verifyOtp({ email, otp: otpStr });
      toast.success('OTP verified!');
      onNext(data.data.resetToken);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.forgotPassword({ email });
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      inputs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="text-xl font-bold text-white mb-1">Enter your OTP</h2>
      <p className="text-gray-400 text-sm mb-1">
        We sent a 6-digit code to
      </p>
      <p className="text-gold-400 text-sm font-medium mb-6">{email}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP boxes */}
        <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`w-11 h-14 text-center text-2xl font-bold rounded-lg border-2 bg-dark-700 text-white outline-none transition-all ${
                digit
                  ? 'border-gold-500 text-gold-400'
                  : 'border-dark-500 focus:border-gold-500/70'
              }`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join('').length < 6}
          className="btn-gold w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>
      </form>

      {/* Resend */}
      <div className="mt-5 text-center">
        {countdown > 0 ? (
          <p className="text-gray-500 text-sm">
            Resend OTP in <span className="text-gold-500 font-medium">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1.5 text-gold-500 hover:text-gold-400 text-sm font-medium transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Step 3: New password ──────────────────────────────────────────────────────
function StepPassword({ resetToken, onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.resetPassword({ resetToken, newPassword: password });
      toast.success('Password reset successfully!');
      onDone();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="text-xl font-bold text-white mb-1">Set new password</h2>
      <p className="text-gray-400 text-sm mb-6">
        Choose a strong password with at least 6 characters.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New password */}
        <div className="space-y-1.5">
          <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              className="input-dark pl-10 pr-10 w-full"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Strength bar */}
          {password && (
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4].map((lvl) => {
                const strength = password.length >= 12 ? 4 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1;
                return (
                  <div key={lvl} className={`h-1 flex-1 rounded-full transition-colors ${
                    lvl <= strength
                      ? strength <= 1 ? 'bg-red-500' : strength <= 2 ? 'bg-amber-500' : strength <= 3 ? 'bg-yellow-400' : 'bg-green-500'
                      : 'bg-dark-500'
                  }`} />
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              required
              className={`input-dark pl-10 pr-10 w-full ${
                confirm && confirm !== password ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirm && confirm !== password && (
            <p className="text-red-400 text-xs">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className="btn-gold w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </motion.div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.push('/login'), 3000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-green-900/40 border-2 border-green-500 flex items-center justify-center mx-auto mb-4"
      >
        <CheckCircle2 className="w-8 h-8 text-green-400" />
      </motion.div>
      <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
      <p className="text-gray-400 text-sm mb-1">Your password has been updated successfully.</p>
      <p className="text-gray-500 text-xs">Redirecting to login...</p>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gold-500/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-gold-500/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
          <h1 className="font-display text-2xl font-bold text-white text-center">
            Reset Password
          </h1>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl p-7">
          {!done && <Steps current={step} />}

          <AnimatePresence mode="wait">
            {done ? (
              <SuccessScreen key="success" />
            ) : step === 1 ? (
              <StepEmail
                key="step1"
                onNext={(e) => { setEmail(e); setStep(2); }}
              />
            ) : step === 2 ? (
              <StepOtp
                key="step2"
                email={email}
                onNext={(token) => { setResetToken(token); setStep(3); }}
              />
            ) : (
              <StepPassword
                key="step3"
                resetToken={resetToken}
                onDone={() => setDone(true)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Back to login */}
        {!done && (
          <div className="text-center mt-5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gold-500 text-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

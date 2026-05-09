'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, FileText, ArrowRight, Github, Chrome,
  Loader2, Check, X, User, Mail, Lock,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // ← added for backend auth

/* ─── Animated background ───────────────────────────────────────────── */
function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0" style={{ background: 'var(--bg)' }} />
      <div
        className="absolute rounded-full blur-3xl opacity-25 animate-pulse-slow"
        style={{ width: 700, height: 700, top: '-20%', right: '-15%', background: 'radial-gradient(circle, #6550e8, transparent 70%)', animationDuration: '9s' }}
      />
      <div
        className="absolute rounded-full blur-3xl opacity-15 animate-pulse-slow"
        style={{ width: 450, height: 450, bottom: '-10%', left: '-10%', background: 'radial-gradient(circle, #7c3aed, transparent 70%)', animationDuration: '12s', animationDelay: '-5s' }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}

/* ─── Password strength ─────────────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /\d/.test(password) },
    { label: 'One special character', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#eab308', '#3b82f6', '#22c55e'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : 'var(--border)' }}
          />
        ))}
      </div>
      <p className="text-[11px] font-medium" style={{ color: colors[score] }}>
        {labels[score]}
      </p>
      {/* Rules */}
      <div className="grid grid-cols-2 gap-1">
        {checks.map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-1.5">
            {ok
              ? <Check className="w-3 h-3 shrink-0" style={{ color: '#22c55e' }} />
              : <X className="w-3 h-3 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            }
            <span className="text-[10px]" style={{ color: ok ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Input with icon ───────────────────────────────────────────────── */
function Field({
  label, icon: Icon, type = 'text', value, onChange, placeholder, error, suffix, hint,
}: {
  label: string; icon: any; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  error?: string; suffix?: React.ReactNode; hint?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </label>
      <div
        className="flex items-center border-2 rounded-xl overflow-hidden transition-all duration-200"
        style={{
          borderColor: error ? 'var(--text-danger)' : focused ? 'var(--brand)' : 'var(--border)',
          background: 'var(--surface)',
          boxShadow: focused ? '0 0 0 4px rgba(101,80,232,0.12)' : 'none',
        }}
      >
        <div className="pl-4 pr-2 flex items-center">
          <Icon className="w-4 h-4" style={{ color: focused ? 'var(--brand)' : 'var(--text-tertiary)' }} />
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 px-2 py-3 text-sm bg-transparent outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        {suffix && <div className="pr-3">{suffix}</div>}
      </div>
      {error && <p className="text-xs" style={{ color: 'var(--text-danger)' }}>{error}</p>}
      {hint}
    </div>
  );
}

/* ─── Step indicator ────────────────────────────────────────────────── */
function Steps({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
            style={{
              background: s <= current ? 'var(--brand)' : 'var(--border)',
              color: s <= current ? 'white' : 'var(--text-tertiary)',
            }}
          >
            {s < current ? <Check className="w-3.5 h-3.5" /> : s}
          </div>
          <span
            className="text-xs font-medium hidden sm:block"
            style={{ color: s === current ? 'var(--brand)' : 'var(--text-tertiary)' }}
          >
            {s === 1 ? 'Your info' : 'Password'}
          </span>
          {s < 2 && <div className="w-8 h-px" style={{ background: s < current ? 'var(--brand)' : 'var(--border)' }} />}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Signup Page ──────────────────────────────────────────────── */
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL; // ← added for backend call

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'At least 8 characters required';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    if (!agreed) e.agreed = 'You must agree to the terms';
    return e;
  };

  const nextStep = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  // ── MODIFIED: real signup with Supabase & backend ─────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      // 1. Sign up with Supabase (name stored in user metadata)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (error) {
        setErrors({ general: error.message });
        setLoading(false);
        return;
      }

      // After signup, if email confirmation is disabled, a session is returned.
      // We need a token for the backend call; if session exists use it, otherwise sign in manually.
      let token: string | null = data.session?.access_token ?? null;
      if (!token) {
        // Email confirmation might be required; we try to sign in directly
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError || !signInData.session) {
          setErrors({ general: 'Account created but auto sign-in failed. Please confirm your email and log in.' });
          setLoading(false);
          return;
        }
        token = signInData.session.access_token;
      }

      // 2. Call backend to finish registration / fetch user
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setErrors({ general: 'Backend registration failed' });
        setLoading(false);
        return;
      }

      const user = await res.json();
      console.log('USER:', user);

      // 3. Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setErrors({ general: 'Unexpected error occurred' });
    }

    setLoading(false);
  };

  return (
    <>
      <AuthBackground />

      <style>{`
        @keyframes pulse-slow { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:.35;transform:scale(1.05)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slide-left  { from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slide-right-in { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:translateX(0)} }
        .animate-pulse-slow { animation: pulse-slow ease-in-out infinite; }
        .anim-0 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 0ms   both; }
        .anim-1 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 80ms  both; }
        .anim-2 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 160ms both; }
        .anim-3 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 240ms both; }
        .anim-4 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 320ms both; }
        .anim-5 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 400ms both; }
        .step-enter { animation: slide-left 0.4s cubic-bezier(.16,1,.3,1) both; }
        .step-back  { animation: slide-right-in 0.4s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

      <div className="min-h-screen flex">
        {/* ── Left decorative panel ── */}
        <div
          className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #2d1fa0 0%, #6550e8 55%, #7c3aed 100%)' }}
        >
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-25" style={{ background: '#a78bfa' }} />
          <div className="absolute bottom-20 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: '#4338ca' }} />

          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-sora)' }}>
              CoWritex
            </span>
          </div>

          {/* Feature list */}
          <div className="relative space-y-5">
            <h2
              className="text-2xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-sora)' }}
            >
              Everything academic writers need
            </h2>
            {[
              { icon: '∑', title: 'Full LaTeX support', desc: 'Inline and block equations with live KaTeX preview' },
              { icon: '✦', title: 'AI writing assistant', desc: 'Context-aware suggestions tailored to your research' },
              { icon: '⌘', title: 'Smart section management', desc: 'VS Code-style tree with drag & drop reordering' },
              { icon: '◎', title: 'Literature review tools', desc: 'Import papers, manage citations, auto-format' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-white font-mono text-base">
                  {icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-purple-200 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <div className="relative">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur">
              <div className="flex -space-x-2">
                {['#6550e8', '#8b5cf6', '#4f46e5'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-white text-[10px] font-bold" style={{ background: c }}>
                    {['R', 'S', 'M'][i]}
                  </div>
                ))}
              </div>
              <p className="text-white/80 text-xs">
                Join <strong className="text-white">2,400+</strong> researchers already using Scriptorium
              </p>
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
          <div className="w-full max-w-md">
            {mounted && (
              <>
                {/* Mobile logo */}
                <div className="flex items-center gap-2 mb-8 lg:hidden anim-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold" style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}>Scriptorium</span>
                </div>

                {/* Header */}
                <div className="mb-6 anim-0">
                  <h1
                    className="text-3xl font-extrabold mb-1.5"
                    style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
                  >
                    {step === 1 ? 'Create your account' : 'Secure your account'}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {step === 1
                      ? 'Start your research journey — free forever'
                      : 'Choose a strong password to protect your work'
                    }
                  </p>
                </div>

                {/* Steps */}
                <div className="anim-1">
                  <Steps current={step} />
                </div>

                {/* Global error (from backend) */}
                {errors.general && (
                  <div className="mb-4 px-4 py-3 rounded-xl text-sm anim-2"
                    style={{ background: 'var(--background-danger)', color: 'var(--text-danger)' }}>
                    {errors.general}
                  </div>
                )}

                {/* Step 1 */}
                {step === 1 && (
                  <div className="space-y-4 step-enter">
                    {/* Social */}
                    <div className="flex gap-3 anim-1">
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all hover:opacity-80 active:scale-95"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      >
                        <Chrome className="w-4 h-4" /> Google
                      </button>
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all hover:opacity-80 active:scale-95"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      >
                        <Github className="w-4 h-4" /> GitHub
                      </button>
                    </div>

                    <div className="flex items-center gap-4 anim-2">
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>or with email</span>
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>

                    <div className="anim-2">
                      <Field
                        label="Full name"
                        icon={User}
                        value={name}
                        onChange={setName}
                        placeholder="Dr. Jane Smith"
                        error={errors.name}
                      />
                    </div>

                    <div className="anim-3">
                      <Field
                        label="Email"
                        icon={Mail}
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="jane@university.edu"
                        error={errors.email}
                      />
                    </div>

                    <button
                      onClick={nextStep}
                      className="anim-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #6550e8, #8b5cf6)',
                        boxShadow: '0 6px 24px rgba(101,80,232,0.4)',
                      }}
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <form onSubmit={handleSubmit} className="space-y-4 step-enter">
                    <div className="anim-1">
                      <Field
                        label="Password"
                        icon={Lock}
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={setPassword}
                        placeholder="Create a strong password"
                        error={errors.password}
                        suffix={
                          <button type="button" onClick={() => setShowPass((v) => !v)} className="p-1 rounded-lg" style={{ color: 'var(--text-tertiary)' }}>
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                        hint={<PasswordStrength password={password} />}
                      />
                    </div>

                    <div className="anim-2">
                      <Field
                        label="Confirm password"
                        icon={Lock}
                        type={showConfirm ? 'text' : 'password'}
                        value={confirm}
                        onChange={setConfirm}
                        placeholder="Repeat your password"
                        error={errors.confirm}
                        suffix={
                          <button type="button" onClick={() => setShowConfirm((v) => !v)} className="p-1 rounded-lg" style={{ color: 'var(--text-tertiary)' }}>
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />
                    </div>

                    {/* Terms */}
                    <div className="anim-3">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div
                          className="relative mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                          style={{
                            background: agreed ? 'var(--brand)' : 'transparent',
                            borderColor: errors.agreed ? 'var(--text-danger)' : agreed ? 'var(--brand)' : 'var(--border)',
                          }}
                          onClick={() => setAgreed((v) => !v)}
                        >
                          {agreed && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          I agree to CoWritex's{' '}
                          <Link href="#" className="underline underline-offset-2 font-medium" style={{ color: 'var(--brand)' }}>Terms of Service</Link>
                          {' '}and{' '}
                          <Link href="#" className="underline underline-offset-2 font-medium" style={{ color: 'var(--brand)' }}>Privacy Policy</Link>
                        </span>
                      </label>
                      {errors.agreed && <p className="text-xs mt-1" style={{ color: 'var(--text-danger)' }}>{errors.agreed}</p>}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 anim-4">
                      <button
                        type="button"
                        onClick={() => { setStep(1); setErrors({}); }}
                        className="px-5 py-3.5 rounded-xl font-semibold text-sm border transition-all hover:opacity-80"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          background: 'linear-gradient(135deg, #6550e8, #8b5cf6)',
                          boxShadow: '0 6px 24px rgba(101,80,232,0.4)',
                        }}
                      >
                        {loading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                        ) : (
                          <>Create account <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Sign in link */}
                <p className="mt-6 text-center text-sm anim-5" style={{ color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold transition-opacity hover:opacity-70"
                    style={{ color: 'var(--brand)' }}
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}